import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/login-form';
import { usePasswordContext, encryptMasterkey } from '@/data/PasswordContext';
import { toast } from 'sonner';
import { MemoryRouter, useNavigate } from 'react-router-dom';

jest.mock('@/data/PasswordContext', () => ({
  usePasswordContext: jest.fn(),
  encryptMasterkey: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster-mock" />,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, disabled }: { children: React.ReactNode; onClick?: () => void; variant?: string; disabled?: boolean }) => (
    <button onClick={onClick} data-testid={variant === 'outline' ? 'google-button' : 'submit-button'} disabled={disabled}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ id, type, value, onChange, disabled }: { id: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled?: boolean }) => (
    <input id={id} type={type} value={value} onChange={onChange} disabled={disabled} data-testid={id} />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) => <label htmlFor={htmlFor}>{children}</label>,
}));

jest.mock('@/components/ResetPasswordDialog', () => ({
  ResetPasswordDialog: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <div data-testid="reset-password-dialog" style={{ display: isOpen ? 'block' : 'none' }}>
      <button onClick={onClose}>Zamknij</button>
    </div>
  ),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...args: string[]) => args.join(' '),
}));

describe('LoginForm', () => {
  const mockNavigate = jest.fn();
  const mockLoginUser = jest.fn();
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
    removeItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (usePasswordContext as jest.Mock).mockReturnValue({
      login: mockLoginUser,
    });
    (encryptMasterkey as jest.Mock).mockResolvedValue('encryptedMasterkey');
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders login form correctly', () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    expect(screen.getByText('Zaloguj się na swoje konto')).toBeInTheDocument();
    expect(screen.getByText('Wprowadź dane')).toBeInTheDocument();
    expect(screen.getByTestId('login')).toBeInTheDocument();
    expect(screen.getByTestId('password')).toBeInTheDocument();
    expect(screen.getByTestId('masterkey')).toBeInTheDocument();
    expect(screen.getByTestId('masterkey2')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('google-button')).toBeInTheDocument();
    expect(screen.getByText('Zapomniałeś hasła?')).toBeInTheDocument();
    expect(screen.getByText('Utwórz konto')).toBeInTheDocument();
    expect(screen.getByTestId('toaster-mock')).toBeInTheDocument();
  });

  it('shows error when masterkeys do not match', async () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByTestId('login'), { target: { value: 'user123' } });
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByTestId('masterkey'), { target: { value: 'masterkey1' } });
    fireEvent.change(screen.getByTestId('masterkey2'), { target: { value: 'masterkey2' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Masterkey i jego potwierdzenie muszą być identyczne.')).toBeInTheDocument();
      expect(mockLoginUser).not.toHaveBeenCalled();
    });
  });

  it('successfully logs in and navigates', async () => {
    mockLoginUser.mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByTestId('login'), { target: { value: 'user123' } });
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByTestId('masterkey'), { target: { value: 'masterkey' } });
    fireEvent.change(screen.getByTestId('masterkey2'), { target: { value: 'masterkey' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(encryptMasterkey).toHaveBeenCalledWith('masterkey', '123');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('masterkey', 'encryptedMasterkey');
      expect(mockLoginUser).toHaveBeenCalledWith('user123', 'password123', 'masterkey');
      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(toast.success).toHaveBeenCalledWith('Zalogowano pomyślnie!', { duration: 3000 });
    });
  });

  it('shows error on login failure', async () => {
    mockLoginUser.mockRejectedValue(new Error('Invalid credentials'));
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByTestId('login'), { target: { value: 'user123' } });
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'wrongpass' } });
    fireEvent.change(screen.getByTestId('masterkey'), { target: { value: 'masterkey' } });
    fireEvent.change(screen.getByTestId('masterkey2'), { target: { value: 'masterkey' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith('user123', 'wrongpass', 'masterkey');
      expect(screen.getByText('Nieprawidłowy login, hasło lub masterkey')).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith('Błąd logowania!', {
        description: 'Sprawdź dane i spróbuj ponownie.',
        duration: 3000,
      });
      expect(screen.getByTestId('password')).toHaveValue('');
      expect(screen.getByTestId('masterkey')).toHaveValue('');
    });
  });

  it('disables inputs and button when loading', async () => {
    mockLoginUser.mockImplementation(() => new Promise(() => {}));
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByTestId('login'), { target: { value: 'user123' } });
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByTestId('masterkey'), { target: { value: 'masterkey' } });
    fireEvent.change(screen.getByTestId('masterkey2'), { target: { value: 'masterkey' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('login')).toBeDisabled();
      expect(screen.getByTestId('password')).toBeDisabled();
      expect(screen.getByTestId('masterkey')).toBeDisabled();
      expect(screen.getByTestId('masterkey2')).toBeDisabled();
      expect(screen.getByTestId('submit-button')).toBeDisabled();
      expect(screen.getByTestId('google-button')).toBeDisabled();
      expect(screen.getByText('Logowanie...')).toBeInTheDocument();
    });
  });

  it('opens reset password dialog when clicking "Zapomniałeś hasła?"', () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Zapomniałeś hasła?'));

    expect(screen.getByTestId('reset-password-dialog')).toHaveStyle('display: block');
  });

  it('navigates to register page when clicking "Utwórz konto"', () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Utwórz konto'));

    expect(screen.getByText('Utwórz konto').closest('a')).toHaveAttribute('href', '/register');
  });
});