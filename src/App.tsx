import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import GenPasswordPage from "./pages/GenPasswordPage";
import SettingsPage from "./pages/SettingsPage";
import PasswordsPage from "./pages/PasswordsPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import { usePasswordContext } from "./data/PasswordContext";
import { JSX } from "react";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { resetPasswordFn } from "./lib/fn2";
import DeviceAuthPage from "./pages/DeviceAuthPage";
import TermsOfService from "./components/TermsOfService";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { state } = usePasswordContext();
  const isAuthenticated = !!state.token && state.token.length > 2;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const UnProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { state } = usePasswordContext();
  const isAuthenticated = !!state.token && state.token.length > 2;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};


/**
 * Komponent główny aplikacji SecureBox.
 * Definiuje strukturę routingu aplikacji przy użyciu `react-router-dom`, obsługując chronione i niechronione trasy.
 * Wykorzystuje kontekst `PasswordContext` do sprawdzania stanu autoryzacji użytkownika (`state.token`) w celu ochrony tras.
 * Zawiera trasy dla logowania, rejestracji, strony głównej, generowania haseł, zarządzania hasłami, ustawień, autoryzacji urządzenia, resetowania hasła, regulaminu, polityki prywatności oraz strony 404.
 *
 * @function App
 * @returns {JSX.Element} Komponent główny z routerem i trasami aplikacji.
 *
 * @example
 * ```tsx
 * import App from "./App";
 *
 * // W pliku głównym aplikacji (np. main.tsx)
 * import { StrictMode } from "react";
 * import { createRoot } from "react-dom/client";
 *
 * const root = createRoot(document.getElementById("root")!);
 * root.render(
 *   <StrictMode>
 *     <App />
 *   </StrictMode>
 * );
 * ```
 *
 * @remarks
 * - **Zależności**: Wymaga `react-router-dom` (`BrowserRouter`, `Routes`, `Route`, `Navigate`), kontekstu `usePasswordContext`, komponentów stron (`LoginPage`, `HomePage`, `GenPasswordPage`, `SettingsPage`, `PasswordsPage`, `NotFoundPage`, `RegisterPage`, `ResetPasswordPage`, `DeviceAuthPage`, `PrivacyPolicyPage`), komponentu `TermsOfService`, funkcji `resetPasswordFn` z `@/lib/fn2`, oraz typu `JSX` z `react`.
 * - **Routing**:
 *   - Używa `BrowserRouter` dla routingu po stronie klienta.
 *   - Trasy są zdefiniowane w komponencie `Routes` z użyciem `Route` dla każdej ścieżki.
 *   - Chronione trasy (`/`, `/genpass`, `/passwords`, `/settings`, `/auth/:deviceId/:userAgent`) są owinięte w `ProtectedRoute`, który wymaga ważnego tokena autoryzacyjnego.
 *   - Niechronione trasy (`/login`, `/register`) są owinięte w `UnProtectedRoute`, który przekierowuje zalogowanych użytkowników na stronę główną.
 *   - Publiczne trasy (`/reset-password/:id`, `/termsofservice`, `/privacy`) oraz trasa 404 (`*`) nie wymagają autoryzacji.
 * - **Komponenty tras**:
 *   - `/login`: `LoginPage` dla logowania użytkownika.
 *   - `/register`: `RegisterPage` dla rejestracji nowego użytkownika.
 *   - `/`: `HomePage` jako strona główna z pulpitem nawigacyjnym.
 *   - `/genpass`: `GenPasswordPage` dla generowania haseł.
 *   - `/passwords`: `PasswordsPage` dla zarządzania hasłami.
 *   - `/settings`: `SettingsPage` dla ustawień użytkownika.
 *   - `/auth/:deviceId/:userAgent`: `DeviceAuthPage` dla autoryzacji urządzeń.
 *   - `/reset-password/:id`: `ResetPasswordPage` dla resetowania hasła, wymaga funkcji `resetPasswordFn`.
 *   - `/termsofservice`: `TermsOfService` dla regulaminu.
 *   - `/privacy`: `PrivacyPolicyPage` dla polityki prywatności.
 *   - `*`: `NotFoundPage` dla nieistniejących tras.
 * - **Ochrona tras**:
 *   - `ProtectedRoute`: Sprawdza, czy `state.token` istnieje i ma długość większą niż 2. Jeśli użytkownik nie jest zalogowany, przekierowuje na `/login`.
 *   - `UnProtectedRoute`: Przekierowuje zalogowanych użytkowników na `/`, umożliwiając dostęp do `/login` i `/register` tylko niezalogowanym użytkownikom.
 * - **Kontekst**: Używa `usePasswordContext` do uzyskania `state.token` dla weryfikacji autoryzacji. Token powinien być bezpiecznie przechowywany (np. w ciasteczkach HTTP-only) i walidowany po stronie serwera.
 * - **Stylizacja**: Nie definiuje własnych stylów, ale dziedziczy style z komponentów stron (np. Tailwind CSS w `PageTemplate` lub innych komponentach).
 * - **Dostępność**:
 *   - Router zapewnia nawigację zgodną z dostępnością (np. poprzez `aria-current` dla aktywnych tras), ale każdy komponent strony powinien być przetestowany pod kątem ARIA i obsługi klawiatury.
 *   - `Navigate` używa `replace` dla przekierowań, co zapobiega zapisywaniu niepotrzebnych wpisów w historii przeglądarki.
 * - **Bezpieczeństwo**:
 *   - Autoryzacja opiera się na `state.token`. Upewnij się, że token jest bezpiecznie przechowywany i weryfikowany po stronie serwera dla każdej chronionej trasy.
 *   - Trasa `/reset-password/:id` wymaga bezpiecznego tokena resetowania hasła, obsługiwanego przez `resetPasswordFn`.
 *   - Trasa `/auth/:deviceId/:userAgent` przesyła wrażliwe dane w URL; rozważ użycie bezpieczniejszych metod (np. token w ciele żądania).
 * - **API**: Komponent nie wykonuje bezpośrednich żądań API, ale przekazuje `resetPasswordFn` do `ResetPasswordPage`. Inne strony (np. `LoginPage`, `HomePage`) mogą wykonywać żądania przez kontekst `PasswordContext`.
 * - **Testowanie**: Komponent jest testowalny z `@testing-library/react` i `react-router-dom`. Mockuj `usePasswordContext`, komponenty stron, oraz `resetPasswordFn`. Testuj przekierowania w `ProtectedRoute` i `UnProtectedRoute`, renderowanie odpowiednich stron dla każdej trasy, oraz obsługę strony 404. Zobacz `tests/App.test.tsx` (jeśli istnieje).
 * - **Przekierowanie**:
 *   - `ProtectedRoute` przekierowuje niezalogowanych użytkowników na `/login`.
 *   - `UnProtectedRoute` przekierowuje zalogowanych użytkowników na `/`.
 *   - Trasa 404 (`NotFoundPage`) obsługuje wszystkie niezdefiniowane ścieżki.
 * - **Rozszerzalność**:
 *   - Nowe trasy można łatwo dodać, definiując kolejne `Route` w `Routes`.
 *   - `ProtectedRoute` i `UnProtectedRoute` mogą być rozszerzone o dodatkowe warunki (np. role użytkownika).
 *   - Aplikacja może zostać zintegrowana z dynamicznym ładowaniem tras (lazy loading) dla lepszej wydajności.
 */
export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <UnProtectedRoute>
              <LoginPage />
            </UnProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <UnProtectedRoute>
              <RegisterPage />
            </UnProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/genpass"
          element={
            <ProtectedRoute>
              <GenPasswordPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passwords"
          element={
            <ProtectedRoute>
              <PasswordsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/auth/:deviceId/:userAgent"
          element={
            <ProtectedRoute>
              <DeviceAuthPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reset-password/:id"
          element={
            <ResetPasswordPage resetPasswordFn={resetPasswordFn} />
          }
        />
        <Route
          path="/termsofservice"
          element={
            <TermsOfService />
          }
        />
        <Route
          path="/privacy"
          element={
            <PrivacyPolicyPage />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}