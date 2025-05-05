import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';


/**
 * Strona polityki prywatności dla aplikacji SecureBox.
 * Przedstawia szczegółowe informacje o przetwarzaniu danych osobowych przez SecureBox Sp. z o.o., zgodnie z przepisami RODO.
 * Wykorzystuje akordeon do prezentacji sekcji dotyczących administratora danych, celów przetwarzania, rodzajów danych, okresu przechowywania, odbiorców danych, praw użytkownika, bezpieczeństwa, ciasteczek, przekazywania danych za granicę oraz kontaktu.
 * Zawiera przycisk do kontaktu z administratorem danych.
 *
 * @function PrivacyPolicyPage
 * @returns {JSX.Element} Strona polityki prywatności z akordeonem i przyciskiem kontaktowym.
 *
 * @example
 * ```tsx
 * import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
 *
 * // W kontekście aplikacji z zaimplementowanym routerem
 * <PrivacyPolicyPage />
 * ```
 *
 * @remarks
 * - **Zależności**: Wymaga komponentów UI (`Accordion`, `Card`, `Button`) z `@/components/ui`, ikony `ExternalLink` z `lucide-react`. Nie korzysta z kontekstu ani API, jest to strona statyczna.
 * - **Układ**:
 *   - Strona jest wyśrodkowana na pełnej wysokości ekranu (`min-h-screen`) z tłem `bg-gray-100`.
 *   - Treść znajduje się w karcie (`Card`) o maksymalnej szerokości `max-w-4xl` z cieniem i zaokrąglonymi rogami.
 *   - Sekcje polityki są zorganizowane w akordeonie (`Accordion`) z możliwością zwijania (tylko jedna sekcja otwarta na raz).
 * - **Stylizacja**: Używa Tailwind CSS (np. `min-h-screen`, `bg-gray-100`, `shadow-lg`, `text-indigo-600`) dla responsywnego i estetycznego wyglądu. Linki i przyciski mają efekty hover (`hover:underline`, `hover:bg-indigo-700`).
 * - **Dostępność**:
 *   - Nagłówki (`CardTitle`, `AccordionTrigger`) są czytelne dla czytników ekranu.
 *   - Linki (np. `mailto:support@securebox.com`) i przyciski mają wyraźne style wizualne i tekstowe.
 *   - Rozważ dodanie `aria-label` do ikony `ExternalLink` (np. „Otwórz w kliencie poczty”) dla lepszej dostępności.
 * - **Bezpieczeństwo**:
 *   - Strona nie przetwarza danych użytkownika, ale zawiera informacje o zabezpieczeniach stosowanych przez SecureBox (np. szyfrowanie end-to-end, HTTPS, reCAPTCHA).
 *   - Linki zewnętrzne (np. do Google Privacy Policy, Data Privacy Framework) otwierają się w nowej karcie z atrybutem `rel="noopener noreferrer"` dla ochrony przed atakami typu window.opener.
 * - **Treść**:
 *   - Obejmuje 10 sekcji: administrator danych, cele przetwarzania, rodzaje danych, okres przechowywania, odbiorcy danych, prawa użytkownika, bezpieczeństwo, ciasteczka, przekazywanie danych do państw trzecich, kontakt.
 *   - Informacje są zgodne z RODO, z odniesieniami do podstaw prawnych (np. art. 6 ust. 1 lit. b, f RODO) i mechanizmów ochrony danych (np. Data Privacy Framework).
 * - **Interakcje**:
 *   - Przycisk „Skontaktuj się z nami” otwiera klienta poczty z adresem `support@securebox.com` za pomocą `window.open('mailto:support@securebox.com')`.
 *   - Akordeon pozwala użytkownikowi rozwinąć jedną sekcję na raz, poprawiając czytelność.
 * - **Testowanie**: Komponent jest testowalny z `@testing-library/react`. Testuj renderowanie akordeonu, widoczność sekcji po rozwinięciu, działanie przycisku kontaktowego oraz responsywność. Mockuj komponenty UI (`Accordion`, `Card`, `Button`). Zobacz `tests/pages/PrivacyPolicyPage.test.tsx` (jeśli istnieje).
 * - **Przekierowanie**: Komponent nie obsługuje nawigacji w aplikacji, ale linki i przycisk kontaktowy otwierają zewnętrzne zasoby (poczta, strony internetowe).
 * - **Rozszerzalność**: Struktura akordeonu ułatwia dodawanie nowych sekcji polityki. Przycisk kontaktowy może być rozszerzony o inne kanały komunikacji (np. formularz kontaktowy).
 */
const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900">Polityka prywatności SecureBox</CardTitle>
          <p className="text-sm text-gray-500 mt-2">Data wejścia w życie: 04 maja 2025 r.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-700">
            Niniejsza Polityka prywatności opisuje, jak <strong>SecureBox Sp. z o.o.</strong> przetwarza dane osobowe
            użytkowników aplikacji SecureBox i jej rozszerzenia przeglądarkowego. Dbamy o ochronę Twojej prywatności i
            przestrzegamy przepisów RODO.
          </p>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="section-1">
              <AccordionTrigger>1. Administrator danych</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Administratorem Twoich danych osobowych jest <strong>SecureBox Sp. z o.o.</strong>, ul. Przykładowa 1,
                  00-000 Warszawa, NIP: 1234567890. Kontakt:{' '}
                  <a href="mailto:support@securebox.com" className="text-indigo-600 hover:underline">
                    support@securebox.com
                  </a>.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-2">
              <AccordionTrigger>2. Cele i podstawy prawne przetwarzania</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Przetwarzamy Twoje dane w następujących celach:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Świadczenie usług Aplikacji i Rozszerzenia (wykonanie umowy, art. 6 ust. 1 lit. b RODO).</li>
                  <li>Rejestracja i uwierzytelnianie użytkownika (wykonanie umowy, art. 6 ust. 1 lit. b RODO).</li>
                  <li>
                    Monitorowanie logowań i prób logowania dla bezpieczeństwa (uzasadniony interes, art. 6 ust. 1 lit. f
                    RODO).
                  </li>
                  <li>Zarządzanie hasłami (wykonanie umowy, art. 6 ust. 1 lit. b RODO).</li>
                  <li>Obsługa resetowania hasła (wykonanie umowy, art. 6 ust. 1 lit. b RODO).</li>
                  <li>Zarządzanie zaufanymi urządzeniami (uzasadniony interes, art. 6 ust. 1 lit. f RODO).</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-3">
              <AccordionTrigger>3. Rodzaje przetwarzanych danych</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Przetwarzamy następujące dane:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Dane użytkownika</strong>: Imię, nazwisko, login (e-mail), zaszyfrowane hasło.</li>
                  <li><strong>Hasła</strong>: Login do platformy, nazwa platformy, URL ikony strony (logo).</li>
                  <li><strong>Próby logowania</strong>: Czas próby, sukces/niepowodzenie, powiązanie z użytkownikiem.</li>
                  <li>
                    <strong>Logowania w rozszerzeniu</strong>: Czas logowania, login, URL strony, powiązanie z
                    użytkownikiem.
                  </li>
                  <li>
                    <strong>Tokeny resetowania hasła</strong>: Token, czas wygaśnięcia, powiązanie z użytkownikiem.
                  </li>
                  <li>
                    <strong>Zaufane urządzenia</strong>: Identyfikator urządzenia, dane przeglądarki (user-agent), status
                    zaufania.
                  </li>
                  <li><strong>Dane techniczne</strong>: Adres IP, wersja przeglądarki (user-agent).</li>
                  <li><strong>Dane z reCAPTCHA</strong>: Ciasteczka Google, adres IP.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-4">
              <AccordionTrigger>4. Okres przechowywania danych</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Twoje dane przechowujemy przez następujące okresy:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Dane użytkownika: Przez okres korzystania z Aplikacji oraz 2 lata od ostatniego logowania.</li>
                  <li>Hasła: Do momentu usunięcia przez użytkownika lub 2 lata po zamknięciu konta.</li>
                  <li>Próby logowania: 2 lata od daty próby.</li>
                  <li>Logowania w rozszerzeniu: 5 lat od daty logowania.</li>
                  <li>Tokeny resetowania hasła: Do momentu wygaśnięcia tokenu (np. 24 godziny).</li>
                  <li>Zaufane urządzenia: Do momentu usunięcia urządzenia przez użytkownika lub zamknięcia konta.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-5">
              <AccordionTrigger>5. Odbiorcy danych</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Twoje dane mogą być przekazywane:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Podmiotom świadczącym usługi hostingu i analityki (np. dostawcy serwerów).</li>
                  <li>
                    Google (reCAPTCHA) - dane mogą być przekazywane do USA na podstawie{' '}
                    <a
                      href="https://www.dataprivacyframework.gov/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      Data Privacy Framework
                    </a>.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-6">
              <AccordionTrigger>6. Twoje prawa</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Masz prawo do:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Dostępu, sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych, sprzeciwu.</li>
                  <li>Cofnięcia zgody w dowolnym momencie (jeśli dotyczy).</li>
                  <li>Wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-7">
              <AccordionTrigger>7. Bezpieczeństwo danych</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Stosujemy następujące środki bezpieczeństwa:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Szyfrowanie end-to-end dla haseł (Masterkey).</li>
                  <li>Szyfrowanie transmisji danych (HTTPS).</li>
                  <li>Ciasteczka HTTP-only dla tokenów uwierzytelniających.</li>
                  <li>reCAPTCHA dla ochrony przed botami.</li>
                  <li>Regularne audyty bezpieczeństwa.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-8">
              <AccordionTrigger>8. Ciasteczka i technologie</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Używamy:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Ciasteczek HTTP-only do przechowywania tokenów uwierzytelniających (niezbędne do logowania).</li>
                  <li>LocalStorage/SessionStorage do danych sesji (usuwane po wylogowaniu).</li>
                  <li>
                    reCAPTCHA - zobacz{' '}
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      Politykę prywatności Google
                    </a>.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-9">
              <AccordionTrigger>9. Przekazywanie danych do państw trzecich</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Dane mogą być przekazywane do USA (Google reCAPTCHA) na podstawie{' '}
                  <a
                    href="https://www.dataprivacyframework.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    Data Privacy Framework
                  </a>. Stosujemy odpowiednie zabezpieczenia, takie jak standardowe klauzule umowne.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="section-10">
              <AccordionTrigger>10. Kontakt</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  W sprawach ochrony danych pisz na:{' '}
                  <a href="mailto:support@securebox.com" className="text-indigo-600 hover:underline">
                    support@securebox.com
                  </a>.
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

export default PrivacyPolicyPage;