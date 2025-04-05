import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterForm } from '../src/components/RegisterForm';
import { usePasswordContext } from '../src/data/PasswordContext';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));


jest.mock('../src/data/PasswordContext', () => ({
  usePasswordContext: jest.fn(),
}));


const mockAddUser = jest.fn();
(usePasswordContext as jest.Mock).mockReturnValue({
  addUser: mockAddUser,
});

beforeEach(() => {
  mockAddUser.mockReset();
  mockNavigate.mockReset();
});
beforeAll(() => {

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
  
describe('RegisterForm', () => {

  test('renders the registration form correctly', () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('imie')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('nazwisko')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('user123')).toBeInTheDocument();
    expect(screen.getByLabelText('Hasło logowania')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Utwórz konto/i })).toBeInTheDocument();
  });

  test('shows an error message on registration failure', async () => {
    mockAddUser.mockRejectedValue(new Error('Registration failed'));

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('imie'), { target: { value: 'Jan' } });
    fireEvent.change(screen.getByPlaceholderText('nazwisko'), { target: { value: 'Kowalski' } });
    fireEvent.change(screen.getByPlaceholderText('user123'), { target: { value: 'jan123' } });
    fireEvent.change(screen.getByLabelText('Hasło logowania'), { target: { value: 'P@ssword123' } });

    fireEvent.click(screen.getByRole('button', { name: /Utwórz konto/i }));

    await waitFor(() => {
      expect(screen.getByText('Rejestracja nie powiodła się. Login może już istnieć lub dane są nieprawidłowe.')).toBeInTheDocument();
    });
  });

  test('registers a user and navigates on success', async () => {
    mockAddUser.mockResolvedValue({ success: true });

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('imie'), { target: { value: 'Jan' } });
    fireEvent.change(screen.getByPlaceholderText('nazwisko'), { target: { value: 'Kowalski' } });
    fireEvent.change(screen.getByPlaceholderText('user123'), { target: { value: 'jan123' } });
    fireEvent.change(screen.getByLabelText('Hasło logowania'), { target: { value: 'P@ssword123' } });

    fireEvent.click(screen.getByRole('button', { name: /Utwórz konto/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('disables inputs and button while loading', async () => {
    mockAddUser.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000))
    );

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('imie'), { target: { value: 'Jan' } });
    fireEvent.change(screen.getByPlaceholderText('nazwisko'), { target: { value: 'Kowalski' } });
    fireEvent.change(screen.getByPlaceholderText('user123'), { target: { value: 'jan123' } });
    fireEvent.change(screen.getByLabelText('Hasło logowania'), { target: { value: 'P@ssword123' } });

    fireEvent.click(screen.getByRole('button', { name: /Utwórz konto/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('imie')).toBeDisabled();
      expect(screen.getByPlaceholderText('nazwisko')).toBeDisabled();
      expect(screen.getByPlaceholderText('user123')).toBeDisabled();
      expect(screen.getByLabelText('Hasło logowania')).toBeDisabled();
      expect(screen.getByRole('button', { name: /Tworzenie konta.../i })).toBeDisabled();
    });
  });

 
});
