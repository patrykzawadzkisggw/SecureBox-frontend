import { render, screen, fireEvent } from '@testing-library/react';
import RecentlyAdded from '@/components/RecentlyAdded';


describe('Komponent RecentlyAdded', () => {
  const mockAddPassword = jest.fn();
  const mockData: any = [
    {
      id: 1,
      platform: 'https://example.com',
      login: 'user@example.com',
      strength: 80,
      timestamp: '2025-04-25T13:24:47.961Z',
    },
    {
      id: 2,
      platform: 'https://test.com',
      login: 'test@example.com',
      strength: 60,
      timestamp: '2025-04-24T10:00:00.000Z',
    },
  ];

  const mockData2: any = [
    {
      id: 445,
      passwordfile: 'plik.txt',
      logo: 'logo.png',
      platform: 'https://example.com',
      login: 'user@example.com'
    },
    {
      id: 56,
      passwordfile: 'plik2.txt',
      logo: 'logo2.png',
      platform: 'https://test.com',
      login: 'test@example.com'
    },
  ];


  it('renderuje listę ostatnio użytych haseł z poprawnymi danymi', () => {
    render(<RecentlyAdded data={mockData} addPassword={mockAddPassword} passwords={mockData2} />);

    expect(screen.getByText('Ostatnio użyte')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('test.com')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('user@example.com'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('test@example.com'))).toBeInTheDocument();
  });

  it('wyświetla komunikat o braku danych, gdy tablica haseł jest pusta', () => {
    render(<RecentlyAdded data={[]} addPassword={mockAddPassword} passwords={mockData2} />);

    expect(
      screen.getByText('Brak ostatnio dodanych lub odczytanych haseł dla istniejących kont.')
    ).toBeInTheDocument();
  });

  it('otwiera dialog po kliknięciu przycisku "Nowy"', () => {
    render(<RecentlyAdded data={mockData} addPassword={mockAddPassword} passwords={mockData2}/>);

    const button = screen.getByRole('button', { name: /Nowy/i });
    fireEvent.click(button);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});