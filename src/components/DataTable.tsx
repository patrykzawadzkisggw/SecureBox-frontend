import { useState } from "react";
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
import { usePasswordContext, PasswordTable } from "../data/PasswordContext";
import { Toaster } from "sonner";
import { UpdatePasswordDialog } from "./UpdatePasswordDialog";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import { findIconUrl } from "@/lib/icons";

export const columns: ColumnDef<PasswordTable>[] = [
  {
    accessorKey: "platform",
    header: "Serwis",
    cell: ({ row }) => {
      const iconUrl = findIconUrl(row.getValue("platform"));
      return iconUrl ? (
        <img
          src={iconUrl}
          alt="Logo"
          width="40"
          height="40"
          style={{ borderRadius: "50%" }}
          className="select-none"
        />
      ) : (
        <span>{row.getValue("platform")}</span>
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
      const { copyToClipboard } = usePasswordContext();
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
          >
            <ClipboardCopy className="w-5 h-5" />
          </Button>
          <RecoverMasterkeyDialog
            isDialogOpen={isRecoverDialogOpen}
            setIsDialogOpen={setIsRecoverDialogOpen}
          />
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;
      const { copyToClipboard } = usePasswordContext();
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
                    payment.passwordfile,
                    payment.platform,
                    payment.login,
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
            passwordfile={payment.passwordfile}
            platform={payment.platform}
            login={payment.login}
          />
          <UpdatePasswordDialog
            isDialogOpen={isUpdateDialogOpen}
            setIsDialogOpen={setIsUpdateDialogOpen}
            platform={payment.platform}
            login={payment.login}
          />
          <DeleteAccountDialog
            isDialogOpen={isDeleteDialogOpen}
            setIsDialogOpen={setIsDeleteDialogOpen}
            platform={payment.platform}
            login={payment.login}
          />
        </>
      );
    },
  },
];

export function DataTable() {
  const { state } = usePasswordContext();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  

  const table = useReactTable({
    data: state.passwords,
    columns,
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
  });

  if (state.loading) {
    return <div className="text-center">Ładowanie...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filtruj konta..."
          value={(table.getColumn("login")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("login")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <AddPasswordDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
        <Button variant="default" onClick={() => setIsDialogOpen(true)} className="select-none">
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
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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