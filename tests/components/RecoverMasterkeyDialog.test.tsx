import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { RecoverMasterkeyDialog } from "@/components/RecoverMasterkeyDialog";

jest.mock("sonner");

const mockSetMasterkey = jest.fn();
const mockSetIsDialogOpen = jest.fn();
const mockToastInfo = jest.spyOn(toast, "info");
const mockToastError = jest.spyOn(toast, "error");

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

describe("Komponent RecoverMasterkeyDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("poprawnie renderuje dialog z formularzem, gdy jest otwarty", () => {
    render(
      <RecoverMasterkeyDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        setMasterkey={mockSetMasterkey}
      />
    );

    expect(screen.getByText(/wprowadź masterkey/i)).toBeInTheDocument();
    expect(
      screen.getByText(/wpisz swoje hasło szyfrowania/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Masterkey")).toBeInTheDocument();
    expect(screen.getByLabelText("Potwierdź Masterkey")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zweryfikuj/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /anuluj/i })).toBeInTheDocument();
  });

  it("nie renderuje dialogu, gdy isDialogOpen jest false", () => {
    render(
      <RecoverMasterkeyDialog
        isDialogOpen={false}
        setIsDialogOpen={mockSetIsDialogOpen}
        setMasterkey={mockSetMasterkey}
      />
    );

    expect(screen.queryByText(/wprowadź masterkey/i)).not.toBeInTheDocument();
  });

  it("wyświetla błąd walidacji, gdy pola są puste", async () => {
    render(
      <RecoverMasterkeyDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        setMasterkey={mockSetMasterkey}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /zweryfikuj/i }));

    await waitFor(() => {
      expect(screen.getByText(/oba pola są wymagane/i)).toBeInTheDocument();
      expect(mockSetMasterkey).not.toHaveBeenCalled();
    });
  });

  it("wyświetla błąd walidacji, gdy masterkey i potwierdzenie nie są identyczne", async () => {
    render(
      <RecoverMasterkeyDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        setMasterkey={mockSetMasterkey}
      />
    );

    fireEvent.change(screen.getByLabelText("Masterkey"), {
      target: { value: "key123" },
    });
    fireEvent.change(screen.getByLabelText("Potwierdź Masterkey"), {
      target: { value: "key456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /zweryfikuj/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/masterkey i jego potwierdzenie muszą być identyczne/i)
      ).toBeInTheDocument();
      expect(mockSetMasterkey).not.toHaveBeenCalled();
    });
  });

  it("poprawnie weryfikuje masterkey i zamyka dialog po sukcesie", async () => {
    mockSetMasterkey.mockResolvedValueOnce(undefined);

    render(
      <RecoverMasterkeyDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        setMasterkey={mockSetMasterkey}
      />
    );

    fireEvent.change(screen.getByLabelText("Masterkey"), {
      target: { value: "key123" },
    });
    fireEvent.change(screen.getByLabelText("Potwierdź Masterkey"), {
      target: { value: "key123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /zweryfikuj/i }));

    await waitFor(() => {
      expect(mockSetMasterkey).toHaveBeenCalledWith("key123");
      expect(mockToastInfo).toHaveBeenCalledWith("Masterkey ustawiony!", {
        description: "Masterkey ustawiony.",
        duration: 3000,
      });
      expect(mockSetIsDialogOpen).toHaveBeenCalledWith(false);
      expect(screen.getByLabelText("Masterkey")).toHaveValue("");
      expect(screen.getByLabelText("Potwierdź Masterkey")).toHaveValue("");
    });
  });

  it("wyświetla błąd i nie zamyka dialogu przy nieudanej weryfikacji", async () => {
    mockSetMasterkey.mockRejectedValueOnce(new Error("Błąd weryfikacji"));

    render(
      <RecoverMasterkeyDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        setMasterkey={mockSetMasterkey}
      />
    );

    fireEvent.change(screen.getByLabelText("Masterkey"), {
      target: { value: "key123" },
    });
    fireEvent.change(screen.getByLabelText("Potwierdź Masterkey"), {
      target: { value: "key123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /zweryfikuj/i }));

    await waitFor(() => {
      expect(mockSetMasterkey).toHaveBeenCalledWith("key123");
      expect(
        screen.getByText(
          /podany masterkey jest nieprawidłowy lub nie można odszyfrować haseł/i
        )
      ).toBeInTheDocument();
      expect(mockToastError).toHaveBeenCalledWith("Błąd!", {
        description: "Nie udało się zweryfikować masterkey. Spróbuj ponownie.",
        duration: 3000,
      });
      expect(mockSetIsDialogOpen).not.toHaveBeenCalled();
    });
  });

  it("zamyka dialog po kliknięciu przycisku Anuluj", () => {
    render(
      <RecoverMasterkeyDialog
        isDialogOpen={true}
        setIsDialogOpen={mockSetIsDialogOpen}
        setMasterkey={mockSetMasterkey}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /anuluj/i }));

    expect(mockSetIsDialogOpen).toHaveBeenCalledWith(false);
    expect(mockSetMasterkey).not.toHaveBeenCalled();
  });
});