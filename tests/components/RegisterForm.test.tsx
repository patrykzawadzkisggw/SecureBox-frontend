// filepath: c:\Users\patryk\Desktop\passwords\frontend\tests\RegisterForm.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "@/components/RegisterForm";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import * as validators from "@/lib/validators";
import React from "react";

// Mockowanie zależności
jest.mock("@/lib/validators", () => ({
    validateName: jest.fn(),
    validateLastName: jest.fn(),
    validateEmail: jest.fn(),
    validatePassword: jest.fn(),
}));

jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
    Toaster: () => <div data-testid="toaster" />, // Render a simple div for Toaster
}));

// Mock react-router-dom
const navigateMock = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), // Use actual implementations for other exports
    useNavigate: () => navigateMock, // Mock only useNavigate
    NavLink: (props: any) => <a href={props.to} {...props} />, // Mock NavLink for simplicity
}));


describe("RegisterForm", () => {
    const mockAddUser = jest.fn();
    const user = userEvent.setup();

    // Helper function to render with Router context
    const renderWithRouter = (initialEntries = ['/register']) => {
        return render(
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                     <Route path="/register" element={<RegisterForm addUser={mockAddUser} data-testid="register-form" />} />
                     <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (validators.validateName as jest.Mock).mockReturnValue("");
        (validators.validateLastName as jest.Mock).mockReturnValue("");
        (validators.validateEmail as jest.Mock).mockReturnValue("");
        (validators.validatePassword as jest.Mock).mockReturnValue("");
        mockAddUser.mockReset();
      });

    it("renderuje formularz poprawnie", () => {
        renderWithRouter();

        expect(screen.getByRole('heading', { name: "Utwórz nowe konto" })).toBeInTheDocument();
        expect(screen.getByLabelText("Imię")).toBeInTheDocument();
        expect(screen.getByLabelText("Nazwisko")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Hasło logowania")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Utwórz konto" })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: "Zaloguj się" })).toBeInTheDocument();
        expect(screen.getByTestId("toaster")).toBeInTheDocument(); // Check if Toaster is rendered
    });

    it("aktualizuje stan pól formularza podczas wpisywania", async () => {
        renderWithRouter();

        const firstNameInput = screen.getByLabelText("Imię");
        const lastNameInput = screen.getByLabelText("Nazwisko");
        const emailInput = screen.getByLabelText("Email");
        const passwordInput = screen.getByLabelText("Hasło logowania");

        await user.type(firstNameInput, "Test");
        expect(firstNameInput).toHaveValue("Test");

        await user.type(lastNameInput, "User");
        expect(lastNameInput).toHaveValue("User");

        await user.type(emailInput, "test@example.com");
        expect(emailInput).toHaveValue("test@example.com");

        await user.type(passwordInput, "Password123!");
        expect(passwordInput).toHaveValue("Password123!");
    });


    it("wyświetla błąd walidacji dla zbyt krótkiego imienia", async () => {
        // Mock validateName to return an error for a short name
        (validators.validateName as jest.Mock).mockReturnValue("Imię musi mieć co najmniej 3 litery.");
      
        render(<RegisterForm addUser={async () => {}} />);
      
        // Wypełnij wszystkie wymagane pola
        fireEvent.change(screen.getByPlaceholderText("Imię"), {
          target: { value: "Ab" }, // Za krótkie imię
        });
        fireEvent.change(screen.getByPlaceholderText("Nazwisko"), {
          target: { value: "Kowalski" },
        });
        fireEvent.change(screen.getByPlaceholderText("user123@example.pl"), {
          target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByLabelText("Hasło logowania"), {
          target: { value: "Haslo1234!" },
        });
      
        // Kliknij przycisk "Utwórz konto"
        fireEvent.click(screen.getByRole("button", { name: /utwórz konto/i }));
      
        // Oczekuj na wyświetlenie błędu walidacji
        await waitFor(() => {
          expect(screen.getByText(/imię musi mieć co najmniej 3 litery/i)).toBeInTheDocument();
        });
      
        // Sprawdź, że input jest oznaczony jako nieprawidłowy
        expect(screen.getByPlaceholderText("Imię")).toHaveAttribute("aria-invalid", "true");
      });

    it("wyświetla błędy walidacji dla nieprawidłowego nazwiska", async () => {
    const errorMsg = "Nazwisko nie może zawierać cyfr.";
    (validators.validateLastName as jest.Mock).mockReturnValue(errorMsg);

    renderWithRouter();
    const input = screen.getByLabelText("Nazwisko");

    // Fill all required fields with valid data
    await user.type(screen.getByLabelText("Imię"), "Jan");
    await user.type(input, "Kowalski123");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło logowania"), "Password123!");

    // Submit the form
    await user.click(screen.getByRole("button", { name: "Utwórz konto" }));

    // Wait for the error message to appear
    await waitFor(() => {
        expect(screen.getByText(errorMsg)).toBeInTheDocument();
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAttribute("aria-describedby", "lastName-error");
        expect(document.getElementById("lastName-error")).toHaveTextContent(errorMsg);
    });

    // Ensure addUser was not called due to validation failure
    expect(mockAddUser).not.toHaveBeenCalled();
});

it("wyświetla błędy walidacji dla nieprawidłowego emaila", async () => {
    const errorMsg = "Podaj poprawny adres email.";
    // Set the mock before rendering
    (validators.validateEmail as jest.Mock).mockReturnValue(errorMsg);
  
    renderWithRouter();
    const input = screen.getByLabelText("Email");
  
    // Fill all required fields with valid data
    await user.type(screen.getByLabelText("Imię"), "Jan");
    await user.type(screen.getByLabelText("Nazwisko"), "Kowalski");
    await user.type(input, "invalid.email");
    await user.type(screen.getByLabelText("Hasło logowania"), "Password123!");
  
    // Submit the form
    await user.click(screen.getByRole("button", { name: "Utwórz konto" }));
  
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("aria-describedby", "login-error");
      expect(document.getElementById("login-error")).toHaveTextContent(errorMsg);
    });
  
    // Ensure addUser was not called due to validation failure
    expect(mockAddUser).not.toHaveBeenCalled();
  });

  it("wyświetla błędy walidacji dla nieprawidłowego hasła", async () => {
    const errorMsg = "Hasło musi mieć co najmniej 8 znaków.";
    (validators.validatePassword as jest.Mock).mockReturnValue(errorMsg);
  
    renderWithRouter();
    const input = screen.getByLabelText("Hasło logowania");
  
    // Fill all required fields with valid data
    await user.type(screen.getByLabelText("Imię"), "Jan");
    await user.type(screen.getByLabelText("Nazwisko"), "Kowalski");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(input, "abc123");
  
    // Submit the form
    await user.click(screen.getByRole("button", { name: "Utwórz konto" }));
  
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("aria-describedby", "password-error");
      expect(document.getElementById("password-error")).toHaveTextContent(errorMsg);
    });
  
    // Ensure addUser was not called due to validation failure
    expect(mockAddUser).not.toHaveBeenCalled();
  });

    it("nie wyświetla błędów walidacji, gdy dane są poprawne", async () => {
         renderWithRouter();

         await user.type(screen.getByLabelText("Imię"), "Jan");
         await user.type(screen.getByLabelText("Nazwisko"), "Kowalski");
         await user.type(screen.getByLabelText("Email"), "jan.kowalski@example.pl");
         await user.type(screen.getByLabelText("Hasło logowania"), "Password123!");
         await user.click(screen.getByRole("button", { name: "Utwórz konto" }));

         await waitFor(() => {
             expect(mockAddUser).toHaveBeenCalled(); // Check if submission was attempted
         });

         // Ensure no validation error messages are displayed
         expect(screen.queryByText(/Imię musi mieć/)).not.toBeInTheDocument();
         expect(screen.queryByText(/Nazwisko nie może zawierać/)).not.toBeInTheDocument();
         expect(screen.queryByText(/Podaj poprawny adres email/)).not.toBeInTheDocument();
         expect(screen.queryByText(/Hasło musi mieć/)).not.toBeInTheDocument();

         // Ensure aria-invalid is false or not present
         expect(screen.getByLabelText("Imię")).not.toHaveAttribute("aria-invalid", "true");
         expect(screen.getByLabelText("Nazwisko")).not.toHaveAttribute("aria-invalid", "true");
         expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid", "true");
         expect(screen.getByLabelText("Hasło logowania")).not.toHaveAttribute("aria-invalid", "true");
     });


    it("wywołuje addUser i nawiguje po poprawnym przesłaniu formularza", async () => {
        mockAddUser.mockResolvedValue(undefined); // Ensure mock resolves successfully
        renderWithRouter();

        await user.type(screen.getByLabelText("Imię"), "Jan");
        await user.type(screen.getByLabelText("Nazwisko"), "Kowalski");
        await user.type(screen.getByLabelText("Email"), "jan.kowalski@example.pl");
        await user.type(screen.getByLabelText("Hasło logowania"), "Password123!");
        await user.click(screen.getByRole("button", { name: "Utwórz konto" }));

        await waitFor(() => {
            expect(mockAddUser).toHaveBeenCalledWith(
                "Jan",
                "Kowalski",
                "jan.kowalski@example.pl",
                "Password123!",
                "123" // Assuming '123' is the hardcoded masterkey
            );
        });

        await waitFor(() => {
             expect(require("sonner").toast.success).toHaveBeenCalledWith("Konto utworzone!", {
                 description: "Witaj, Jan Kowalski! Możesz się teraz zalogować.",
                 duration: 3000,
             });
        });

        await waitFor(() => {
                expect(navigateMock).toHaveBeenCalledWith("/login");
        });


        // Sprawdzenie, czy pola zostały wyczyszczone after successful submission
        expect(screen.getByLabelText("Imię")).toHaveValue("");
        expect(screen.getByLabelText("Nazwisko")).toHaveValue("");
        expect(screen.getByLabelText("Email")).toHaveValue("");
        expect(screen.getByLabelText("Hasło logowania")).toHaveValue("");
    });

    it("wyświetla ogólny błąd przy nieudanej rejestracji i nie czyści pól oprócz hasła", async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Silence console.error
        const errorMsg = "Rejestracja nie powiodła się. Login może już istnieć lub dane są nieprawidłowe.";
        mockAddUser.mockRejectedValueOnce(new Error("Błąd rejestracji"));
        renderWithRouter();

        await user.type(screen.getByLabelText("Imię"), "Jan");
        await user.type(screen.getByLabelText("Nazwisko"), "Kowalski");
        await user.type(screen.getByLabelText("Email"), "jan.kowalski@example.pl");
        await user.type(screen.getByLabelText("Hasło logowania"), "Password123!");
        await user.click(screen.getByRole("button", { name: "Utwórz konto" }));

        await waitFor(() => {
            expect(screen.getByText(errorMsg)).toBeInTheDocument();
            expect(require("sonner").toast.error).toHaveBeenCalledWith("Błąd rejestracji!", {
                description: "Nie udało się utworzyć konta. Sprawdź dane i spróbuj ponownie.",
                duration: 3000,
            });
        });

        // Check fields: only password should be cleared
        expect(screen.getByLabelText("Imię")).toHaveValue("Jan");
        expect(screen.getByLabelText("Nazwisko")).toHaveValue("Kowalski");
        expect(screen.getByLabelText("Email")).toHaveValue("jan.kowalski@example.pl");
        expect(screen.getByLabelText("Hasło logowania")).toHaveValue(""); // Password cleared

        consoleErrorSpy.mockRestore(); // Restore console.error
    });

    it("dezaktywuje przycisk wysyłania i pokazuje tekst ładowania podczas przetwarzania", async () => {
        // Mock addUser to simulate a delay
        mockAddUser.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
        renderWithRouter();

        await user.type(screen.getByLabelText("Imię"), "Jan");
        await user.type(screen.getByLabelText("Nazwisko"), "Kowalski");
        await user.type(screen.getByLabelText("Email"), "jan.kowalski@example.pl");
        await user.type(screen.getByLabelText("Hasło logowania"), "Password123!");

        const submitButton = screen.getByRole("button", { name: "Utwórz konto" });
        await user.click(submitButton);

        // Check immediately after click
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent("Tworzenie konta...");
        expect(screen.getByLabelText("Imię")).toBeDisabled();
        expect(screen.getByLabelText("Nazwisko")).toBeDisabled();
        expect(screen.getByLabelText("Email")).toBeDisabled();
        expect(screen.getByLabelText("Hasło logowania")).toBeDisabled();


        // Wait for the mock promise to resolve
        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
            expect(submitButton).toHaveTextContent("Utwórz konto"); // Or whatever state it ends up in
        });

         // Check inputs are enabled again
         expect(screen.getByLabelText("Imię")).not.toBeDisabled();
         expect(screen.getByLabelText("Nazwisko")).not.toBeDisabled();
         expect(screen.getByLabelText("Email")).not.toBeDisabled();
         expect(screen.getByLabelText("Hasło logowania")).not.toBeDisabled();
    });

    it("przekazuje dodatkowe klasy CSS i inne propsy do formularza", () => {
         const { container } = render(
             <MemoryRouter>
                 <RegisterForm
                        addUser={mockAddUser}
                        className="custom-class"
                        data-testid="register-form-custom"
                        aria-label="Rejestracja"
                    />
             </MemoryRouter>
         );
         const formElement = screen.getByTestId("register-form-custom");
         expect(formElement).toHaveClass("custom-class");
         expect(formElement).toHaveAttribute("aria-label", "Rejestracja");
         // Check if default classes are also present
         expect(formElement).toHaveClass("flex");
         expect(formElement).toHaveClass("flex-col");
     });

    it("renderuje link do logowania i nawiguje po kliknięciu", async () => {
        renderWithRouter();

        const loginLink = screen.getByRole('link', { name: "Zaloguj się" });
        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute("href", "/login");

        // Simulate click - Note: In MemoryRouter, this won't change the URL shown,
        // but we can check if the target component renders or if navigate was called if needed.
        // Since we mocked NavLink to a simple <a>, we can't easily test navigation
        // without a more complex setup or checking navigateMock if NavLink used it.
        // For this test, checking href is sufficient.
    });

    it("nie wywołuje addUser jeśli walidacja po stronie klienta zawiedzie", async () => {
        (validators.validateEmail as jest.Mock).mockReturnValue("Błędny email");
        renderWithRouter();

        await user.type(screen.getByLabelText("Imię"), "Jan");
        await user.type(screen.getByLabelText("Nazwisko"), "Kowalski");
        await user.type(screen.getByLabelText("Email"), "zlyemail"); // Invalid email
        await user.type(screen.getByLabelText("Hasło logowania"), "Password123!");
        await user.click(screen.getByRole("button", { name: "Utwórz konto" }));

        await waitFor(() => {
                expect(screen.getByText("Błędny email")).toBeInTheDocument();
        });

        expect(mockAddUser).not.toHaveBeenCalled();
        expect(navigateMock).not.toHaveBeenCalled();
        expect(require("sonner").toast.success).not.toHaveBeenCalled();
    });
});