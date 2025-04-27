import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { UpdateMasterkeyDialog } from "@/components/UpdateMasterkeyDialog";

jest.mock("sonner");

const mockUpdateFn = jest.fn();
const mockSetIsDialogOpen = jest.fn();
const mockToastSuccess = jest.spyOn(toast, "success");
const mockToastError = jest.spyOn(toast, "error");
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });
const mockUser = {
  id: "1",
  login: "test@example.com",
  first_name: "Jan",
  last_name: "Kowalski",
  password: "pass",
};

const mockPasswords = [
  {
    id: "1",
    passwordfile: "encrypted",
    logo: "",
    platform: "example",
    login: "user",
  },
];

describe("Komponent UpdateMasterkeyDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("poprawnie renderuje dialog z formularzem, gdy jest otwarty", () => {
    render(
      <UpdateMasterkeyDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        updatefn={mockUpdateFn}
        token="abc123"
        currentUser={mockUser}
        passwords={mockPasswords}
      />
    );

    expect(screen.getByText(/zmień masterkey/i)).toBeInTheDocument();
    expect(
      screen.getByText(/aktualizuj swoje hasło szyfrowania/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Stare Masterkey")).toBeInTheDocument();
    expect(screen.getByLabelText("Nowe Masterkey")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Potwierdź nowe Masterkey")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zapisz/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /anuluj/i })).toBeInTheDocument();
  });

  it("nie renderuje dialogu, gdy isDialogOpen jest false", () => {
    render(
      <UpdateMasterkeyDialog
        isDialogOpen={false}
        setIsDialogOpen={mockSetIsDialogOpen}
        updatefn={mockUpdateFn}
        token="abc123"
        currentUser={mockUser}
        passwords={mockPasswords}
      />
    );

    expect(screen.queryByText(/zmień masterkey/i)).not.toBeInTheDocument();
  });

  it("wyświetla błąd walidacji, gdy pola są puste", async () => {
    render(
      <UpdateMasterkeyDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        updatefn={mockUpdateFn}
        token="abc123"
        currentUser={mockUser}
        passwords={mockPasswords}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /zapisz/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/wszystkie pola są wymagane/i)
      ).toBeInTheDocument();
      expect(mockUpdateFn).not.toHaveBeenCalled();
    });
  });

  it("wyświetla błąd walidacji, gdy nowe masterkey i potwierdzenie nie są identyczne", async () => {
    render(
      <UpdateMasterkeyDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        updatefn={mockUpdateFn}
        token="abc123"
        currentUser={mockUser}
        passwords={mockPasswords}
      />
    );

    fireEvent.change(screen.getByLabelText("Stare Masterkey"), {
      target: { value: "oldkey" },
    });
    fireEvent.change(screen.getByLabelText("Nowe Masterkey"), {
      target: { value: "newkey123" },
    });
    fireEvent.change(screen.getByLabelText("Potwierdź nowe Masterkey"), {
      target: { value: "newkey456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /zapisz/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /nowe hasło masterkey i jego potwierdzenie muszą być identyczne/i
        )
      ).toBeInTheDocument();
      expect(mockUpdateFn).not.toHaveBeenCalled();
    });
  });

  it("poprawnie aktualizuje masterkey i zamyka dialog po sukcesie", async () => {
    mockUpdateFn.mockResolvedValueOnce(undefined);

    render(
      <UpdateMasterkeyDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        updatefn={mockUpdateFn}
        token="abc123"
        currentUser={mockUser}
        passwords={mockPasswords}
      />
    );

    fireEvent.change(screen.getByLabelText("Stare Masterkey"), {
      target: { value: "oldkey" },
    });
    fireEvent.change(screen.getByLabelText("Nowe Masterkey"), {
      target: { value: "newkey123" },
    });
    fireEvent.change(screen.getByLabelText("Potwierdź nowe Masterkey"), {
      target: { value: "newkey123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /zapisz/i }));

    await waitFor(() => {
      expect(mockUpdateFn).toHaveBeenCalledWith(
        "oldkey",
        "newkey123",
        "abc123",
        mockUser,
        mockPasswords
      );
      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Masterkey zaktualizowany pomyślnie!",
        { duration: 3000 }
      );
      expect(mockSetIsDialogOpen).toHaveBeenCalledWith(false);
      expect(screen.getByLabelText("Stare Masterkey")).toHaveValue("");
      expect(screen.getByLabelText("Nowe Masterkey")).toHaveValue("");
      expect(screen.getByLabelText("Potwierdź nowe Masterkey")).toHaveValue("");
    });
  });

  it("wyświetla błąd i nie zamyka dialogu przy nieudanej aktualizacji", async () => {
    mockUpdateFn.mockRejectedValueOnce(new Error("Błąd aktualizacji"));

    render(
      <UpdateMasterkeyDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        updatefn={mockUpdateFn}
        token="abc123"
        currentUser={mockUser}
        passwords={mockPasswords}
      />
    );

    fireEvent.change(screen.getByLabelText("Stare Masterkey"), {
      target: { value: "oldkey" },
    });
    fireEvent.change(screen.getByLabelText("Nowe Masterkey"), {
      target: { value: "newkey123" },
    });
    fireEvent.change(screen.getByLabelText("Potwierdź nowe Masterkey"), {
      target: { value: "newkey123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /zapisz/i }));

    await waitFor(() => {
      expect(mockUpdateFn).toHaveBeenCalledWith(
        "oldkey",
        "newkey123",
        "abc123",
        mockUser,
        mockPasswords
      );
      expect(
        screen.getByText(
          /nie udało się zaktualizować masterkey\. sprawdź dane i spróbuj ponownie/i
        )
      ).toBeInTheDocument();
      expect(mockToastError).toHaveBeenCalledWith("Błąd aktualizacji masterkey!", {
        description: "Błąd aktualizacji",
        duration: 3000,
      });
      expect(mockSetIsDialogOpen).not.toHaveBeenCalled();
    });
  });

  it("zamyka dialog po kliknięciu przycisku Anuluj", () => {
    render(
      <UpdateMasterkeyDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        updatefn={mockUpdateFn}
        token="abc123"
        currentUser={mockUser}
        passwords={mockPasswords}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /anuluj/i }));

    expect(mockSetIsDialogOpen).toHaveBeenCalledWith(false);
    expect(mockUpdateFn).not.toHaveBeenCalled();
  });
});