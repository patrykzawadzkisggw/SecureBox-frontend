import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordDialog } from "@/components/ResetPasswordDialog";
import { validateEmail } from "@/lib/validators";
import { toast } from "sonner";



beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });


jest.mock("@/lib/validators", () => ({
  validateEmail: jest.fn(),
}));
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));


const user = userEvent.setup();


const defaultProps = {                                              
  isOpen: true,
  onClose: jest.fn(),
  resetPasswordSubmit: jest.fn(),
};

describe("ResetPasswordDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (validateEmail as jest.Mock).mockReturnValue("");
    (defaultProps.resetPasswordSubmit as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup(); 
  });

  it("renderuje dialog, gdy isOpen jest true", () => {
    render(<ResetPasswordDialog {...defaultProps} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Resetowanie hasła")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Podaj adres email, na który wyślemy link do resetowania hasła."
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wyślij" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anuluj" })).toBeInTheDocument();
  });

  it("nie renderuje dialogu, gdy isOpen jest false", () => {
    render(<ResetPasswordDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("wyświetla błąd walidacji dla nieprawidłowego emaila", async () => {
    (validateEmail as jest.Mock).mockReturnValue("Nieprawidłowy email");

    render(<ResetPasswordDialog {...defaultProps} />);

    await user.type(screen.getByLabelText("Email"), "invalid.email");
    await user.click(screen.getByRole("button", { name: "Wyślij" }));

    await waitFor(() => {
      expect(
        screen.getByText("Proszę wprowadzić poprawny adres email.")
      ).toBeInTheDocument();
    });
    expect(defaultProps.resetPasswordSubmit).not.toHaveBeenCalled();
  });

  it("wysyła formularz dla prawidłowego emaila i wyświetla potwierdzenie", async () => {
    render(<ResetPasswordDialog {...defaultProps} />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "Wyślij" }));

    await waitFor(() => {
      expect(defaultProps.resetPasswordSubmit).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Link do resetowania hasła został wysłany!",
        {
          description: "Sprawdź swoją skrzynkę: test@example.com",
          duration: 3000,
        }
      );
      expect(
        screen.getByText(
          "Link do resetowania hasła został wysłany na podany adres email."
        )
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Zamknij" })).toBeInTheDocument();
    });
  });

  it("wyświetla błąd, gdy resetPasswordSubmit zakończy się niepowodzeniem", async () => {
    (defaultProps.resetPasswordSubmit as jest.Mock).mockRejectedValue(
      new Error("Błąd serwera")
    );

    render(<ResetPasswordDialog {...defaultProps} />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "Wyślij" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Błąd!", {
        description: "Nie udało się wysłać linku do resetowania hasła.",
        duration: 3000,
      });
    });
    expect(
      screen.getByText(
        "Podaj adres email, na który wyślemy link do resetowania hasła."
      )
    ).toBeInTheDocument();
  });

  it("wyświetla stan ładowania podczas wysyłania formularza", async () => {
    // Create a promise that won't resolve until we explicitly resolve it
    let resolveSubmit: (value?: unknown) => void;
    const submitPromise = new Promise((resolve) => {
      resolveSubmit = resolve;
    });
    (defaultProps.resetPasswordSubmit as jest.Mock).mockReturnValue(submitPromise);
  
    render(<ResetPasswordDialog {...defaultProps} />);
  
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "Wyślij" }));
  
    // Check loading state
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Wysyłanie..." })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Anuluj" })).toBeDisabled();
      expect(screen.getByLabelText("Email")).toBeDisabled();
    });
  
    // Resolve the submission to allow the component to proceed
    resolveSubmit!();
  
    // Check success state
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Zamknij" })).toBeInTheDocument();
    });
  });

  it("zamyka dialog i resetuje stan po kliknięciu Anuluj", async () => {
    render(<ResetPasswordDialog {...defaultProps} />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "Anuluj" }));

    expect(defaultProps.onClose).toHaveBeenCalled();
    expect(screen.getByLabelText("Email")).toHaveValue("");
  });

  it("zamyka dialog i resetuje stan po kliknięciu Zamknij po wysłaniu", async () => {
    render(<ResetPasswordDialog {...defaultProps} />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "Wyślij" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Zamknij" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Zamknij" }));
    expect(defaultProps.onClose).toHaveBeenCalled();


    defaultProps.onClose.mockClear();
    cleanup();
    render(<ResetPasswordDialog {...defaultProps} />);

    expect(
      screen.getByText(
        "Podaj adres email, na który wyślemy link do resetowania hasła."
      )
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveValue("");
  });
});