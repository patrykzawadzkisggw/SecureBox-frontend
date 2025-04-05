import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecoverMasterkeyDialog } from '@/components/RecoverMasterkeyDialog';
import { usePasswordContext } from '@/data/PasswordContext';
import { toast } from 'sonner';

jest.mock('@/data/PasswordContext', () => ({
  usePasswordContext: jest.fn(),
}));
jest.mock('sonner', () => ({
  toast: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('RecoverMasterkeyDialog', () => {
  const mockSetMasterkey = jest.fn();

  const setup = (isOpen = true) => {
    const setIsDialogOpen = jest.fn();
    (usePasswordContext as jest.Mock).mockReturnValue({
      setMasterkey: mockSetMasterkey,
    });

    render(
      <RecoverMasterkeyDialog
        isDialogOpen={isOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    );

    return { setIsDialogOpen };
  };

  it('renders dialog with inputs and buttons', () => {
    setup();

    expect(screen.getByText('Wprowadź Masterkey')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Wpisz masterkey')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Potwierdź masterkey')).toBeInTheDocument();
    expect(screen.getByText('Zweryfikuj')).toBeInTheDocument();
  });

  it('shows error when fields are empty', async () => {
    setup();

    fireEvent.click(screen.getByText('Zweryfikuj'));
    expect(await screen.findByText('Oba pola są wymagane.')).toBeInTheDocument();
  });

  it('shows error when masterkeys do not match', async () => {
    setup();

    fireEvent.change(screen.getByPlaceholderText('Wpisz masterkey'), {
      target: { value: 'test123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Potwierdź masterkey'), {
      target: { value: 'wrong' },
    });

    fireEvent.click(screen.getByText('Zweryfikuj'));

    expect(await screen.findByText('Masterkey i jego potwierdzenie muszą być identyczne.')).toBeInTheDocument();
  });

  it('calls setMasterkey and closes dialog on success', async () => {
    const { setIsDialogOpen } = setup();
    mockSetMasterkey.mockResolvedValueOnce(undefined);

    fireEvent.change(screen.getByPlaceholderText('Wpisz masterkey'), {
      target: { value: 'securekey' },
    });
    fireEvent.change(screen.getByPlaceholderText('Potwierdź masterkey'), {
      target: { value: 'securekey' },
    });

    fireEvent.click(screen.getByText('Zweryfikuj'));

    await waitFor(() => {
      expect(mockSetMasterkey).toHaveBeenCalledWith('securekey');
      expect(toast.info).toHaveBeenCalled();
      expect(setIsDialogOpen).toHaveBeenCalledWith(false);
    });
  });

  it('shows error toast on failure', async () => {
    setup();
    mockSetMasterkey.mockRejectedValueOnce(new Error('Błąd masterkey'));

    fireEvent.change(screen.getByPlaceholderText('Wpisz masterkey'), {
      target: { value: 'wrongkey' },
    });
    fireEvent.change(screen.getByPlaceholderText('Potwierdź masterkey'), {
      target: { value: 'wrongkey' },
    });

    fireEvent.click(screen.getByText('Zweryfikuj'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
      expect(screen.getByText(/Podany masterkey jest nieprawidłowy/)).toBeInTheDocument();
    });
  });

  it('calls setIsDialogOpen(false) when clicking "Anuluj"', () => {
    const { setIsDialogOpen } = setup();

    fireEvent.click(screen.getByText('Anuluj'));
    expect(setIsDialogOpen).toHaveBeenCalledWith(false);
  });
});