import {
    validateName,
    validateLastName,
    validateEmail,
    validatePassword,
    isValidToken,
    isTokenExpired2,
    resetPasswordSchema,
  } from '@/lib/validators';

  describe('Validators', () => {
    describe('validateName', () => {
      it('powinno zwrócić pusty ciąg dla poprawnego imienia', () => {
        expect(validateName('Jan')).toBe('');
        expect(validateName('Anna Maria')).toBe('');
        expect(validateName('Łukasz')).toBe('');
      });
  
      it('powinno zwrócić błąd dla imienia krótszego niż 3 znaki', () => {
        expect(validateName('Ja')).toBe('Imię musi mieć co najmniej 3 litery.');
      });
  
      it('powinno zwrócić błąd dla imienia dłuższego niż 30 znaków', () => {
        expect(validateName('A'.repeat(31))).toBe('Imię nie może mieć więcej niż 30 liter.');
      });
  
      it('powinno zwrócić błąd dla imienia zawierającego cyfry', () => {
        expect(validateName('Jan123')).toBe('Imię nie może zawierać cyfr.');
      });
  
      it('powinno zwrócić błąd dla imienia zawierającego znaki specjalne', () => {
        expect(validateName('Jan!')).toBe('Imię może zawierać tylko litery i spacje.');
      });
    });
  
    describe('validateLastName', () => {
      it('powinno zwrócić pusty ciąg dla poprawnego nazwiska', () => {
        expect(validateLastName('Kowalski')).toBe('');
        expect(validateLastName('Nowak-Janowski')).toBe('');
        expect(validateLastName('Śmiałkowski')).toBe('');
      });
  
      it('powinno zwrócić błąd dla nazwiska krótszego niż 3 znaki', () => {
        expect(validateLastName('No')).toBe('Nazwisko musi mieć co najmniej 3 litery.');
      });
  
      it('powinno zwrócić błąd dla nazwiska dłuższego niż 30 znaków', () => {
        expect(validateLastName('A'.repeat(31))).toBe('Nazwisko nie może mieć więcej niż 30 liter.');
      });
  
      it('powinno zwrócić błąd dla nazwiska zawierającego cyfry', () => {
        expect(validateLastName('Kowalski123')).toBe('Nazwisko nie może zawierać cyfr.');
      });
  
      it('powinno zwrócić błąd dla nazwiska zawierającego niedozwolone znaki', () => {
        expect(validateLastName('Kowalski!')).toBe('Nazwisko może zawierać tylko litery, spacje i myślniki.');
      });
    });
  
    describe('validateEmail', () => {
      it('powinno zwrócić pusty ciąg dla poprawnego emaila', () => {
        expect(validateEmail('user@example.com')).toBe('');
        expect(validateEmail('jan.kowalski@domain.pl')).toBe('');
      });
  
      it('powinno zwrócić błąd dla niepoprawnego emaila', () => {
        expect(validateEmail('invalid.email')).toBe('Podaj poprawny adres email.');
        expect(validateEmail('user@')).toBe('Podaj poprawny adres email.');
        expect(validateEmail('@domain.com')).toBe('Podaj poprawny adres email.');
      });
    });
  
    describe('validatePassword', () => {
      it('powinno zwrócić pusty ciąg dla poprawnego hasła', () => {
        expect(validatePassword('Password123!')).toBe('');
        expect(validatePassword('Abcd123$')).toBe('');
      });
  
      it('powinno zwrócić błąd dla hasła krótszego niż 8 znaków', () => {
        expect(validatePassword('Pass1!')).toBe('Hasło musi mieć co najmniej 8 znaków.');
      });
  
      it('powinno zwrócić błąd dla hasła bez małej litery', () => {
        expect(validatePassword('PASSWORD123!')).toBe('Hasło musi zawierać co najmniej jedną małą literę.');
      });
  
      it('powinno zwrócić błąd dla hasła bez dużej litery', () => {
        expect(validatePassword('password123!')).toBe('Hasło musi zawierać co najmniej jedną dużą literę.');
      });
  
      it('powinno zwrócić błąd dla hasła bez cyfry', () => {
        expect(validatePassword('Password!')).toBe('Hasło musi zawierać co najmniej jedną cyfrę.');
      });
  
      it('powinno zwrócić błąd dla hasła bez znaku specjalnego', () => {
        expect(validatePassword('Password123')).toBe('Hasło musi zawierać co najmniej jeden znak specjalny (@$!%*?&).');
      });
    });
  
    describe('isValidToken', () => {
      it('powinno zwrócić true dla poprawnego tokenu', () => {
        const validToken = 'a'.repeat(64);
        expect(isValidToken(validToken)).toBe(true);
        expect(isValidToken('1234567890abcdef'.repeat(4))).toBe(true);
      });
  
      it('powinno zwrócić false dla niepoprawnego tokenu', () => {
        expect(isValidToken('A'.repeat(64))).toBe(false); 
        expect(isValidToken('a'.repeat(63))).toBe(false); 
        expect(isValidToken('a'.repeat(65))).toBe(false); 
        expect(isValidToken('invalid-token')).toBe(false);
      });
    });
  
    describe('isTokenExpired2', () => {
      it('powinno zwrócić false dla tokenu z datą w przyszłości', () => {
        expect(isTokenExpired2('2090-04-27T21:42:09.048Z')).toBe(false);
      });
  
      it('powinno zwrócić true dla tokenu z datą w przeszłości', () => {
        expect(isTokenExpired2('2024-04-27T21:42:09.048Z')).toBe(true);
      });
  
      it('powinno zwrócić false dla null', () => {
        expect(isTokenExpired2(null)).toBe(false);
      });
      
  
      it('powinno zwrócić true dla niepoprawnej daty', () => {
        expect(isTokenExpired2('invalid-date')).toBe(true);
      });
    });
  
    describe('resetPasswordSchema', () => {
      it('powinno przejść walidację dla poprawnych danych', () => {
        const result = resetPasswordSchema.safeParse({
          newPassword: 'Password123!',
          confirmPassword: 'Password123!',
        });
        expect(result.success).toBe(true);
      });
  
      it('powinno zwrócić błąd dla hasła krótszego niż 8 znaków', () => {
        const result = resetPasswordSchema.safeParse({
          newPassword: 'Pass1!',
          confirmPassword: 'Pass1!',
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe('Hasło musi mieć co najmniej 8 znaków');
      });
  
      it('powinno zwrócić błąd dla niezgodnych haseł', () => {
        const result = resetPasswordSchema.safeParse({
          newPassword: 'Password123!',
          confirmPassword: 'Different123!',
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe('Hasła muszą się zgadzać');
      });
  
      it('powinno zwrócić błąd dla hasła bez dużej litery', () => {
        const result = resetPasswordSchema.safeParse({
          newPassword: 'password123!',
          confirmPassword: 'password123!',
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe('Hasło musi zawierać co najmniej jedną wielką literę');
      });
  
      it('powinno zwrócić błąd dla hasła bez cyfry', () => {
        const result = resetPasswordSchema.safeParse({
          newPassword: 'Password!',
          confirmPassword: 'Password!',
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe('Hasło musi zawierać co najmniej jedną cyfrę');
      });
  
      it('powinno zwrócić błąd dla hasła bez znaku specjalnego', () => {
        const result = resetPasswordSchema.safeParse({
          newPassword: 'Password123',
          confirmPassword: 'Password123',
        });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe('Hasło musi zawierać co najmniej jeden znak specjalny');
      });
    });
  });
  
  afterAll(() => {
    jest.restoreAllMocks();
  });