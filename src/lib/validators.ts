/**
 * Funkcja walidująca imię użytkownika. Sprawdza, czy imię spełnia określone wymagania dotyczące długości i zawartości.
 *
 * @function validateName
 * @param {string} name - Imię do zwalidowania.
 * @returns {string} Pusty ciąg znaków, jeśli imię jest poprawne, lub komunikat o błędzie w przypadku niepowodzenia walidacji.
 *
 * @example
 * ```typescript
 * import { validateName } from '@/lib/validators';
 *
 * console.log(validateName("Jan")); // ""
 * console.log(validateName("J")); // "Imię musi mieć co najmniej 3 litery."
 * console.log(validateName("Jan123")); // "Imię nie może zawierać cyfr."
 * ```
 *
 * @remarks
 * - Imię musi mieć od 3 do 30 liter.
 * - Imię nie może zawierać cyfr ani znaków specjalnych (poza spacjami).
 * - Dozwolone są tylko litery alfabetu łacińskiego oraz polskie znaki diakrytyczne (np. Ą, Ć, Ł).
 */
export const validateName = (name: string): string => {
    if (name.length < 3) {
      return "Imię musi mieć co najmniej 3 litery.";
    }
    if (name.length > 30) {
      return "Imię nie może mieć więcej niż 30 liter.";
    }
    if (/\d/.test(name)) {
      return "Imię nie może zawierać cyfr.";
    }
    if (!/^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż\s]*$/.test(name)) {
      return "Imię może zawierać tylko litery i spacje.";
    }
    return "";
  };

  /**
 * Funkcja walidująca nazwisko użytkownika. Sprawdza, czy nazwisko spełnia określone wymagania dotyczące długości i zawartości.
 *
 * @function validateLastName
 * @param {string} lastName - Nazwisko do zwalidowania.
 * @returns {string} Pusty ciąg znaków, jeśli nazwisko jest poprawne, lub komunikat o błędzie w przypadku niepowodzenia walidacji.
 *
 * @example
 * ```typescript
 * import { validateLastName } from '@/lib/validators';
 *
 * console.log(validateLastName("Kowalski")); // ""
 * console.log(validateLastName("Ko")); // "Nazwisko musi mieć co najmniej 3 litery."
 * console.log(validateLastName("Kowalski123")); // "Nazwisko nie może zawierać cyfr."
 * ```
 *
 * @remarks
 * - Nazwisko musi mieć od 3 do 30 liter.
 * - Nazwisko nie może zawierać cyfr.
 * - Dozwolone są litery alfabetu łacińskiego, polskie znaki diakrytyczne, spacje oraz myślniki.
 */
  export const validateLastName = (lastName: string): string => {
    if (lastName.length < 3) {
      return "Nazwisko musi mieć co najmniej 3 litery.";
    }
    if (lastName.length > 30) {
      return "Nazwisko nie może mieć więcej niż 30 liter.";
    }
    if (/\d/.test(lastName)) {
      return "Nazwisko nie może zawierać cyfr.";
    }
    if (!/^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż\s-]*$/.test(lastName)) {
      return "Nazwisko może zawierać tylko litery, spacje i myślniki.";
    }
    return "";
  };

/**
 * Funkcja walidująca adres email. Sprawdza, czy podany email ma poprawny format.
 *
 * @function validateEmail
 * @param {string} email - Adres email do zwalidowania.
 * @returns {string} Pusty ciąg znaków, jeśli email jest poprawny, lub komunikat o błędzie w przypadku niepowodzenia walidacji.
 *
 * @example
 * ```typescript
 * import { validateEmail } from '@/lib/validators';
 *
 * console.log(validateEmail("user@example.com")); // ""
 * console.log(validateEmail("invalid.email")); // "Podaj poprawny adres email."
 * ```
 *
 * @remarks
 * - Email musi zawierać znak `@` oraz poprawną strukturę (np. `nazwa@domena.pl`).
 * - Funkcja nie sprawdza, czy email faktycznie istnieje.
 */
  export const validateEmail = (email: string): string => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Podaj poprawny adres email.";
    }
    return "";
  };

/**
 * Funkcja walidująca hasło użytkownika. Sprawdza, czy hasło spełnia wymagania dotyczące długości i zawartości.
 *
 * @function validatePassword
 * @param {string} password - Hasło do zwalidowania.
 * @returns {string} Pusty ciąg znaków, jeśli hasło jest poprawne, lub komunikat o błędzie w przypadku niepowodzenia walidacji.
 *
 * @example
 * ```typescript
 * import { validatePassword } from '@/lib/validators';
 *
 * console.log(validatePassword("Password123!")); // ""
 * console.log(validatePassword("pass")); // "Hasło musi mieć co najmniej 8 znaków."
 * console.log(validatePassword("password123")); // "Hasło musi zawierać co najmniej jedną dużą literę."
 * ```
 *
 * @remarks
 * - Hasło musi mieć co najmniej 8 znaków.
 * - Hasło musi zawierać: małą literę, dużą literę, cyfrę oraz znak specjalny (@$!%*?&).
 */
  export const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return "Hasło musi mieć co najmniej 8 znaków.";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Hasło musi zawierać co najmniej jedną małą literę.";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Hasło musi zawierać co najmniej jedną dużą literę.";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Hasło musi zawierać co najmniej jedną cyfrę.";
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return "Hasło musi zawierać co najmniej jeden znak specjalny (@$!%*?&).";
    }
    return "";
  };

/**
 * Funkcja sprawdzająca, czy podany token jest poprawny. Token musi być ciągiem 64 znaków składającym się z liter a-f oraz cyfr.
 *
 * @function isValidToken
 * @param {string} token - Token do zwalidowania.
 * @returns {boolean} `true`, jeśli token jest poprawny, `false` w przeciwnym razie.
 *
 * @example
 * ```typescript
 * import { isValidToken } from '@/lib/validators';
 *
 * const validToken = "a".repeat(64);
 * console.log(isValidToken(validToken)); // true
 * console.log(isValidToken("invalid-token")); // false
 * ```
 *
 * @remarks
 * - Token musi mieć dokładnie 64 znaki i składać się wyłącznie z liter a-f (małe litery) oraz cyfr 0-9.
 */
export const isValidToken = (token: string) => {
    const regex = /^[a-f0-9]{64}$/;
    return regex.test(token);
  };

/**
 * Funkcja sprawdzająca, czy token wygasł na podstawie daty wygaśnięcia.
 *
 * @function isTokenExpired2
 * @param {string | null} exp - Data wygaśnięcia tokenu w formacie ISO lub `null`.
 * @returns {boolean} `true`, jeśli token wygasł lub data jest nieprawidłowa, `false` w przeciwnym razie.
 *
 * @example
 * ```typescript
 * import { isTokenExpired2 } from '@/lib/validators';
 *
 * console.log(isTokenExpired2("2023-10-01T12:00:00Z")); // true (data w przeszłości)
 * console.log(isTokenExpired2("2025-12-01T12:00:00Z")); // false (data w przyszłości)
 * console.log(isTokenExpired2(null)); // false
 * console.log(isTokenExpired2("invalid-date")); // true
 * ```
 *
 * @remarks
 * - Funkcja przyjmuje datę w formacie ISO (np. `2023-10-01T12:00:00Z`).
 * - Jeśli data jest nieprawidłowa lub niepodana (`null`), token jest uznawany za niewygasły lub wygasły (w zależności od przypadku).
 */
export function isTokenExpired2(exp: string | null): boolean {
      if (!exp) {
        return false;
      }
    
      try {
        const expDate = new Date(exp);
    
        if (isNaN(expDate.getTime())) {
          return true; 
        }
    
        return expDate < new Date();
      } catch {
        return true; 
      }
    }
import * as z from "zod";

/**
 * Schemat walidacji dla formularza resetowania hasła, wykorzystujący bibliotekę Zod.
 * Sprawdza poprawność nowego hasła oraz zgodność potwierdzenia hasła.
 *
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * import { resetPasswordSchema } from '@/lib/validators';
 *
 * const validData = { newPassword: "Password123!", confirmPassword: "Password123!" };
 * console.log(resetPasswordSchema.safeParse(validData).success); // true
 *
 * const invalidData = { newPassword: "pass", confirmPassword: "pass" };
 * console.log(resetPasswordSchema.safeParse(invalidData).success); // false
 * ```
 *
 * @remarks
 * - Nowe hasło musi mieć co najmniej 8 znaków, zawierać dużą literę, małą literę, cyfrę oraz znak specjalny.
 * - Pole `confirmPassword` musi być identyczne jak `newPassword`.
 * - Schemat jest zgodny z biblioteką Zod i może być używany do walidacji formularzy.
 *
 * @see {@link https://zod.dev} - Dokumentacja biblioteki Zod.
 */
export  const resetPasswordSchema = z
    .object({
      newPassword: z
        .string()
        .min(8, "Hasło musi mieć co najmniej 8 znaków")
        .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
        .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
        .regex(/[^a-zA-Z0-9]/, "Hasło musi zawierać co najmniej jeden znak specjalny")
        .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Hasła muszą się zgadzać",
      path: ["confirmPassword"],
    });
  
  export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;