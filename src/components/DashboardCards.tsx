import { Link } from "react-router-dom";
import { Lock, CircleGauge, Wand } from "lucide-react";
import { AddPasswordDialog } from "./AddPasswordDialog";
import { useState } from "react";
import { PasswordHistory, PasswordTable } from "../data/PasswordContext";
import { calculateAverageStrength } from "@/lib/functions";



/**
 * Komponent wyświetlający zestaw kart nawigacyjnych na pulpicie nawigacyjnym.
 * Zawiera karty do dodawania hasła, generowania hasła oraz wyświetlania średniej jakości haseł.
 * 
 * @function DashboardCards
 * @param {Object} props - Właściwości komponentu.
 * @param {(password: string, platform: string, login: string) => Promise<void>} props.addPassword - Funkcja zapisująca nowe hasło.
 * @param {PasswordHistory[]} props.history - Tablica historii haseł użytkownika.
 * @param {PasswordTable[]} props.passwords - Tablica zapisanych haseł użytkownika.
 * @returns {JSX.Element} Zestaw trzech kart nawigacyjnych na pulpicie.
 * 
 * @example
 * ```tsx
 * import DashboardCards from '@/components/DashboardCards';
 * 
 * const addPassword = async (password: string, platform: string, login: string) => {
 *   console.log({ password, platform, login });
 * };
 * const history = [{ "id": "https://int.pl/#/login-clear-mail@int.pl","platform": "https://int.pl/#/login-clear","login": "mail@int.pl","strength": 100,"timestamp": "2025-04-25T15:07:10.160Z" }];
 * const passwords = [{ "id": "12402267-23f4-471d-b4a8-665b42951af6","passwordfile": "2c1983cb.txt","logo": "https://img.freepik.com/darmowe-wektory/nowy-projekt-ikony-x-logo-twittera-2023_1017-45418.jpg?semt=ais_hybrid","platform": "https://int.pl/#/login-clear","login": "mail@int.pl","userId": "67eb5b5d-4b18-482c-a338-f761e5086811"}];
 * 
 * <DashboardCards addPassword={addPassword} history={history} passwords={passwords} />
 * ```
 * 
 * @remarks
 * - Karta "Dodaj nowe hasło" otwiera dialog `AddPasswordDialog` po kliknięciu.
 * - Karta "Generuj hasło" jest linkiem do `/genpass` (używa `react-router-dom`).
 * - Karta "Średnia jakość hasła" wyświetla wartość procentową obliczoną przez `calculateAverageStrength`.
 * - Komponent używa ikon z biblioteki `lucide-react` dla elementów wizualnych.
 * - Stylizacja kart obejmuje efekty przejścia i cieniowania przy najechaniu kursorem.
 * 
 * @see {@link AddPasswordDialog} - Komponent dialogu dodawania hasła.
 * @see {@link https://reactrouter.com} - Dokumentacja biblioteki `react-router-dom`.
 * @see {@link https://lucide.dev} - Dokumentacja biblioteki `lucide-react` dla ikon.
 * @see {@link PasswordHistory} - Interfejs `PasswordHistory`.
 * @see {@link PasswordTable} - Interfejs `PasswordTable`.
 * @see {@link calculateAverageStrength} - Funkcja `calculateAverageStrength`.
 */
export default function DashboardCards({addPassword, history, passwords} : {addPassword: (password: string, platform: string, login: string) => Promise<void>, history: PasswordHistory[], passwords: PasswordTable[]}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const averageStrength = calculateAverageStrength(history, passwords);
  return (
    <div className="grid md:grid-cols-3 gap-6 p-6 grid-cols-1 select-none">
      <AddPasswordDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} onSubmit={addPassword}/>
      <div
        onClick={() => setIsDialogOpen(true)}
        className="bg-purple-50 p-6 rounded-xl flex flex-col items-center justify-between h-48 transition hover:shadow-lg cursor-pointer"
      >
        <div className="bg-purple-600 text-white p-2 rounded-lg">
          <Lock className="w-6 h-6" />
        </div>
        <p className="text-lg font-semibold text-gray-800 text-center">Dodaj nowe hasło</p>
      </div>

      <Link to="/genpass" className="group">
        <div className="bg-slate-50 p-6 rounded-xl flex flex-col items-center justify-between h-48 transition hover:shadow-lg">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Wand className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex -space-x-2"></div>
          <p className="text-lg font-semibold text-gray-800 text-center">Generuj hasło</p>
        </div>
      </Link>

      <div className="bg-purple-50 p-6 rounded-xl flex flex-col items-center justify-between h-48">
        <div className="relative w-20 h-20">
          <CircleGauge className="w-20 h-20 text-purple-600" />
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800">
            {averageStrength}%
          </span>
        </div>
        <p className="text-lg font-semibold text-gray-800 text-center">Średnia jakość hasła</p>
      </div>
    </div>
  );
}