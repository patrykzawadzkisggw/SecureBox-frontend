import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DevicePhoneMobileIcon, InformationCircleIcon, GlobeAltIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import api from '@/lib/api';

/**
 * Strona autoryzacji urządzenia dla aplikacji SecureBox.
 * Umożliwia użytkownikowi potwierdzenie dostępu dla nowego urządzenia na podstawie identyfikatora urządzenia (`deviceId`) i informacji o przeglądarce (`userAgent`) przekazanych w parametrach URL.
 * Wyświetla informacje o urządzeniu (przeglądarka, system operacyjny, typ urządzenia) i pozwala na autoryzację poprzez API.
 * Pokazuje komunikaty o sukcesie lub błędzie po próbie autoryzacji.
 *
 * @function DeviceAuthPage
 * @returns {JSX.Element} Strona autoryzacji urządzenia z kartą informacyjną i przyciskiem autoryzacji.
 *
 * @example
 * ```tsx
 * import { BrowserRouter, Route, Routes } from "react-router-dom";
 * import { DeviceAuthPage } from "@/pages/DeviceAuthPage";
 *
 * const App = () => (
 *   <BrowserRouter>
 *     <Routes>
 *       <Route path="/authorize-device/:deviceId/:userAgent" element={<DeviceAuthPage />} />
 *     </Routes>
 *   </BrowserRouter>
 * );
 *
 * export default App;
 * ```
 *
 * @remarks
 * - **Zależności**: Wymaga `react` (`useEffect`, `useState`), `react-router-dom` (`useParams`), komponentów UI (`Button`, `Card`, `Alert`) z `@/components/ui`, ikon z `@heroicons/react/24/outline`, oraz klienta API (`api`) z `@/lib/api`.
 * - **Routing**: Oczekuje ścieżki `/authorize-device/:deviceId/:userAgent`, gdzie `deviceId` to unikalny identyfikator urządzenia, a `userAgent` to ciąg informacji o przeglądarce (zakodowany w URL).
 * - **Stan lokalny**:
 *   - `deviceInfo`: Obiekt z informacjami o urządzeniu (`browser`, `os`, `device`), parsowany z `userAgent`.
 *   - `status`: Stan autoryzacji (`null`, `'success'`, `'error'`) do wyświetlania komunikatów.
 *   - `message`: Tekst komunikatu o wyniku autoryzacji.
 * - **Parsowanie User-Agent**:
 *   - Funkcja `parseUserAgent` rozpoznaje popularne przeglądarki (Chrome, Firefox, Safari), systemy operacyjne (Windows, Mac OS, Android, iOS) i typ urządzenia (mobilne lub komputer).
 *   - Domyślne wartości (`Nieznana przeglądarka`, `Nieznany system`, `Nieznane urządzenie`) są ustawiane dla nierozpoznanych ciągów.
 * - **API**: Wywołuje `api.post('/authorize-device')` z danymi `deviceId` i `userAgent`. Oczekuje odpowiedzi z kodem 2xx dla sukcesu lub błędu z polem `message` w odpowiedzi (np. dla kodu 4xx/5xx).
 * - **Stylizacja**: Używa Tailwind CSS (np. `min-h-screen`, `bg-gradient-to-br`, `bg-gray-800`, `text-white`) dla responsywnego i nowoczesnego wyglądu. Karta ma maksymalną szerokość `max-w-md` i gradientowe tło strony.
 * - **Dostępność**:
 *   - Nagłówki (`CardTitle`, `CardDescription`) i komunikaty (`Alert`) są czytelne dla czytników ekranu.
 *   - Ikony Heroicons (`DevicePhoneMobileIcon`, `GlobeAltIcon`, `InformationCircleIcon`) powinny mieć `aria-hidden="true"` lub `aria-label` dla lepszej dostępności.
 *   - Przycisk autoryzacji jest wyłączany po sukcesie (`disabled`), co zapobiega wielokrotnym kliknięciom.
 *   - Rozważ dodanie `aria-live="polite"` do `Alert` dla dynamicznych komunikatów.
 * - **Bezpieczeństwo**:
 *   - `deviceId` i `userAgent` są pobierane z URL i dekodowane (`decodeURIComponent`) przed użyciem.
 *   - API powinno weryfikować `deviceId` i `userAgent` po stronie serwera, aby zapobiec nieautoryzowanym autoryzacjom.
 *   - Klient API (`api`) powinien obsługiwać bezpieczne połączenia (HTTPS) i odpowiednie nagłówki autoryzacyjne (np. tokeny).
 * - **Testowanie**: Komponent jest testowalny z `@testing-library/react`. Mockuj `useParams`, `api.post`, i komponenty UI. Testuj parsowanie `userAgent`, renderowanie informacji o urządzeniu, działanie przycisku, oraz wyświetlanie komunikatów sukcesu/błędu. Zobacz `tests/pages/DeviceAuthPage.test.tsx` (jeśli istnieje).
 * - **Przekierowanie**: Komponent nie obsługuje automatycznego przekierowania po autoryzacji, ale komunikat sugeruje zamknięcie przeglądarki. Rozważ użycie `useNavigate` z `react-router-dom` dla płynniejszej nawigacji (np. do strony logowania po sukcesie).
 * - **Rozszerzalność**: Strona może być rozszerzona o dodatkowe informacje (np. lokalizacja urządzenia) lub opcje (np. odrzucenie autoryzacji).
 */
const DeviceAuthPage = () => {
  // Pobieranie parametrów z URL
  const { deviceId, userAgent } = useParams();

  // Parsowanie User-Agent
  const [deviceInfo, setDeviceInfo] = useState({
    browser: 'Nieznana przeglądarka',
    os: 'Nieznany system',
    device: 'Nieznane urządzenie',
  });

  // Stan do zarządzania komunikatami
  const [status, setStatus] = useState<null | 'success' | 'error'>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Proste parsowanie User-Agent
    const parseUserAgent = (ua :any) => {
   
      let browser = 'Nieznana przeglądarka';
      let os = 'Nieznany system';
      let device = 'Nieznane urządzenie';

      if (ua.includes('Chrome')) browser = 'Google Chrome';
      else if (ua.includes('Firefox')) browser = 'Mozilla Firefox';
      else if (ua.includes('Safari')) browser = 'Apple Safari';

      if (ua.includes('Windows')) os = 'Windows';
      else if (ua.includes('Mac OS')) os = 'Mac OS';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iOS')) os = 'iOS';

      if (ua.includes('Mobile')) device = 'Urządzenie mobilne';
      else device = 'Komputer';

      return { browser, os, device };
    };

    setDeviceInfo(parseUserAgent(decodeURIComponent(userAgent || navigator.userAgent)));
  }, [userAgent]);

  // Funkcja do autoryzacji urządzenia
  const handleAuthorize = async () => {
    try {
      const response = await api.post('/authorize-device', {
        deviceId,
        userAgent: decodeURIComponent(userAgent || navigator.userAgent),
      });

      setStatus('success');
      setMessage('Urządzenie zostało pomyślnie autoryzowane. Możesz teraz zamknąć przeglądarkę.');
    } catch (error) {
      setStatus('error');
      let errorMessage = 'Wystąpił błąd podczas autoryzacji urządzenia. Możesz teraz zamknąć przeglądarkę.';
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = (error as any).response;
        if (typeof response === 'object' && response !== null && 'data' in response) {
          const data = response.data;
          if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') {
            errorMessage = data.message;
          }
        }
      }
      setMessage(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">
            Autoryzacja urządzenia
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Potwierdź dostęp dla urządzenia o ID: {deviceId || 'Nieznane urządzenie'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status && (
            <Alert
              variant={status === 'success' ? 'default' : 'destructive'}
              className={status === 'success' ? 'bg-green-900/50 border-green-700' : 'bg-red-900/50 border-red-700'}
            >
              {status === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              )}
              <AlertTitle className="text-white">
                {status === 'success' ? 'Sukces' : 'Błąd'}
              </AlertTitle>
              <AlertDescription className="text-gray-300">{message}</AlertDescription>
            </Alert>
          )}
          <div className="flex items-center space-x-3">
            <DevicePhoneMobileIcon className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-gray-300">Urządzenie</p>
              <p className="text-lg font-semibold text-white">{deviceInfo.device}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <GlobeAltIcon className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-gray-300">Przeglądarka</p>
              <p className="text-lg font-semibold text-white">{deviceInfo.browser}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <InformationCircleIcon className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-gray-300">System operacyjny</p>
              <p className="text-lg font-semibold text-white">{deviceInfo.os}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
            onClick={handleAuthorize}
            disabled={status === 'success'} // Wyłącz przycisk po udanej autoryzacji
          >
            Autoryzuj
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DeviceAuthPage;