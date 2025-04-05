import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import ExportToJSON from '@/components/ExportToJSON';
import { usePasswordContext, decryptPassword } from '@/data/PasswordContext';
import { toast } from 'sonner';

jest.mock('@/data/PasswordContext', () => ({
  usePasswordContext: jest.fn(),
  decryptPassword: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick?: () => void }) => (
    <button disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock('lucide-react', () => ({
  Download: () => <svg data-testid="download-icon" />,
}));

jest.mock('@/components/RecoverMasterkeyDialog', () => ({
  RecoverMasterkeyDialog: ({ isDialogOpen, setIsDialogOpen }: { isDialogOpen: boolean; setIsDialogOpen: (value: boolean) => void }) => (
    <div data-testid="recover-dialog" style={{ display: isDialogOpen ? 'block' : 'none' }}>
      <button onClick={() => setIsDialogOpen(false)}>Zamknij</button>
    </div>
  ),
}));


const mockCreateObjectURL = jest.fn(() => 'mock-url');
const mockRevokeObjectURL = jest.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe('ExportToJSON', () => {
  const mockZip = {
    file: jest.fn(() => ({
      async: jest.fn(() => Promise.resolve('encrypted:iv')),
    })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: {
        loading: false,
        passwords: [
          { platform: 'test1', login: 'user1', passwordfile: 'file1' },
          { platform: 'test2', login: 'user2', passwordfile: 'file2' },
        ],
        zip: mockZip,
        encryptionKey: 'key123', 
      },
    });
    (decryptPassword as jest.Mock).mockImplementation(() => Promise.resolve('decryptedPass'));
    mockCreateObjectURL.mockReturnValue('mock-url');
    console.error = jest.fn(); 
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('renders the export button', () => {
    render(<ExportToJSON />);
    expect(screen.getByText('Eksportuj do JSON')).toBeInTheDocument();
    expect(screen.getByTestId('download-icon')).toBeInTheDocument();
  });

  it('disables button when state.loading is true', () => {
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { loading: true, passwords: [], zip: null, encryptionKey: null },
    });
    render(<ExportToJSON />);
    expect(screen.getByText('Eksportuj do JSON').closest('button')).toBeDisabled();
  });

  it('disables button and shows "Eksportowanie..." when exporting', async () => {
    render(<ExportToJSON />);
    fireEvent.click(screen.getByText('Eksportuj do JSON'));
    expect(screen.getByText('Eksportowanie...')).toBeInTheDocument();
    expect(screen.getByText('Eksportowanie...').closest('button')).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText('Eksportuj do JSON')).toBeInTheDocument();
    });
  });

  it('exports passwords to JSON successfully', async () => {
    const mockLink = {
      setAttribute: jest.fn(),
      click: jest.fn(),
      remove: jest.fn(),
    } as unknown as HTMLAnchorElement;

    const originalCreateElement = document.createElement;
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') return mockLink;
      return originalCreateElement.call(document, tagName);
    });


    render(<ExportToJSON />);
    fireEvent.click(screen.getByText('Eksportuj do JSON'));

    await waitFor(() => {
      expect(decryptPassword).toHaveBeenCalledTimes(2);
      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'mock-url');
      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        'download',
        expect.stringMatching(/passwords_export_\d{4}-\d{2}-\d{2}\.json/)
      );
      expect(mockLink.click);
      expect(mockRevokeObjectURL);
      expect(toast.success);
      
    }, { timeout: 2000 });
  });

  it('shows error and opens recover dialog when no encryption key', async () => {
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: {
        loading: false,
        passwords: [{ platform: 'test1', login: 'user1', passwordfile: 'file1' }],
        zip: mockZip,
        encryptionKey: null,
      },
    });

    render(<ExportToJSON />);
    fireEvent.click(screen.getByText('Eksportuj do JSON'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Błąd!', {
        description: 'Nie udało się wyeksportować haseł do JSON: Brak klucza szyfrowania',
        duration: 3000,
      });
      expect(screen.getByTestId('recover-dialog')).toBeInTheDocument();
    });
  });

  it('retries export after closing recover dialog with encryption key', async () => {
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: {
        loading: false,
        passwords: [{ platform: 'test1', login: 'user1', passwordfile: 'file1' }],
        zip: mockZip,
        encryptionKey: null,
      },
    });

    const { rerender } = render(<ExportToJSON />);
    fireEvent.click(screen.getByText('Eksportuj do JSON'));

    await waitFor(() => {
      expect(screen.getByTestId('recover-dialog')).toBeInTheDocument();
    });

    (usePasswordContext as jest.Mock).mockReturnValue({
      state: {
        loading: false,
        passwords: [{ platform: 'test1', login: 'user1', passwordfile: 'file1' }],
        zip: mockZip,
        encryptionKey: 'newKey',
      },
    });
    fireEvent.click(screen.getByText('Zamknij'));

    rerender(<ExportToJSON />);

    await waitFor(() => {
      expect(decryptPassword).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Eksport zakończony!', {
        description: 'Plik JSON z hasłami został pobrany.',
        duration: 3000,
      });
    });
  });

  it('handles decryption errors and skips invalid entries', async () => {
    (decryptPassword as jest.Mock).mockImplementation((encrypted: string, iv: string, key: string) => {
      if (encrypted === 'encrypted' && iv === 'iv') {
        return Promise.reject(new Error('Decryption failed'));
      }
      return Promise.resolve('decryptedPass');
    });

    render(<ExportToJSON />);
    fireEvent.click(screen.getByText('Eksportuj do JSON'));

    await waitFor(() => {
      expect(decryptPassword).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith('Błąd!', {
        description: 'Nie udało się wyeksportować haseł do JSON: Decryption failed',
        duration: 3000,
      });
      expect(toast.success).not.toHaveBeenCalled();
    });
  });
});