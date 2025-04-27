import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { toast } from "sonner";
import ImportFromJSON, { handleFileChange } from "@/components/ImportFromJSON";
import { PasswordTable } from "@/data/PasswordContext";



beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
    (console.warn as jest.Mock).mockRestore();
  });

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

interface MockButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  asChild?: boolean;
}

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, asChild }: MockButtonProps) => (
    <button disabled={disabled}>{asChild ? (children as any).props.children : children}</button>
  ),
}));
jest.mock("lucide-react", () => ({
  Upload: () => <svg role="img" aria-hidden="true" />,
}));



const mockAddPassword = jest.fn();
const mockUpdatePassword = jest.fn();
const mockToastSuccess = jest.spyOn(toast, "success");
const mockToastError = jest.spyOn(toast, "error");


const mockPasswords: PasswordTable[] = [
  {
    id: "1",
    passwordfile: "pass1.txt",
    platform: "existing",
    login: "user",
    logo: "",
  },
];


const mockFile = (content: string) =>
    new File([content], "test.json", { type: "application/json" });
const originalFileText = File.prototype.text;

describe("Komponent ImportFromJSON", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAddPassword.mockResolvedValue(undefined);
        mockUpdatePassword.mockResolvedValue(undefined);
    

        File.prototype.text = jest.fn().mockImplementation(async function(this: File) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(reader.error);
                reader.readAsText(this);
            });
        });
      });

      afterEach(() => {
        jest.clearAllMocks();
   
      });

  it("poprawnie renderuje przycisk i input importu", () => {
    render(
      <ImportFromJSON
        addPassword={mockAddPassword}
        updatePassword={mockUpdatePassword}
        loading={false}
        passwords={mockPasswords}
      />
    );

    const button = screen.getByRole("button", { name: /importuj z json/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
    const input = screen.getByTestId("json-import-input");
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute("accept", ".json");
    expect(input).not.toBeDisabled();
  });

  it("przycisk i input są wyłączone podczas ładowania", () => {
    render(
      <ImportFromJSON
        addPassword={mockAddPassword}
        updatePassword={mockUpdatePassword}
        loading={true} 
        passwords={mockPasswords}
      />
    );

    expect(screen.getByRole("button", { name: /importuj z json/i })).toBeDisabled();

    expect(screen.getByTestId("json-import-input")).toBeDisabled(); 
  });

  it("przycisk pokazuje 'Importowanie...' i jest wyłączony podczas importu", async () => {
    render(
        <ImportFromJSON
          addPassword={mockAddPassword}
          updatePassword={mockUpdatePassword}
          loading={false}
          passwords={mockPasswords}
        />
      );
  
     
      const input = screen.getByTestId("json-import-input"); 
      fireEvent.change(input, { target: { files: [mockFile(JSON.stringify([]))] } });
  
      expect(screen.getByRole("button", { name: /importowanie.../i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /importowanie.../i })).toBeDisabled();
      expect(input).toBeDisabled();
  
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /importuj z json/i })).toBeInTheDocument();
      });
  });

  it("poprawnie importuje nowe i istniejące hasła", async () => {
    const jsonData = [
      { platform: "existing", login: "user", password: "updatedPass" },
      { platform: "new", login: "newUser", password: "newPass" },
    ];
    const file = mockFile(JSON.stringify(jsonData));

    render(
      <ImportFromJSON
        addPassword={mockAddPassword}
        updatePassword={mockUpdatePassword}
        loading={false}
        passwords={mockPasswords}
      />
    );

    const input = screen.getByTestId("json-import-input"); 
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith("updatedPass", "existing", "user");
      expect(mockAddPassword).toHaveBeenCalledWith("newPass", "new", "newUser");
      expect(mockToastSuccess).toHaveBeenCalledWith("Import zakończony!", {
        description: "Hasła zostały zaimportowane z pliku JSON.",
        duration: 3000,
      });
      expect(input).toHaveValue("");
    });
  });

  it("pomija nieprawidłowe wpisy w pliku JSON", async () => {
    const jsonData = [
      { platform: "new", login: "newUser", password: "newPass" },
      { platform: "", login: "invalid", password: "invalidPass" },
      { platform: "missingLogin", password: "missingPass" },
    ];
    const file = mockFile(JSON.stringify(jsonData));

    render(
      <ImportFromJSON
        addPassword={mockAddPassword}
        updatePassword={mockUpdatePassword}
        loading={false}
        passwords={mockPasswords}
      />
    );

    const input = screen.getByTestId("json-import-input"); 
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockAddPassword).toHaveBeenCalledWith("newPass", "new", "newUser");
      expect(mockUpdatePassword).not.toHaveBeenCalled();
      expect(mockToastSuccess).toHaveBeenCalledWith("Import zakończony!", {
        description: "Hasła zostały zaimportowane z pliku JSON.",
        duration: 3000,
      });
      expect(input).toHaveValue("");
    });
  });

  it("obsługuje błąd nieprawidłowego formatu JSON", async () => {
    const file = mockFile("invalid json");

    render(
      <ImportFromJSON
        addPassword={mockAddPassword}
        updatePassword={mockUpdatePassword}
        loading={false}
        passwords={mockPasswords}
      />
    );

    const input = screen.getByTestId("json-import-input"); 
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockAddPassword).not.toHaveBeenCalled();
      expect(mockUpdatePassword).not.toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith("Błąd!", {
        description: "Nie udało się zaimportować haseł z JSON.",
        duration: 3000,
      });
      expect(input).toHaveValue("");
    });
  });

  it("obsługuje błąd, gdy JSON nie jest tablicą", async () => {
    const file = mockFile(JSON.stringify({ invalid: "data" }));

    render(
      <ImportFromJSON
        addPassword={mockAddPassword}
        updatePassword={mockUpdatePassword}
        loading={false}
        passwords={mockPasswords}
      />
    );

    const input = screen.getByTestId("json-import-input"); 
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockAddPassword).not.toHaveBeenCalled();
      expect(mockUpdatePassword).not.toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith("Błąd!", {
        description: "Nie udało się zaimportować haseł z JSON.",
        duration: 3000,
      });
      expect(input).toHaveValue("");
    });
  });

  it("nie wywołuje akcji, gdy brak pliku", async () => {
    render(
      <ImportFromJSON
        addPassword={mockAddPassword}
        updatePassword={mockUpdatePassword}
        loading={false}
        passwords={mockPasswords}
      />
    );

    const input = screen.getByTestId("json-import-input"); 
    fireEvent.change(input, { target: { files: [] } });

    await waitFor(() => {
      expect(mockAddPassword).not.toHaveBeenCalled();

      expect(mockToastSuccess).not.toHaveBeenCalled();
      expect(mockToastError).not.toHaveBeenCalled();
      expect(input).toHaveValue("");
    });
  });

  describe("Funkcja handleFileChange", () => {
    it("poprawnie przetwarza plik JSON z nowymi i istniejącymi hasłami", async () => {
      const jsonData = [
        { platform: "existing", login: "user", password: "updatedPass" },
        { platform: "new", login: "newUser", password: "newPass" },
      ];
      const file = mockFile(JSON.stringify(jsonData));
      const setIsImporting = jest.fn();

      await handleFileChange(
        { target: { files: [file], value: "test.json" } } as any,
        mockPasswords,
        mockAddPassword,
        mockUpdatePassword,
        setIsImporting
      );

      expect(setIsImporting).toHaveBeenCalledWith(true);
      expect(mockUpdatePassword).toHaveBeenCalledWith("updatedPass", "existing", "user");
      expect(mockAddPassword).toHaveBeenCalledWith("newPass", "new", "newUser");
      expect(mockToastSuccess).toHaveBeenCalledWith("Import zakończony!", {
        description: "Hasła zostały zaimportowane z pliku JSON.",
        duration: 3000,
      });
      expect(setIsImporting).toHaveBeenCalledWith(false);
    });

    it("obsługuje błąd nieprawidłowego JSON", async () => {
      const file = mockFile("invalid json");
      const setIsImporting = jest.fn();

      await handleFileChange(
        { target: { files: [file], value: "test.json" } } as any,
        mockPasswords,
        mockAddPassword,
        mockUpdatePassword,
        setIsImporting
      );

      expect(setIsImporting).toHaveBeenCalledWith(true);
      expect(mockAddPassword).not.toHaveBeenCalled();
      expect(mockUpdatePassword).not.toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith("Błąd!", {
        description: "Nie udało się zaimportować haseł z JSON.",
        duration: 3000,
      });
      expect(setIsImporting).toHaveBeenCalledWith(false);
    });
  });
});