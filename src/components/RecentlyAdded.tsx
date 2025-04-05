import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { AddPasswordDialog } from "./AddPasswordDialog";
import { usePasswordContext } from "../data/PasswordContext";
import { extractDomain } from "@/lib/functions";
import { findIconUrl } from "@/lib/icons";
import { Skeleton } from "@/components/ui/skeleton";


const getRandomColor = (platform: string) => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9B59B6",
    "#3498DB",
  ];
  const hash = platform.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getInitials = (platform: string) => {
  const words = platform.split(" ");
  if (words.length > 1) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return platform.slice(0, 2).toUpperCase();
};

export default function RecentlyAdded() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { state } = usePasswordContext();
  const [isLoadingIcons, setIsLoadingIcons] = useState(false);


  useEffect(() => {
    const iconUrls = state.history
      .map((item) => findIconUrl(item.platform))
      .filter(Boolean) as string[];

    if (iconUrls.length === 0) {
      setIsLoadingIcons(false);
      return;
    }

    setIsLoadingIcons(true);
    let loadedCount = 0;
    const totalIcons = iconUrls.length;

    const handleLoad = () => {
      loadedCount += 1;
      if (loadedCount === totalIcons) {
        setIsLoadingIcons(false); 
      }
    };

    iconUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = handleLoad;
      img.onerror = handleLoad; 
    });
  }, [state.history]);


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
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Nowy
        </Button>
      </div>

      <div className="space-y-4">
        {sortedHistory.length > 0 ? (
          sortedHistory.map((item) => {
            const strengthInfo = getStrengthInfo(item.strength);
            const logo = findIconUrl(item.platform);

            return (
              <div
                key={item.id}
                className="flex items-center justify-between space-x-4"
              >
                <div className="flex items-center space-x-4">
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    {logo ? (
                      <>
                        <Skeleton
                          className="w-12 h-12 rounded-full absolute top-0 left-0"
                          style={{
                            opacity: isLoadingIcons ? 1 : 0,
                            transition: "opacity 0.3s ease-in-out",
                          }}
                        />
                        <img
                          src={logo}
                          alt={item.platform}
                          className="w-12 h-12 rounded-full select-none absolute top-0 left-0"
                          style={{
                            opacity: isLoadingIcons ? 0 : 1,
                            transition: "opacity 0.3s ease-in-out",
                          }}
                        />
                      </>
                    ) : (
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          backgroundColor: getRandomColor(item.platform),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "18px",
                          fontWeight: "bold",
                        }}
                        className="select-none"
                      >
                        {getInitials(item.platform)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {extractDomain(item.platform)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.login} • {getTimeDifference(item.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-end">
                  <p
                    className={`text-sm font-medium ${strengthInfo.color} text-right`}
                  >
                    {strengthInfo.text}
                  </p>
                  <Progress
                    value={item.strength}
                    className="w-32 h-2 bg-gray-200"
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">
            Brak ostatnio dodanych lub odczytanych haseł dla istniejących kont.
          </p>
        )}
      </div>
    </div>
  );
}