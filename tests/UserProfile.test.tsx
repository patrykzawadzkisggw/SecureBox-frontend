import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserProfile from '../src/components/UserProfile';
import { usePasswordContext, User } from '../src/data/PasswordContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

jest.mock('../src/data/PasswordContext', () => ({
  usePasswordContext: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label {...props}>{children}</label>
  ),
}));

describe('UserProfile', () => {
  const mockNavigate = jest.fn();
  const mockUpdateUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('renders loading state when state.loading is true', () => {
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { loading: true, currentUser: null },
      updateUser: mockUpdateUser,
    });

    render(<UserProfile />);
    expect(screen.getByText('Ładowanie danych użytkownika...')).toBeInTheDocument();
  });

  it('renders no user message when currentUser is null', () => {
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { loading: false, currentUser: null },
      updateUser: mockUpdateUser,
    });

    render(<UserProfile />);
    expect(screen.getByText('Brak danych użytkownika.')).toBeInTheDocument();
  });

  it('renders user data correctly', () => {
    const mockUser: User = {
        id: '1',
        login: 'testuser',
        first_name: 'Abc',
        last_name: 'Xyz',
        password: ''
    };
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { loading: false, currentUser: mockUser },
      updateUser: mockUpdateUser,
    });

    render(<UserProfile />);
    expect(screen.getByLabelText('Login')).toHaveValue('testuser');
    expect(screen.getByLabelText('Imię')).toHaveValue('Abc');
    expect(screen.getByLabelText('Nazwisko')).toHaveValue('Xyz');
    expect(screen.getByText('Edytuj')).toBeInTheDocument();
  });

  it('enables editing mode when "Edytuj" is clicked', () => {
    const mockUser: User = {
        id: '1',
        login: 'testuser',
        first_name: 'Abc',
        last_name: 'Xyz',
        password: ''
    };
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { loading: false, currentUser: mockUser },
      updateUser: mockUpdateUser,
    });

    render(<UserProfile />);
    fireEvent.click(screen.getByText('Edytuj'));
    expect(screen.getByLabelText('Nowe hasło')).toBeInTheDocument();
    expect(screen.getByText('Zapisz')).toBeInTheDocument();
    expect(screen.getByText('Anuluj')).toBeInTheDocument();
  });

  it('cancels editing and resets form', () => {
    const mockUser: User = {
        id: '1',
        login: 'testuser',
        first_name: 'Abc',
        last_name: 'Xyz',
        password: ''
    };
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { loading: false, currentUser: mockUser },
      updateUser: mockUpdateUser,
    });

    render(<UserProfile />);
    fireEvent.click(screen.getByText('Edytuj'));
    fireEvent.change(screen.getByLabelText('Imię'), { target: { value: 'Adam' } });
    fireEvent.click(screen.getByText('Anuluj'));
    expect(screen.getByLabelText('Imię')).toHaveValue('Abc');
    expect(screen.queryByText('Zapisz')).not.toBeInTheDocument();
  });

  it('saves changes and navigates on success', async () => {
    const mockUser: User = {
        id: '1',
        login: 'testuser',
        first_name: 'Abc',
        last_name: 'Kowalski',
        password: ''
    };
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { loading: false, currentUser: mockUser },
      updateUser: mockUpdateUser.mockResolvedValueOnce(undefined),
    });

    render(<UserProfile />);
    fireEvent.click(screen.getByText('Edytuj'));
    fireEvent.change(screen.getByLabelText('Imię'), { target: { value: 'Adam' } });
    fireEvent.change(screen.getByLabelText('Nowe hasło'), { target: { value: 'newpass123' } });
    fireEvent.click(screen.getByText('Zapisz'));

    expect(screen.getByText('Zapisywanie...')).toBeInTheDocument();
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith('1', 'Adam', undefined, undefined, 'newpass123');
      expect(toast.success).toHaveBeenCalledWith('Profil zaktualizowany!', {
        description: 'Zmiany zostały zapisane.',
        duration: 3000,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/settings');
      expect(screen.queryByText('Zapisywanie...')).not.toBeInTheDocument();
    });
  });

  it('handles error during save', async () => {
    const mockUser: User = {
        id: '1',
        login: 'testuser',
        first_name: 'Abc',
        last_name: 'Xyz',
        password: ''
    };
    (usePasswordContext as jest.Mock).mockReturnValue({
      state: { loading: false, currentUser: mockUser },
      updateUser: mockUpdateUser.mockRejectedValueOnce(new Error('Błąd aktualizacji')),
    });

    render(<UserProfile />);
    fireEvent.click(screen.getByText('Edytuj'));
    fireEvent.change(screen.getByLabelText('Imię'), { target: { value: 'Adam' } });
    fireEvent.click(screen.getByText('Zapisz'));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/settings');
      expect(toast.success).not.toHaveBeenCalled();
    });
  });
});