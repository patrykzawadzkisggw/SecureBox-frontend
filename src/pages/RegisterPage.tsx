import { GalleryVerticalEnd } from "lucide-react";
import { RegisterForm } from "@/components/RegisterForm";
import image from "../assets/registerImage.jpg";
import { usePasswordContext } from "@/data/PasswordContext";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

/**
 * Strona rejestracji użytkownika dla menedżera haseł SecureBox.
 * Umożliwia użytkownikowi utworzenie nowego konta poprzez formularz rejestracyjny z zabezpieczeniem reCAPTCHA v3.
 * Zawiera responsywny układ z logo i obrazem tła (widocznym tylko na większych ekranach).
 * Wykorzystuje kontekst `PasswordContext` do dodania nowego użytkownika.
 *
 * @function RegisterPage
 * @returns {JSX.Element} Strona rejestracji z formularzem i obrazem tła.
 *
 * @example
 * ```tsx
 * import { RegisterPage } from "@/pages/RegisterPage";
 *
 * // W kontekście aplikacji z zaimplementowanym PasswordContext
 * <RegisterPage />
 * ```
 *
 * @remarks
 * - **Zależności**: Wymaga `lucide-react` (`GalleryVerticalEnd`), komponentu `RegisterForm`, obrazu statycznego (`registerImage.jpg`), kontekstu (`usePasswordContext`), oraz `react-google-recaptcha-v3` (`GoogleReCaptchaProvider`).
 * - **Kontekst**: Używa `usePasswordContext` do uzyskania funkcji `addUser`, która odpowiada za dodanie nowego użytkownika do systemu.
 * - **reCAPTCHA**: Integruje Google reCAPTCHA v3 z kluczem witryny (`SITE_KEY`). Skrypt reCAPTCHA jest ładowany asynchronicznie z opcjami `async`, `defer`, i `appendTo: "head"`.
 * - **Układ**:
 *   - Strona jest podzielona na dwie kolumny w widoku desktopowym (`lg:grid-cols-2`): lewa zawiera formularz, prawa obraz tła.
 *   - W widoku mobilnym prawa kolumna (obraz) jest ukryta (`lg:block`).
 *   - Formularz jest wyśrodkowany w kontenerze o maksymalnej szerokości `max-w-xs`.
 * - **Stylizacja**: Używa Tailwind CSS (np. `min-h-svh`, `flex`, `gap-4`, `bg-muted`) dla responsywnego układu. Obraz tła ma efekty `dark:brightness-[0.2]` i `dark:grayscale` w trybie ciemnym.
 * - **Dostępność**:
 *   - Logo zawiera ikonę `GalleryVerticalEnd` z tekstem „SecureBox” dla czytelności.
 *   - Formularz w `RegisterForm` powinien zawierać etykiety i komunikaty błędów (do zweryfikowania w dokumentacji `RegisterForm`).
 *   - Rozważ dodanie `aria-label` dla ikony logo i zapewnienie, że reCAPTCHA jest dostępna dla czytników ekranu.
 * - **Bezpieczeństwo**:
 *   - reCAPTCHA v3 chroni przed botami, weryfikując interakcje użytkownika w tle.
 *   - Funkcja `addUser` powinna być zabezpieczona po stronie serwera, np. poprzez walidację danych i ochronę przed atakami typu brute-force.
 * - **API**: Komponent nie wykonuje bezpośrednich żądań API, ale przekazuje funkcję `addUser` do `RegisterForm`, która prawdopodobnie obsługuje komunikację z serwerem.
 * - **Testowanie**: Komponent jest testowalny z `@testing-library/react`. Mockuj `usePasswordContext`, `RegisterForm`, i `GoogleReCaptchaProvider`. Testuj renderowanie formularza, logo, i widoczność obrazu tła w różnych rozdzielczościach. Zobacz `tests/pages/RegisterPage.test.tsx` (jeśli istnieje).
 * - **Przekierowanie**: Komponent nie obsługuje bezpośrednich przekierowań, ale `RegisterForm` może inicjować nawigację po udanej rejestracji (np. do strony logowania).
 * - **Rozszerzalność**: Układ pozwala na dodanie dodatkowych elementów (np. linków do logowania) w lewej kolumnie lub zmianę obrazu tła.
 */
export default function RegisterPage() {
  const {addUser} = usePasswordContext();
  const SITE_KEY = "6LdROCgrAAAAAEkl7izkHo6eb4Fesdq2E37OkstI";
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
            <RegisterForm addUser={addUser}/>
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
  );
}