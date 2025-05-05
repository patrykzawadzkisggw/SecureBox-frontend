import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';


/**
 * Komponent strony regulaminu dla aplikacji SecureBox.
 * Wyświetla pełny regulamin korzystania z aplikacji i jej rozszerzenia przeglądarkowego w formacie akordeonu, umożliwiając łatwe przeglądanie sekcji.
 * Zawiera informacje o zasadach użytkowania, Masterkey, ochronie danych osobowych, odpowiedzialności dostawcy oraz innych kluczowych aspektach.
 * Oferuje przycisk do kontaktu z pomocą techniczną poprzez email.
 *
 * @function TermsOfService
 * @returns {JSX.Element} Strona regulaminu w formie karty z akordeonem i przyciskiem kontaktowym.
 *
 * @example
 * ```tsx
 * import { TermsOfService } from "@/components/TermsOfService";
 *
 * // W konfiguracji routingu
 * import { Routes, Route } from "react-router-dom";
 *
 * const App = () => (
 *   <Routes>
 *     <Route path="/termsofservice" element={<TermsOfService />} />
 *   </Routes>
 * );
 * ```
 *
 * @remarks
 * - **Zależności**: Wymaga komponentów UI (`Accordion`, `Card`, `Button`) z `@/components/ui`, ikony `ExternalLink` z `lucide-react`.
 * - **Struktura**:
 *   - Strona jest wyśrodkowana na pełnej wysokości ekranu (`min-h-screen`) z tłem `bg-gray-100`.
 *   - Karta (`Card`) ma maksymalną szerokość `max-w-4xl` i zawiera nagłówek (`CardHeader`) oraz treść (`CardContent`).
 *   - Treść regulaminu jest zorganizowana w akordeonie (`Accordion`) z 14 sekcjami, każda z nagłówkiem (`AccordionTrigger`) i szczegółami (`AccordionContent`).
 *   - Przycisk kontaktowy otwiera klienta poczty z adresem `support@securebox.com`.
 * - **Zawartość**:
 *   - Regulamin obejmuje definicje, warunki korzystania, zasady Masterkey, eksport haseł, monitorowanie logowań, blokadę konta, zabezpieczenia, statystyki haseł, ciasteczka, odpowiedzialność dostawcy, ochronę danych, rozwiązanie umowy, zmiany regulaminu i postanowienia końcowe.
 *   - Zawiera odniesienia do RODO, polityki prywatności Google (dla reCAPTCHA) oraz prawa polskiego i unijnego.
 *   - Informacje o administratorze danych: SecureBox Sp. z o.o., ul. Przykładowa 1, 00-000 Warszawa.
 * - **Stylizacja**: Używa Tailwind CSS (np. `min-h-screen`, `bg-gray-100`, `max-w-4xl`, `bg-indigo-600`) dla responsywnego i estetycznego układu. Akordeon i przycisk mają efekty hover dla lepszej interaktywności.
 * - **Dostępność**:
 *   - Nagłówki (`CardTitle`, `AccordionTrigger`) są czytelne dla czytników ekranu.
 *   - Akordeon jest zgodny z ARIA dzięki komponentowi `Accordion` z Shadcn/UI, wspierając nawigację klawiaturą.
 *   - Ikona `ExternalLink` powinna mieć `aria-hidden="true"` lub `aria-label` (np. „Otwórz email do wsparcia”).
 *   - Link do polityki Google (`target="_blank"`) otwiera się w nowej karcie z `rel="noopener noreferrer"` dla bezpieczeństwa i dostępności.
 *   - Rozważ dodanie `aria-describedby` do akordeonu, aby opisać jego cel (np. „Regulamin aplikacji SecureBox”).
 * - **Bezpieczeństwo**:
 *   - Link do polityki Google używa bezpiecznych atrybutów (`rel="noopener noreferrer"`) zapobiegających atakom typu window.opener.
 *   - Przycisk kontaktowy (`mailto:support@securebox.com`) jest bezpieczny, ale upewnij się, że serwer poczty obsługuje zgłoszenia użytkowników.
 *   - Dane osobowe (np. adres administratora) są statyczne i nie wymagają dodatkowej walidacji.
 * - **Testowanie**: Komponent jest testowalny z `@testing-library/react`. Testuj renderowanie akordeonu, otwieranie/zamykanie sekcji, kliknięcie przycisku kontaktowego oraz responsywność. Zobacz `tests/components/TermsOfService.test.tsx` (jeśli istnieje).
 * - **Przekierowanie**: Komponent nie obsługuje wewnętrznych przekierowań, ale zawiera link zewnętrzny do polityki Google i przycisk otwierający klienta poczty.
 * - **Rozszerzalność**:
 *   - Treść regulaminu może być dynamicznie ładowana (np. z CMS) dla łatwiejszej aktualizacji.
 *   - Akordeon może zostać rozszerzony o kolejne sekcje (np. FAQ) lub podsekcje.
 *   - Przycisk kontaktowy mógłby otwierać formularz kontaktowy zamiast klienta poczty dla lepszej UX.
 */
const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900">Regulamin aplikacji SecureBox</CardTitle>
          <p className="text-sm text-gray-500 mt-2">Data wejścia w życie: 04 maja 2025 r.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-700">
            Niniejszy Regulamin określa zasady korzystania z aplikacji <strong>SecureBox</strong> oraz jej rozszerzenia
            przeglądarkowego. Korzystanie z Aplikacji oznacza akceptację Regulaminu oraz zgodę na przetwarzanie danych
            osobowych.
          </p>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="section-1">
              <AccordionTrigger>1. Definicje</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Aplikacja SecureBox</strong>: Oprogramowanie do zarządzania hasłami.
                  </li>
                  <li>
                    <strong>Rozszerzenie</strong>: Dodatek do przeglądarki umożliwiający automatyczne logowanie.
                  </li>
                  <li>
                    <strong>Użytkownik</strong>: Osoba korzystająca z Aplikacji lub Rozszerzenia.
                  </li>
                  <li>
                    <strong>Masterkey</strong>: Klucz główny do szyfrowania haseł.
                  </li>
                  <li>
                    <strong>Dane osobowe</strong>: Informacje zgodne z RODO.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-2">
              <AccordionTrigger>2. Ogólne warunki korzystania</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Korzystanie z Aplikacji wymaga akceptacji Regulaminu. Aplikacja jest przeznaczona dla osób
                  pełnoletnich. Użytkownik zobowiązuje się do przestrzegania prawa.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-3">
              <AccordionTrigger>3. Zasady funkcjonowania Masterkey</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    Użytkownik ustala Masterkey, który nie jest przechowywany na serwerach. Utrata Masterkey uniemożliwia
                    dostęp do haseł.
                  </li>
                  <li>Przy logowaniu Użytkownik jest informowany o ryzyku utraty Masterkey.</li>
                  <li>
                    Możliwe jest użycie wielu Masterkey, ale uniemożliwia to eksport haseł do JSON.
                  </li>
                  <li>
                    W Rozszerzeniu Użytkownik musi używać spójnego Masterkey, o czym jest informowany przy logowaniu.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-4">
              <AccordionTrigger>4. Eksport haseł</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Użytkownik może eksportować hasła do pliku JSON (nieszyfrowanego). Przed eksportem otrzymuje ostrzeżenie
                  o konieczności bezpiecznego przechowywania danych. Dostawca nie odpowiada za utratę wyeksportowanych
                  danych.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-5">
              <AccordionTrigger>5. Monitorowanie logowań w Rozszerzeniu</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Monitorowanie obejmuje 5 ostatnich logowań i statystyki tygodniowe.</li>
                  <li>Dane logowań przechowywane są przez 5 lat, nieudane logowania przez 2 lata.</li>
                  <li>Przetwarzanie danych wymaga zgody Użytkownika lub jest częścią umowy.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-6">
              <AccordionTrigger>6. Blokada konta</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Po 5 nieudanych próbach logowania konto jest blokowane na 10 minut.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-7">
              <AccordionTrigger>7. Zabezpieczenie logowania</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Logowanie jest zabezpieczone za pomocą reCAPTCHA. Użycie reCAPTCHA podlega{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    polityce prywatności Google
                  </a>
                  .
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-8">
              <AccordionTrigger>8. Statystyki haseł</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Statystyki siły haseł są obliczane lokalnie w przeglądarce i mają charakter poglądowy. Średnia jakość
                  haseł uwzględnia tylko hasła użyte w przeglądarce.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-9">
              <AccordionTrigger>9. Ciasteczka i technologie przechowywania danych</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Ciasteczka HTTP-only przechowują token uwierzytelniający.</li>
                  <li>LocalStorage/SessionStorage przechowuje dane sesji, usuwane po wylogowaniu.</li>
                  <li>Użytkownik jest informowany o ciasteczkach przy pierwszym uruchomieniu.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-10">
              <AccordionTrigger>10. Odpowiedzialność Dostawcy</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Dostawca nie odpowiada za utratę Masterkey, nieautoryzowany dostęp do wyeksportowanych haseł ani przerwy
                  w działaniu Aplikacji z przyczyn niezależnych. Wsparcie: support@securebox.com.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-11">
              <AccordionTrigger>11. Ochrona danych osobowych</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Administrator</strong>: SecureBox Sp. z o.o., ul. Przykładowa 1, 00-000 Warszawa.
                  </li>
                  <li>
                    <strong>Cele</strong>: Świadczenie usług, monitorowanie logowań, bezpieczeństwo.
                  </li>
                  <li>
                    <strong>Okres przechowywania</strong>: Logowania - 5 lat, nieudane logowania - 2 lata, pozostałe dane
                    - do 2 lat po zakończeniu korzystania.
                  </li>
                  <li>
                    <strong>Prawa Użytkownika</strong>: Dostęp, sprostowanie, usunięcie, przenoszenie danych, skarg do
                    PUODO.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-12">
              <AccordionTrigger>12. Rozwiązanie umowy</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Użytkownik może usunąć konto w ustawieniach. Dane zostaną trwale usunięte, z wyjątkiem danych wymaganych
                  przez prawo.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-13">
              <AccordionTrigger>13. Zmiany Regulaminu</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Zmiany Regulaminu są ogłaszane z 14-dniowym wyprzedzeniem. Dalsze korzystanie oznacza akceptację.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-14">
              <AccordionTrigger>14. Postanowienia końcowe</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Regulamin podlega prawu polskiemu i unijnemu. Spory rozstrzyga sąd w Warszawie. Wersja polska ma
                  pierwszeństwo.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => window.open('mailto:support@securebox.com')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Skontaktuj się z nami
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsOfService;