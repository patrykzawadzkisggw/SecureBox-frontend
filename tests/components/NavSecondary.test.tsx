import { render, screen } from "@testing-library/react";
import { NavSecondary } from "@/components/nav-secondary";
import { MemoryRouter } from "react-router-dom";
import { Calendar, Mail } from "lucide-react";

jest.mock("@/components/ui/sidebar", () => ({
  SidebarGroup: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group" {...props}>
      {children}
    </div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenuButton: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => (
    <div data-testid="sidebar-menu-button">
      {asChild ? children : <div>{children}</div>}
    </div>
  ),
  SidebarMenuBadge: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu-badge">{children}</div>
  ),
}));

describe("NavSecondary", () => {
  const mockItems = [
    { title: "Kalendarz", url: "/calendar", icon: Calendar, badge: 5 },
    { title: "Poczta", url: "/mail", icon: Mail },
  ];

  const renderWithRouter = (initialRoute: string = "/") => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <NavSecondary items={mockItems} />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderuje elementy menu poprawnie", () => {
    renderWithRouter();

    expect(screen.getByText("Kalendarz")).toBeInTheDocument();
    expect(screen.getByText("Poczta")).toBeInTheDocument();
  });

  it("renderuje linki z poprawnymi ścieżkami URL", () => {
    renderWithRouter();

    const calendarLink = screen.getByText("Kalendarz").closest("a");
    const mailLink = screen.getByText("Poczta").closest("a");

    expect(calendarLink).toHaveAttribute("href", "/calendar");
    expect(mailLink).toHaveAttribute("href", "/mail");
  });

  it("renderuje ikony dla każdego elementu menu", () => {
    renderWithRouter();

    const buttons = screen.getAllByTestId("sidebar-menu-button");
    buttons.forEach((button) => {
      const icon = button.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  it("renderuje odznaki dla elementów z badge", () => {
    renderWithRouter();

    const badge = screen.getByTestId("sidebar-menu-badge");
    expect(badge).toHaveTextContent("5");
    expect(screen.getAllByTestId("sidebar-menu-badge")).toHaveLength(1);
  });

  it("przekazuje dodatkowe właściwości do SidebarGroup", () => {
    render(
      <MemoryRouter>
        <NavSecondary items={mockItems} className="custom-class" data-test="test" />
      </MemoryRouter>
    );

    const sidebarGroup = screen.getByTestId("sidebar-group");
    expect(sidebarGroup).toHaveClass("custom-class");
    expect(sidebarGroup).toHaveAttribute("data-test", "test");
  });

  it("nie renderuje menu gdy lista elementów jest pusta", () => {
    render(
      <MemoryRouter>
        <NavSecondary items={[]} />
      </MemoryRouter>
    );

    expect(screen.queryByTestId("sidebar-menu-button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("sidebar-menu-badge")).not.toBeInTheDocument();
  });
});