import {
  PasswordProvider,
  usePasswordContext,
  passwordReducer,
  encryptMasterkey,
  decryptMasterkey,
  deriveEncryptionKeyFromMasterkey,
  encryptPassword,
  decryptPassword,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  PasswordState,
  PasswordTable,
  PasswordHistory,
  TrustedDevice,
  User,
  LoginEntry,
} from '@/data/PasswordContext';
import { render, act, waitFor } from '@testing-library/react';
import React from 'react';
import { toast } from 'sonner';
import JSZip from 'jszip';
import zxcvbn from 'zxcvbn';
import api from '@/lib/api';

// Mock dependencies
jest.mock('@/lib/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('jszip', () => {
  const mockFileFn = jest.fn();
  const mockLoadAsyncResult = {
    file: mockFileFn,
  };
  const mockZipInstance = {
    file: jest.fn(),
    generateAsync: jest.fn().mockResolvedValue(new Blob(['mock zip content'])),
  };

  const mockConstructor = jest.fn(() => mockZipInstance);
  (mockConstructor as any).loadAsync = jest.fn().mockResolvedValue(mockLoadAsyncResult);
  (mockConstructor as any)._mockFileFn = mockFileFn;

  return mockConstructor;
});

jest.mock('zxcvbn', () => jest.fn(() => ({ score: 4 })));

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

const cryptoMock = {
  subtle: {
    importKey: jest.fn(),
    deriveKey: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  },
  getRandomValues: jest.fn((array) => {
    array.fill(1);
    return array;
  }),
};
Object.defineProperty(global, 'crypto', { value: cryptoMock });

// Mock window.location to avoid JSDOM navigation errors
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    assign: jest.fn(),
  },
  writable: true,
});

describe('PasswordProvider and Related Functions', () => {
  const initialState: PasswordState = {
    passwords: [],
    history: [],
    trustedDevices: [],
    currentUser: null,
    zip: null,
    loading: true,
    token: null,
    userLogins: [],
    encryptionKey: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.getItem.mockReturnValue(null);
    (cryptoMock.subtle.importKey as jest.Mock).mockResolvedValue('mocked-key');
    (cryptoMock.subtle.deriveKey as jest.Mock).mockResolvedValue({} as CryptoKey);
    (cryptoMock.subtle.encrypt as jest.Mock).mockResolvedValue(new TextEncoder().encode('encrypted').buffer);
    (cryptoMock.subtle.decrypt as jest.Mock).mockResolvedValue(new TextEncoder().encode('my-password').buffer);

    (api.post as jest.Mock).mockImplementation((url: string) => {
      if (url === '/login') {
        return Promise.resolve({
          data: {
            user: { id: '1', first_name: 'John', last_name: 'Doe', login: 'john', password: 'pass' },
            token: 'jwt_token',
          },
        });
      }
      if (url === '/users') {
        return Promise.resolve({
          data: { id: '1', first_name: 'John', last_name: 'Doe', login: 'john', password: 'pass' },
        });
      }
      return Promise.resolve({ data: {} });
    });

    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/users/me/get' || url.includes('/users/1')) {
        return Promise.resolve({
          data: { id: '1', first_name: 'John', last_name: 'Doe', login: 'john', password: 'pass' },
        });
      }
      if (url === '/passwords') {
        return Promise.resolve({
          data: [
            { id: '1', passwordfile: 'file1', logo: 'logo1', platform: 'platform1', login: 'login1' },
          ],
        });
      }
      if (url.includes('/files')) {
        return Promise.resolve({ data: new Blob() });
      }
      if (url.includes('/trusted-devices')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/logins')) {
        return Promise.resolve({
          data: [{ timestamp: '2023-01-01T00:00:00Z', user_id: '1', login: 'john', page: 'home' }],
        });
      }
      return Promise.resolve({ data: {} });
    });

    (api.put as jest.Mock).mockResolvedValue({
      data: { id: '1', passwordfile: 'file2', logo: 'logo1', platform: 'platform1', login: 'login1' },
    });

    (api.patch as jest.Mock).mockResolvedValue({
      data: { user_id: '1', device_id: 'device1', user_agent: 'agent1', is_trusted: true },
    });

    (api.delete as jest.Mock).mockResolvedValue({});
  });

  describe('passwordReducer', () => {
    it('powinien obsłużyć akcję SET_DATA', () => {
      const payload = {
        passwords: [{ id: '1', passwordfile: 'file1', logo: 'logo1', platform: 'platform1', login: 'login1' }],
        trustedDevices: [{ user_id: '1', device_id: 'device1', user_agent: 'agent1', is_trusted: true }],
        currentUser: { id: '1', first_name: 'John', last_name: 'Doe', login: 'john', password: 'pass' },
        zip: new JSZip(),
      };
      const action = { type: 'SET_DATA', payload } as any;
      const newState = passwordReducer(initialState, action);
      expect(newState).toEqual({
        ...initialState,
        ...payload,
        loading: false,
      });
    });

    it('powinien obsłużyć akcję ADD_PASSWORD', () => {
      const password: PasswordTable = {
        id: '1',
        passwordfile: 'file1',
        logo: 'logo1',
        platform: 'platform1',
        login: 'login1',
      };
      const action = { type: 'ADD_PASSWORD', payload: password };
      const newState = passwordReducer(initialState, action as any);
      expect(newState.passwords).toContainEqual(password);
    });

    it('powinien obsłużyć akcję UPDATE_PASSWORD', () => {
      const initialStateWithPassword: PasswordState = {
        ...initialState,
        passwords: [{ id: '1', passwordfile: 'file1', logo: 'logo1', platform: 'platform1', login: 'login1' }],
      };
      const updatedPassword: PasswordTable = {
        id: '1',
        passwordfile: 'file2',
        logo: 'logo2',
        platform: 'platform1',
        login: 'login1',
      };
      const action = { type: 'UPDATE_PASSWORD', payload: updatedPassword };
      const newState = passwordReducer(initialStateWithPassword, action as any);
      expect(newState.passwords).toContainEqual(updatedPassword);
    });

    it('powinien obsłużyć akcję DELETE_PASSWORD', () => {
      const initialStateWithPassword: PasswordState = {
        ...initialState,
        passwords: [{ id: '1', passwordfile: 'file1', logo: 'logo1', platform: 'platform1', login: 'login1' }],
      };
      const action = { type: 'DELETE_PASSWORD', payload: { platform: 'platform1', login: 'login1' } };
      const newState = passwordReducer(initialStateWithPassword, action as any);
      expect(newState.passwords).toEqual([]);
    });

    it('powinien obsłużyć akcję UPDATE_HISTORY', () => {
      const historyEntry: PasswordHistory = {
        id: 'platform1-login1',
        platform: 'platform1',
        login: 'login1',
        strength: 80,
        timestamp: '2023-01-01T00:00:00Z',
      };
      const action = { type: 'UPDATE_HISTORY', payload: historyEntry };
      const newState = passwordReducer(
        { ...initialState, currentUser: { id: '1', first_name: 'John', last_name: 'Doe', login: 'john', password: 'pass' } },
        action as any
      );
      expect(newState.history).toContainEqual(historyEntry);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('passwordHistory', JSON.stringify([historyEntry]));
    });

    it('powinien obsłużyć akcję LOGOUT', () => {
      const stateWithData: PasswordState = {
        ...initialState,
        currentUser: { id: '1', first_name: 'John', last_name: 'Doe', login: 'john', password: 'pass' },
        token: 'jwt_token',
        history: [{ id: '1', platform: 'platform1', login: 'login1', strength: 80, timestamp: '2023-01-01T00:00:00Z' }],
      };
      const action = { type: 'LOGOUT' };
      const newState = passwordReducer(stateWithData, action as any);
      expect(newState).toEqual({
        ...initialState,
        history: stateWithData.history,
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('passwordHistory', JSON.stringify(stateWithData.history));
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('jwt_token');
    });
  });

  describe('Crypto Functions', () => {
    it('powinien szyfrować i deszyfrować klucz główny', async () => {
      const masterkey = 'my-masterkey';
      const password = '123';
      (cryptoMock.subtle.encrypt as jest.Mock).mockResolvedValueOnce(new TextEncoder().encode(masterkey).buffer);
      const encrypted = await encryptMasterkey(masterkey, password);
      expect(encrypted).toBeDefined();

      (cryptoMock.subtle.decrypt as jest.Mock).mockResolvedValueOnce(new TextEncoder().encode(masterkey).buffer);
      const decrypted = await decryptMasterkey(encrypted, password);
      expect(decrypted).toBe(masterkey);
    });

    it('powinien zgłosić błąd przy nieprawidłowym haśle dla deszyfrujKluczGłówny', async () => {
      const masterkey = 'my-masterkey';
      const password = '123';
      const wrongPassword = 'wrong';
      (cryptoMock.subtle.encrypt as jest.Mock).mockResolvedValueOnce(new TextEncoder().encode(masterkey).buffer);
      const encrypted = await encryptMasterkey(masterkey, password);

      (cryptoMock.subtle.decrypt as jest.Mock).mockRejectedValueOnce(new Error('Invalid key'));
      await expect(decryptMasterkey(encrypted, wrongPassword)).rejects.toThrow();
    });

    it('powinien szyfrować i deszyfrować hasło', async () => {
      const password = 'my-password';
      const key = {} as CryptoKey;
      (cryptoMock.subtle.encrypt as jest.Mock).mockResolvedValueOnce(new TextEncoder().encode('encrypted').buffer);
      const { encrypted, iv } = await encryptPassword(password, key);
      expect(encrypted).toBeDefined();
      expect(iv).toBeDefined();

      (cryptoMock.subtle.decrypt as jest.Mock).mockResolvedValueOnce(new TextEncoder().encode('my-password').buffer);
      const decrypted = await decryptPassword(encrypted, iv, key);
      expect(decrypted).toBe('my-password');
    });

    it('powinien wyprowadzić klucz szyfrowania z klucza głównego', async () => {
      const masterkey = 'my-masterkey';
      const key = await deriveEncryptionKeyFromMasterkey(masterkey);
      expect(key).toBeDefined();
      expect(cryptoMock.subtle.deriveKey).toHaveBeenCalled();
    });

    it('powinien konwertować ArrayBuffer na base64 i z powrotem', () => {
      const buffer = new TextEncoder().encode('test').buffer;
      const base64 = arrayBufferToBase64(buffer);
      expect(base64).toBe(btoa('test'));

      const decodedBuffer = base64ToArrayBuffer(base64);
      expect(new TextDecoder().decode(decodedBuffer)).toBe('test');
    });
  });

  describe('PasswordProvider', () => {
    const TestComponent = () => {
      const {
        state,
        copyToClipboard,
        addPassword,
        updatePassword,
        deletePassword,
        addOrUpdateTrustedDevice,
        deleteTrustedDevice,
        getUser,
        addUser,
        updateUser,
        setToken,
        logout,
        getUserLogins,
        login,
        setMasterkey,
        fetchPasswords,
      } = usePasswordContext();

      return (
        <div>
          <span data-testid="loading">{state.loading.toString()}</span>
          <span data-testid="user">{state.currentUser?.login || 'none'}</span>
          <button onClick={() => login('john', 'pass', 'masterkey', 'token2')} data-testid="login">
            Login
          </button>
          <button onClick={() => logout()} data-testid="logout">
            Logout
          </button>
          <button
            onClick={() => copyToClipboard('file1', 'platform1', 'login1', () => toast.error('Decryption failed'))}
            data-testid="copy"
          >
            Copy
          </button>
          <button onClick={() => addPassword('new-pass', 'platform1', 'login1')} data-testid="add-password">
            Add Password
          </button>
          <button onClick={() => updatePassword('updated-pass', 'platform1', 'login1')} data-testid="update-password">
            Update Password
          </button>
          <button onClick={() => deletePassword('platform1', 'login1')} data-testid="delete-password">
            Delete Password
          </button>
          <button
            onClick={() => addOrUpdateTrustedDevice('device1', 'agent1', true)}
            data-testid="add-trusted-device"
          >
            Add Trusted Device
          </button>
          <button onClick={() => deleteTrustedDevice('device1')} data-testid="delete-trusted-device">
            Delete Trusted Device
          </button>
          <button onClick={() => getUser('1')} data-testid="get-user">
            Get User
          </button>
          <button
            onClick={() => addUser('John', 'Doe', 'john', 'pass', 'token')}
            data-testid="add-user"
          >
            Add User
          </button>
          <button onClick={() => updateUser('1', 'Jane', 'Doe')} data-testid="update-user">
            Update User
          </button>
          <button onClick={() => setToken('jwt_token')} data-testid="set-token">
            Set Token
          </button>
          <button onClick={() => getUserLogins('1')} data-testid="get-user-logins">
            Get User Logins
          </button>
          <button onClick={() => setMasterkey('masterkey')} data-testid="set-masterkey">
            Set Masterkey
          </button>
          <button onClick={() => fetchPasswords()} data-testid="fetch-passwords">
            Fetch Passwords
          </button>
        </div>
      );
    };

    it('powinien zainicjować z poprawnym stanem początkowym', async () => {
      const { getByTestId } = render(
        <PasswordProvider>
          <TestComponent />
        </PasswordProvider>
      );
      await waitFor(() => {
        expect(getByTestId('loading').textContent).toBe('false');
        expect(getByTestId('user').textContent).toBe('none');
      });
    });

    it('powinien dodać użytkownika', async () => {
      const { getByTestId } = render(
        <PasswordProvider>
          <TestComponent />
        </PasswordProvider>
      );

      await act(async () => {
        getByTestId('add-user').click();
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Użytkownik dodany!', expect.anything());
      });
    });

    it('powinien ustawić token', async () => {
      const { getByTestId } = render(
        <PasswordProvider>
          <TestComponent />
        </PasswordProvider>
      );

      await act(async () => {
        getByTestId('set-token').click();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('jwt_token', 'jwt_token');
    });

    it('powinien obsłużyć niepowodzenie pobierania haseł z powodu braku tokena', async () => {
      const { getByTestId } = render(
        <PasswordProvider>
          <TestComponent />
        </PasswordProvider>
      );

      await act(async () => {
        getByTestId('fetch-passwords').click();
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Błąd!', expect.anything());
      });
    });
  });
});