import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/login-form";
import { validateEmail, validatePassword } from "@/lib/validators";
import { encryptMasterkey } from "@/data/PasswordContext";
import { toast } from "sonner";
import {
  getFailedLogins,
  saveFailedLogins,
  isEmailLockedOut,
  getRemainingLockoutTime,
  recordFailedAttempt,
} from "@/lib/functions";
import { MemoryRouter } from "react-router-dom";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

jest.mock("react-google-recaptcha-v3", () => ({
  useGoogleReCaptcha: jest.fn(),
}));


jest.mock("@/lib/validators", () => ({
  validateEmail: jest.fn(),
  validatePassword: jest.fn(),
}));
jest.mock("@/data/PasswordContext", () => ({
  encryptMasterkey: jest.fn(),
}));
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => <div data-testid="mock-toaster" />, 
}));
jest.mock("@/lib/functions", () => ({
  getFailedLogins: jest.fn(),
  saveFailedLogins: jest.fn(),
  isEmailLockedOut: jest.fn(),
  getRemainingLockoutTime: jest.fn(),
  recordFailedAttempt: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

const user = userEvent.setup();

const mockLoginUser = jest.fn();
const mockResetPasswordSubmit = jest.fn();
const mockNavigate = jest.fn();

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (validateEmail as jest.Mock).mockReturnValue("");
    (validatePassword as jest.Mock).mockReturnValue("");
    (encryptMasterkey as jest.Mock).mockResolvedValue("encrypted-masterkey");
    (getFailedLogins as jest.Mock).mockReturnValue({});
    (saveFailedLogins as jest.Mock).mockImplementation(() => {});
    (isEmailLockedOut as jest.Mock).mockReturnValue(false);
    (getRemainingLockoutTime as jest.Mock).mockReturnValue(0);
    (recordFailedAttempt as jest.Mock).mockImplementation(() => {});
    (mockLoginUser as jest.Mock).mockResolvedValue(undefined);
    (mockResetPasswordSubmit as jest.Mock).mockResolvedValue(undefined);
    (jest.spyOn(require("react-router-dom"), "useNavigate") as jest.Mock).mockReturnValue(mockNavigate);
    (useGoogleReCaptcha as jest.Mock).mockReturnValue({
      executeRecaptcha: jest.fn().mockResolvedValue("mocked-recaptcha-token"),
    });
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renderuje komponent Toaster", () => {
    render(
      <MemoryRouter>
        <LoginForm loginUser={mockLoginUser} resetPasswordSubmit={mockResetPasswordSubmit} />
      </MemoryRouter>
    );
    expect(screen.getByTestId("mock-toaster")).toBeInTheDocument();
  });

  it("renderuje formularz logowania z poprawnymi polami i przyciskami", () => {
    render(
      <MemoryRouter>
        <LoginForm loginUser={mockLoginUser} resetPasswordSubmit={mockResetPasswordSubmit} />
      </MemoryRouter>
    );

    expect(screen.getByText("Zaloguj się na swoje konto")).toBeInTheDocument();
    expect(screen.getByLabelText("Login")).toBeInTheDocument();
    expect(screen.getByLabelText("Hasło logowania")).toBeInTheDocument();
    expect(screen.getByLabelText(/Masterkey \(hasło szyfrowania\)/, { selector: '#masterkey' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Masterkey \(hasło szyfrowania\)/, { selector: '#masterkey2' })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zaloguj" })).toBeInTheDocument();
    expect(screen.getByText("Nie masz jeszcze konta?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Utwórz konto" })).toHaveAttribute("href", "/register");
  });

  it("wyświetla błąd walidacji dla nieprawidłowego emaila", async () => {
    (validateEmail as jest.Mock).mockReturnValue("Nieprawidłowy adres email");
    render(
      <MemoryRouter>
        <LoginForm loginUser={mockLoginUser} resetPasswordSubmit={mockResetPasswordSubmit} />
      </MemoryRouter>
    );
    await user.type(screen.getByLabelText("Login"), "invalid.email");
    await user.click(screen.getByRole("button", { name: "Zaloguj" }));
    await waitFor(() => {
      expect(screen.getByText("Nieprawidłowy adres email")).toBeInTheDocument();
      
      expect(mockLoginUser).not.toHaveBeenCalled();
      expect(recordFailedAttempt).not.toHaveBeenCalled();
    });
  });

  it("wyświetla błąd walidacji dla nieprawidłowego hasła", async () => {
    (validatePassword as jest.Mock).mockReturnValue("Hasło za krótkie");
    render(
      <MemoryRouter>
        <LoginForm loginUser={mockLoginUser} resetPasswordSubmit={mockResetPasswordSubmit} />
      </MemoryRouter>
    );
    await user.type(screen.getByLabelText("Login"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło logowania"), "short");
    await user.click(screen.getByRole("button", { name: "Zaloguj" }));
    await waitFor(() => {
      expect(screen.getByText("Hasło za krótkie")).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith("Błąd walidacji!", {
        description: "Hasło za krótkie",
        duration: 3000,
      });
      expect(mockLoginUser).not.toHaveBeenCalled();
      expect(recordFailedAttempt).not.toHaveBeenCalled();
    });
  });

  it("wyświetla błąd, gdy masterkey i masterkey2 nie są identyczne", async () => {
    render(
      <MemoryRouter>
        <LoginForm loginUser={mockLoginUser} resetPasswordSubmit={mockResetPasswordSubmit} />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Login"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło logowania"), "password123");
    await user.type(screen.getByLabelText(/Masterkey \(hasło szyfrowania\)/, { selector: '#masterkey' }), "key1");
    await user.type(screen.getByLabelText(/Masterkey \(hasło szyfrowania\)/, { selector: '#masterkey2' }), "key2");
    await user.click(screen.getByRole("button", { name: "Zaloguj" }));

    await waitFor(() => {
      expect(screen.getByText("Masterkey i jego potwierdzenie muszą być identyczne.")).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith("Błąd walidacji!", {
        description: "Masterkey i jego potwierdzenie muszą być identyczne.",
        duration: 3000,
      });
      expect(recordFailedAttempt).toHaveBeenCalledWith("test@example.com");
      expect(mockLoginUser).not.toHaveBeenCalled();
    });
  });

  it("z powodzeniem loguje użytkownika i czyści nieudane próby", async () => {
    render(
      <MemoryRouter>
        <LoginForm loginUser={mockLoginUser} resetPasswordSubmit={mockResetPasswordSubmit} />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Login"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło logowania"), "password123");
    await user.type(screen.getByLabelText(/Masterkey \(hasło szyfrowania\)/, { selector: '#masterkey' }), "masterkey");
    await user.type(screen.getByLabelText(/Masterkey \(hasło szyfrowania\)/, { selector: '#masterkey2' }), "masterkey");
    await user.click(screen.getByRole("button", { name: "Zaloguj" }));

    await waitFor(() => {
      expect(encryptMasterkey).toHaveBeenCalledWith("masterkey", "123");
      expect(localStorage.getItem("masterkey")).toBe("encrypted-masterkey");
      expect(mockLoginUser).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
        "masterkey",
        "mocked-recaptcha-token"
      );
      expect(toast.success).toHaveBeenCalledWith("Zalogowano pomyślnie!", { duration: 3000 });
      expect(mockNavigate).toHaveBeenCalledWith("/");
      expect(getFailedLogins).toHaveBeenCalled();
      expect(saveFailedLogins).toHaveBeenCalledWith({}); 
    });
  });

  it("wyświetla błąd i rejestruje nieudaną próbę przy niepowodzeniu logowania", async () => {
    (mockLoginUser as jest.Mock).mockRejectedValue(new Error("Invalid credentials"));

    render(
      <MemoryRouter>
        <LoginForm loginUser={mockLoginUser} resetPasswordSubmit={mockResetPasswordSubmit} />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Login"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło logowania"), "wrongpassword");
    await user.type(screen.getByLabelText(/Masterkey \(hasło szyfrowania\)/, { selector: '#masterkey' }), "masterkey");
    await user.type(screen.getByLabelText(/Masterkey \(hasło szyfrowania\)/, { selector: '#masterkey2' }), "masterkey");
    await user.click(screen.getByRole("button", { name: "Zaloguj" }));

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith(
        "test@example.com",
        "wrongpassword",
        "masterkey",
        "mocked-recaptcha-token"
      );
      expect(recordFailedAttempt).toHaveBeenCalledWith("test@example.com");
      expect(screen.getByText("Nieprawidłowy login, hasło lub masterkey")).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith("Błąd logowania!", {
        description: "Sprawdź dane i spróbuj ponownie.",
        duration: 3000,
      });
      expect(screen.getByLabelText("Hasło logowania")).toHaveValue("");
      expect(screen.getByLabelText(/Masterkey \(hasło szyfrowania\)/, { selector: '#masterkey' })).toHaveValue("");
      expect(screen.getByLabelText(/Masterkey \(hasło szyfrowania\)/, { selector: '#masterkey2' })).toHaveValue("");
    });
  });

  it("blokuje logowanie po 5 nieudanych próbach na 10 minut", async () => {
    (mockLoginUser as jest.Mock).mockRejectedValue(new Error("Invalid credentials"));
    (isEmailLockedOut as jest.Mock).mockImplementation((email) => email === "test@example.com" && true);
    (getRemainingLockoutTime as jest.Mock).mockReturnValue(600); // 10 minutes in seconds

    render(
      <MemoryRouter>
        <LoginForm loginUser={mockLoginUser} resetPasswordSubmit={mockResetPasswordSubmit} />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Login"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło logowania"), "password123");
    await user.type(screen.getByLabelText(/Masterkey \(hasło szyfrowania\)/, { selector: '#masterkey' }), "masterkey");
    await user.type(screen.getByLabelText(/Masterkey \(hasło szyfrowania\)/, { selector: '#masterkey2' }), "masterkey");
    await user.click(screen.getByRole("button", { name: "Zaloguj" }));

    await waitFor(() => {
      expect(isEmailLockedOut).toHaveBeenCalledWith("test@example.com");
      expect(getRemainingLockoutTime).toHaveBeenCalledWith("test@example.com");
      expect(screen.getByText(/Zbyt wiele nieudanych prób logowania. Spróbuj ponownie za 10 minut./)).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith("Konto zablokowane!", {
        description: "Spróbuj ponownie za 10 minut.",
        duration: 5000,
      });
      expect(mockLoginUser).not.toHaveBeenCalled();
      expect(recordFailedAttempt).not.toHaveBeenCalled();
    });
  });

  it("pozwala na logowanie po wygaśnięciu blokady", async () => {
    (getFailedLogins as jest.Mock).mockReturnValue({
      "test@example.com": { count: 5, lastAttempt: Date.now() - 11 * 60 * 1000 }, // 11 minutes ago
    });

    render(
      <MemoryRouter>
        <LoginForm loginUser={mockLoginUser} resetPasswordSubmit={mockResetPasswordSubmit} />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Login"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło logowania"), "password123");
    await user.type(screen.getByLabelText(/Masterkey \(hasło szyfrowania\)/, { selector: '#masterkey' }), "masterkey");
    await user.type(screen.getByLabelText(/Masterkey \(hasło szyfrowania\)/, { selector: '#masterkey2' }), "masterkey");
    await user.click(screen.getByRole("button", { name: "Zaloguj" }));

    await waitFor(() => {
      expect(isEmailLockedOut).toHaveBeenCalledWith("test@example.com");
      expect(mockLoginUser).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
        "masterkey",
        "mocked-recaptcha-token"
      );
      expect(toast.success).toHaveBeenCalledWith("Zalogowano pomyślnie!", { duration: 3000 });
      expect(mockNavigate).toHaveBeenCalledWith("/");
      expect(saveFailedLogins).toHaveBeenCalledWith({}); // Failed attempts cleared
    });
  });

  it("otwiera dialog resetowania hasła po kliknięciu 'Zapomniałeś hasła?'", async () => {
    render(
      <MemoryRouter>
        <LoginForm loginUser={mockLoginUser} resetPasswordSubmit={mockResetPasswordSubmit} />
      </MemoryRouter>
    );

    await user.click(screen.getByText("Zapomniałeś hasła?"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Resetowanie hasła")).toBeInTheDocument();
    });
  });


  it("blokuje różne emaile niezależnie", async () => {
    (mockLoginUser as jest.Mock).mockRejectedValue(new Error("Invalid credentials"));
    (isEmailLockedOut as jest.Mock).mockImplementation((email) => email === "user1@example.com");

    render(
      <MemoryRouter>
        <LoginForm loginUser={mockLoginUser} resetPasswordSubmit={mockResetPasswordSubmit} />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Login"), "user1@example.com");
    await user.type(screen.getByLabelText("Hasło logowania"), "password123");
    await user.type(screen.getByLabelText(/Masterkey \(hasło szyfrowania\)/, { selector: '#masterkey' }), "masterkey");
    await user.type(screen.getByLabelText(/Masterkey \(hasło szyfrowania\)/, { selector: '#masterkey2' }), "masterkey");
    await user.click(screen.getByRole("button", { name: "Zaloguj" }));

    await waitFor(() => {
      expect(screen.getByText(/Zbyt wiele nieudanych prób logowania/)).toBeInTheDocument();
      expect(mockLoginUser).not.toHaveBeenCalled();
    });

    await user.clear(screen.getByLabelText("Login"));
    await user.type(screen.getByLabelText("Login"), "user2@example.com");
    await user.click(screen.getByRole("button", { name: "Zaloguj" }));

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith(
        "user2@example.com",
        "password123",
        "masterkey",
        "mocked-recaptcha-token"
      );
      expect(screen.queryByText(/Zbyt wiele nieudanych prób logowania/)).not.toBeInTheDocument();
    });
  });
});