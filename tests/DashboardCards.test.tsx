import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardCards from '../src/components/DashboardCards';
import { usePasswordContext } from '../src/data/PasswordContext';

jest.mock('../src/data/PasswordContext', () => ({
  usePasswordContext: jest.fn(),
}));

describe('DashboardCards', () => {
  it('renders all cards correctly', () => {
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { passwords: [], history: [] },
    });

    render(
      <MemoryRouter>
        <DashboardCards />
      </MemoryRouter>
    );

    expect(screen.getByText('Dodaj nowe hasło')).toBeInTheDocument();
    expect(screen.getByText('Generuj hasło')).toBeInTheDocument();
    expect(screen.getByText('Średnia jakość hasła')).toBeInTheDocument();
  });

  it('opens AddPasswordDialog when clicking the add password card', () => {
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { passwords: [], history: [] },
    });

    render(
      <MemoryRouter>
        <DashboardCards />
      </MemoryRouter>
    );

    const addPasswordCard = screen.getByText('Dodaj nowe hasło');
    fireEvent.click(addPasswordCard);
    
    expect(screen.getByText('Dodaj hasło')).toBeInTheDocument();
  });

  it('calculates the correct average strength', () => {
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: {
        passwords: [{ platform: 'example.com', login: 'user@example.com' }],
        history: [
          { platform: 'example.com', login: 'user@example.com', strength: 80 },
          { platform: 'example.com', login: 'user@example.com', strength: 60 },
        ],
      },
    });

    render(
      <MemoryRouter>
        <DashboardCards />
      </MemoryRouter>
    );

    expect(screen.getByText('70%')).toBeInTheDocument();
  });
});
