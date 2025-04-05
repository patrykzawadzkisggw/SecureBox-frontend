import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ShowPasswordDialog } from '@/components/ShowPasswordDialog';
import { usePasswordContext, decryptPassword } from '@/data/PasswordContext';
import zxcvbn from 'zxcvbn';


jest.mock('@/data/PasswordContext', () => ({
  usePasswordContext: jest.fn(),
  decryptPassword: jest.fn(),
}));

jest.mock('zxcvbn', () => ({
  __esModule: true,
  default: jest.fn((password: string) => ({ score: password === 'strong' ? 4 : 2 })),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick} data-testid="close-button">{children}</button>
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
    <div data-testid="dialog" style={{ display: open ? 'block' : 'none' }}>
      {children}
      <button onClick={() => onOpenChange?.(false)} data-testid="dialog-close">Close</button>
    </div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
}));

jest.mock('@/components/RecoverMasterkeyDialog', () => ({
  RecoverMasterkeyDialog: ({
    isDialogOpen,
    setIsDialogOpen,
  }: {
    isDialogOpen: boolean;
    setIsDialogOpen: (value: boolean) => void;
  }) => (
    <div data-testid="recover-dialog" style={{ display: isDialogOpen ? 'block' : 'none' }}>
      <button onClick={() => setIsDialogOpen(false)} data-testid="recover-close">Zamknij</button>
    </div>
  ),
}));

describe('ShowPasswordDialog', () => {
  const mockZip = {
    file: jest.fn().mockReturnValue({
      async: jest.fn().mockResolvedValue('encrypted:iv'),
    }),
  };
  const mockSetIsDialogOpen = jest.fn();


  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  

  afterAll(() => {
    jest.restoreAllMocks(); 
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: {
        zip: mockZip,
        encryptionKey: 'mock-key',
      },
    });
    (decryptPassword as jest.Mock).mockResolvedValue('strong');
  });

  afterEach(() => {
    document.body.innerHTML = ''; 
  });

  it('renders dialog when open', () => {
    render(
      <ShowPasswordDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        passwordfile="testfile"
        platform="TestPlatform"
        login="testuser"
      />
    );
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Pokaż hasło')).toBeInTheDocument();
    expect(screen.getByText('Podgląd hasła dla TestPlatform')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('shows "Ładowanie..." before password is decrypted', () => {
    render(
      <ShowPasswordDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        passwordfile="testfile"
        platform="TestPlatform"
        login="testuser"
      />
    );
    expect(screen.getByText('Ładowanie...')).toBeInTheDocument();
  });

  it('decrypts and displays password with strength', async () => {
    render(
      <ShowPasswordDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        passwordfile="testfile"
        platform="TestPlatform"
        login="testuser"
      />
    );
    await waitFor(() => {
      expect(screen.getByText('strong')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument(); 
      expect(decryptPassword).toHaveBeenCalledWith('encrypted', 'iv', 'mock-key');
      expect(zxcvbn).toHaveBeenCalledWith('strong');
    });
  });

  it('opens RecoverMasterkeyDialog when encryptionKey is missing', async () => {
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { zip: mockZip, encryptionKey: null },
    });
    render(
      <ShowPasswordDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        passwordfile="testfile"
        platform="TestPlatform"
        login="testuser"
      />
    );
    await waitFor(() => {
      expect(screen.getByTestId('recover-dialog')).toBeInTheDocument();
      expect(screen.getByText('Ładowanie...')).toBeInTheDocument(); 
    });
  });

  it('retries decryption after RecoverMasterkeyDialog closes with encryptionKey', async () => {
    (usePasswordContext as jest.Mock)
      .mockReturnValueOnce({
        state: { zip: mockZip, encryptionKey: null },
      })
      .mockReturnValueOnce({
        state: { zip: mockZip, encryptionKey: 'new-key' },
      });
    (decryptPassword as jest.Mock).mockResolvedValue('weak');

    render(
      <ShowPasswordDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        passwordfile="testfile"
        platform="TestPlatform"
        login="testuser"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('recover-dialog')).toBeInTheDocument();
    });

    const recoverDialog = screen.getByTestId('recover-dialog');
    fireEvent.click(within(recoverDialog).getByTestId('recover-close'));

    await waitFor(() => {
      expect(screen.getByText('weak')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument(); 
      expect(decryptPassword).toHaveBeenCalledWith('encrypted', 'iv', 'new-key');
    });
  });

  it('displays error message on decryption failure', async () => {
    (decryptPassword as jest.Mock).mockRejectedValue(new Error('Decryption failed'));
    render(
      <ShowPasswordDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        passwordfile="testfile"
        platform="TestPlatform"
        login="testuser"
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Błąd deszyfrowania')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByTestId('recover-dialog')).toBeInTheDocument();
    });
  });

  it('closes dialog when "Zamknij" is clicked', () => {
    render(
      <ShowPasswordDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        passwordfile="testfile"
        platform="TestPlatform"
        login="testuser"
      />
    );
    const dialog = screen.getByTestId('dialog');
    fireEvent.click(within(dialog).getByTestId('close-button'));
    expect(mockSetIsDialogOpen).toHaveBeenCalledWith(false);
  });
});