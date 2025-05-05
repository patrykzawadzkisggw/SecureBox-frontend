import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Info } from 'lucide-react';
import { cn } from '@/lib/utils'; // Pomocnicza funkcja z Shadcn/UI do łączenia klas

const COOKIE_BANNER_KEY = 'securebox_cookie_banner_dismissed';

/**
 * Baner informacyjny o ciasteczkach dla aplikacji SecureBox.
 * Wyświetla komunikat o użyciu ciasteczek HTTP-only do przechowywania tokenów uwierzytelniających oraz ostrzeżenie o korzystaniu z wielu Masterkey.
 * Baner jest widoczny na górze strony, dopóki użytkownik go nie zamknie, a stan zamknięcia jest zapisywany w `localStorage`.
 * Zawiera link do regulaminu (`/termsofservice`) i przycisk zamknięcia.
 *
 * @function CookieBanner
 * @returns {JSX.Element | null} Baner informacyjny o ciasteczkach lub `null`, jeśli baner został zamknięty.
 *
 * @example
 * ```tsx
 * import CookieBanner from "@/components/CookieBanner";
 *
 * // W komponencie nadrzędnym, np. LoginPage
 * const LoginPage = () => (
 *   <div>
 *     <CookieBanner />
 *    
 *   </div>
 * );
 * ```
 *
 * @remarks
 * - **Zależności**: Wymaga `react` (`useState`, `useEffect`), komponentu `Button` z `@/components/ui/button`, ikon `X` i `Info` z `lucide-react`, oraz funkcji `cn` z `@/lib/utils` do łączenia klas Tailwind CSS.
 * - **Stan i efekty**:
 *   - `isVisible`: Stan określający, czy baner jest widoczny. Domyślnie ustawiany na podstawie wartości w `localStorage`.
 *   - `useEffect`: Sprawdza przy pierwszym renderowaniu, czy baner został wcześniej zamknięty (klucz `securebox_cookie_banner_dismissed` w `localStorage`). Jeśli nie, ustawia `isVisible` na `true`.
 * - **Zachowanie**:
 *   - Baner jest wyświetlany na górze strony (`fixed top-0`) i pozostaje widoczny, dopóki użytkownik nie kliknie przycisku „Zamknij”.
 *   - Po zamknięciu (`handleDismiss`) baner znika, a stan zamknięcia jest zapisywany w `localStorage`, zapobiegając ponownemu wyświetleniu.
 *   - Link do `/termsofservice` kieruje użytkownika do regulaminu, gdzie można znaleźć więcej informacji o ciasteczkach i polityce prywatności.
 * - **Stylizacja**:
 *   - Używa Tailwind CSS (np. `fixed`, `bg-white`, `shadow-md`, `animate-slide-in`) dla responsywnego i nowoczesnego wyglądu.
 *   - Funkcja `cn` pozwala na dynamiczne łączenie klas, zapewniając elastyczność stylów.
 *   - Baner ma maksymalną szerokość `max-w-7xl` i responsywny układ (`flex-col` na urządzeniach mobilnych, `flex-row` na desktopie).
 *   - Przycisk i link mają efekty hover (`hover:bg-indigo-700`, `hover:underline`) dla lepszej interaktywności.
 * - **Dostępność**:
 *   - Tekst banera jest czytelny, z wyraźnym kontrastem (`text-gray-700` na `bg-white`).
 *   - Link do regulaminu zawiera ikonę `Info` z domyślnym `aria-hidden="true"` (od `lucide-react`), ale rozważ dodanie `aria-label` (np. „Dowiedz się więcej o ciasteczkach”).
 *   - Przycisk „Zamknij” zawiera ikonę `X` i tekst, co ułatwia identyfikację dla użytkowników korzystających z czytników ekranu.
 *   - Baner powinien mieć atrybut `aria-live="polite"`, aby czytniki ekranu ogłaszały jego pojawienie się.
 * - **Bezpieczeństwo**:
 *   - Baner używa `localStorage` do przechowywania stanu zamknięcia (`securebox_cookie_banner_dismissed`). Klucz jest prosty i nie zawiera wrażliwych danych.
 *   - Link `/termsofservice` jest wewnętrznym odnośnikiem, nie wymaga zabezpieczeń przed atakami typu XSS.
 *   - Informacje o ciasteczkach HTTP-only i Masterkey są zgodne z polityką prywatności SecureBox, zapewniając transparentność.
 * - **Testowanie**: Komponent jest testowalny z `@testing-library/react`. Mockuj `localStorage` i komponent `Button`. Testuj wyświetlanie banera, zamykanie, zapis w `localStorage`, oraz renderowanie linku do regulaminu. Zobacz `tests/components/CookieBanner.test.tsx` (jeśli istnieje).
 * - **Przekierowanie**: Link do `/termsofservice` przenosi użytkownika do strony regulaminu. Baner nie obsługuje innych przekierowań, ale zamknięcie banera nie wpływa na nawigację.
 * - **Rozszerzalność**:
 *   - Baner może zostać rozszerzony o opcje zgody na ciasteczka (np. „Akceptuj wszystkie”, „Odrzuć opcjonalne”) dla zgodności z GDPR.
 *   - Treść banera może być dynamicznie ładowana (np. z CMS) dla łatwiejszej aktualizacji.
 *   - Animacja `animate-slide-in` może być dostosowana lub zastąpiona inną (np. fade-in).
 */
const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Sprawdź, czy baner został wcześniej zamknięty
    const isDismissed = localStorage.getItem(COOKIE_BANNER_KEY);
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(COOKIE_BANNER_KEY, 'true');
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-white shadow-md p-4 md:p-6',
        'border-b border-gray-200 animate-slide-in'
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-gray-700 text-sm md:text-base">
          <p>
            SecureBox używa <strong>ciasteczek HTTP-only</strong> do przechowywania tokenu uwierzytelniającego w celu
            bezpiecznego logowania. Korzystanie z wielu <strong>Masterkey</strong> może uniemożliwić eksport haseł do
            pliku JSON i wymaga zapamiętania wszystkich kluczy.
          </p>
          <a
            href="/termsofservice"
            className="text-indigo-600 hover:underline inline-flex items-center mt-2"
          >
            Dowiedz się więcej <Info className="ml-1 w-4 h-4" />
          </a>
        </div>
        <Button
          onClick={handleDismiss}
          variant="outline"
          className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 border-none"
        >
          Zamknij <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CookieBanner;