import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Plus } from "lucide-react";
import { useState } from "react";
import { AddPasswordDialog } from "./AddPasswordDialog";

const items = [
  {
    name: "InvisionApp",
    email: "mw@newsite.com",
    time: "2 dni",
    image: "https://cdn.prod.website-files.com/5d66bdc65e51a0d114d15891/64cebc6c19c2fe31de94c78e_X-vector-logo-download.png",
    logo: "https://cdn.prod.website-files.com/5d66bdc65e51a0d114d15891/64cebc6c19c2fe31de94c78e_X-vector-logo-download.png",
    strength: "Silna",
    strengthColor: "text-purple-700",
    progress: 80,
  },
  {
    name: "Dribbble",
    email: "ja@newsite.com",
    time: "3 dni",
    image: "https://cdn.prod.website-files.com/5d66bdc65e51a0d114d15891/64cebc6c19c2fe31de94c78e_X-vector-logo-download.png",
    logo: "https://cdn.prod.website-files.com/5d66bdc65e51a0d114d15891/64cebc6c19c2fe31de94c78e_X-vector-logo-download.png",
    strength: "Dobra",
    strengthColor: "text-purple-500",
    progress: 60,
  },
  {
    name: "Behance",
    email: "jj@newsite.com",
    time: "3 dni",
    image: "https://cdn.prod.website-files.com/5d66bdc65e51a0d114d15891/64cebc6c19c2fe31de94c78e_X-vector-logo-download.png",
    logo: "https://cdn.prod.website-files.com/5d66bdc65e51a0d114d15891/64cebc6c19c2fe31de94c78e_X-vector-logo-download.png",
    strength: "Średnia",
    strengthColor: "text-purple-400",
    progress: 40,
  },
];

export default function RecentlyAdded() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
  return (
    <div className="p-6">
      {/* Nagłówek */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Ostatnio dodane</h2>
        <AddPasswordDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
        <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Nowy
        </Button>
      </div>

      {/* Lista elementów */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between space-x-4">
            {/* Logo + info */}
            <div className="flex items-center space-x-4">
              <img src={item.logo} alt={item.name} className="w-12 h-12 rounded-full" />
              <div>
                <p className="text-lg font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">{item.email} • {item.time}</p>
              </div>
            </div>

            {/* Siła + pasek postępu */}
            <div className="flex-1 flex flex-col items-center">
              <p className={`text-sm font-medium ${item.strengthColor}`}>{item.strength}</p>
              <Progress value={item.progress} className="w-32 h-2 bg-gray-200" />
            </div>

            

            {/* Opcje */}
            <MoreVertical className="text-gray-500 cursor-pointer" />
          </div>
        ))}
      </div>
    </div>
  );
}
