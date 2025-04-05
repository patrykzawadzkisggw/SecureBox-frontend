import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable, columns } from '@/components/DataTable';
import { usePasswordContext } from '@/data/PasswordContext';
import {
  useReactTable
} from '@tanstack/react-table';


jest.mock('@/data/PasswordContext', () => ({
  usePasswordContext: jest.fn(),
}));

jest.mock('@tanstack/react-table', () => {
  const originalModule = jest.requireActual('@tanstack/react-table');
  return {
    ...originalModule,
    useReactTable: jest.fn(),
  };
});

jest.mock('@/lib/icons', () => ({
  findIconUrl: jest.fn((platform: string) => (platform === 'test1' ? 'https://test1.com/icon.png' : null)),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, disabled }: { children: React.ReactNode; onClick?: () => void; variant?: string; size?: string; disabled?: boolean }) => (
    <button
      onClick={onClick}
      data-testid={
        variant === 'ghost' ? 'sort-button' :
        size === 'sm' && children === 'Poprzednia' ? 'prev-button' :
        size === 'sm' && children === 'Następna' ? 'next-button' :
        variant === 'outline' && size === 'icon' ? 'copy-button' :
        'add-button'
      }
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string }) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      data-testid="filter-input"
    />
  ),
}));

jest.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => children, 
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <div onClick={onClick} data-testid={`dropdown-item-${children}`}>{children}</div>
  ),
  DropdownMenuSeparator: () => <hr />,
}));

jest.mock('@/components/AddPasswordDialog', () => ({
  AddPasswordDialog: ({ isDialogOpen, setIsDialogOpen }: { isDialogOpen: boolean; setIsDialogOpen: (open: boolean) => void }) => (
    <div data-testid="add-dialog" style={{ display: isDialogOpen ? 'block' : 'none' }}>
      <button onClick={() => setIsDialogOpen(false)}>Close</button>
    </div>
  ),
}));

jest.mock('@/components/ShowPasswordDialog', () => ({
  ShowPasswordDialog: ({ isDialogOpen, setIsDialogOpen }: { isDialogOpen: boolean; setIsDialogOpen: (open: boolean) => void }) => (
    <div data-testid="show-dialog" style={{ display: isDialogOpen ? 'block' : 'none' }}>
      <button onClick={() => setIsDialogOpen(false)}>Close</button>
    </div>
  ),
}));

jest.mock('@/components/UpdatePasswordDialog', () => ({
  UpdatePasswordDialog: ({ isDialogOpen, setIsDialogOpen }: { isDialogOpen: boolean; setIsDialogOpen: (open: boolean) => void }) => (
    <div data-testid="update-dialog" style={{ display: isDialogOpen ? 'block' : 'none' }}>
      <button onClick={() => setIsDialogOpen(false)}>Close</button>
    </div>
  ),
}));

jest.mock('@/components/DeleteAccountDialog', () => ({
  DeleteAccountDialog: ({ isDialogOpen, setIsDialogOpen }: { isDialogOpen: boolean; setIsDialogOpen: (open: boolean) => void }) => (
    <div data-testid="delete-dialog" style={{ display: isDialogOpen ? 'block' : 'none' }}>
      <button onClick={() => setIsDialogOpen(false)}>Close</button>
    </div>
  ),
}));

jest.mock('@/components/RecoverMasterkeyDialog', () => ({
  RecoverMasterkeyDialog: ({ isDialogOpen, setIsDialogOpen }: { isDialogOpen: boolean; setIsDialogOpen: (open: boolean) => void }) => (
    <div data-testid="recover-dialog" style={{ display: isDialogOpen ? 'block' : 'none' }}>
      <button onClick={() => setIsDialogOpen(false)}>Close</button>
    </div>
  ),
}));

jest.mock('lucide-react', () => ({
  ArrowUpDown: () => <svg data-testid="arrow-up-down" />,
  MoreHorizontal: () => <svg data-testid="more-horizontal" />,
  ClipboardCopy: () => <svg data-testid="clipboard-copy" />,
  Plus: () => <svg data-testid="plus-icon" />,
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className: string }) => <div data-testid="skeleton" className={className} />,
}));

jest.mock('sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

describe('DataTable', () => {
  const mockCopyToClipboard = jest.fn();
  const mockPasswords = [
    { platform: 'test1', login: 'user1', passwordfile: 'pass1.enc' },
    { platform: 'test2', login: 'user2', passwordfile: 'pass2.enc' },
  ];

  const defaultTableMock = {
    getHeaderGroups: () => [
      {
        id: 'header1',
        headers: [
          { id: 'platform', column: { columnDef: { header: 'Serwis' } }, isPlaceholder: false, getContext: () => ({}) },
          { id: 'login', column: { columnDef: { header: () => <div>Login</div> }, toggleSorting: jest.fn(), getIsSorted: () => false }, isPlaceholder: false, getContext: () => ({}) },
          { id: 'passwordfile', column: { columnDef: { header: () => 'Kopiuj' } }, isPlaceholder: false, getContext: () => ({}) },
          { id: 'actions', column: { columnDef: { header: null } }, isPlaceholder: true, getContext: () => ({}) },
        ],
      },
    ],
    getRowModel: () => ({
      rows: mockPasswords.map((p, i) => ({
        id: `row-${i}`,
        original: p,
        getVisibleCells: () => [
          { id: `cell-platform-${i}`, column: { columnDef: columns[0] }, getValue: () => p.platform, getContext: () => ({ row: { getValue: () => p.platform, original: p }, table: { options: { meta: { isLoadingIcons: false } } } }) },
          { id: `cell-login-${i}`, column: { columnDef: columns[1] }, getValue: () => p.login, getContext: () => ({ row: { getValue: () => p.login } }) },
          { id: `cell-passwordfile-${i}`, column: { columnDef: columns[2] }, getValue: () => p.passwordfile, getContext: () => ({ row: { getValue: () => p.passwordfile, original: p } }) },
          { id: `cell-actions-${i}`, column: { columnDef: columns[3] }, getContext: () => ({ row: { original: p } }) },
        ],
        getIsSelected: () => false,
      })),
    }),
    getColumn: (id: string) => ({
      getFilterValue: () => '',
      setFilterValue: jest.fn(),
      columnDef: columns.find(col => col.id === id),
    }),
    previousPage: jest.fn(),
    nextPage: jest.fn(),
    getCanPreviousPage: () => false,
    getCanNextPage: () => true,
    options: { meta: { isLoadingIcons: false } },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { loading: false, passwords: mockPasswords },
      copyToClipboard: mockCopyToClipboard,
    });
    (useReactTable as jest.Mock).mockReturnValue(defaultTableMock);
  });

  it('renders table with data', () => {
    render(<DataTable />);
    expect(screen.getByText('Serwis')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Kopiuj')).toBeInTheDocument();
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
    expect(screen.getAllByAltText('test1 logo')[0]).toBeInTheDocument();
    expect(screen.getByText('TE')).toBeInTheDocument();
    expect(screen.getByTestId('add-button')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('shows loading state when state.loading is true', () => {
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { loading: true, passwords: [] },
      copyToClipboard: mockCopyToClipboard,
    });
    render(<DataTable />);
    expect(screen.getByText('Ładowanie...')).toBeInTheDocument();
  });

  it('filters table by login', () => {
    const setFilterValue = jest.fn();
    (useReactTable as jest.Mock).mockReturnValue({
      ...defaultTableMock,
      getColumn: (id: string) => ({
        getFilterValue: () => id === 'login' ? '' : undefined,
        setFilterValue,
        columnDef: columns.find(col => col.id === id),
      }),
    });

    render(<DataTable />);
    fireEvent.change(screen.getByTestId('filter-input'), { target: { value: 'user1' } });
    expect(setFilterValue).toHaveBeenCalledWith('user1');
  });

  it('sorts table by login when clicking header', () => {
    const toggleSorting = jest.fn();
    (useReactTable as jest.Mock).mockReturnValue({
      ...defaultTableMock,
      getHeaderGroups: () => [
        {
          id: 'header1',
          headers: [
            { id: 'platform', column: { columnDef: { header: 'Serwis' } }, isPlaceholder: false, getContext: () => ({}) },
            { id: 'login', column: { columnDef: { header: () => <button data-testid="sort-button" onClick={() => toggleSorting()}>Login<svg data-testid="arrow-up-down" /></button> }, toggleSorting, getIsSorted: () => false }, isPlaceholder: false, getContext: () => ({}) },
            { id: 'passwordfile', column: { columnDef: { header: () => 'Kopiuj' } }, isPlaceholder: false, getContext: () => ({}) },
            { id: 'actions', column: { columnDef: { header: null } }, isPlaceholder: true, getContext: () => ({}) },
          ],
        },
      ],
    });

    render(<DataTable />);
    fireEvent.click(screen.getAllByTestId('sort-button')[0]);
    expect(toggleSorting).toHaveBeenCalled();
  });

  it('copies password when clicking copy button', () => {
    render(<DataTable />);
    const copyButtons = screen.getAllByTestId('copy-button');
    fireEvent.click(copyButtons[0]);
    expect(mockCopyToClipboard).toHaveBeenCalledWith('pass1.enc', 'test1', 'user1', expect.any(Function));
  });

  it('opens add dialog when clicking add button', () => {
    render(<DataTable />);
    fireEvent.click(screen.getByTestId('add-button'));
    expect(screen.getByTestId('add-dialog')).toHaveStyle('display: block');
  });

  it('opens action dialogs from dropdown', async () => {
    render(<DataTable />);
    fireEvent.click(screen.getAllByTestId('sort-button')[1]); 
    expect(screen.getAllByTestId('dropdown-content')[0]).toBeInTheDocument();
  
    fireEvent.click(screen.getAllByTestId('dropdown-item-Zmień hasło')[0]); 
    expect(screen.getAllByTestId('update-dialog')[0]).toHaveStyle('display: block');
  
    fireEvent.click(screen.getAllByTestId('dropdown-item-Pokaż')[0]); 
    expect(screen.getAllByTestId('show-dialog')[0]).toHaveStyle('display: block');
  
    fireEvent.click(screen.getAllByTestId('dropdown-item-Usuń konto')[0]); 
    expect(screen.getAllByTestId('delete-dialog')[0]).toHaveStyle('display: block');
  });

  it('handles pagination', () => {
    render(<DataTable />);
    const prevButton = screen.getByTestId('prev-button');
    const nextButton = screen.getByTestId('next-button');

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);
    expect(defaultTableMock.nextPage).toHaveBeenCalled();
  });

  it('shows skeleton while loading icons', () => {
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { loading: false, passwords: [{ platform: 'test1', login: 'user1', passwordfile: 'pass1.enc' }] },
      copyToClipboard: mockCopyToClipboard,
    });
    (useReactTable as jest.Mock).mockReturnValue({
      ...defaultTableMock,
      options: { meta: { isLoadingIcons: true } },
      getRowModel: () => ({
        rows: [{
          id: 'row-0',
          original: { platform: 'test1', login: 'user1', passwordfile: 'pass1.enc' },
          getVisibleCells: () => [
            { id: 'cell-platform-0', column: { columnDef: columns[0] }, getValue: () => 'test1', getContext: () => ({ row: { getValue: () => 'test1', original: { platform: 'test1' } }, table: { options: { meta: { isLoadingIcons: true } } } }) },
            { id: 'cell-login-0', column: { columnDef: columns[1] }, getValue: () => 'user1', getContext: () => ({ row: { getValue: () => 'user1' } }) },
            { id: 'cell-passwordfile-0', column: { columnDef: columns[2] }, getValue: () => 'pass1.enc', getContext: () => ({ row: { getValue: () => 'pass1.enc', original: { platform: 'test1', login: 'user1', passwordfile: 'pass1.enc' } } }) },
            { id: 'cell-actions-0', column: { columnDef: columns[3] }, getContext: () => ({ row: { original: { platform: 'test1', login: 'user1', passwordfile: 'pass1.enc' } } }) },
          ],
          getIsSelected: () => false,
        }],
      }),
    });

    render(<DataTable />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });
});