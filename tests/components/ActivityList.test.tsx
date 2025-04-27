import { render, screen } from '@testing-library/react';
import ActivityList from '@/components/ActivityList';

describe('Komponent ActivityList', () => {
  const mockUser = {
    first_name: 'Patryk',
    id: '67eb5b5d-4b18-482c-a338-f761e5086811',
    last_name: 'Zawadzki',
    login: 'user123@gmail.com',
    password: '****',
  };

  const mockLogins = [
    {
      time: '13:24',
      date: 'Dziś',
      name: 'https://int.pl/#/login-clear',
      email: 'zawadzkip2@int.pl',
      color: 'bg-purple-500',
    },
    {
      time: '09:15',
      date: 'Wczoraj',
      name: 'https://example.com',
      email: 'user@example.com',
      color: 'bg-blue-500',
    },
  ];



  it('wyświetla komunikat o logowaniu, gdy użytkownik nie jest zalogowany', () => {
    render(<ActivityList user={null} logins={mockLogins} />);

    expect(
      screen.getByText('Zaloguj się, aby zobaczyć aktywności.')
    ).toBeInTheDocument();
  });

  it('wyświetla komunikat o braku aktywności, gdy tablica logowań jest pusta', () => {
    render(<ActivityList user={mockUser} logins={[]} />);

    expect(
      screen.getByText('Brak aktywności do wyświetlenia.')
    ).toBeInTheDocument();
  });

  it('renderuje listę aktywności z poprawnymi danymi', () => {
    render(<ActivityList user={mockUser} logins={mockLogins} />);

    expect(screen.getByText('int.pl')).toBeInTheDocument();
    expect(screen.getByText('zawadzkip2@int.pl')).toBeInTheDocument();
    expect(screen.getByText('13:24')).toBeInTheDocument();
    expect(screen.getByText('Dziś')).toBeInTheDocument();

    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('09:15')).toBeInTheDocument();
    expect(screen.getByText('Wczoraj')).toBeInTheDocument();
  });

  
});