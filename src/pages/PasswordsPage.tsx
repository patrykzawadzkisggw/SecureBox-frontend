import { DataTable } from "@/components/DataTable";
import PageTemplate from "./PageTemplate";
import { usePasswordContext } from "@/data/PasswordContext";

/**
 * Strona zarządzania hasłami dla aplikacji SecureBox.
 * Wyświetla listę haseł użytkownika w tabeli danych (`DataTable`) i umożliwia ich dodawanie, aktualizację, usuwanie oraz kopiowanie do schowka.
 * Wykorzystuje kontekst `PasswordContext` do zarządzania hasłami i stanem aplikacji.
 * Jest owinięta w szablon `PageTemplate` dla spójnego układu.
 *
 * @function PasswordsPage
 * @returns {JSX.Element} Strona z tabelą haseł i nagłówkiem.
 *
 * @example
 * ```tsx
 * import { PasswordsPage } from "@/pages/PasswordsPage";
 *
 * // W kontekście aplikacji z zaimplementowanym PasswordContext
 * <PasswordsPage />
 * ```
 *
 * @remarks
 * - **Zależności**: Wymaga komponentu `DataTable`, szablonu `PageTemplate` oraz kontekstu `usePasswordContext` z `@/data/PasswordContext`.
 * - **Kontekst**: Używa `usePasswordContext` do uzyskania:
 *   - `state`: Zawiera dane aplikacji, w tym `passwords` (lista haseł) i `loading` (stan ładowania).
 *   - `addPassword`: Funkcja dodająca nowe hasło.
 *   - `copyToClipboard`: Funkcja kopiująca hasło do schowka.
 *   - `setMasterkey`: Funkcja ustawiająca masterkey.
 *   - `updatePassword`: Funkcja aktualizująca istniejące hasło.
 *   - `deletePassword`: Funkcja usuwająca hasło.
 * - **Układ**:
 *   - Strona jest owinięta w `PageTemplate` z tytułem „Manager haseł”.
 *   - Treść jest wyśrodkowana w kontenerze o maksymalnej szerokości `max-w-4xl` z paddingiem (`px-4 py-10`).
 *   - Nagłówek (`h1`) zawiera tytuł „Hasła” z klasą `select-none` zapobiegającą zaznaczaniu tekstu.
 *   - Tabela danych (`DataTable`) wyświetla hasła i obsługuje interakcje użytkownika.
 * - **Stylizacja**: Używa Tailwind CSS (np. `flex`, `gap-4`, `max-w-4xl`, `text-3xl`, `select-none`) dla responsywnego układu i czytelnego wyglądu.
 * - **Dostępność**:
 *   - Nagłówek (`h1`) jest czytelny dla czytników ekranu.
 *   - Klasa `select-none` na nagłówku może utrudniać zaznaczanie tekstu dla niektórych użytkowników; rozważ jej ograniczone użycie.
 *   - Upewnij się, że `DataTable` zawiera odpowiednie atrybuty ARIA (np. `aria-label` dla akcji, `role="grid"` dla tabeli) – do zweryfikowania w dokumentacji `DataTable`.
 * - **Bezpieczeństwo**:
 *   - Hasła są zarządzane przez `PasswordContext`, który powinien zapewniać szyfrowanie (np. za pomocą masterkey).
 *   - Funkcja `copyToClipboard` musi być zabezpieczona przed nieautoryzowanym dostępem do schowka (np. działa tylko po akcji użytkownika).
 *   - Funkcje `addPassword`, `updatePassword`, `deletePassword` powinny być zabezpieczone po stronie serwera, np. poprzez walidację tokena autoryzacyjnego.
 * - **API**: Komponent nie wykonuje bezpośrednich żądań API, ale przekazuje funkcje kontekstu (`addPassword`, `updatePassword`, `deletePassword`) do `DataTable`, które prawdopodobnie komunikują się z serwerem.
 * - **Testowanie**: Komponent jest testowalny z `@testing-library/react`. Mockuj `usePasswordContext` i `DataTable`. Testuj renderowanie nagłówka, tabeli, oraz przekazywanie propsów do `DataTable`. Zobacz `tests/pages/PasswordsPage.test.tsx` (jeśli istnieje).
 * - **Przekierowanie**: Komponent nie obsługuje bezpośredniej nawigacji, ale może współpracować z routerem aplikacji poprzez `PageTemplate` lub akcje w `DataTable`.
 * - **Rozszerzalność**: Struktura pozwala na dodanie nowych elementów UI (np. filtry nad tabelą) lub rozszerzenie `DataTable` o dodatkowe funkcjonalności (np. sortowanie, wyszukiwanie).
 */
export default function PasswordsPage() {
  const {state,addPassword, copyToClipboard,setMasterkey,updatePassword,deletePassword} = usePasswordContext();
  return (
    <PageTemplate title="Manager haseł">
      <div className="flex justify-center">
        <div className="flex flex-1 flex-col gap-4 px-4 py-10 max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight select-none">Hasła</h1>
          <DataTable passwords={state.passwords} loading={state.loading} addPassword={addPassword } copyToClipboard={copyToClipboard} setMasterkey={setMasterkey} updatePassword={updatePassword} deletePassword={deletePassword} state={state} />
        </div>
      </div>
    </PageTemplate>
  );
}