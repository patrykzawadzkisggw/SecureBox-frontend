import { Link } from "react-router-dom";
import { Lock, CircleGauge, Wand } from "lucide-react";
import { AddPasswordDialog } from "./AddPasswordDialog";
import { useState } from "react";
import { usePasswordContext } from "../data/PasswordContext";

/**
 * Oblicza średnią siłę haseł na podstawie historii haseł.
 * @function calculateAverageStrength
 * @param {ReturnType<typeof usePasswordContext>["state"]} state - Stan kontekstu haseł.
 * @returns {number} Średnia siła haseł w procentach (0-100).
 * @example
 * ```tsx
 * const state = { history: [{ platform: "test", login: "user", strength: 80 }], passwords: [{ platform: "test", login: "user" }] };
 * const strength = calculateAverageStrength(state); // Wynik: 80
 * ```
 */
export const calculateAverageStrength = (state: ReturnType<typeof usePasswordContext>["state"]): number => {
  if (state.history.length === 0) return 0;
  const hist = [...state.history].filter((item) =>
    state.passwords.some(
      (p) => p.platform === item.platform && p.login === item.login
    )
  );
  const totalStrength = hist.reduce((sum, item) => sum + item.strength, 0);
  return Math.round(totalStrength / hist.length);
};

/**
 * Komponent wyświetlający karty na pulpicie nawigacyjnym.
 * Korzysta z kontekstu haseł (`usePasswordContext`) oraz komponentu `AddPasswordDialog`.
 * @function DashboardCards
 * @returns {JSX.Element} Zestaw kart nawigacyjnych na pulpicie.
 * @example
 * ```tsx
 * import DashboardCards from './DashboardCards';
 * <DashboardCards />
 * ```
 * @see {@link "../data/PasswordContext"} - Kontekst haseł
 * @see {@link "./AddPasswordDialog"} - Komponent dialogu dodawania hasła
 * @see {@link "react-router-dom"} - Biblioteka routingu
 * @see {calculateAverageStrength} - Funkcja obliczająca średnią siłę haseł
 */
export default function DashboardCards() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { state } = usePasswordContext();

  const averageStrength = calculateAverageStrength(state);
  return (
    <div className="grid md:grid-cols-3 gap-6 p-6 grid-cols-1 select-none">
      <AddPasswordDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
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