import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ShowPasswordDialog, ShowPasswordDialogProps } from '@/components/ShowPasswordDialog';
import { decryptPassword } from '@/data/PasswordContext';
import zxcvbn from 'zxcvbn';
import JSZip from 'jszip';

jest.mock('@/data/PasswordContext', () => ({
  decryptPassword: jest.fn(),
}));
const mockDecryptPassword = decryptPassword as jest.Mock;

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange?: (open: boolean) => void }) => (
    <div data-testid="dialog" data-open={open}>
      {open ? children : null}
      {open && <button data-testid="overlay-close" onClick={() => onOpenChange && onOpenChange(false)} />}
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

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
}));

jest.mock('@/components/RecoverMasterkeyDialog', () => ({
  RecoverMasterkeyDialog: ({
    isDialogOpen,
    setIsDialogOpen,
    setMasterkey,
  }: {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    setMasterkey: (key: string) => void;
  }) => (
    <div data-testid="recover-dialog" data-open={isDialogOpen}>
      {isDialogOpen && (
        <>
          <button
            data-testid="recover-submit"
            onClick={() => {
              setMasterkey('mockMasterkey');
              setIsDialogOpen(false);
            }}
          >
            Submit Recovery
          </button>
          <button data-testid="recover-close" onClick={() => setIsDialogOpen(false)}>
            Close Recovery
          </button>
        </>
      )}
    </div>
  ),
}));

jest.mock('zxcvbn');
const mockZxcvbn = zxcvbn as jest.Mock;

describe('ShowPasswordDialog', () => {
  const mockSetIsDialogOpen = jest.fn();
  const mockSetMasterkey = jest.fn().mockResolvedValue(undefined);

  const defaultProps: ShowPasswordDialogProps = {
    isDialogOpen: true,
    setIsDialogOpen: mockSetIsDialogOpen,
    passwordfile: 'testPass.txt',
    platform: 'TestPlatform',
    login: 'test@example.com',
    zip: null as JSZip | null,
    encryptionKey: { algorithm: { name: 'AES-GCM' } } as CryptoKey, // Poprawiona definicja
    setMasterkey: mockSetMasterkey,
  };

  // Mocki dla JSZip
  const mockZipFileAsync = jest.fn();
  const mockZipFile = jest.fn(() => ({ async: mockZipFileAsync }));
  const mockZip = {
    file: mockZipFile,
    files: { [defaultProps.passwordfile]: { async: mockZipFileAsync } },
  } as unknown as JSZip;

  // Aktualizacja defaultProps.zip
  defaultProps.zip = mockZip;

  let consoleErrorSpy: jest.SpyInstance;
  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockZipFileAsync.mockResolvedValue('encryptedData:ivData');
    mockDecryptPassword.mockResolvedValue('decryptedPassword123');
    mockZxcvbn.mockReturnValue({ score: 3 });
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('nie renderuje się, gdy isDialogOpen jest false', () => {
    render(<ShowPasswordDialog {...defaultProps} isDialogOpen={false} />);
    expect(screen.queryByTestId('dialog')).toHaveAttribute('data-open', 'false');
    expect(screen.queryByText('Pokaż hasło')).not.toBeInTheDocument();
  });

  it('renderuje poprawnie i próbuje odszyfrować hasło, gdy jest otwarty', async () => {
    await act(async () => {
      render(<ShowPasswordDialog {...defaultProps} />);
    });

    expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'true');
    expect(screen.getByText('Pokaż hasło')).toBeInTheDocument();
    expect(screen.getByText(`Podgląd hasła dla ${defaultProps.platform}`)).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText(defaultProps.login)).toBeInTheDocument();
    expect(screen.getByText('Hasło')).toBeInTheDocument();
    expect(screen.getByText('Siła hasła')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zamknij' })).toBeInTheDocument();

    await waitFor(
      () => {
        expect(mockZipFile).toHaveBeenCalledWith(defaultProps.passwordfile);
        expect(mockZipFileAsync).toHaveBeenCalledWith('string');
        expect(mockDecryptPassword).toHaveBeenCalledWith('encryptedData', 'ivData', defaultProps.encryptionKey);
        expect(mockZxcvbn).toHaveBeenCalledWith('decryptedPassword123');
        expect(screen.getByText('decryptedPassword123')).toBeInTheDocument();
        expect(screen.getByText('75%')).toBeInTheDocument();
        const progressBarContainer = screen.getByRole('progressbar');
        const progressBarInner = progressBarContainer.firstChild as HTMLElement;
        expect(progressBarInner).toHaveStyle('width: 75%');
      },
      { timeout: 2000 }
    );

    expect(screen.queryByTestId('recover-dialog')).toHaveAttribute('data-open', 'false');
  });

  it('pokazuje "Ładowanie..." początkowo przed odszyfrowaniem', async () => {
    mockZipFileAsync.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('encryptedData:ivData'), 100)));

    await act(async () => {
      render(<ShowPasswordDialog {...defaultProps} />);
    });

    expect(screen.getByText('Ładowanie...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('decryptedPassword123')).toBeInTheDocument();
    });
  });

  it('otwiera dialog odzyskiwania, gdy brakuje klucza szyfrowania', async () => {
    await act(async () => {
      render(<ShowPasswordDialog {...defaultProps} encryptionKey={undefined} />);
    });

    await waitFor(
      () => {
        expect(mockZipFile).toHaveBeenCalledWith(defaultProps.passwordfile);
        expect(mockZipFileAsync).toHaveBeenCalledWith('string');
        expect(mockDecryptPassword).not.toHaveBeenCalled();
        expect(screen.getByText('Ładowanie...')).toBeInTheDocument();
        expect(screen.getByText('0%')).toBeInTheDocument();
        expect(screen.getByTestId('recover-dialog')).toHaveAttribute('data-open', 'true');
      },
      { timeout: 2000 }
    );
  });

  it('ponawia próbę odszyfrowania po zamknięciu dialogu odzyskiwania i dostarczeniu klucza', async () => {
    const { rerender } = await act(async () => render(<ShowPasswordDialog {...defaultProps} encryptionKey={undefined} />));

    await waitFor(() => {
      expect(screen.getByTestId('recover-dialog')).toHaveAttribute('data-open', 'true');
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('recover-submit'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('recover-dialog')).toHaveAttribute('data-open', 'false');
    });

    await act(async () => {
      rerender(<ShowPasswordDialog {...defaultProps} encryptionKey={defaultProps.encryptionKey} />);
    });

    await waitFor(
      () => {
        expect(mockDecryptPassword).toHaveBeenCalledWith('encryptedData', 'ivData', defaultProps.encryptionKey);
        expect(screen.getByText('decryptedPassword123')).toBeInTheDocument();
        expect(screen.getByText('75%')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('pokazuje błąd i otwiera dialog odzyskiwania, gdy plik nie istnieje w zip', async () => {
    mockZipFile.mockReturnValueOnce(null as any );

    await act(async () => {
      render(<ShowPasswordDialog {...defaultProps} />);
    });

    await waitFor(
      () => {
        expect(mockZipFile).toHaveBeenCalledWith(defaultProps.passwordfile);
        expect(mockZipFileAsync).not.toHaveBeenCalled();
        expect(mockDecryptPassword).not.toHaveBeenCalled();
        expect(screen.getByText('Błąd deszyfrowania')).toBeInTheDocument();
        expect(screen.getByText('0%')).toBeInTheDocument();
        expect(screen.getByTestId('recover-dialog')).toHaveAttribute('data-open', 'true');
      },
      { timeout: 2000 }
    );
  });

  it('pokazuje błąd i otwiera dialog odzyskiwania, gdy format pliku jest nieprawidłowy', async () => {
    mockZipFileAsync.mockResolvedValueOnce('invalidDataFormat');

    await act(async () => {
      render(<ShowPasswordDialog {...defaultProps} />);
    });

    await waitFor(
      () => {
        expect(mockZipFile).toHaveBeenCalledWith(defaultProps.passwordfile);
        expect(mockZipFileAsync).toHaveBeenCalledWith('string');
        expect(mockDecryptPassword).not.toHaveBeenCalled();
        expect(screen.getByText('Błąd deszyfrowania')).toBeInTheDocument();
        expect(screen.getByText('0%')).toBeInTheDocument();
        expect(screen.getByTestId('recover-dialog')).toHaveAttribute('data-open', 'true');
      },
      { timeout: 2000 }
    );
  });

  it('pokazuje błąd i otwiera dialog odzyskiwania, gdy deszyfrowanie zawiedzie', async () => {
    const decryptionError = new Error('Decryption Failed');
    mockDecryptPassword.mockRejectedValueOnce(decryptionError);

    await act(async () => {
      render(<ShowPasswordDialog {...defaultProps} />);
    });

    await waitFor(
      () => {
        expect(mockZipFile).toHaveBeenCalledWith(defaultProps.passwordfile);
        expect(mockZipFileAsync).toHaveBeenCalledWith('string');
        expect(mockDecryptPassword).toHaveBeenCalledWith('encryptedData', 'ivData', defaultProps.encryptionKey);
        expect(screen.getByText('Błąd deszyfrowania')).toBeInTheDocument();
        expect(screen.getByText('0%')).toBeInTheDocument();
        expect(screen.getByTestId('recover-dialog')).toHaveAttribute('data-open', 'true');
      },
      { timeout: 2000 }
    );
  });

  it('nie próbuje odszyfrować, gdy zip jest null', async () => {
    await act(async () => {
      render(<ShowPasswordDialog {...defaultProps} zip={null} />);
    });

    expect(screen.getByText('Ładowanie...')).toBeInTheDocument();
    expect(mockZipFile).not.toHaveBeenCalled();
    expect(mockDecryptPassword).not.toHaveBeenCalled();

    await waitFor(
      () => {
        expect(mockZipFile).not.toHaveBeenCalled();
        expect(mockDecryptPassword).not.toHaveBeenCalled();
        expect(screen.queryByTestId('recover-dialog')).toHaveAttribute('data-open', 'false');
      },
      { timeout: 1000 }
    );
  });

  it('zamyka dialog po kliknięciu przycisku Zamknij', async () => {
    await act(async () => {
      render(<ShowPasswordDialog {...defaultProps} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Zamknij' }));
    });

    expect(mockSetIsDialogOpen).toHaveBeenCalledTimes(1);
    expect(mockSetIsDialogOpen).toHaveBeenCalledWith(false);
  });

  it('zamyka dialog po kliknięciu na overlay (symulowane)', async () => {
    await act(async () => {
      render(<ShowPasswordDialog {...defaultProps} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('overlay-close'));
    });

    expect(mockSetIsDialogOpen).toHaveBeenCalledTimes(1);
    expect(mockSetIsDialogOpen).toHaveBeenCalledWith(false);
  });
});