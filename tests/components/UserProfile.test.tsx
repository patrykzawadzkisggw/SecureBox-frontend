import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import UserProfile from "@/components/UserProfile";

jest.mock("sonner");
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));


const mockNavigate = jest.fn();
const mockUpdateUser = jest.fn();
const mockToast = jest.spyOn(toast, "success");


const mockUser = {
  id: "1",
  login: "test@example.com",
  first_name: "Jan",
  last_name: "Kowalski",
  password: "Pa",
};

describe("Komponent UserProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it("poprawnie renderuje dane użytkownika, gdy dane nie są ładowane", () => {
    render(
      <UserProfile
        updateUser={mockUpdateUser}
        currentUser={mockUser}
        loading={false}
      />
    );

    expect(screen.getByLabelText(/login/i)).toHaveValue("test@example.com");
    expect(screen.getByLabelText(/imię/i)).toHaveValue("Jan");
    expect(screen.getByLabelText(/nazwisko/i)).toHaveValue("Kowalski");
    expect(screen.getByRole("button", { name: /edytuj/i })).toBeInTheDocument();
  });

  it("wyświetla stan ładowania, gdy prop loading jest ustawiony na true", () => {
    render(
      <UserProfile
        updateUser={mockUpdateUser}
        currentUser={mockUser}
        loading={true}
      />
    );

    expect(
      screen.getByText(/ładowanie danych użytkownika/i)
    ).toBeInTheDocument();
  });

  it("wyświetla komunikat o braku danych użytkownika, gdy currentUser jest null", () => {
    render(
      <UserProfile
        updateUser={mockUpdateUser}
        currentUser={null}
        loading={false}
      />
    );

    expect(screen.getByText(/brak danych użytkownika/i)).toBeInTheDocument();
  });

  it("włącza tryb edycji po kliknięciu przycisku Edytuj", () => {
    render(
      <UserProfile
        updateUser={mockUpdateUser}
        currentUser={mockUser}
        loading={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /edytuj/i }));

    expect(screen.getByRole("button", { name: /zapisz/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /anuluj/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nowe hasło/i)).toBeInTheDocument();
  });

  it("resetuje formularz i wychodzi z trybu edycji po kliknięciu Anuluj", () => {
    render(
      <UserProfile
        updateUser={mockUpdateUser}
        currentUser={mockUser}
        loading={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /edytuj/i }));

    const firstNameInput = screen.getByLabelText(/imię/i);
    fireEvent.change(firstNameInput, { target: { value: "Anna" } });

    fireEvent.click(screen.getByRole("button", { name: /anuluj/i }));

    expect(firstNameInput).toHaveValue("Jan");
    expect(screen.getByRole("button", { name: /edytuj/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/nowe hasło/i)).not.toBeInTheDocument();
  });

  it("wyświetla błędy walidacji dla nieprawidłowego imienia", async () => {
    render(
      <UserProfile
        updateUser={mockUpdateUser}
        currentUser={mockUser}
        loading={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /edytuj/i }));

    const firstNameInput = screen.getByLabelText(/imię/i);
    fireEvent.change(firstNameInput, { target: { value: "Jan12" } });

    fireEvent.click(screen.getByRole("button", { name: /zapisz/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/imię nie może zawierać cyfr/i)
      ).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith("Popraw błędy w formularzu");
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });
  });

  it("wyświetla błędy walidacji dla nieprawidłowego hasła", async () => {
    render(
      <UserProfile
        updateUser={mockUpdateUser}
        currentUser={mockUser}
        loading={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /edytuj/i }));

    const passwordInput = screen.getByLabelText(/nowe hasło/i);
    fireEvent.change(passwordInput, { target: { value: "short" } });

    fireEvent.click(screen.getByRole("button", { name: /zapisz/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/hasło musi mieć co najmniej 8 znaków/i)
      ).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith("Popraw błędy w formularzu");
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });
  });

  it("poprawnie zapisuje prawidłowe dane i nawiguje", async () => {
    render(
      <UserProfile
        updateUser={mockUpdateUser}
        currentUser={mockUser}
        loading={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /edytuj/i }));

    const firstNameInput = screen.getByLabelText(/imię/i);
    const lastNameInput = screen.getByLabelText(/nazwisko/i);
    const passwordInput = screen.getByLabelText(/nowe hasło/i);

    fireEvent.change(firstNameInput, { target: { value: "Anna" } });
    fireEvent.change(lastNameInput, { target: { value: "Nowak" } });
    fireEvent.change(passwordInput, { target: { value: "Password123!" } });

    fireEvent.click(screen.getByRole("button", { name: /zapisz/i }));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(
        "1",
        "Anna",
        "Nowak",
        undefined,
        "Password123!"
      );
      expect(mockToast).toHaveBeenCalledWith("Profil zaktualizowany!", {
        description: "Zmiany zostały zapisane.",
        duration: 3000,
      });
      expect(mockNavigate).toHaveBeenCalledWith("/settings");
    });
  });

  it("wyświetla powiadomienie o błędzie przy nieudanej aktualizacji", async () => {
    mockUpdateUser.mockRejectedValueOnce(new Error("Błąd aktualizacji"));

    render(
      <UserProfile
        updateUser={mockUpdateUser}
        currentUser={mockUser}
        loading={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /edytuj/i }));

    fireEvent.click(screen.getByRole("button", { name: /zapisz/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Wystąpił błąd podczas zapisywania"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/settings");
    });
  });
});