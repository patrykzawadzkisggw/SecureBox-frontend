import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UpdatePasswordDialog } from "@/components/UpdatePasswordDialog";
import { BrowserRouter } from "react-router-dom";


const mockUpdatePassword = jest.fn();

jest.mock("../src/data/PasswordContext", () => ({
  usePasswordContext: () => ({
    updatePassword: mockUpdatePassword,
  }),
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe("UpdatePasswordDialog", () => {
  const defaultProps = {
    isDialogOpen: true,
    setIsDialogOpen: jest.fn(),
    platform: "Facebook",
    login: "test@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with given props", () => {
    render(<UpdatePasswordDialog {...defaultProps} />, { wrapper: Wrapper });

    expect(screen.getByText("Zmień hasło")).toBeInTheDocument();
    expect(screen.getByText("Zmień hasło dla Facebook")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByLabelText("Nowe hasło")).toBeInTheDocument();
    expect(screen.getByText("Siła hasła")).toBeInTheDocument();
  });

  it("updates password strength when typing", async () => {
    render(<UpdatePasswordDialog {...defaultProps} />, { wrapper: Wrapper });

    const input = screen.getByLabelText("Nowe hasło");
    fireEvent.change(input, { target: { value: "mocnehaslo123" } });

    await waitFor(() => {
      expect(screen.getByText(/%/)).toBeInTheDocument(); 
    });
  });

  it("calls updatePassword and closes dialog on save", async () => {
    render(<UpdatePasswordDialog {...defaultProps} />, { wrapper: Wrapper });

    const input = screen.getByLabelText("Nowe hasło");
    fireEvent.change(input, { target: { value: "hasloTest123" } });

    const saveButton = screen.getByText("Zapisz");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith("hasloTest123", "Facebook", "test@example.com");
      expect(defaultProps.setIsDialogOpen).toHaveBeenCalledWith(false);
    });
  });
});
