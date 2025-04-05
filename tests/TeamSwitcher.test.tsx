import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamSwitcher } from '@/components/team-switcher';
import { usePasswordContext } from '@/data/PasswordContext';

jest.mock('@/data/PasswordContext', () => ({
  usePasswordContext: jest.fn(),
}));

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

describe('TeamSwitcher', () => {
  const mockLogout = jest.fn();
  const teams = [
    { name: 'Team 1', logo: MockLogo1, plan: 'Basic' },
    { name: 'Team 2', logo: MockLogo2, plan: 'Pro' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: {
        currentUser: { first_name: 'Abc', last_name: 'Xyz' },
      },
      logout: mockLogout,
    });
  });

  afterEach(() => {
    document.body.innerHTML = ''; 
  });

  it('renders nothing when no active team is provided', () => {
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { currentUser: null },
      logout: mockLogout,
    });
    const { container } = render(<TeamSwitcher teams={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders user name and active team logo', () => {
    render(<TeamSwitcher teams={teams} />);
    expect(screen.getByText('Abc Xyz')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
  });

  it('opens dropdown menu and displays teams', () => {
    render(<TeamSwitcher teams={teams} />);
    fireEvent.click(screen.getByTestId('sidebar-button'));
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-label')).toHaveTextContent('Konto');
    expect(screen.getAllByTestId('dropdown-item').length).toBe(3);
    expect(screen.getByText('Team 1')).toBeInTheDocument();
    expect(screen.getByText('Team 2')).toBeInTheDocument();
    expect(screen.getByText('Wyloguj')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-separator')).toBeInTheDocument();
  });

  it('calls logout when "Wyloguj" is clicked', () => {
    render(<TeamSwitcher teams={teams} />);
    fireEvent.click(screen.getByTestId('sidebar-button'));
    const logoutItem = screen.getAllByTestId('dropdown-item').find((item) =>
      item.textContent?.includes('Wyloguj')
    );
    fireEvent.click(logoutItem!);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('displays logout icon in the dropdown', () => {
    render(<TeamSwitcher teams={teams} />);
    fireEvent.click(screen.getByTestId('sidebar-button'));
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
  });

});