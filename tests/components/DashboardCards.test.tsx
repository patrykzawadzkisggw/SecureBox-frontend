import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardCards from '@/components/DashboardCards';
import { calculateAverageStrength } from '@/lib/functions';
import { PasswordHistory, PasswordTable } from '@/data/PasswordContext';


jest.mock('@/components/AddPasswordDialog', () => ({
  AddPasswordDialog: jest.fn(({ isDialogOpen, setIsDialogOpen, onSubmit }) => (
    <div data-testid="add-password-dialog" style={{ display: isDialogOpen ? 'block' : 'none' }}>
      Dialog dodawania hasła
    </div>
  )),
}));

jest.mock('@/lib/functions', () => ({
  calculateAverageStrength: jest.fn(),
}));

jest.mock('@/data/PasswordContext', () => ({
  usePasswordContext: jest.fn(),
  PasswordHistory: jest.fn(),
  PasswordTable: jest.fn(),
}));

describe('Komponent DashboardCards', () => {
  const mockAddPassword = jest.fn().mockResolvedValue(undefined);
  const mockHistory: PasswordHistory[] = [
    {
      id: 'https://int.pl/#/login-clear-zawadzkip2@int.pl',
      platform: 'https://int.pl/#/login-clear',
      login: 'zawadzkip2@int.pl',
      strength: 100,
      timestamp: '2025-04-25T15:07:10.160Z',
    },
  ];
  const mockPasswords: any = [
    {
      id: '12402267-23f4-471d-b4a8-665b42951af6',
      passwordfile: '2c1983cb.txt',
      logo: 'https://img.freepik.com/darmowe-wektory/nowy-projekt-ikony-x-logo-twittera-2023_1017-45418.jpg?semt=ais_hybrid',
      platform: 'https://int.pl/#/login-clear',
      login: 'zawadzkip2@int.pl',
      userId: '67eb5b5d-4b18-482c-a338-f761e5086811',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (calculateAverageStrength as jest.Mock).mockReturnValue(75);
  });

  it('renderuje DashboardCards z trzema kartami', () => {
    render(
      <MemoryRouter>
        <DashboardCards
          addPassword={mockAddPassword}
          history={mockHistory}
          passwords={mockPasswords}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Dodaj nowe hasło')).toBeInTheDocument();
    expect(screen.getByText('Generuj hasło')).toBeInTheDocument();
    expect(screen.getByText('Średnia jakość hasła')).toBeInTheDocument();
  });

  it('otwiera dialog dodawania hasła po kliknięciu w kartę "Dodaj nowe hasło"', async () => {
    render(
      <MemoryRouter>
        <DashboardCards
          addPassword={mockAddPassword}
          history={mockHistory}
          passwords={mockPasswords}
        />
      </MemoryRouter>
    );

    const kartaDodajHaslo = screen.getByText('Dodaj nowe hasło').closest('div');
    fireEvent.click(kartaDodajHaslo!);

    await waitFor(() => {
      expect(screen.getByTestId('add-password-dialog')).toBeInTheDocument();
    });
  });


  it('renderuje link do /genpass w karcie "Generuj hasło"', () => {
    render(
      <MemoryRouter>
        <DashboardCards
          addPassword={mockAddPassword}
          history={mockHistory}
          passwords={mockPasswords}
        />
      </MemoryRouter>
    );

    const linkGenerujHaslo = screen.getByText('Generuj hasło').closest('a');
    expect(linkGenerujHaslo).toHaveAttribute('href', '/genpass');
  });

  it('wyświetla poprawnie średnią jakość hasła', () => {
    render(
      <MemoryRouter>
        <DashboardCards
          addPassword={mockAddPassword}
          history={mockHistory}
          passwords={mockPasswords}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(calculateAverageStrength).toHaveBeenCalledWith(mockHistory, mockPasswords);
  });


  it('renderuje ikony z lucide-react w kartach', () => {
    render(
      <MemoryRouter>
        <DashboardCards
          addPassword={mockAddPassword}
          history={mockHistory}
          passwords={mockPasswords}
        />
      </MemoryRouter>
    );

    const ikonaKlodki = screen.getByText('Dodaj nowe hasło').parentElement?.querySelector('svg');
    const ikonaRozdzki = screen.getByText('Generuj hasło').parentElement?.querySelector('svg');
    const ikonaWskaznika = screen.getByText('Średnia jakość hasła').parentElement?.querySelector('svg');

    expect(ikonaKlodki).toBeInTheDocument();
    expect(ikonaRozdzki).toBeInTheDocument();
    expect(ikonaWskaznika).toBeInTheDocument();
  });

  it('renderuje poprawnie z pustą historią i hasłami', () => {
    (calculateAverageStrength as jest.Mock).mockReturnValue(0);

    render(
      <MemoryRouter>
        <DashboardCards
          addPassword={mockAddPassword}
          history={[]}
          passwords={[]}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Dodaj nowe hasło')).toBeInTheDocument();
    expect(screen.getByText('Generuj hasło')).toBeInTheDocument();
    expect(screen.getByText('Średnia jakość hasła')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});