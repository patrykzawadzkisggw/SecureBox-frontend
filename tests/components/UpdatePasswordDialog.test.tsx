import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UpdatePasswordDialog } from '@/components/UpdatePasswordDialog';
import zxcvbn from 'zxcvbn';


jest.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange?: (open: boolean) => void }) => (
      <div data-testid="dialog" data-open={open}>
        {open ? children : null}
      </div>
    ),
    DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
    DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DialogTitle: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
    DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
    DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  }));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

interface MockInputProps {
  id?: string;
  value?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  type?: string;
  className?: string;
}

jest.mock('@/components/ui/input', () => ({
  Input: React.forwardRef<HTMLInputElement, MockInputProps>(({ id, value, onChange, type, className }, ref) => (
    <input
      ref={ref}
      id={id}
      value={value}
      onChange={onChange}
      type={type}
      className={className}
      data-testid="password-input"
    />
  )),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
}));


jest.mock('zxcvbn');
const mockZxcvbn = zxcvbn as jest.Mock;



describe('UpdatePasswordDialog', () => {
  const mockSetIsDialogOpen = jest.fn();
  const mockUpdatePassword = jest.fn();

  const defaultProps = {
    isDialogOpen: true,
    setIsDialogOpen: mockSetIsDialogOpen,
    platform: 'TestPlatform',
    login: 'test@example.com',
    updatePassword: mockUpdatePassword,
  };

  beforeEach(() => {

    jest.clearAllMocks();

    mockZxcvbn.mockReturnValue({ score: 0 });

    mockUpdatePassword.mockResolvedValue(undefined);
  });

  it('nie renderuje się, gdy isDialogOpen jest false', () => {
    render(<UpdatePasswordDialog {...defaultProps} isDialogOpen={false} />);
    expect(screen.queryByTestId('dialog')).toHaveAttribute('data-open', 'false');
    expect(screen.queryByText('Zmień hasło')).not.toBeInTheDocument();
  });

  it('renderuje poprawnie, gdy isDialogOpen jest true', () => {
    render(<UpdatePasswordDialog {...defaultProps} />);

    expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'true');
    expect(screen.getByText('Zmień hasło')).toBeInTheDocument();
    expect(screen.getByText(`Zmień hasło dla ${defaultProps.platform}`)).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText(defaultProps.login)).toBeInTheDocument();
    expect(screen.getByLabelText('Nowe hasło')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByText('Siła hasła')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument(); 
    expect(screen.getByRole('button', { name: 'Zapisz' })).toBeInTheDocument();
  });

  it('aktualizuje wartość pola hasła podczas wpisywania', () => {
    render(<UpdatePasswordDialog {...defaultProps} />);
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.change(passwordInput, { target: { value: 'newPass' } });

    expect(passwordInput).toHaveValue('newPass');
  });

  it('oblicza i wyświetla siłę hasła', () => {
    render(<UpdatePasswordDialog {...defaultProps} />);
    const passwordInput = screen.getByTestId('password-input');

    // Initial
    expect(screen.getByText('0%')).toBeInTheDocument();


    mockZxcvbn.mockReturnValue({ score: 1 });
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    expect(mockZxcvbn).toHaveBeenCalledWith('weak');
    expect(screen.getByText('25%')).toBeInTheDocument();


    mockZxcvbn.mockReturnValue({ score: 4 });
    fireEvent.change(passwordInput, { target: { value: 'VeryStrongP@ssw0rd!' } });
    expect(mockZxcvbn).toHaveBeenCalledWith('VeryStrongP@ssw0rd!');
    expect(screen.getByText('100%')).toBeInTheDocument();


    fireEvent.change(passwordInput, { target: { value: '' } });
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('wywołuje updatePassword i zamyka dialog po kliknięciu Zapisz', async () => {
    render(<UpdatePasswordDialog {...defaultProps} />);
    const passwordInput = screen.getByTestId('password-input');
    const saveButton = screen.getByRole('button', { name: 'Zapisz' });

    const newPasswordValue = 'mySecurePassword123';
    fireEvent.change(passwordInput, { target: { value: newPasswordValue } });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledTimes(1);
      expect(mockUpdatePassword).toHaveBeenCalledWith(
        newPasswordValue,
        defaultProps.platform,
        defaultProps.login
      );
    });


    expect(mockSetIsDialogOpen).toHaveBeenCalledTimes(1);
    expect(mockSetIsDialogOpen).toHaveBeenCalledWith(false);


  });

   it('nie zamyka dialogu, gdy updatePassword odrzuci promise', async () => {
    const updateError = new Error('Failed to update');
    mockUpdatePassword.mockRejectedValue(updateError); 

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<UpdatePasswordDialog {...defaultProps} />);
    const passwordInput = screen.getByTestId('password-input');
    const saveButton = screen.getByRole('button', { name: 'Zapisz' });

    fireEvent.change(passwordInput, { target: { value: 'somePassword' } });
    fireEvent.click(saveButton);


    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledTimes(1);
    });


    expect(mockSetIsDialogOpen).not.toHaveBeenCalled();

 
    consoleErrorSpy.mockRestore();
  });

});