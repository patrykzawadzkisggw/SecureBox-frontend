import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { AddPasswordDialog } from "./AddPasswordDialog";
import { PasswordHistory, PasswordTable } from "../data/PasswordContext";
import { extractDomain, getInitials, getRandomColor, getStrengthInfo, getTimeDifference } from "@/lib/functions";
import { findIconUrl } from "@/lib/icons";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Komponent wyświetlający listę ostatnio użytych haseł użytkownika.
 * Pokazuje do 5 najnowszych haseł z informacjami o platformie, loginie, sile hasła i czasie użycia.
 * Umożliwia dodanie nowego hasła poprzez dialog `AddPasswordDialog`.
 * 
 * @function RecentlyAdded
 * @param {Object} props - Właściwości komponentu.
 * @param {PasswordHistory[]} props.data - Tablica historii haseł użytkownika.
 * @param {(password: string, platform: string, login: string) => Promise<void>} props.addPassword - Funkcja zapisująca nowe hasło.
 * @param {PasswordTable[]} props.passwords - Tablica haseł użytkownika.
 * @returns {JSX.Element} Lista ostatnio użytych haseł lub komunikat o braku danych.
 * 
 * @example
 * ```tsx
 * import RecentlyAdded from '@/components/RecentlyAdded';
 * 
 * const data = [
 *   {
 *     id: 1,
 *     platform: "https://example.com",
 *     login: "user@example.com",
 *     strength: 80,
 *     timestamp: "2025-04-25T13:24:47.961Z",
 *   },
 * ];
 * const passwords = [{id: 5;passwordfile: "plik.txt";logo: "logo.png";platform: "https://example.com";login: "user@example.com"}]
 * const addPassword = async (password: string, platform: string, login: string) => {
 *   console.log({ password, platform, login });
 * };
 * 
 * <RecentlyAdded data={data} addPassword={addPassword} passwords={passwords}/>
 * ```
 * 
 * @remarks
 * - Komponent sortuje hasła według daty (od najnowszych) i wyświetla maksymalnie 5.
 * - Dla każdej platformy próbuje załadować ikonę za pomocą `findIconUrl`. Jeśli ikona nie istnieje, wyświetla inicjały platformy na losowym tle (`getInitials`, `getRandomColor`).
 * - Siła hasła jest wyświetlana jako pasek postępu (`Progress`) z etykietą i kolorem zależnym od wartości (`getStrengthInfo`).
 * - Pole `platform` jest formatowane za pomocą `extractDomain` (np. "example.com" z "https://example.com").
 * - Czas użycia jest obliczany względem bieżącej daty (`getTimeDifference`).
 * - Podczas ładowania ikon wyświetlane są szkielety (`Skeleton`) dla płynnego UX.
 * - Komponent używa ikony `Plus` z biblioteki `lucide-react` dla przycisku dodawania hasła.
 * 
 * @see {@link AddPasswordDialog} - Komponent dialogu dodawania hasła.
 * @see {@link PasswordHistory} - Interfejs `PasswordHistory`.
 * @see {@link extractDomain} - Funkcja `extractDomain`.
 * @see {@link findIconUrl} - Funkcja `findIconUrl`.
 * @see {@link https://lucide.dev} - Dokumentacja biblioteki `lucide-react` dla ikon.
 */
export default function RecentlyAdded({ data, addPassword, passwords}: { data: PasswordHistory[], addPassword : (password: string, platform: string, login: string) => Promise<void>, passwords: PasswordTable[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingIcons, setIsLoadingIcons] = useState(false);


  useEffect(() => {
    const iconUrls = data
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
  }, [data]);


  const sortedHistory = [...data]
    .filter((item) =>
      passwords.some(
        (p) => p.platform === item.platform && p.login === item.login
      )
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 pt-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Ostatnio użyte</h2>
        <AddPasswordDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} onSubmit={addPassword}/>
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