import { render, screen, fireEvent } from '@testing-library/react';
import { AddPasswordDialog, AddPasswordDialogProps } from '@/components/AddPasswordDialog';


beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Komponent AddPasswordDialog', () => {
  const mockOnSubmit = jest.fn();
  const defaultProps: AddPasswordDialogProps = {
    isDialogOpen: true,
    setIsDialogOpen: jest.fn(),
    onSubmit: mockOnSubmit,
  };


 

  it('renderuje dialog z formularzem do dodawania hasła', () => {
    render(<AddPasswordDialog {...defaultProps} />);

    expect(screen.getByText('Dodaj hasło')).toBeInTheDocument();
    expect(screen.getByText('Pozwala dodać hasło do managera haseł.')).toBeInTheDocument();
    expect(screen.getByLabelText('Strona')).toBeInTheDocument();
    expect(screen.getByLabelText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Hasło')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dodaj/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Anuluj/i })).toBeInTheDocument();
  });

  it('wyświetla błąd, gdy pole strony jest puste', async () => {
    render(<AddPasswordDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Dodaj/i }));

    expect(await screen.findByText("Pole 'Strona' nie może być puste.")).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('wyświetla błąd, gdy pole loginu jest puste', async () => {
    render(<AddPasswordDialog {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Strona'), { target: { value: 'example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Dodaj/i }));

    expect(await screen.findByText("Pole 'Login' nie może być puste.")).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('wyświetla błąd, gdy pole hasła jest puste', async () => {
    render(<AddPasswordDialog {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Strona'), { target: { value: 'example.com' } });
    fireEvent.change(screen.getByLabelText('Login'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Dodaj/i }));

    expect(await screen.findByText("Pole 'Hasło' nie może być puste.")).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('wywołuje onSubmit i zamyka dialog po poprawnym przesłaniu formularza', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);
    render(<AddPasswordDialog {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Strona'), { target: { value: 'example.com' } });
    fireEvent.change(screen.getByLabelText('Login'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Hasło'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Dodaj/i }));

    await screen.findByRole('button', { name: /Dodaj/i }); 

    expect(mockOnSubmit).toHaveBeenCalledWith('password123', 'example.com', 'user@example.com');
    expect(defaultProps.setIsDialogOpen).toHaveBeenCalledWith(false);
  });

  it('wyświetla błąd, gdy onSubmit zgłasza wyjątek', async () => {
    mockOnSubmit.mockRejectedValueOnce(new Error('Błąd API'));
    render(<AddPasswordDialog {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Strona'), { target: { value: 'example.com' } });
    fireEvent.change(screen.getByLabelText('Login'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('Hasło'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Dodaj/i }));

    expect(await screen.findByText('Wystąpił błąd podczas dodawania hasła.')).toBeInTheDocument();
  });

  it('zamyka dialog po kliknięciu przycisku Anuluj', () => {
    render(<AddPasswordDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Anuluj/i }));

    expect(defaultProps.setIsDialogOpen).toHaveBeenCalledWith(false);
  });
});