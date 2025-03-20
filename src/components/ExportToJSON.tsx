import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { usePasswordContext } from "../data/PasswordContext";
import { toast } from "sonner";

export default function ExportToJSON() {
  const { state } = usePasswordContext();
  const [isExporting, setIsExporting] = useState(false);

  const exportToJSON = async () => {
    setIsExporting(true);
    try {
      if (!state.zip || state.passwords.length === 0) {
        throw new Error("Brak danych do eksportu");
      }

      const jsonData = [];
      for (const entry of state.passwords) {
        const password = await state.zip.file(entry.passwordfile)?.async("string");
        if (!password) {
          console.warn(`Nie znaleziono hasła dla ${entry.platform}/${entry.login}`);
          continue;
        }
        jsonData.push({
          platform: entry.platform,
          login: entry.login,
          password: password.trim(),
        });
      }

      const jsonString = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `passwords_export_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Eksport zakończony!", {
        description: "Plik JSON z hasłami został pobrany.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Błąd podczas eksportu do JSON:", error);
      toast.error("Błąd!", {
        description: "Nie udało się wyeksportować haseł do JSON.",
        duration: 3000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={exportToJSON}
      disabled={isExporting || state.loading || state.passwords.length === 0}
    >
      <Download className="w-4 h-4" />
      {isExporting ? "Eksportowanie..." : "Eksportuj do JSON"}
    </Button>
  );
}