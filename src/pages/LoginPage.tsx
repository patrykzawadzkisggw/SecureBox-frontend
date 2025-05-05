import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import image from "../assets/loginImage.jpg"
import { usePasswordContext } from "@/data/PasswordContext"
import { resetPasswordSubmit } from "@/lib/fn2"
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import CookieBanner from "@/components/CookieBanner"

const SITE_KEY = "6LdROCgrAAAAAEkl7izkHo6eb4Fesdq2E37OkstI";

/**
 * Strona logowania użytkownika dla aplikacji SecureBox.
 * Umożliwia użytkownikowi zalogowanie się do systemu poprzez formularz logowania z zabezpieczeniem reCAPTCHA v3 oraz opcjonalnym resetowaniem hasła.
 * Wyświetla baner dotyczący ciasteczek (`CookieBanner`) i zawiera responsywny układ z logo oraz obrazem tła (widocznym tylko na większych ekranach).
 * Wykorzystuje kontekst `PasswordContext` do obsługi logowania.
 *
 * @function LoginPage
 * @returns {JSX.Element} Strona logowania z formularzem, banerem ciasteczek i obrazem tła.
 *
 * @example
 * ```tsx
 * import { LoginPage } from "@/pages/LoginPage";
 *
 * // W kontekście aplikacji z zaimplementowanym PasswordContext
 * <LoginPage />
 * ```
 *
 * @remarks
 * - **Zależności**: Wymaga `lucide-react` (`GalleryVerticalEnd`), komponentów `LoginForm` i `CookieBanner`, obrazu statycznego (`loginImage.jpg`), kontekstu (`usePasswordContext`), funkcji `resetPasswordSubmit` z `@/lib/fn2`, oraz `react-google-recaptcha-v3` (`GoogleReCaptchaProvider`).
 * - **Kontekst**: Używa `usePasswordContext` do uzyskania funkcji `login`, która odpowiada za uwierzytelnianie użytkownika w systemie.
 * - **reCAPTCHA**: Integruje Google reCAPTCHA v3 z kluczem witryny (`SITE_KEY`). Skrypt reCAPTCHA jest ładowany asynchronicznie z opcjami `async`, `defer`, i `appendTo: "head"`.
 * - **Układ**:
 *   - Strona jest podzielona na dwie kolumny w widoku desktopowym (`lg:grid-cols-2`): lewa zawiera logo, baner ciasteczek i formularz, prawa obraz tła.
 *   - W widoku mobilnym prawa kolumna (obraz) jest ukryta (`lg:block`).
 *   - Formularz jest wyśrodkowany w kontenerze o maksymalnej szerokości `max-w-xs`.
 *   - Baner ciasteczek (`CookieBanner`) jest wyświetlany poniżej logo.
 * - **Stylizacja**: Używa Tailwind CSS (np. `min-h-svh`, `flex`, `gap-4`, `bg-muted`) dla responsywnego układu. Obraz tła ma efekty `dark:brightness-[0.2]` i `dark:grayscale` w trybie ciemnym.
 * - **Dostępność**:
 *   - Logo zawiera ikonę `GalleryVerticalEnd` z tekstem „SecureBox” dla czytelności.
 *   - Formularz w `LoginForm` powinien zawierać etykiety i komunikaty błędów (do zweryfikowania w dokumentacji `LoginForm`).
 *   - Rozważ dodanie `aria-label` dla ikony logo (np. „SecureBox logo”) i zapewnienie, że reCAPTCHA oraz `CookieBanner` są dostępne dla czytników ekranu.
 * - **Bezpieczeństwo**:
 *   - reCAPTCHA v3 chroni przed botami, weryfikując interakcje użytkownika w tle.
 *   - Funkcja `login` powinna być zabezpieczona po stronie serwera, np. poprzez walidację poświadczeń i ochronę przed atakami brute-force.
 *   - Funkcja `resetPasswordSubmit` (przekazana do `LoginForm`) powinna bezpiecznie obsługiwać żądania resetowania hasła, np. generując tokeny z ograniczonym czasem ważności.
 *   - Klucz `SITE_KEY` jest hardcoded; rozważ przeniesienie go do zmiennej środowiskowej (np. `process.env.REACT_APP_RECAPTCHA_SITE_KEY`) dla bezpieczeństwa.
 * - **API**: Komponent nie wykonuje bezpośrednich żądań API, ale przekazuje funkcje `login` i `resetPasswordSubmit` do `LoginForm`, które prawdopodobnie komunikują się z serwerem.
 * - **Testowanie**: Komponent jest testowalny z `@testing-library/react`. Mockuj `usePasswordContext`, `LoginForm`, `CookieBanner`, i `GoogleReCaptchaProvider`. Testuj renderowanie formularza, logo, banera ciasteczek, i widoczność obrazu tła w różnych rozdzielczościach. Zobacz `tests/pages/LoginPage.test.tsx` (jeśli istnieje).
 * - **Przekierowanie**: Komponent nie obsługuje bezpośrednich przekierowań, ale `LoginForm` może inicjować nawigację po udanym logowaniu (np. do strony haseł) lub resetowaniu hasła.
 * - **Rozszerzalność**: Układ pozwala na dodanie dodatkowych elementów (np. linku do rejestracji) w lewej kolumnie lub zmianę obrazu tła.
 */
export default function LoginPage() {
  const {login} = usePasswordContext()

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <span className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            SecureBox
          </span>
        </div>
        <CookieBanner />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
          <GoogleReCaptchaProvider
            reCaptchaKey={SITE_KEY}
            scriptProps={{
              async: true,
              defer: true,
              appendTo: "head",
              nonce: undefined,
            }}>
              <LoginForm loginUser={login} resetPasswordSubmit={resetPasswordSubmit} />
            </GoogleReCaptchaProvider>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src={image}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
