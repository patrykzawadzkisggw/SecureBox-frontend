import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImportFromJSON from '@/components/ImportFromJSON';
import { usePasswordContext } from '@/data/PasswordContext';
import { toast } from 'sonner';

jest.mock('@/data/PasswordContext', () => ({
  usePasswordContext: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    disabled,
    asChild,
    ...props
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    asChild?: boolean;
  } & (React.ButtonHTMLAttributes<HTMLButtonElement> | React.HTMLAttributes<HTMLDivElement>)) => {
    if (asChild) {
      const divProps = { ...props } as React.HTMLAttributes<HTMLDivElement>;
      return (
        <div {...divProps} data-disabled={disabled ? 'true' : undefined}>
          {children}
        </div>
      );
    }
    const buttonProps = { ...props } as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button {...buttonProps} disabled={disabled}>
        {children}
      </button>
    );
  },
}));

jest.mock('lucide-react', () => ({
  Upload: () => <svg data-testid="upload-icon" />,
}));

beforeAll(() => {
  if (!File.prototype.text) {
    Object.defineProperty(File.prototype, 'text', {
      value: jest.fn(function () {
        return Promise.resolve(this.toString());
      }),
      writable: true,
    });
  }
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('ImportFromJSON', () => {
  const mockAddPassword = jest.fn();
  const mockUpdatePassword = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { loading: false, passwords: [] },
      addPassword: mockAddPassword,
      updatePassword: mockUpdatePassword,
    });
  });

  it('renders the import button', () => {
    render(<ImportFromJSON />);
    expect(screen.getByText('Importuj z JSON')).toBeInTheDocument();
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
  });

  it('disables button when state.loading is true', () => {
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { loading: true, passwords: [] },
      addPassword: mockAddPassword,
      updatePassword: mockUpdatePassword,
    });

    render(<ImportFromJSON />);
    const buttonContainer = screen.getByText('Importuj z JSON').parentElement;
    expect(buttonContainer).toHaveAttribute('data-disabled', 'true');
  });

  it('disables button and shows "Importowanie..." when importing', async () => {
    render(<ImportFromJSON />);
    const input = document.getElementById('json-import') as HTMLInputElement;

    const file = new File(['[]'], 'test.json', { type: 'application/json' });
    (File.prototype.text as jest.Mock).mockResolvedValueOnce('[]');

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(screen.getByText('Importowanie...')).toBeInTheDocument();
    const buttonContainer = screen.getByText('Importowanie...').parentElement;
    expect(buttonContainer).toHaveAttribute('data-disabled', 'true');

    await waitFor(() => {
      expect(screen.getByText('Importuj z JSON')).toBeInTheDocument();
    });
  });

  it('imports valid JSON and adds new passwords', async () => {
    const mockPasswords = [
      { platform: 'test1', login: 'user1', password: 'pass1' },
      { platform: 'test2', login: 'user2', password: 'pass2' },
    ];
    const mockFile = new File([JSON.stringify(mockPasswords)], 'test.json', {
      type: 'application/json',
    });

    (File.prototype.text as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockPasswords));
    mockAddPassword.mockResolvedValue(undefined);

    render(<ImportFromJSON />);
    const input = document.getElementById('json-import') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockAddPassword).toHaveBeenCalledTimes(2);
      expect(mockAddPassword).toHaveBeenCalledWith('pass1', 'test1', 'user1');
      expect(mockAddPassword).toHaveBeenCalledWith('pass2', 'test2', 'user2');
      expect(toast.success).toHaveBeenCalledWith('Import zakończony!', {
        description: 'Hasła zostały zaimportowane z pliku JSON.',
        duration: 3000,
      });
    });
  });

  it('updates existing passwords in JSON', async () => {
    const mockPasswords = [{ platform: 'test1', login: 'user1', password: 'newpass' }];
    const mockFile = new File([JSON.stringify(mockPasswords)], 'test.json', {
      type: 'application/json',
    });

    (usePasswordContext as jest.Mock).mockReturnValue({
      state: {
        loading: false,
        passwords: [{ platform: 'test1', login: 'user1', password: 'oldpass' }],
      },
      addPassword: mockAddPassword,
      updatePassword: mockUpdatePassword.mockResolvedValue(undefined),
    });

    (File.prototype.text as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockPasswords));

    render(<ImportFromJSON />);
    const input = document.getElementById('json-import') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith('newpass', 'test1', 'user1');
      expect(mockAddPassword).not.toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Import zakończony!', {
        description: 'Hasła zostały zaimportowane z pliku JSON.',
        duration: 3000,
      });
    });
  });

  it('handles invalid JSON and shows error', async () => {
    const mockFile = new File(['not a json'], 'test.json', { type: 'application/json' });

    (File.prototype.text as jest.Mock).mockResolvedValueOnce('not a json');

    render(<ImportFromJSON />);
    const input = document.getElementById('json-import') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Błąd!', {
        description: 'Nie udało się zaimportować haseł z JSON.',
        duration: 3000,
      });
      expect(mockAddPassword).not.toHaveBeenCalled();
      expect(mockUpdatePassword).not.toHaveBeenCalled();
    });
  });

  it('skips invalid entries and imports valid ones', async () => {
    const mockPasswords = [
      { platform: 'test1', login: 'user1' }, 
      { platform: 'test2', login: 'user2', password: 'pass2' },
    ];
    const mockFile = new File([JSON.stringify(mockPasswords)], 'test.json', {
      type: 'application/json',
    });

    (File.prototype.text as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockPasswords));
    mockAddPassword.mockResolvedValue(undefined);

    render(<ImportFromJSON />);
    const input = document.getElementById('json-import') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockAddPassword).toHaveBeenCalledTimes(1);
      expect(mockAddPassword).toHaveBeenCalledWith('pass2', 'test2', 'user2');
      expect(toast.success).toHaveBeenCalledWith('Import zakończony!', {
        description: 'Hasła zostały zaimportowane z pliku JSON.',
        duration: 3000,
      });
    });
  });
});