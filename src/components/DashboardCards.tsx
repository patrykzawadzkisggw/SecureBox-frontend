import { Link } from "react-router-dom";
import { Lock,  CircleGauge, Wand } from "lucide-react";
import { AddPasswordDialog } from "./AddPasswordDialog";
import { useState } from "react";
import { usePasswordContext } from "../data/PasswordContext";

export default function DashboardCards() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { state } = usePasswordContext();


  const calculateAverageStrength = () => {
    if (state.history.length === 0) return 0; // Jeśli brak danych, zwracamy 0%
    const totalStrength = state.history.reduce((sum, item) => sum + item.strength, 0);
    return Math.round(totalStrength / state.history.length); // Zaokrąglamy do pełnych procentów
  };

  const averageStrength = calculateAverageStrength();
  return (
    <div className="grid md:grid-cols-3 gap-6 p-6 grid-cols-1">
      
      <AddPasswordDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
        <div onClick={() => setIsDialogOpen(true)} className="bg-purple-50 p-6 rounded-xl  flex flex-col items-center justify-between h-48 transition hover:shadow-lg cursor-pointer">
          <div className="bg-purple-600 text-white p-2 rounded-lg">
            <Lock className="w-6 h-6" />
          </div>
          <p className="text-lg font-semibold text-gray-800 text-center">Dodaj nowe hasło</p>
        </div>
      

      <Link to="/genpass" className="group">
        <div className="bg-white p-6 rounded-xl  flex flex-col items-center justify-between h-48 transition hover:shadow-lg">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Wand className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex -space-x-2">
            
          </div>
          <p className="text-lg font-semibold text-gray-800 text-center">Generuj hasło</p>
        </div>
      </Link>

      <div className="bg-purple-50 p-6 rounded-xl  flex flex-col items-center justify-between h-48">
        <div className="relative w-20 h-20">
          <CircleGauge className="w-20 h-20 text-purple-600" />
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800">{averageStrength}%</span>
        </div>
        <p className="text-lg font-semibold text-gray-800 text-center">Średnia jakość hasła</p>
      </div>
    </div>
  );
}
