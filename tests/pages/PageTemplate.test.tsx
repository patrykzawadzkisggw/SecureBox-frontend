/**
 * Testy dla komponentu PageTemplate.
 * Weryfikują poprawność renderowania szablonu strony, w tym tytułu, zawartości, akcji nagłówka,
 * paska bocznego, nawigacji okruszkowej oraz przycisku przełączania paska bocznego.
 */
import { render, screen } from "@testing-library/react";
import PageTemplate from "@/pages/PageTemplate";
import { Button } from "@/components/ui/button";
import React from "react";


jest.mock("@/components/app-sidebar", () => ({
  AppSidebar: () => <div data-testid="app-sidebar">Sidebar</div>,
}));
jest.mock("@/components/ui/breadcrumb", () => ({
  Breadcrumb: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
  BreadcrumbList: ({ children }: { children: React.ReactNode }) => <ol>{children}</ol>,
  BreadcrumbItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  BreadcrumbPage: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}));
jest.mock("@/components/ui/separator", () => ({
  Separator: ({ orientation }: { orientation?: string }) => (
    <div data-testid={`separator-${orientation}`} />
  ),
}));
jest.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
  SidebarInset: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-inset">{children}</div>
  ),
  SidebarTrigger: () => <button data-testid="sidebar-trigger">Toggle Sidebar</button>,
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <button {...props}>{children}</button>
  ),
}));

describe("PageTemplate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderuje tytuł, zawartość i pasek boczny", () => {
    render(
      <PageTemplate title="Test Page">
        <div data-testid="content">Page Content</div>
      </PageTemplate>
    );


    expect(screen.getByText("Test Page")).toBeInTheDocument();
    expect(screen.getByText("Test Page")).toHaveClass("line-clamp-1");


    expect(screen.getByTestId("content")).toHaveTextContent("Page Content");


    expect(screen.getByTestId("app-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-provider")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-inset")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-trigger")).toBeInTheDocument();


    expect(screen.getByTestId("separator-vertical")).toBeInTheDocument();

    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renderuje akcje nagłówka, gdy są podane", () => {
    render(
      <PageTemplate
        title="Test Page"
        headerActions={<Button data-testid="action-button">Action</Button>}
      >
        <div>Content</div>
      </PageTemplate>
    );


    expect(screen.getByTestId("action-button")).toHaveTextContent("Action");
    expect(screen.getByTestId("action-button")).toBeInTheDocument();
  });

  it("nie renderuje akcji nagłówka, gdy nie są podane", () => {
    render(
      <PageTemplate title="Test Page">
        <div>Content</div>
      </PageTemplate>
    );


    expect(screen.queryByTestId("action-button")).not.toBeInTheDocument();
  });

  it("renderuje poprawną strukturę nagłówka", () => {
    render(
      <PageTemplate title="Test Page">
        <div>Content</div>
      </PageTemplate>
    );


    const header = screen.getByRole("banner");
    expect(header).toHaveClass("flex", "h-14", "shrink-0", "items-center", "gap-2");


    expect(header).toContainElement(screen.getByTestId("sidebar-trigger"));
    expect(header).toContainElement(screen.getByTestId("separator-vertical"));
    expect(header).toContainElement(screen.getByRole("navigation"));
  });

  it("obsługuje długi tytuł w nawigacji", () => {
    const longTitle = "Very Long Page Title That Should Be Truncated";
    render(
      <PageTemplate title={longTitle}>
        <div>Content</div>
      </PageTemplate>
    );


    expect(screen.getByText(longTitle)).toHaveClass("line-clamp-1");
  });

  it("renderuje zawartość dzieci w SidebarInset", () => {
    render(
      <PageTemplate title="Test Page">
        <div data-testid="child-content">Child Content</div>
      </PageTemplate>
    );


    const sidebarInset = screen.getByTestId("sidebar-inset");
    expect(sidebarInset).toContainElement(screen.getByTestId("child-content"));
  });

  it("sprawdza dostępność komponentu", () => {
    render(
      <PageTemplate title="Test Page">
        <div>Content</div>
      </PageTemplate>
    );


    expect(screen.getByRole("navigation")).toBeInTheDocument(); 
    expect(screen.getByRole("banner")).toBeInTheDocument(); 
    expect(screen.getByTestId("sidebar-trigger")).toHaveTextContent("Toggle Sidebar");
  });
});