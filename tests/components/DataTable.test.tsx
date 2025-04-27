import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DataTable } from "@/components/DataTable";
import { PasswordTable } from "@/data/PasswordContext";
import JSZip from "jszip";
import * as icons from "@/lib/icons";
import * as functions from "@/lib/functions";

jest.mock("@/lib/icons", () => ({
  findIconUrl: jest.fn(),
}));
jest.mock("@/lib/functions", () => ({
  getInitials: jest.fn(),
  getRandomColor: jest.fn(),
}));
jest.mock("@/components/AddPasswordDialog", () => ({
  AddPasswordDialog: jest.fn(({ isDialogOpen, setIsDialogOpen, onSubmit }) => (
    <div data-testid="add-password-dialog">
      {isDialogOpen && <button onClick={() => setIsDialogOpen(false)}>Close</button>}
    </div>
  )),
}));
jest.mock("@/components/RecoverMasterkeyDialog", () => ({
  RecoverMasterkeyDialog: jest.fn(() => <div data-testid="recover-masterkey-dialog" />),
}));
jest.mock("@/components/ShowPasswordDialog", () => ({
  ShowPasswordDialog: jest.fn(() => <div data-testid="show-password-dialog" />),
}));
jest.mock("@/components/UpdatePasswordDialog", () => ({
  UpdatePasswordDialog: jest.fn(() => <div data-testid="update-password-dialog" />),
}));
jest.mock("@/components/DeleteAccountDialog", () => ({
  DeleteAccountDialog: jest.fn(() => <div data-testid="delete-account-dialog" />),
}));
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    asChild ? children : <div data-testid="dropdown-menu-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-content">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <div data-testid="dropdown-menu-item" onClick={onClick}>
      {children}
    </div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-label">{children}</div>
  ),
  DropdownMenuSeparator: () => <hr />,
}));

describe("DataTable", () => {
  const mockPasswords: PasswordTable[] = [
    { platform: "Test1", login: "user1", passwordfile: "file1", id: "1122", logo: "logo2" },
    { platform: "Test2", login: "user2", passwordfile: "file2", id: "2334", logo: "logo1" },
  ];

  const mockProps: DataTableProps = {
    passwords: mockPasswords,
    loading: false,
    addPassword: jest.fn().mockResolvedValue(undefined),
    copyToClipboard: jest.fn().mockResolvedValue(undefined),
    setMasterkey: jest.fn().mockResolvedValue(undefined),
    updatePassword: jest.fn().mockResolvedValue(undefined),
    deletePassword: jest.fn().mockResolvedValue(undefined),
    state: { zip: null, encryptionKey: undefined },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (icons.findIconUrl as jest.Mock).mockReturnValue(null);
    (functions.getInitials as jest.Mock).mockImplementation((platform: string) =>
      platform.slice(0, 2).toUpperCase()
    );
    (functions.getRandomColor as jest.Mock).mockReturnValue("#000000");
  });

  it("renderuje tabele z haslami poprawnie", () => {
    render(<DataTable {...mockProps} />);
    const initials = screen.getAllByText("TE");
    expect(initials).toHaveLength(2);
    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.getByText("user2")).toBeInTheDocument();
  });

  it("wyswietla stan ladowania gdy ladowanie jest prawdziwe", () => {
    render(<DataTable {...mockProps} loading={true} />);
    expect(screen.getByText("Ładowanie...")).toBeInTheDocument();
  });

  it("wyswietla komunikat o braku wynikow gdy hasla sa puste", () => {
    render(<DataTable {...mockProps} passwords={[]} />);
    expect(screen.getByText("Brak wyników.")).toBeInTheDocument();
  });

  it("filtruje hasla po loginie", async () => {
    render(<DataTable {...mockProps} />);
    const filterInput = screen.getByPlaceholderText("Filtruj konta...");
    fireEvent.change(filterInput, { target: { value: "user1" } });
    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.queryByText("user2")).not.toBeInTheDocument();
  });

  it("sortuje kolumne login rosnaco", async () => {
    render(<DataTable {...mockProps} />);
    const loginHeader = screen.getByText("Login");
    fireEvent.click(loginHeader);
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("user1");
    expect(rows[2]).toHaveTextContent("user2");
  });

  it("obsluguje paginacje poprawnie", async () => {
    const manyPasswords: PasswordTable[] = Array.from({ length: 15 }, (_, i) => ({
      platform: `Test${i}`,
      login: `user${i}`,
      passwordfile: `file${i}`,
      id: `id${i}`,
      logo: `logo${i}`,
    }));
    render(<DataTable {...mockProps} passwords={manyPasswords} />);
    const nextButton = screen.getByText("Następna");
    expect(nextButton).not.toBeDisabled();
    fireEvent.click(nextButton);
    expect(screen.getByText("user10")).toBeInTheDocument();
  });

  it("otwiera dialog dodawania hasla po kliknieciu przycisku Dodaj", async () => {
    render(<DataTable {...mockProps} />);
    const addButton = screen.getByText("Dodaj");
    fireEvent.click(addButton);
    expect(screen.getByTestId("add-password-dialog")).toBeInTheDocument();
  });

  it("wywoluje copyToClipboard po kliknieciu przycisku kopiowania", async () => {
    render(<DataTable {...mockProps} />);
    const copyButtons = screen.getAllByTestId("copy-button");
    fireEvent.click(copyButtons[0]);
    await waitFor(() => {
      expect(mockProps.copyToClipboard).toHaveBeenCalledWith(
        "file1",
        "Test1",
        "user1",
        expect.any(Function)
      );
    });
  });

  it("renderuje inicjaly platformy gdy iconUrl jest niedostepny", () => {
    (icons.findIconUrl as jest.Mock).mockReturnValue(null);
    (functions.getInitials as jest.Mock).mockImplementation((platform: string) =>
      platform.slice(0, 2).toUpperCase()
    );
    render(<DataTable {...mockProps} />);
    expect(functions.getInitials).toHaveBeenCalledWith("Test1");
    const initials = screen.getAllByText("TE");
    expect(initials).toHaveLength(2);
  });

  it("renderuje ikone platformy gdy iconUrl jest dostepny", () => {
    (icons.findIconUrl as jest.Mock).mockReturnValue("http://example.com/icon.png");
    render(<DataTable {...mockProps} />);
    const icon = screen.getAllByAltText(/Test1 logo/)[0];
    expect(icon).toHaveAttribute("src", "http://example.com/icon.png");
  });
});

interface DataTableProps {
  passwords: PasswordTable[];
  loading: boolean;
  addPassword: (password: string, platform: string, login: string) => Promise<void>;
  copyToClipboard: (passwordfile: string, platform: string, login: string, onDecryptionFail?: () => void) => Promise<void>;
  setMasterkey: (masterkey: string) => Promise<void>;
  updatePassword: (newPassword: string, platform: string, login: string) => Promise<void>;
  deletePassword: (platform: string, login: string) => Promise<void>;
  state: { zip: JSZip | null; encryptionKey?: CryptoKey | undefined };
}