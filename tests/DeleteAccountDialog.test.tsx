import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteAccountDialog } from '@/components/DeleteAccountDialog';
import { usePasswordContext } from '@/data/PasswordContext';

jest.mock('@/data/PasswordContext', () => ({
  usePasswordContext: jest.fn(),
}));

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});


afterAll(() => {
  jest.restoreAllMocks(); 
});

describe('DeleteAccountDialog', () => {
  const mockDeletePassword = jest.fn();

  const setup = (isOpen = true) => {
    const setIsDialogOpen = jest.fn();
    (usePasswordContext as jest.Mock).mockReturnValue({
      deletePassword: mockDeletePassword,
    });

    render(
      <DeleteAccountDialog
        isDialogOpen={isOpen}
        setIsDialogOpen={setIsDialogOpen}
        platform="Facebook"
        login="user@example.com"
      />
    );

    return { setIsDialogOpen };
  };

  it('renders dialog with correct content', () => {
    setup();
    expect(screen.getByText('Usuń konto')).toBeInTheDocument();
    expect(screen.getByText(/Czy na pewno chcesz usunąć hasło/)).toBeInTheDocument();
    expect(screen.getByText('Anuluj')).toBeInTheDocument();
    expect(screen.getByText('Usuń')).toBeInTheDocument();
  });

  it('calls setIsDialogOpen(false) when "Anuluj" is clicked', () => {
    const { setIsDialogOpen } = setup();

    fireEvent.click(screen.getByText('Anuluj'));
    expect(setIsDialogOpen).toHaveBeenCalledWith(false);
  });

  it('calls deletePassword and closes dialog on confirm', async () => {
    const { setIsDialogOpen } = setup();
    mockDeletePassword.mockResolvedValueOnce(undefined);

    fireEvent.click(screen.getByText('Usuń'));

    expect(screen.getByText('Usuwanie...')).toBeInTheDocument();
    expect(mockDeletePassword).toHaveBeenCalledWith('Facebook', 'user@example.com');

    await waitFor(() => {
      expect(setIsDialogOpen).toHaveBeenCalledWith(false);
    });
  });

  it('handles error during deletion and re-enables buttons', async () => {
    setup();
    mockDeletePassword.mockRejectedValueOnce(new Error('Błąd'));

    fireEvent.click(screen.getByText('Usuń'));

    expect(screen.getByText('Usuwanie...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Usuń')).toBeInTheDocument(); 
    });
  });

  it('disables buttons during deletion', async () => {
    setup();
    mockDeletePassword.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100)) 
    );

    fireEvent.click(screen.getByText('Usuń'));

    expect(screen.getByText('Usuwanie...')).toBeDisabled();
    expect(screen.getByText('Anuluj')).toBeDisabled();
  });
});
