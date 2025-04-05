import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UpdateMasterkeyDialog } from '@/components/UpdateMasterkeyDialog';
import { usePasswordContext, decryptPassword, encryptPassword, deriveEncryptionKeyFromMasterkey, encryptMasterkey, decryptMasterkey } from '@/data/PasswordContext';
import axios from 'axios';
import { toast } from 'sonner';
import JSZip from 'jszip';

jest.mock('@/data/PasswordContext', () => ({
  usePasswordContext: jest.fn(),
  decryptPassword: jest.fn(),
  encryptPassword: jest.fn(),
  deriveEncryptionKeyFromMasterkey: jest.fn(),
  encryptMasterkey: jest.fn(),
  decryptMasterkey: jest.fn(),
}));

jest.mock('axios');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('jszip', () => ({
  loadAsync: jest.fn(),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant }: { children: React.ReactNode; onClick?: () => void; variant?: string }) => (
    <button onClick={onClick} data-testid={variant === 'outline' ? 'cancel-button' : 'save-button'}>{children}</button>
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
    <div data-testid="dialog" style={{ display: open ? 'block' : 'none' }}>
      {children}
    </div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ id, type, value, onChange, className }: { id: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string }) => (
    <input id={id} type={type} value={value} onChange={onChange} className={className} data-testid={id} />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) => <label htmlFor={htmlFor}>{children}</label>,
}));

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  const localStorageMock = {
    getItem: jest.fn().mockReturnValue('encryptedMasterkey'),
    setItem: jest.fn(),
    clear: jest.fn(),
    removeItem: jest.fn(),
  };
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
});

afterAll(() => {
  jest.restoreAllMocks(); 
});
describe('UpdateMasterkeyDialog', () => {
  const mockSetIsDialogOpen = jest.fn();
  const mockZip = {
    file: jest.fn().mockReturnValue({
      async: jest.fn().mockResolvedValue('encrypted:iv'),
    }),
  };
  const apiUrl = 'http://localhost:3000';

  beforeEach(() => {
    jest.clearAllMocks();
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: {
        currentUser: { id: 'user1', password: 'hashedPassword' },
        token: 'mockToken',
        passwords: [
          { platform: 'Platform1', login: 'login1', passwordfile: 'file1' },
          { platform: 'Platform2', login: 'login2', passwordfile: 'file2' },
        ],
      },
    });
    (axios.get as jest.Mock).mockResolvedValue({ data: 'mockZipData' });
    (axios.put as jest.Mock).mockResolvedValue({});
    (JSZip.loadAsync as jest.Mock).mockResolvedValue(mockZip);
    (decryptMasterkey as jest.Mock).mockResolvedValue('oldMasterkey');
    (deriveEncryptionKeyFromMasterkey as jest.Mock).mockImplementation((masterkey) => masterkey === 'oldMasterkey' ? 'oldKey' : 'newKey');
    (decryptPassword as jest.Mock).mockResolvedValue('decryptedPass');
    (encryptPassword as jest.Mock).mockResolvedValue({ encrypted: 'newEncrypted', iv: 'newIv' });
    (encryptMasterkey as jest.Mock).mockResolvedValue('newEncryptedMasterkey');
    process.env.VITE_API_URL = apiUrl;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete process.env.VITE_API_URL;
  });

  it('renders dialog when open', () => {
    render(<UpdateMasterkeyDialog isDialogOpen={true} setIsDialogOpen={mockSetIsDialogOpen} />);
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Zmień Masterkey')).toBeInTheDocument();
    expect(screen.getByText('Aktualizuj swoje hasło szyfrowania (masterkey).')).toBeInTheDocument();
    expect(screen.getByTestId('oldMasterkey')).toBeInTheDocument();
    expect(screen.getByTestId('newMasterkey')).toBeInTheDocument();
    expect(screen.getByTestId('confirmNewMasterkey')).toBeInTheDocument();
  });

  it('shows error when fields are empty', async () => {
    render(<UpdateMasterkeyDialog isDialogOpen={true} setIsDialogOpen={mockSetIsDialogOpen} />);
    fireEvent.click(screen.getByTestId('save-button'));
    await waitFor(() => {
      expect(screen.getByText('Wszystkie pola są wymagane.')).toBeInTheDocument();
    });
  });

  it('shows error when new masterkey and confirmation do not match', async () => {
    render(<UpdateMasterkeyDialog isDialogOpen={true} setIsDialogOpen={mockSetIsDialogOpen} />);
    fireEvent.change(screen.getByTestId('oldMasterkey'), { target: { value: 'oldMasterkey' } });
    fireEvent.change(screen.getByTestId('newMasterkey'), { target: { value: 'newMasterkey' } });
    fireEvent.change(screen.getByTestId('confirmNewMasterkey'), { target: { value: 'different' } });
    fireEvent.click(screen.getByTestId('save-button'));
    await waitFor(() => {
      expect(screen.getByText('Nowe hasło masterkey i jego potwierdzenie muszą być identyczne.')).toBeInTheDocument();
    });
  });

  it('shows error when old masterkey is incorrect', async () => {
    (decryptMasterkey as jest.Mock).mockResolvedValue('correctOldMasterkey'); 
    render(<UpdateMasterkeyDialog isDialogOpen={true} setIsDialogOpen={mockSetIsDialogOpen} />);
    fireEvent.change(screen.getByTestId('oldMasterkey'), { target: { value: 'wrongOldMasterkey' } });
    fireEvent.change(screen.getByTestId('newMasterkey'), { target: { value: 'newMasterkey' } });
    fireEvent.change(screen.getByTestId('confirmNewMasterkey'), { target: { value: 'newMasterkey' } });
    fireEvent.click(screen.getByTestId('save-button'));
    await waitFor(() => {
      expect(screen.getByText('Podane stare masterkey jest nieprawidłowe.')).toBeInTheDocument();
    });
  });

  it('successfully updates masterkey', async () => {
    render(<UpdateMasterkeyDialog isDialogOpen={true} setIsDialogOpen={mockSetIsDialogOpen} />);
    fireEvent.change(screen.getByTestId('oldMasterkey'), { target: { value: 'oldMasterkey' } });
    fireEvent.change(screen.getByTestId('newMasterkey'), { target: { value: 'newMasterkey' } });
    fireEvent.change(screen.getByTestId('confirmNewMasterkey'), { target: { value: 'newMasterkey' } });
    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        `${apiUrl}/passwords/user1/files`,
        { responseType: 'blob', headers: { Authorization: 'Bearer mockToken' } }
      );
      expect(decryptMasterkey).toHaveBeenCalledWith('encryptedMasterkey', '123');
      expect(deriveEncryptionKeyFromMasterkey).toHaveBeenCalledWith('oldMasterkey');
      expect(decryptPassword).toHaveBeenCalledTimes(2);
      expect(encryptPassword).toHaveBeenCalledTimes(2);
      expect(axios.put).toHaveBeenCalledWith(
        `${apiUrl}/passwords/user1/passwords`,
        { passwordsall: expect.any(Array) },
        { headers: { Authorization: 'Bearer mockToken' } }
      );
      expect(toast.success).toHaveBeenCalledWith('Masterkey zaktualizowany pomyślnie!', { duration: 3000 });
      expect(localStorage.setItem).toHaveBeenCalledWith('masterkey', 'newEncryptedMasterkey');
      expect(mockSetIsDialogOpen).toHaveBeenCalledWith(false);
    });
  });

  it('shows error on update failure', async () => {
    (axios.put as jest.Mock).mockRejectedValue(new Error('Update failed'));
    render(<UpdateMasterkeyDialog isDialogOpen={true} setIsDialogOpen={mockSetIsDialogOpen} />);
    fireEvent.change(screen.getByTestId('oldMasterkey'), { target: { value: 'oldMasterkey' } });
    fireEvent.change(screen.getByTestId('newMasterkey'), { target: { value: 'newMasterkey' } });
    fireEvent.change(screen.getByTestId('confirmNewMasterkey'), { target: { value: 'newMasterkey' } });
    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(screen.getByText('Nie udało się zaktualizować masterkey. Sprawdź dane i spróbuj ponownie.')).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith('Błąd aktualizacji masterkey!', {
        description: 'Update failed',
        duration: 3000,
      });
    });
  });

  it('closes dialog when "Anuluj" is clicked', () => {
    render(<UpdateMasterkeyDialog isDialogOpen={true} setIsDialogOpen={mockSetIsDialogOpen} />);
    fireEvent.click(screen.getByTestId('cancel-button'));
    expect(mockSetIsDialogOpen).toHaveBeenCalledWith(false);
  });
});