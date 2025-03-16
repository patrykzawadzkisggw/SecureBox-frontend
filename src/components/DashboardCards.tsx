import { Link } from "react-router-dom";
import { Lock, Users, CircleGauge, Wand } from "lucide-react";
import { AddPasswordDialog } from "./AddPasswordDialog";
import { useState } from "react";

export default function DashboardCards() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {/* Karta - Dodaj nowe hasło */}
      
      <AddPasswordDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
        <div onClick={() => setIsDialogOpen(true)} className="bg-purple-50 p-6 rounded-xl  flex flex-col items-center justify-between h-48 transition hover:shadow-lg cursor-pointer">
          <div className="bg-purple-600 text-white p-2 rounded-lg">
            <Lock className="w-6 h-6" />
          </div>
          <p className="text-lg font-semibold text-gray-800 text-center">Dodaj nowe hasło</p>
        </div>
      

      {/* Karta - Aktywni użytkownicy */}
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

      {/* Karta - Średnia jakość hasła (nie link) */}
      <div className="bg-purple-50 p-6 rounded-xl  flex flex-col items-center justify-between h-48">
        <div className="relative w-20 h-20">
          <CircleGauge className="w-20 h-20 text-purple-600" />
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800">87%</span>
        </div>
        <p className="text-lg font-semibold text-gray-800 text-center">Średnia jakość hasła</p>
      </div>
    </div>
  );
}
