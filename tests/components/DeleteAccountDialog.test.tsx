import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeleteAccountDialog } from '@/components/DeleteAccountDialog';
import { toast } from 'sonner';
import { act } from 'react';


jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));


let onOpenChangeCallback: (open: boolean) => void; 
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({
    open,
    onOpenChange,
    children,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
  }) => {
    onOpenChangeCallback = onOpenChange; // Capture the onOpenChange prop
    return open ? <div data-testid="dialog">{children}</div> : null;
  },
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h1>{children}</h1>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe('Komponent DeleteAccountDialog', () => {
  const mockSetIsDialogOpen = jest.fn();
  const mockDeletePassword = jest.fn();
  const platform = 'TestPlatform';
  const login = 'testuser';

  const defaultProps = {
    isDialogOpen: true,
    setIsDialogOpen: mockSetIsDialogOpen,
    platform: platform,
    login: login,
    deletePassword: mockDeletePassword,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDeletePassword.mockResolvedValue(undefined);
  });

  it('renderuje dialog z poprawnym tytułem i opisem gdy otwarte', () => {
    render(<DeleteAccountDialog {...defaultProps} />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Usuń konto')).toBeInTheDocument();
    expect(
      screen.getByText(
        `Czy na pewno chcesz usunąć hasło dla ${platform} (${login})? Tej akcji nie można cofnąć.`
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anuluj' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Usuń' })).toBeInTheDocument();
  });

  it('nie renderuje zawartości dialogu gdy czyOtwarte jest false', () => {
    render(<DeleteAccountDialog {...defaultProps} isDialogOpen={false} />);

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Usuń konto')).not.toBeInTheDocument();
  });

  it('wywołuje ustawCzyOtwarte(false) po kliknięciu Anuluj', () => {
    render(<DeleteAccountDialog {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Anuluj' });
    fireEvent.click(cancelButton);

    expect(mockSetIsDialogOpen).toHaveBeenCalledTimes(1);
    expect(mockSetIsDialogOpen).toHaveBeenCalledWith(false);
  });

  it('wywołuje usunHaslo z poprawnymi argumentami po kliknięciu Usuń', async () => {
    render(<DeleteAccountDialog {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: 'Usuń' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeletePassword).toHaveBeenCalledTimes(1);
    });
    expect(mockDeletePassword).toHaveBeenCalledWith(platform, login);
  });

  it('pokazuje stan ładowania i wyłącza przyciski podczas usuwania', async () => {
    let resolvePromise: (value?: unknown) => void;
    mockDeletePassword.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    render(<DeleteAccountDialog {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: 'Usuń' });
    const cancelButton = screen.getByRole('button', { name: 'Anuluj' });

    fireEvent.click(deleteButton);

    expect(deleteButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toHaveTextContent('Usuwanie...');

    await act(async () => {
      resolvePromise();
    });
    await waitFor(() => {
      expect(mockDeletePassword).toHaveBeenCalled();
    });
  });

  it('wywołuje toast.success i zamyka dialog po pomyślnym usunięciu', async () => {
    render(<DeleteAccountDialog {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: 'Usuń' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeletePassword).toHaveBeenCalledTimes(1);
    });

    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Konto zostało usunięte.', {
      duration: 3000,
    });
    expect(mockSetIsDialogOpen).toHaveBeenCalledTimes(1);
    expect(mockSetIsDialogOpen).toHaveBeenCalledWith(false);
  });

  it('wywołuje toast.error i pozostawia dialog otwarty przy nieudanym usunięciu', async () => {
    const error = new Error('Deletion failed');
    mockDeletePassword.mockRejectedValueOnce(error);

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(<DeleteAccountDialog {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: 'Usuń' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeletePassword).toHaveBeenCalledTimes(1);
    });

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('Błąd!', {
      description: 'Nie udało się usunąć konta. Spróbuj ponownie.',
      duration: 3000,
    });
    expect(mockSetIsDialogOpen).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Błąd podczas usuwania konta:',
      error
    );

    expect(deleteButton).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Anuluj' })).not.toBeDisabled();
    expect(deleteButton).toHaveTextContent('Usuń');

    consoleErrorSpy.mockRestore();
  });

  it('wywołuje ustawCzyOtwarte gdy onOpenChange jest wyzwalane przez Dialog', async () => {
    render(<DeleteAccountDialog {...defaultProps} />);

    await act(async () => {
      onOpenChangeCallback(false); 
    });

    expect(mockSetIsDialogOpen).toHaveBeenCalledTimes(1);
    expect(mockSetIsDialogOpen).toHaveBeenCalledWith(false);
  });
});