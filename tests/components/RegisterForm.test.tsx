import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "@/components/RegisterForm";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import * as validators from "@/lib/validators";
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';


jest.mock('react-google-recaptcha-v3', () => ({
  useGoogleReCaptcha: jest.fn(),
}));

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
    Toaster: () => <div data-testid="toaster" />, 
}));


const navigateMock = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), 
    useNavigate: () => navigateMock, 
    NavLink: (props: any) => <a href={props.to} {...props} />, 
}));


describe("RegisterForm", () => {
    const mockAddUser = jest.fn();
    const user = userEvent.setup();

    
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

        (useGoogleReCaptcha as jest.Mock).mockReturnValue({
            executeRecaptcha: jest.fn().mockResolvedValue('mocked-recaptcha-token'),
          });
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
        expect(screen.getByTestId("toaster")).toBeInTheDocument(); 
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
   
        (validators.validateName as jest.Mock).mockReturnValue("Imię musi mieć co najmniej 3 litery.");
      
        render(<RegisterForm addUser={async () => {}} />);
      
    
        fireEvent.change(screen.getByPlaceholderText("Imię"), {
          target: { value: "Ab" }, 
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
      
     
        fireEvent.click(screen.getByRole("button", { name: /utwórz konto/i }));
      
        
        await waitFor(() => {
          expect(screen.getByText(/imię musi mieć co najmniej 3 litery/i)).toBeInTheDocument();
        });
      
        
        expect(screen.getByPlaceholderText("Imię")).toHaveAttribute("aria-invalid", "true");
      });

    it("wyświetla błędy walidacji dla nieprawidłowego nazwiska", async () => {
    const errorMsg = "Nazwisko nie może zawierać cyfr.";
    (validators.validateLastName as jest.Mock).mockReturnValue(errorMsg);

    renderWithRouter();
    const input = screen.getByLabelText("Nazwisko");

 
    await user.type(screen.getByLabelText("Imię"), "Jan");
    await user.type(input, "Kowalski123");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Hasło logowania"), "Password123!");


    await user.click(screen.getByRole("button", { name: "Utwórz konto" }));


    await waitFor(() => {
        expect(screen.getByText(errorMsg)).toBeInTheDocument();
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAttribute("aria-describedby", "lastName-error");
        expect(document.getElementById("lastName-error")).toHaveTextContent(errorMsg);
    });

   
    expect(mockAddUser).not.toHaveBeenCalled();
});

it("wyświetla błędy walidacji dla nieprawidłowego emaila", async () => {
    const errorMsg = "Podaj poprawny adres email.";

    (validators.validateEmail as jest.Mock).mockReturnValue(errorMsg);
  
    renderWithRouter();
    const input = screen.getByLabelText("Email");
  
 
    await user.type(screen.getByLabelText("Imię"), "Jan");
    await user.type(screen.getByLabelText("Nazwisko"), "Kowalski");
    await user.type(input, "invalid.email");
    await user.type(screen.getByLabelText("Hasło logowania"), "Password123!");
  

    await user.click(screen.getByRole("button", { name: "Utwórz konto" }));
  
  
    await waitFor(() => {
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("aria-describedby", "login-error");
      expect(document.getElementById("login-error")).toHaveTextContent(errorMsg);
    });
  
  
    expect(mockAddUser).not.toHaveBeenCalled();
  });

  it("wyświetla błędy walidacji dla nieprawidłowego hasła", async () => {
    const errorMsg = "Hasło musi mieć co najmniej 8 znaków.";
    (validators.validatePassword as jest.Mock).mockReturnValue(errorMsg);
  
    renderWithRouter();
    const input = screen.getByLabelText("Hasło logowania");
  
   
    await user.type(screen.getByLabelText("Imię"), "Jan");
    await user.type(screen.getByLabelText("Nazwisko"), "Kowalski");
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(input, "abc123");
  

    await user.click(screen.getByRole("button", { name: "Utwórz konto" }));
  

    await waitFor(() => {
      expect(screen.getByText(errorMsg)).toBeInTheDocument();
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("aria-describedby", "password-error");
      expect(document.getElementById("password-error")).toHaveTextContent(errorMsg);
    });
  
 
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
             expect(mockAddUser).toHaveBeenCalled(); 
         });

        
         expect(screen.queryByText(/Imię musi mieć/)).not.toBeInTheDocument();
         expect(screen.queryByText(/Nazwisko nie może zawierać/)).not.toBeInTheDocument();
         expect(screen.queryByText(/Podaj poprawny adres email/)).not.toBeInTheDocument();
         expect(screen.queryByText(/Hasło musi mieć/)).not.toBeInTheDocument();

        
         expect(screen.getByLabelText("Imię")).not.toHaveAttribute("aria-invalid", "true");
         expect(screen.getByLabelText("Nazwisko")).not.toHaveAttribute("aria-invalid", "true");
         expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid", "true");
         expect(screen.getByLabelText("Hasło logowania")).not.toHaveAttribute("aria-invalid", "true");
     });


    it("wywołuje addUser i nawiguje po poprawnym przesłaniu formularza", async () => {
        mockAddUser.mockResolvedValue(undefined); 
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
                "mocked-recaptcha-token"
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


       
        expect(screen.getByLabelText("Imię")).toHaveValue("");
        expect(screen.getByLabelText("Nazwisko")).toHaveValue("");
        expect(screen.getByLabelText("Email")).toHaveValue("");
        expect(screen.getByLabelText("Hasło logowania")).toHaveValue("");
    });

    it("wyświetla ogólny błąd przy nieudanej rejestracji i nie czyści pól oprócz hasła", async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); 
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

       
        expect(screen.getByLabelText("Imię")).toHaveValue("Jan");
        expect(screen.getByLabelText("Nazwisko")).toHaveValue("Kowalski");
        expect(screen.getByLabelText("Email")).toHaveValue("jan.kowalski@example.pl");
        expect(screen.getByLabelText("Hasło logowania")).toHaveValue(""); 

        consoleErrorSpy.mockRestore(); 
    });

    it("dezaktywuje przycisk wysyłania i pokazuje tekst ładowania podczas przetwarzania", async () => {
        
        mockAddUser.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
        renderWithRouter();

        await user.type(screen.getByLabelText("Imię"), "Jan");
        await user.type(screen.getByLabelText("Nazwisko"), "Kowalski");
        await user.type(screen.getByLabelText("Email"), "jan.kowalski@example.pl");
        await user.type(screen.getByLabelText("Hasło logowania"), "Password123!");

        const submitButton = screen.getByRole("button", { name: "Utwórz konto" });
        await user.click(submitButton);

      
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent("Tworzenie konta...");
        expect(screen.getByLabelText("Imię")).toBeDisabled();
        expect(screen.getByLabelText("Nazwisko")).toBeDisabled();
        expect(screen.getByLabelText("Email")).toBeDisabled();
        expect(screen.getByLabelText("Hasło logowania")).toBeDisabled();


       
        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
            expect(submitButton).toHaveTextContent("Utwórz konto"); 
        });

        
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
      
         expect(formElement).toHaveClass("flex");
         expect(formElement).toHaveClass("flex-col");
     });

    it("renderuje link do logowania i nawiguje po kliknięciu", async () => {
        renderWithRouter();

        const loginLink = screen.getByRole('link', { name: "Zaloguj się" });
        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute("href", "/login");

    
    });

    it("nie wywołuje addUser jeśli walidacja po stronie klienta zawiedzie", async () => {
        (validators.validateEmail as jest.Mock).mockReturnValue("Błędny email");
        renderWithRouter();

        await user.type(screen.getByLabelText("Imię"), "Jan");
        await user.type(screen.getByLabelText("Nazwisko"), "Kowalski");
        await user.type(screen.getByLabelText("Email"), "zlyemail"); 
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