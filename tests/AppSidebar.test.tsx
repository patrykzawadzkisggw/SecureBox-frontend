import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppSidebar } from '@/components/app-sidebar';
import { usePasswordContext } from '@/data/PasswordContext';

jest.mock('@/data/PasswordContext', () => ({
  usePasswordContext: jest.fn(),
}));

jest.mock('@/components/team-switcher', () => ({
  TeamSwitcher: ({ teams }: { teams: any[] }) => (
    <div data-testid="team-switcher">
      {teams.map((team, i) => (
        <div key={i} data-testid="team-name">
          {team.name}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@/components/nav-main', () => ({
  NavMain: ({ items }: { items: any[] }) => (
    <nav data-testid="nav-main">
      {items.map((item, i) => (
        <div key={i} data-testid="nav-item">
          {item.title}
        </div>
      ))}
    </nav>
  ),
}));

jest.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar">{children}</div>
  ),
  SidebarHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-header">{children}</div>
  ),
  SidebarContent: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="sidebar-content">{children}</div>
  ),
  SidebarRail: () => <div data-testid="sidebar-rail" />,
}));

describe('AppSidebar', () => {
  const mockUser = {
    first_name: 'Anna',
    last_name: 'Nowak',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with current user data', () => {
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { currentUser: mockUser },
    });

    render(<AppSidebar />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-rail')).toBeInTheDocument();

    expect(screen.getByTestId('team-switcher')).toBeInTheDocument();
    expect(screen.getByText('Anna Nowak')).toBeInTheDocument();

    expect(screen.getByTestId('nav-main')).toBeInTheDocument();
    expect(screen.getAllByTestId('nav-item')).toHaveLength(4);
    expect(screen.getByText('Główna')).toBeInTheDocument();
    expect(screen.getByText('Hasła')).toBeInTheDocument();
    expect(screen.getByText('Generuj hasło')).toBeInTheDocument();
    expect(screen.getByText('Ustawienia')).toBeInTheDocument();
  });

  it('renders with fallback when user is not available', () => {
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { currentUser: null },
    });

    render(<AppSidebar />);
    expect(screen.getByText('Brak użytkownika')).toBeInTheDocument();
  });
});
