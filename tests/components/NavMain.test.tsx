import { render, screen } from "@testing-library/react";
import { NavMain } from "@/components/nav-main";
import { MemoryRouter } from "react-router-dom";
import { Home, Settings } from "lucide-react";

jest.mock("@/components/ui/sidebar", () => ({
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenuButton: ({
    children,
    isActive,
    asChild,
  }: {
    children: React.ReactNode;
    isActive?: boolean;
    asChild?: boolean;
  }) => (
    <div data-testid="sidebar-menu-button" data-active={isActive}>
      {asChild ? children : <div>{children}</div>}
    </div>
  ),
}));

describe("NavMain", () => {
  const mockItems = [
    { title: "Strona główna", url: "/", icon: Home },
    { title: "Ustawienia", url: "/settings", icon: Settings },
  ];

  const renderWithRouter = (initialRoute: string) => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <NavMain items={mockItems} />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderuje elementy menu poprawnie", () => {
    renderWithRouter("/");

    expect(screen.getByText("Strona główna")).toBeInTheDocument();
    expect(screen.getByText("Ustawienia")).toBeInTheDocument();
  });

  it("wyróżnia aktywny element menu na podstawie aktualnej ścieżki", () => {
    renderWithRouter("/");

    const buttons = screen.getAllByTestId("sidebar-menu-button");
    expect(buttons[0]).toHaveAttribute("data-active", "true");
    expect(buttons[1]).toHaveAttribute("data-active", "false");
  });

  it("zmienia aktywny element menu przy zmianie ścieżki", () => {
    renderWithRouter("/settings");

    const buttons = screen.getAllByTestId("sidebar-menu-button");
    expect(buttons[0]).toHaveAttribute("data-active", "false");
    expect(buttons[1]).toHaveAttribute("data-active", "true");
  });

  it("renderuje ikony dla każdego elementu menu", () => {
    renderWithRouter("/");

    const buttons = screen.getAllByTestId("sidebar-menu-button");
    const homeIcon = buttons[0].querySelector("svg");
    expect(homeIcon).toBeInTheDocument();
  });

  it("renderuje linki z poprawnymi ścieżkami URL", () => {
    renderWithRouter("/");

    const homeLink = screen.getByText("Strona główna").closest("a");
    const settingsLink = screen.getByText("Ustawienia").closest("a");

    expect(homeLink).toHaveAttribute("href", "/");
    expect(settingsLink).toHaveAttribute("href", "/settings");
  });

  it("nie renderuje menu gdy lista elementów jest pusta", () => {
    render(
      <MemoryRouter>
        <NavMain items={[]} />
      </MemoryRouter>
    );

    expect(screen.queryByTestId("sidebar-menu-button")).not.toBeInTheDocument();
  });
});