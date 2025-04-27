import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import ExportToJSON from '@/components/ExportToJSON';
import { decryptPassword } from '@/data/PasswordContext';
import { toast } from 'sonner';
import JSZip from 'jszip';

jest.mock('@/data/PasswordContext', () => ({
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
        <button disabled={disabled} onClick={onClick} data-testid="export-button">
            {children}
        </button>
    ),
}));

jest.mock('lucide-react', () => ({
    Download: () => <svg data-testid="download-icon" />,
}));

jest.mock('@/components/RecoverMasterkeyDialog', () => ({
    RecoverMasterkeyDialog: ({
        isDialogOpen,
        setIsDialogOpen,
        setMasterkey,
    }: {
        isDialogOpen: boolean;
        setIsDialogOpen: (value: boolean) => void;
        setMasterkey: (masterkey: string) => Promise<void>;
    }) => (
        <div data-testid="recover-dialog" style={{ display: isDialogOpen ? 'block' : 'none' }}>
            <button
                data-testid="submit-button"
                onClick={() => {
                    setMasterkey('newMasterkey');
                    setIsDialogOpen(false);
                }}
            >
                Submit
            </button>
            <button data-testid="close-button" onClick={() => setIsDialogOpen(false)}>
                Zamknij
            </button>
        </div>
    ),
}));

const mockCreateObjectURL = jest.fn(() => 'mock-url');
const mockRevokeObjectURL = jest.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

const mockZip = {
    file: jest.fn((fileName: string) =>
        fileName === 'validFile'
            ? {
                    async: jest.fn(() => Promise.resolve('encrypted:iv')),
                }
            : null
    ),
};

beforeAll(() => {
    if (typeof document === 'undefined') {
        throw new Error('document is not defined. Ensure Jest is configured with the "jsdom" test environment.');
    }
});

describe('ExportToJSON', () => {
    const defaultProps = {
        zip: mockZip as unknown as JSZip,
        passwords: [
            { id: '1', platform: 'test1', login: 'user1', passwordfile: 'validFile', logo: '' },
            { id: '2', platform: 'test2', login: 'user2', passwordfile: 'invalidFile', logo: '' },
        ],
        encryptionKey: { algorithm: { name: 'AES-GCM' } } as CryptoKey,
        loading: false,
        setMasterkey: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (decryptPassword as jest.Mock).mockResolvedValue('decryptedPass');
        mockCreateObjectURL.mockReturnValue('mock-url');
        console.error = jest.fn();
        console.warn = jest.fn();
    });

    afterEach(() => {
        cleanup();
        jest.restoreAllMocks();
    });

    it('powinien renderować przycisk eksportu z ikoną pobierania', () => {
        render(<ExportToJSON {...defaultProps} />);
        expect(screen.getByText('Eksportuj do JSON')).toBeInTheDocument();
        expect(screen.getByTestId('download-icon')).toBeInTheDocument();
        expect(screen.getByTestId('export-button')).not.toBeDisabled();
    });

    it('powinien wyłączyć przycisk, gdy loading jest true', () => {
        render(<ExportToJSON {...defaultProps} loading={true} />);
        expect(screen.getByTestId('export-button')).toBeDisabled();
    });

    it('powinien wyłączyć przycisk, gdy tablica passwords jest pusta', () => {
        render(<ExportToJSON {...defaultProps} passwords={[]} />);
        expect(screen.getByTestId('export-button')).toBeDisabled();
    });

    it('powinien wyłączyć przycisk i pokazać "Eksportowanie..." podczas eksportu', async () => {
        render(<ExportToJSON {...defaultProps} />);
        fireEvent.click(screen.getByText('Eksportuj do JSON'));
        expect(screen.getByText('Eksportowanie...')).toBeInTheDocument();
        expect(screen.getByTestId('export-button')).toBeDisabled();

        await waitFor(() => {
            expect(screen.getByText('Eksportuj do JSON')).toBeInTheDocument();
        });
    });


    it('powinien pomyślnie wyeksportować hasła do JSON', async () => {
        const mockLink = {
            setAttribute: jest.fn(),
            click: jest.fn(),
        } as unknown as HTMLAnchorElement;


        render(<ExportToJSON {...defaultProps} />);

        const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
        const mockAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
        const mockRemoveChild = jest.spyOn(document.body, 'removeChild').mockImplementation(() => undefined as unknown as Node);

        fireEvent.click(screen.getByText('Eksportuj do JSON'));

        await waitFor(() => {
            expect(decryptPassword).toHaveBeenCalledWith('encrypted', 'iv', defaultProps.encryptionKey);
            expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
            expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'mock-url');
            expect(mockLink.setAttribute).toHaveBeenCalledWith(
                'download',
                expect.stringMatching(/passwords_export_\d{4}-\d{2}-\d{2}\.json/)
            );
            expect(mockLink.click).toHaveBeenCalled();
            expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
            expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
            expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');
            expect(toast.success).toHaveBeenCalledWith('Eksport zakończony!', {
                description: 'Plik JSON z hasłami został pobrany.',
                duration: 3000,
            });
        });
    });

    it('powinien pokazać błąd i otworzyć dialog odzyskiwania, gdy brakuje klucza szyfrowania', async () => {
        render(<ExportToJSON {...defaultProps} encryptionKey={undefined} />);
        fireEvent.click(screen.getByText('Eksportuj do JSON'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Błąd!', {
                description: 'Nie udało się wyeksportować haseł do JSON: Brak klucza szyfrowania',
                duration: 3000,
            });
            expect(screen.getByTestId('recover-dialog')).toBeInTheDocument();
        });
    });


    it('powinien ponowić próbę eksportu po ustawieniu klucza głównego przez dialog odzyskiwania', async () => {
        const mockLink = {
            setAttribute: jest.fn(),
            click: jest.fn(),
        } as unknown as HTMLAnchorElement;

        const { rerender } = render(<ExportToJSON {...defaultProps} encryptionKey={undefined} />);

        fireEvent.click(screen.getByText('Eksportuj do JSON'));

        await waitFor(() => {
            expect(screen.getByTestId('recover-dialog')).toBeInTheDocument();
        });

        const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
        const mockAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
        const mockRemoveChild = jest.spyOn(document.body, 'removeChild').mockImplementation(() => undefined as unknown as Node);


        fireEvent.click(screen.getByTestId('submit-button'));

        rerender(<ExportToJSON {...defaultProps} />);

        await waitFor(() => {
            expect(defaultProps.setMasterkey).toHaveBeenCalledWith('newMasterkey');
            expect(decryptPassword).toHaveBeenCalledWith('encrypted', 'iv', defaultProps.encryptionKey);
            expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
            expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'mock-url');
            expect(mockLink.setAttribute).toHaveBeenCalledWith(
                'download',
                expect.stringMatching(/passwords_export_\d{4}-\d{2}-\d{2}\.json/)
            );
            expect(mockLink.click).toHaveBeenCalled();
            expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
            expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
            expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');
            expect(toast.success).toHaveBeenCalledWith('Eksport zakończony!', {
                description: 'Plik JSON z hasłami został pobrany.',
                duration: 3000,
            });
        });

    });

    it('powinien obsłużyć błędy deszyfrowania i pokazać powiadomienie o błędzie', async () => {
        (decryptPassword as jest.Mock).mockRejectedValue(new Error('Decryption failed'));

        render(<ExportToJSON {...defaultProps} />);
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

    it('powinien pominąć nieprawidłowe zaszyfrowane dane i kontynuować przetwarzanie', async () => {
        (mockZip.file as jest.Mock).mockImplementation((fileName: string) =>
            fileName === 'validFile'
                ? {
                        async: jest.fn(() => Promise.resolve('invalidEncrypted')),
                    }
                : null
        );

        render(<ExportToJSON {...defaultProps} />);
        fireEvent.click(screen.getByText('Eksportuj do JSON'));

        await waitFor(() => {
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('Nieprawidłowy format hasła dla test1/user1')
            );
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('Nie znaleziono hasła dla test2/user2')
            );
            expect(decryptPassword).not.toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith('Eksport zakończony!', {
                description: 'Plik JSON z hasłami został pobrany.',
                duration: 3000,
            });
        });
    });

    it('powinien pokazać błąd, gdy zip jest null', async () => {
        render(<ExportToJSON {...defaultProps} zip={null} />);
        fireEvent.click(screen.getByText('Eksportuj do JSON'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Błąd!', {
                description: 'Nie udało się wyeksportować haseł do JSON: Brak danych do eksportu',
                duration: 3000,
            });
            expect(screen.getByTestId('recover-dialog')).toBeInTheDocument();
        });
    });
});
