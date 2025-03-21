import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {  Plus } from "lucide-react";
import { useState, useEffect } from "react"; 
import { AddPasswordDialog } from "./AddPasswordDialog";
import { usePasswordContext } from "../data/PasswordContext";

export default function RecentlyAdded() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { state } = usePasswordContext();

  useEffect(() => {
    
  }, [state.history, state.passwords]);

  // Sortowanie historii po timestampie (od najnowszych) i filtrowanie istniejących kont
  const sortedHistory = [...state.history]
    .filter((item) =>
      state.passwords.some(
        (p) => p.platform === item.platform && p.login === item.login
      )
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  

  const getTimeDifference = (timestamp: string) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(timestamp).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "Dzisiaj" : `${diffDays} dni`;
  };


  const getStrengthInfo = (strength: number) => {
    if (strength >= 80) return { text: "Silna", color: "text-purple-700" };
    if (strength >= 60) return { text: "Dobra", color: "text-purple-500" };
    if (strength >= 40) return { text: "Średnia", color: "text-purple-400" };
    return { text: "Słaba", color: "text-purple-300" };
  };

  return (
    <div className="p-6 pt-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Ostatnio użyte</h2>
        <AddPasswordDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
        <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Nowy
        </Button>
      </div>

      <div className="space-y-4">
        {sortedHistory.length > 0 ? (
          sortedHistory.map((item) => {
            const strengthInfo = getStrengthInfo(item.strength);
            const passwordEntry = state.passwords.find(
              (p) => p.platform === item.platform && p.login === item.login
            );
            const logo = passwordEntry?.logo || "https://static.vecteezy.com/system/resources/previews/013/948/544/non_2x/gmail-logo-on-transparent-white-background-free-vector.jpg";

            return (
              <div key={item.id} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <img src={logo} alt={item.platform} className="w-12 h-12 rounded-full" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">{item.platform}</p>
                    <p className="text-sm text-gray-500">
                      {item.login} • {getTimeDifference(item.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <p className={`text-sm font-medium ${strengthInfo.color}`}>
                    {strengthInfo.text}
                  </p>
                  <Progress value={item.strength} className="w-32 h-2 bg-gray-200" />
                </div>

                
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">Brak ostatnio dodanych lub odczytanych haseł dla istniejących kont.</p>
        )}
      </div>
    </div>
  );
}