import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from 'react';
import { AddPasswordDialog } from "../src/components/AddPasswordDialog";
import { usePasswordContext } from "../src/data/PasswordContext";

jest.mock("../src/data/PasswordContext", () => ({
  usePasswordContext: jest.fn(),
}));

describe("AddPasswordDialog", () => {
  let addPasswordMock: jest.Mock<any, any, any>;
  let setIsDialogOpenMock: jest.Mock<any, any, any>;

  beforeEach(() => {
    addPasswordMock = jest.fn();
    setIsDialogOpenMock = jest.fn();

    (usePasswordContext as jest.Mock).mockReturnValue({
      addPassword: addPasswordMock,
    });
  });

  it("renders the dialog with input fields and buttons", () => {
    render(
      <AddPasswordDialog isDialogOpen={true} setIsDialogOpen={setIsDialogOpenMock} />
    );

    expect(screen.getByText("Dodaj hasło")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Wpisz nazwę strony")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Wpisz login")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Wpisz hasło")).toBeInTheDocument();
    expect(screen.getByText("Anuluj")).toBeInTheDocument();
    expect(screen.getByText("Dodaj")).toBeInTheDocument();
  });

  it("validates empty fields and shows error messages", () => {
    render(
      <AddPasswordDialog isDialogOpen={true} setIsDialogOpen={setIsDialogOpenMock} />
    );

    fireEvent.click(screen.getByText("Dodaj"));
    
    expect(screen.getByText("Pole 'Strona' nie może być puste.")).toBeInTheDocument();
  });

  it("calls addPassword function with correct values", async () => {
    render(
      <AddPasswordDialog isDialogOpen={true} setIsDialogOpen={setIsDialogOpenMock} />
    );

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Wpisz nazwę strony"), {
        target: { value: "example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Wpisz login"), {
        target: { value: "user@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Wpisz hasło"), {
        target: { value: "securepassword" },
      });
      fireEvent.click(screen.getByText("Dodaj"));
    });

    await waitFor(() => {
      expect(addPasswordMock).toHaveBeenCalledWith(
        "securepassword",
        "example.com",
        "user@example.com"
      );
      expect(setIsDialogOpenMock).toHaveBeenCalledWith(false);
    });
  });

  it("closes the dialog on cancel", () => {
    render(
      <AddPasswordDialog isDialogOpen={true} setIsDialogOpen={setIsDialogOpenMock} />
    );

    fireEvent.click(screen.getByText("Anuluj"));
    expect(setIsDialogOpenMock).toHaveBeenCalledWith(false);
  });
});