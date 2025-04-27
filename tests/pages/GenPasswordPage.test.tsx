/**
 * Testy dla komponentu GenPasswordPage.
 * Weryfikują poprawność renderowania strony generatora haseł, interakcji użytkownika (generowanie hasła, kopiowanie do schowka),
 * zmiany ustawień (długość, cyfry, znaki specjalne) oraz wyświetlanie powiadomień.
 */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GenPasswordPage from "@/pages/GenPasswordPage";
import * as generator from "generate-password-browser";
import { toast } from "sonner";
import React from "react";

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    variant?: string;
    size?: string;
    [key: string]: any;
  }) => (
    <button
      data-testid={variant === "outline" ? "copy-button" : "generate-button"}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <div {...props}>{children}</div>
  ),
  CardHeader: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <div {...props}>{children}</div>
  ),
  CardTitle: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <h2 {...props}>{children}</h2>
  ),
  CardContent: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <div {...props}>{children}</div>
  ),
}));
jest.mock("@/components/ui/input", () => ({
  Input: ({ value, ...props }: { value: string; [key: string]: any }) => (
    <input value={value} {...props} />
  ),
}));
jest.mock("@/components/ui/slider", () => ({
  Slider: ({
    onValueChange,
    value,
    defaultValue,
    min,
    max,
    step,
    ...props
  }: {
    onValueChange: (value: number[]) => void;
    value?: number[];
    defaultValue: number[];
    min: number;
    max: number;
    step: number;
    [key: string]: any;
  }) => (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value ? value[0].toString() : defaultValue[0].toString()}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
      data-testid="slider"
      {...props}
    />
  ),
}));
jest.mock("@/components/ui/switch", () => ({
  Switch: ({
    checked,
    onCheckedChange,
    ...props
  }: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    [key: string]: any;
  }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-testid="switch"
      {...props}
    />
  ),
}));
jest.mock("lucide-react", () => ({
  ClipboardCopy: () => <svg data-testid="clipboard-icon" />,
  RefreshCcw: () => <svg data-testid="refresh-icon" />,
}));
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}));


jest.mock("@/pages/PageTemplate", () => ({
  __esModule: true,
  default: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
    headerActions?: React.ReactNode;
  }) => (
    <div data-testid="page-template">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));
jest.mock("@/components/app-sidebar", () => ({
  AppSidebar: () => <div data-testid="app-sidebar" />,
}));
jest.mock("@/components/ui/breadcrumb", () => ({
  Breadcrumb: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
  BreadcrumbList: ({ children }: { children: React.ReactNode }) => <ol>{children}</ol>,
  BreadcrumbItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  BreadcrumbPage: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
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
  SidebarTrigger: () => <button data-testid="sidebar-trigger">Toggle</button>,
}));


jest.mock("generate-password-browser", () => ({
  generate: jest.fn(),
}));


const mockClipboardWriteText = jest.fn();
beforeAll(() => {
  Object.defineProperty(global.navigator, "clipboard", {
    value: {
      writeText: mockClipboardWriteText,
    },
    writable: true,
  });
});

describe("GenPasswordPage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (generator.generate as jest.Mock).mockReturnValue("GeneratedPass123!");
    mockClipboardWriteText.mockResolvedValue(undefined);
  });

  it("renderuje stronę generatora haseł z poprawną zawartością", () => {
    render(<GenPasswordPage />);


    expect(screen.getByTestId("page-template")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Manager haseł - Generator"
    );


    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Generator Haseł");


    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.getByTestId("copy-button")).toContainElement(
      screen.getByTestId("clipboard-icon")
    );


    expect(screen.getByText("Długość: 12")).toBeInTheDocument();
    expect(screen.getByTestId("slider")).toHaveAttribute("value", "12");


    expect(screen.getByText("Cyfry")).toBeInTheDocument();
    expect(screen.getByText("Znaki specjalne")).toBeInTheDocument();
    expect(screen.getAllByTestId("switch")).toHaveLength(2);
    expect(screen.getAllByTestId("switch")[0]).toBeChecked();
    expect(screen.getAllByTestId("switch")[1]).toBeChecked(); 

 
    expect(screen.getByTestId("generate-button")).toContainElement(
      screen.getByTestId("refresh-icon")
    );
    expect(screen.getByText("Generuj hasło")).toBeInTheDocument();


    expect(screen.getByTestId("toaster")).toBeInTheDocument();
  });

  it("generuje hasło po kliknięciu przycisku 'Generuj hasło'", async () => {
    render(<GenPasswordPage />);

    await user.click(screen.getByTestId("generate-button"));

    expect(generator.generate).toHaveBeenCalledWith({
      length: 12,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
      excludeSimilarCharacters: true,
      strict: true,
    });
    expect(screen.getByRole("textbox")).toHaveValue("GeneratedPass123!");
  });

  it("kopiuje hasło do schowka i wyświetla powiadomienie o sukcesie", async () => {
    render(<GenPasswordPage />);


    await user.click(screen.getByTestId("generate-button"));
    await user.click(screen.getByTestId("copy-button"));

    await waitFor(() => {
      expect(mockClipboardWriteText).toHaveBeenCalledWith("GeneratedPass123!");
      expect(toast.success).toHaveBeenCalledWith("Sukces!", {
        description: "Hasło zostało skopiowane do schowka.",
        duration: 3000,
      });
    });
  });

  it("wyświetla błąd, gdy kopiowanie do schowka się nie powiedzie", async () => {
    mockClipboardWriteText.mockRejectedValueOnce(new Error("Clipboard error"));
    render(<GenPasswordPage />);

    await user.click(screen.getByTestId("generate-button"));
    await user.click(screen.getByTestId("copy-button"));

    await waitFor(() => {
      expect(mockClipboardWriteText).toHaveBeenCalledWith("GeneratedPass123!");
      expect(toast.error).toHaveBeenCalledWith("Błąd!", {
        description: "Wystąpił błąd podczas kopiowania hasła.",
        duration: 3000,
      });
    });
  });


  it("włącza/wyłącza cyfry za pomocą przełącznika", async () => {
    render(<GenPasswordPage />);

    const numbersSwitch = screen.getAllByTestId("switch")[0];
    await user.click(numbersSwitch);

    expect(numbersSwitch).not.toBeChecked();


    await user.click(screen.getByTestId("generate-button"));
    expect(generator.generate).toHaveBeenCalledWith(
      expect.objectContaining({ numbers: false })
    );
  });

  it("włącza/wyłącza znaki specjalne za pomocą przełącznika", async () => {
    render(<GenPasswordPage />);

    const symbolsSwitch = screen.getAllByTestId("switch")[1];
    await user.click(symbolsSwitch);

    expect(symbolsSwitch).not.toBeChecked();

  
    await user.click(screen.getByTestId("generate-button"));
    expect(generator.generate).toHaveBeenCalledWith(
      expect.objectContaining({ symbols: false })
    );
  });

  it("pole hasła jest tylko do odczytu", () => {
    render(<GenPasswordPage />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("readonly");
  });
});