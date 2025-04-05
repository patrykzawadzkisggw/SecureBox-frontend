import { render, screen } from '@testing-library/react';
import ActivityList from '../src/components/ActivityList';
import { usePasswordContext } from '../src/data/PasswordContext';

jest.mock('../src/data/PasswordContext', () => ({
  usePasswordContext: jest.fn(),
}));

jest.mock('@/lib/functions', () => ({
  extractDomain: jest.fn((url) => url),
}));

describe('ActivityList', () => {
  it('renders message when user is not logged in', () => {
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { currentUser: null, userLogins: [] },
    });

    render(<ActivityList />);
    expect(
      screen.getByText('Zaloguj się, aby zobaczyć aktywności.')
    ).toBeInTheDocument();
  });

  it('renders message when no activities are available', () => {
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { currentUser: { id: '1' }, userLogins: [] },
    });

    render(<ActivityList />);
    expect(
      screen.getByText('Brak aktywności do wyświetlenia.')
    ).toBeInTheDocument();
  });

  it('renders user activity correctly', () => {
    const mockActivities = [
      {
        user_id: '1',
        timestamp: new Date().toISOString(),
        login: 'user@example.com',
        page: 'example.com',
      },
    ];

    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { currentUser: { id: '1' }, userLogins: mockActivities },
    });

    render(<ActivityList />);

    expect(screen.getByText('Dziś')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });
});
