import { useState, useEffect } from "react";
import { RecoverMasterkeyDialog } from "./RecoverMasterkeyDialog";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClipboardCopy, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddPasswordDialog } from "./AddPasswordDialog";
import { ShowPasswordDialog } from "./ShowPasswordDialog";
import {  PasswordTable } from "../data/PasswordContext";
import { Toaster } from "sonner";
import { UpdatePasswordDialog } from "./UpdatePasswordDialog";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import { findIconUrl } from "@/lib/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, getRandomColor } from "@/lib/functions";
import JSZip from "jszip";

/**
 * Rozszerzenie meta danych tabeli o flagę ładowania ikon.
 * @see {@link https://tanstack.com/table/v8/docs/api/core/table#meta}
 */
declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    isLoadingIcons?: boolean;
  }
}


interface ColumnProps {
  copyToClipboard: (passwordfile: string, platform: string, login: string, onDecryptionFail?: () => void) => Promise<void>;
  setMasterkey: (masterkey: string) => Promise<void>;
  updatePassword: (newPassword: string, platform: string, login: string) => Promise<void>;
  deletePassword: (platform: string, login: string) => Promise<void>;
  state: { zip: JSZip | null; encryptionKey?: CryptoKey | undefined };
}

/**
 * Interfejs propsów dla komponentu DataTable.
 * @interface DataTableProps
 * @property {PasswordTable[]} passwords - Lista haseł do wyświetlenia w tabeli.
 * @property {boolean} loading - Flaga wskazująca, czy dane są w trakcie ładowania.
 * @property {Function} addPassword - Funkcja do dodawania nowego hasła.
 * @property {Function} copyToClipboard - Funkcja do kopiowania hasła do schowka.
 * @property {Function} setMasterkey - Funkcja do ustawiania klucza głównego.
 * @property {Function} updatePassword - Funkcja do aktualizacji hasła.
 * @property {Function} deletePassword - Funkcja do usuwania hasła.
 * @property {{ zip: JSZip | null; encryptionKey?: CryptoKey | undefined }} state - Stan zawierający obiekt zip i klucz szyfrowania.
 */
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


/**
 * Definicja kolumn tabeli dla komponentu DataTable.
 * @param props - Obiekt zawierający funkcje i stan do obsługi akcji w kolumnach.
 * @returns Tablica definicji kolumn dla tabeli.
 * @type {ColumnDef<PasswordTable>[]}
 */
export const columns = ({
  copyToClipboard,
  setMasterkey,
  updatePassword,
  deletePassword,
  state,
}: ColumnProps): ColumnDef<PasswordTable>[] => [
  {
    accessorKey: "platform",
    header: "Serwis",
    cell: ({ row, table }) => {
      const platform: string = row.getValue("platform");
      const iconUrl = findIconUrl(platform);
      const isLoading = table.options.meta?.isLoadingIcons;

      return (
        <div
          style={{
            width: "40px",
            height: "40px",
            position: "relative",
            display: "inline-block",
          }}
        >
          {iconUrl ? (
            <>
              <Skeleton
                className="w-[40px] h-[40px] rounded-full absolute top-0 left-0"
                style={{
                  opacity: isLoading ? 1 : 0,
                  transition: "opacity 0.5s ease-in, background 0.2s ease-in",
                }}
              />
              <img
                src={iconUrl}
                alt={`${platform} logo`}
                width="40"
                height="40"
                style={{
                  borderRadius: "50%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  opacity: isLoading ? 0 : 1,
                  transition: "opacity 0.5s ease-in, background 0.2s ease-in",
                }}
                className="select-none"
              />
            </>
          ) : (
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: getRandomColor(platform),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "bold",
              }}
              className="select-none"
            >
              {getInitials(platform)}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "login",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Login
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("login")}</div>,
  },
  {
    accessorKey: "passwordfile",
    header: () => <div className="text-right">Kopiuj</div>,
    cell: ({ row }) => {
      const platform = row.original.platform;
      const login = row.original.login;
      const [isRecoverDialogOpen, setIsRecoverDialogOpen] = useState(false);
      const handleDecryptionFail = () => {
        setIsRecoverDialogOpen(true);
      };
      return (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outline"
            size="icon"
            style={{ cursor: "pointer" }}
            onClick={() =>
              copyToClipboard(
                row.getValue("passwordfile"),
                platform,
                login,
                handleDecryptionFail
              )
            }
            data-testid="copy-button"
          >
            <ClipboardCopy className="w-5 h-5" />
          </Button>
          <RecoverMasterkeyDialog
            isDialogOpen={isRecoverDialogOpen}
            setIsDialogOpen={setIsRecoverDialogOpen}
            setMasterkey={setMasterkey}

          />
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const rowData = row.original;
      const [isShowDialogOpen, setIsShowDialogOpen] = useState(false);
      const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
      const [isRecoverDialogOpen, setIsRecoverDialogOpen] = useState(false);
      const handleDecryptionFail = () => {
        setIsRecoverDialogOpen(true);
      };
      return (
        <>
          <RecoverMasterkeyDialog
            isDialogOpen={isRecoverDialogOpen}
            setIsDialogOpen={setIsRecoverDialogOpen}
            setMasterkey={setMasterkey}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="select-none">
              <DropdownMenuLabel>Akcje</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  copyToClipboard(
                    rowData.passwordfile,
                    rowData.platform,
                    rowData.login,
                    handleDecryptionFail
                  )
                }
              >
                Kopiuj hasło
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsUpdateDialogOpen(true)}>
                Zmień hasło
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsShowDialogOpen(true)}>
                Pokaż
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                Usuń konto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ShowPasswordDialog
            isDialogOpen={isShowDialogOpen}
            setIsDialogOpen={setIsShowDialogOpen}
            passwordfile={rowData.passwordfile}
            platform={rowData.platform}
            login={rowData.login}
            zip={state.zip}
            encryptionKey={state.encryptionKey}
            setMasterkey={setMasterkey}
          />
          <UpdatePasswordDialog
            isDialogOpen={isUpdateDialogOpen}
            setIsDialogOpen={setIsUpdateDialogOpen}
            platform={rowData.platform}
            login={rowData.login}
            updatePassword={updatePassword}
          />
          <DeleteAccountDialog
            isDialogOpen={isDeleteDialogOpen}
            setIsDialogOpen={setIsDeleteDialogOpen}
            platform={rowData.platform}
            login={rowData.login}
            deletePassword={deletePassword}
          />
        </>
      );
    },
  },
];

/**
 * Komponent DataTable wyświetla tabelę z danymi haseł użytkownika.
 * Umożliwia filtrowanie, sortowanie, paginację oraz zarządzanie hasłami (dodawanie, kopiowanie, aktualizacja, usuwanie).
 * Wykorzystuje bibliotekę `@tanstack/react-table` do zarządzania tabelą.
 * @param props - Propsy komponentu.
 * @returns {JSX.Element} Tabela z danymi haseł użytkownika i opcjami zarządzania.
 * @example
 * ```tsx
 * import { DataTable } from '@/components/DataTable';
 * import { usePasswordContext } from '@/data/PasswordContext';
 *
 * function ParentComponent() {
 *   const { passwords, addPassword, copyToClipboard, setMasterkey, updatePassword, deletePassword, state } = usePasswordContext();
 *   return (
 *     <DataTable
 *       passwords={passwords}
 *       loading={false}
 *       addPassword={addPassword}
 *       copyToClipboard={copyToClipboard}
 *       setMasterkey={setMasterkey}
 *       updatePassword={updatePassword}
 *       deletePassword={deletePassword}
 *       state={{ zip: state.zip, encryptionKey: state.encryptionKey }}
 *     />
 *   );
 * }
 * ```
 * @see {@link DataTable} - Tabela haseł
 * @see {@link https://tanstack.com/table/v8/docs} - Biblioteka useReactTable
 * @see {@link columns} - Definicja kolumn tabeli
 * @see {@link getRandomColor} - Funkcja generująca losowy kolor
 * @see {@link getInitials} - Funkcja generująca inicjały
 */
export function DataTable({
  passwords,
  loading,
  addPassword,
  copyToClipboard,
  setMasterkey,
  updatePassword,
  deletePassword,
  state,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingIcons, setIsLoadingIcons] = useState(false);

  useEffect(() => {
    if (passwords.length === 0) return;

    const iconUrls = passwords
      .map((item) => findIconUrl(item.platform))
      .filter(Boolean) as string[];

    if (iconUrls.length === 0) {
      setIsLoadingIcons(false);
      return;
    }

    setIsLoadingIcons(true);
    let loadedCount = 0;
    const totalIcons = iconUrls.length;

    const handleLoad = () => {
      loadedCount += 1;
      if (loadedCount === totalIcons) {
        setIsLoadingIcons(false);
      }
    };

    iconUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = handleLoad;
      img.onerror = handleLoad;
    });
  }, [passwords]);

  const table = useReactTable({
    data: passwords,
    columns: columns({ copyToClipboard, setMasterkey, updatePassword, deletePassword, state }),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      isLoadingIcons,
    },
  });

  if (loading) {
    return <div className="text-center">Ładowanie...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filtruj konta..."
          value={(table.getColumn("login")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("login")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <AddPasswordDialog
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          onSubmit={addPassword}
        />
        <Button
          variant="default"
          onClick={() => setIsDialogOpen(true)}
          className="select-none"
        >
          <Plus className="w-5 h-5 mr-2 select-none" />
          Dodaj
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Brak wyników.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="select-none"
          >
            Poprzednia
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="select-none"
          >
            Następna
          </Button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}