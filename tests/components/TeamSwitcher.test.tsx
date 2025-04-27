import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamSwitcher } from '@/components/team-switcher';

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? children : <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-label">{children}</div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <div onClick={onClick} data-testid="dropdown-item">
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/sidebar', () => ({
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenuButton: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <button className={className} data-testid="sidebar-button">
      {children}
    </button>
  ),
}));

jest.mock('lucide-react', () => ({
  ChevronDown: () => <svg data-testid="chevron-down" />,
  LogOut: () => <svg data-testid="logout-icon" />,
}));

const MockLogo1: React.FC = () => <svg data-testid="active-team-logo-1" />;
const MockLogo2: React.FC = () => <svg data-testid="active-team-logo-2" />;

describe('TeamSwitcher – Przełącznik zespołów', () => {
  const mockLogout = jest.fn();
  const currentUser = { first_name: 'Abc', last_name: 'Xyz' };

  const teams = [
    { name: 'Team 1', logo: MockLogo1 },
    { name: 'Team 2', logo: MockLogo2 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('nie renderuje nic, jeśli lista zespołów jest pusta', () => {
    const { container } = render(
      <TeamSwitcher teams={[]} logout={mockLogout} currentUser={currentUser} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renderuje nazwę użytkownika i ikonę zespołu', () => {
    render(
      <TeamSwitcher teams={teams} logout={mockLogout} currentUser={currentUser} />
    );
    expect(screen.getByText('Abc Xyz')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
  });

  it('otwiera menu rozwijane i wyświetla zespoły oraz opcję wylogowania', () => {
    render(
      <TeamSwitcher teams={teams} logout={mockLogout} currentUser={currentUser} />
    );
    fireEvent.click(screen.getByTestId('sidebar-button'));
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-label')).toHaveTextContent('Konto');
    expect(screen.getAllByTestId('dropdown-item').length).toBe(3); // 2 zespoły + wylogowanie
    expect(screen.getByText('Team 1')).toBeInTheDocument();
    expect(screen.getByText('Team 2')).toBeInTheDocument();
    expect(screen.getByText('Wyloguj')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-separator')).toBeInTheDocument();
  });

  it('wywołuje funkcję logout po kliknięciu opcji "Wyloguj"', () => {
    render(
      <TeamSwitcher teams={teams} logout={mockLogout} currentUser={currentUser} />
    );
    fireEvent.click(screen.getByTestId('sidebar-button'));
    const logoutItem = screen.getAllByTestId('dropdown-item').find((item) =>
      item.textContent?.includes('Wyloguj')
    );
    fireEvent.click(logoutItem!);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('wyświetla ikonę wylogowania w menu', () => {
    render(
      <TeamSwitcher teams={teams} logout={mockLogout} currentUser={currentUser} />
    );
    fireEvent.click(screen.getByTestId('sidebar-button'));
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
  });
});
