import { useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios, { AxiosResponse } from "axios";
import { isTokenExpired2, isValidToken, ResetPasswordFormValues, resetPasswordSchema } from "@/lib/validators";



/**
 * Strona resetowania hasła.
 * Umożliwia użytkownikowi zmianę hasła za pomocą tokena resetowania (`resetToken`) i opcjonalnego parametru wygaśnięcia (`exp`) przesłanych przez URL.
 * Wykorzystuje formularz z walidacją (zod) do wprowadzenia nowego hasła i jego potwierdzenia.
 * Sprawdza ważność tokena i jego wygaśnięcie, wyświetla komunikaty o błędach lub sukcesie.
 * Po udanej zmianie hasła umożliwia przekierowanie do strony logowania.
 *
 * @function ResetPasswordPage
 * @param {Object} props - Właściwości komponentu.
 * @param {Function} props.resetPasswordFn - Funkcja wysyłająca żądanie API do zmiany hasła. Przyjmuje token resetowania i nowe hasło, zwraca odpowiedź Axios.
 * @returns {JSX.Element} Strona resetowania hasła z formularzem lub komunikatami o sukcesie/błędzie.
 *
 * @example
 * ```tsx
 * import { BrowserRouter, Route, Routes } from "react-router-dom";
 * import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
 * import axios from "axios";
 *
 * const resetPasswordFn = async (resetToken, newPassword) => {
 *   return axios.post("/api/reset-password", { resetToken, newPassword });
 * };
 *
 * const App = () => (
 *   <BrowserRouter>
 *     <Routes>
 *       <Route
 *         path="/reset-password/:id"
 *         element={<ResetPasswordPage resetPasswordFn={resetPasswordFn} />}
 *       />
 *     </Routes>
 *   </BrowserRouter>
 * );
 *
 * export default App;
 * ```
 *
 * @remarks
 * - **Zależności**: Wymaga `react-router-dom` (`useParams`, `useSearchParams`), `react-hook-form`, `@hookform/resolvers/zod`, `zod`, `axios` oraz komponentów UI (`Button`, `Form`, `Input`).
 * - **Routing**: Oczekuje ścieżki `/reset-password/:id` z `id` jako `resetToken`. Parametr `exp` (ISO 8601, np. `2025-04-27T12:34:56.789Z`) jest opcjonalny i przesyłany jako query string (`?exp=`).
 * - **Walidacja**: Schemat `resetPasswordSchema` wymaga hasła (min. 8 znaków, wielka litera, mała litera, cyfra, znak specjalny) i zgodnego potwierdzenia hasła.
 * - **API**: `resetPasswordFn` musi zwracać odpowiedź Axios z kodem 200 dla sukcesu lub błędami (np. 401 dla wygasłego tokena). Komponent obsługuje błędy Axios i generyczne.
 * - **Stylizacja**: Używa Tailwind CSS (np. `min-h-screen`, `bg-gray-100`, `rounded-lg`) dla responsywnego układu.
 * - **Dostępność**: Formularz zawiera etykiety (`FormLabel`) i komunikaty błędów (`FormMessage`). Zaleca się dodanie `aria-live="polite"` do komunikatów błędów dla czytników ekranu.
 * - **Bezpieczeństwo**: Token jest walidowany przez `isValidToken` (klient) i `resetPasswordFn` (serwer). Wygaśnięcie tokena sprawdzane przez `isTokenExpired2` (klient) i serwer (401). Zawsze weryfikuj token po stronie serwera.
 * - **Przekierowanie**: Używa `window.location.href` dla przekierowań. Rozważ `useNavigate` z `react-router-dom` dla płynniejszej nawigacji.
 * - **Testowanie**: Komponent jest testowalny z `@testing-library/react`. Mockuj `resetPasswordFn`, `isValidToken`, `isTokenExpired2` i komponenty UI. Zobacz `tests/pages/ResetPasswordPage.test.tsx`.
 */
export const ResetPasswordPage = ({resetPasswordFn} : {resetPasswordFn: (resetToken: string | undefined, newPassword: any) => Promise<AxiosResponse<any, any>>}) => {
  const { id: resetToken } = useParams<{ id: string }>();

  const [searchParams] = useSearchParams();
  const exp = searchParams.get("exp");



  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);



  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsTokenExpired(false); 

    try {

      const response = await resetPasswordFn(resetToken, data.newPassword);
      
      if (response.status === 200) {
        setIsSuccess(true);
        console.log("Hasło zostało zaktualizowane pomyślnie.");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const message = error.response.data.error || "Wystąpił błąd podczas zmiany hasła";

        if (status === 401) {
          setIsTokenExpired(true);
        } else {
          setErrorMessage(message); 
        }
      } else {
        setErrorMessage("Wystąpił nieoczekiwany błąd");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!resetToken || !isValidToken(resetToken)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-500 text-lg">Invalid or missing token</div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Sukces!</h2>
          <p className="text-gray-700">Hasło zostało pomyślnie zmienione.</p>
          <Button
            variant="link"
            className="mt-4"
            onClick={() => window.location.href = "/login"}
          >
            Przejdź do logowania
          </Button>
        </div>
      </div>
    );
  }

  if (isTokenExpired || isTokenExpired2(exp)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Błąd</h2>
          <p className="text-gray-700">Token resetu hasła wygasł lub został już użyty.</p>
          <Button
            variant="link"
            className="mt-4"
            onClick={() => window.location.href = "/"}
          >
            Strona główna
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Zmień hasło</h2>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errorMessage}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nowe hasło</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Wprowadź nowe hasło"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potwierdź hasło</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Potwierdź nowe hasło"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Zmieniam..." : "Zmień hasło"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};