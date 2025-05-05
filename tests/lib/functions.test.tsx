import {
    extractDomain,
    formatActivity,
    calculateAverageStrength,
    getTimeDifference,
    getStrengthInfo,
    processLoginData,
    get5RecentActivities,
    getRandomColor,
    getInitials,
    getFailedLogins,
    saveFailedLogins,
    isEmailLockedOut,
    getRemainingLockoutTime,
    recordFailedAttempt,
    MAX_ATTEMPTS,
    LOCKOUT_DURATION,
  } from '@/lib/functions';
  import { Activity, ChartData, FailedLoginAttempt } from '@/lib/interfaces';
  import { LoginEntry, PasswordHistory, PasswordTable, User } from '@/data/PasswordContext';
  

  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => (store[key] = value),
      clear: () => (store = {}),
    };
  })();
  Object.defineProperty(global, 'localStorage', { value: localStorageMock });
  
  describe('Utils', () => {
    beforeEach(() => {
      localStorage.clear(); 
    });
  
    describe('extractDomain', () => {
      it('powinno wyodrębnić domenę główną z pełnego URL', () => {
        expect(extractDomain('https://www.google.pl/path?query=1')).toBe('google.pl');
        expect(extractDomain('http://sub.example.com')).toBe('sub.example.com');
        expect(extractDomain('www.test.co.uk')).toBe('test.co.uk');
      });
  
      it('powinno obsługiwać URL bez protokołu i subdomen', () => {
        expect(extractDomain('google.pl')).toBe('google.pl');
        expect(extractDomain('example.com')).toBe('example.com');
      });
  
      it('powinno zwrócić wejście dla niepoprawnego URL', () => {
        expect(extractDomain('invalid-url')).toBe('invalid-url');
      });
    });
  
    describe('formatActivity', () => {
      it('powinno sformatować aktywność dla dzisiejszego wpisu', () => {
        const d1 = new Date()
        const entry = { timestamp: d1.toISOString(), login: 'user123', page: 'Twitter' };
        const result: Activity = formatActivity(entry);
        expect(result).toEqual({
          time: d1.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
          date: 'Dziś',
          name: 'Twitter',
          email: 'user123',
          color: 'bg-purple-500',
        });
      });
  
      it('powinno sformatować aktywność dla wczorajszego wpisu', () => {
        const d1 = new Date()
        d1.setDate(d1.getDate() - 1); 
        const entry = { timestamp: d1.toISOString(), login: 'user123', page: 'Google' };
        const result: Activity = formatActivity(entry);
        expect(result).toEqual({
          time: d1.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
          date: '1 dzień',
          name: 'Google',
          email: 'user123',
          color: 'bg-purple-500',
        });
      });
  
      it('powinno sformatować aktywność dla starszego wpisu', () => {
        const d1 = new Date()
        d1.setDate(d1.getDate() - 3); 
        const entry = { timestamp: d1.toISOString(), login: 'user123', page: 'Facebook' };
        const result: Activity = formatActivity(entry);
        expect(result).toEqual({
          time: d1.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
          date: '3 dni',
          name: 'Facebook',
          email: 'user123',
          color: 'bg-purple-500',
        });
      });
    });
  
    describe('calculateAverageStrength', () => {
      it('powinno zwrócić 100 dla pustej historii', () => {
        expect(calculateAverageStrength([], [])).toBe(100);
      });
  
      it('powinno obliczyć średnią siłę dla powiązanych haseł', () => {
        const history: PasswordHistory[] = [
          {
              platform: 'test', login: 'user', strength: 80,
              id: '',
              timestamp: ''
          },
          {
              platform: 'test2', login: 'user', strength: 60,
              id: '',
              timestamp: ''
          },
        ];
        const passwords: PasswordTable[] = [
          {
              platform: 'test', login: 'user',
              id: '',
              passwordfile: '',
              logo: ''
          },
          {
              platform: 'test2', login: 'user',
              id: '',
              passwordfile: '',
              logo: ''
          },
        ];
        expect(calculateAverageStrength(history, passwords)).toBe(70);
      });
  
      it('powinno pominąć niepowiązane rekordy historii', () => {
        const history: PasswordHistory[] = [
          {
              platform: 'test', login: 'user', strength: 80,
              id: '',
              timestamp: ''
          },
          {
              platform: 'unrelated', login: 'user', strength: 20,
              id: '',
              timestamp: ''
          },
        ];
        const passwords: PasswordTable[] = [{
            platform: 'test', login: 'user',
            id: '',
            passwordfile: '',
            logo: ''
        }];
        expect(calculateAverageStrength(history, passwords)).toBe(80);
      });
    });
  
    describe('getTimeDifference', () => {
      it('powinno zwrócić "Dzisiaj" dla tego samego dnia', () => {
        const d1 = new Date()
        expect(getTimeDifference(d1.toISOString())).toBe('Dzisiaj');
      });
      const d2 = new Date()
      d2.setDate(d2.getDate() - 2);
      const d3 = new Date()
      d3.setDate(d3.getDate() - 3);
      it('powinno zwrócić liczbę dni dla starszych dat', () => {
        expect(getTimeDifference(d2.toISOString())).toBe('2 dni');
        expect(getTimeDifference(d3.toDateString())).toBe('3 dni');
      });
    });
  
    describe('getStrengthInfo', () => {
      it('powinno zwrócić poprawne informacje dla różnych sił hasła', () => {
        expect(getStrengthInfo(85)).toEqual({ text: 'Silna', color: 'text-purple-700' });
        expect(getStrengthInfo(65)).toEqual({ text: 'Dobra', color: 'text-purple-500' });
        expect(getStrengthInfo(45)).toEqual({ text: 'Średnia', color: 'text-purple-400' });
        expect(getStrengthInfo(35)).toEqual({ text: 'Słaba', color: 'text-purple-300' });
      });
    });
  
    describe('processLoginData', () => {
      it('powinno przetworzyć logowania na dane wykresu', () => {

        //get last friday date
        const d1 = new Date()
        d1.setDate(d1.getDate() - (d1.getDay() + 2) % 7);
       

        const logins = [
          { timestamp: d1.toISOString() }, 
          { timestamp: d1.toISOString() }, 
          { timestamp: '2025-04-25T12:00:00Z' }, 
        ];
        const result: ChartData[] = processLoginData(logins);
        expect(result).toEqual([
          { month: 'Poniedzialek', logins: 0 },
          { month: 'Wtorek', logins: 0 },
          { month: 'Sroda', logins: 0 },
          { month: 'Czwartek', logins: 0 },
          { month: 'Piatek', logins: 2 },
          { month: 'Sobota', logins: 0 },
          { month: 'Niedziela', logins: 0 },
        ]);
      });
  
      it('powinno ignorować logowania starsze niż 7 dni', () => {
        const logins = [
          { timestamp: '2025-04-27T12:00:00Z' }, 
          { timestamp: '2025-04-19T12:00:00Z' }, 
        ];
        const result: ChartData[] = processLoginData(logins);
        expect(result.find((d) => d.month === 'Niedziela')?.logins).toBe(0);
        expect(result.reduce((sum, d) => sum + d.logins, 0)).toBe(0);
      });
    });
  
    describe('get5RecentActivities', () => {
        const d1 = new Date(new Date().getTime() - 60 * 60 * 1000);
        const d2 = new Date(new Date().getTime() - 60 * 60 * 2000);
      const user: User = {
          id: '123', first_name: 'Jan', last_name: 'Kowalski', login: 'user123',
          password: ''
      };
      const logins: LoginEntry[] = [
        { user_id: '123', timestamp: d1.toISOString(), login: 'user123', page: 'Twitter' },
        { user_id: '123', timestamp: d2.toISOString(), login: 'user123', page: 'Google' },
      ];
  
      it('powinno zwrócić 5 ostatnich aktywności użytkownika', () => {
        const result = get5RecentActivities(user, logins);
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
          time: d1.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
          date: 'Dziś',
          name: 'Twitter',
          email: 'user123',
          color: 'bg-purple-500',
        });
        expect(result[1]).toEqual({
          time: d2.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
          date: 'Dziś',
          name: 'Google',
          email: 'user123',
          color: 'bg-purple-500',
        });
      });
  
      it('powinno zwrócić pustą tablicę dla null użytkownika', () => {
        expect(get5RecentActivities(null, logins)).toEqual([]);
      });
  
      it('powinno obsługiwać user_id', () => {
        const loginsWithUserId: LoginEntry[] = [
          { user_id: '123', timestamp: '2025-04-27T12:00:00Z', login: 'user123', page: 'Twitter' },
        ];
        const result = get5RecentActivities(user, loginsWithUserId);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Twitter');
      });
    });
  
    describe('getRandomColor', () => {
      it('powinno zwrócić deterministyczny kolor dla danej platformy', () => {
        expect(getRandomColor('Twitter')).toBe(getRandomColor('Twitter')); 
        expect(['#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB']).toContain(
          getRandomColor('Twitter')
        );
      });
    });
  
    describe('getInitials', () => {
      it('powinno zwrócić inicjały dla nazwy platformy', () => {
        expect(getInitials('Twitter')).toBe('TW');
        expect(getInitials('Google Chrome')).toBe('GC');
        expect(getInitials('FB')).toBe('FB');
      });
    });
  
    describe('Lockout Logic', () => {
      describe('Constants', () => {
        it('powinno mieć poprawne wartości stałych', () => {
          expect(MAX_ATTEMPTS).toBe(5);
          expect(LOCKOUT_DURATION).toBe(10 * 60 * 1000); 
        });
      });
  
      describe('getFailedLogins', () => {
        it('powinno zwrócić pusty obiekt, jeśli brak danych w localStorage', () => {
          expect(getFailedLogins()).toEqual({});
        });
  
        it('powinno zwrócić zapisane dane z localStorage', () => {
          localStorage.setItem(
            'failedLogins',
            JSON.stringify({ 'user@example.com': { count: 3, lastAttempt: 1698765432100 } })
          );
          expect(getFailedLogins()).toEqual({
            'user@example.com': { count: 3, lastAttempt: 1698765432100 },
          });
        });
      });
  
      describe('saveFailedLogins', () => {
        it('powinno zapisać dane do localStorage', () => {
          const failedLogins: Record<string, FailedLoginAttempt> = {
            'user@example.com': { count: 3, lastAttempt: 1698765432100 },
          };
          saveFailedLogins(failedLogins);
          expect(localStorage.getItem('failedLogins')).toBe(JSON.stringify(failedLogins));
        });
      });
  
      describe('isEmailLockedOut', () => {
        it('powinno zwrócić false dla emaila z mniej niż MAX_ATTEMPTS', () => {
          recordFailedAttempt('user@example.com');
          expect(isEmailLockedOut('user@example.com')).toBe(false);
        });
  
        it('powinno zwrócić true dla emaila z MAX_ATTEMPTS w czasie blokady', () => {
          for (let i = 0; i < MAX_ATTEMPTS; i++) {
            recordFailedAttempt('user@example.com');
          }
          expect(isEmailLockedOut('user@example.com')).toBe(true);
        });
  
        it('powinno zwrócić false po wygaśnięciu blokady', () => {
          const failedLogins: Record<string, FailedLoginAttempt> = {
            'user@example.com': { count: MAX_ATTEMPTS, lastAttempt: Date.now() - LOCKOUT_DURATION - 1000 },
          };
          saveFailedLogins(failedLogins);
          expect(isEmailLockedOut('user@example.com')).toBe(false);
        });
      });
  
      describe('getRemainingLockoutTime', () => {
        it('powinno zwrócić 0 dla emaila z mniej niż MAX_ATTEMPTS', () => {
          recordFailedAttempt('user@example.com');
          expect(getRemainingLockoutTime('user@example.com')).toBe(0);
        });
  
        it('powinno zwrócić pozostały czas dla zablokowanego emaila', () => {
          for (let i = 0; i < MAX_ATTEMPTS; i++) {
            recordFailedAttempt('user@example.com');
          }
          const remainingTime = getRemainingLockoutTime('user@example.com');
          expect(remainingTime).toBeGreaterThan(0);
          expect(remainingTime).toBeLessThanOrEqual(600); 
        });
  
        it('powinno zwrócić 0 po wygaśnięciu blokady', () => {
          const failedLogins: Record<string, FailedLoginAttempt> = {
            'user@example.com': { count: MAX_ATTEMPTS, lastAttempt: Date.now() - LOCKOUT_DURATION - 1000 },
          };
          saveFailedLogins(failedLogins);
          expect(getRemainingLockoutTime('user@example.com')).toBe(0);
        });
      });
  
      describe('recordFailedAttempt', () => {
        it('powinno zarejestrować pierwszą nieudaną próbę', () => {
          recordFailedAttempt('user@example.com');
          const failedLogins = getFailedLogins();
          expect(failedLogins['user@example.com']).toEqual({
            count: 1,
            lastAttempt: expect.any(Number),
          });
        });
  
        it('powinno zwiększyć licznik dla istniejącego emaila', () => {
          recordFailedAttempt('user@example.com');
          recordFailedAttempt('user@example.com');
          const failedLogins = getFailedLogins();
          expect(failedLogins['user@example.com'].count).toBe(2);
        });
      });
    });
  });
  
  afterAll(() => {
    jest.restoreAllMocks();
  });