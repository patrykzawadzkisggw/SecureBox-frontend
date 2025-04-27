/**
 * Testy dla komponentu NotFoundPage.
 * Weryfikują poprawność renderowania strony 404, zawartości tekstowej, stylów oraz zachowania przycisku nawigacji.
 */
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import NotFoundPage from "@/pages/NotFoundPage";

import React from "react";
import { JSX } from "react/jsx-runtime";

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, ...props }: { children: React.ReactNode; onClick?: React.MouseEventHandler<HTMLButtonElement>; variant?: string | null | undefined; [key: string]: any }) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("lucide-react", () => ({
  Ghost: (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => <svg data-testid="ghost-icon" {...props} />,
}));


const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("NotFoundPage", () => {
  const user = userEvent.setup();


  const renderComponent = () =>
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderuje stronę 404 z poprawną zawartością", () => {
    renderComponent();


    const ghostIcon = screen.getByTestId("ghost-icon");
    expect(ghostIcon).toBeInTheDocument();
    expect(ghostIcon).toHaveClass("h-16 w-16 text-gray-500");


    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "404 - Strona nie znaleziona"
    );
    expect(
      screen.getByText(/Wygląda na to, że strona, której szukasz, nie istnieje./)
    ).toBeInTheDocument();


    const button = screen.getByRole("button", { name: "Wróć na stronę główną" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-testid", "button");
  });

  it("aplikuje poprawne klasy Tailwind do kontenerów", () => {
    renderComponent();


    const mainContainer = screen.getByRole("heading", { level: 1 }).parentElement
      ?.parentElement;
    expect(mainContainer).toHaveClass(
      "flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6 text-center"
    );


    const contentContainer = screen.getByTestId("ghost-icon").parentElement;
    expect(contentContainer).toHaveClass(
      "animate-fade-in flex flex-col items-center space-y-4"
    );
  });

  it("przekierowuje na stronę główną po kliknięciu przycisku", async () => {
    renderComponent();

    const button = screen.getByRole("button", { name: "Wróć na stronę główną" });
    await user.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it("przycisk jest dostępny za pomocą klawiatury", async () => {
    renderComponent();

    const button = screen.getByRole("button", { name: "Wróć na stronę główną" });
    button.focus();
    await user.keyboard("{Enter}");

    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});