import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ClipboardCopy, RefreshCcw } from "lucide-react";
import generator from "generate-password-browser";
import { toast, Toaster } from "sonner";
import { useState } from "react";
import PageTemplate from "./PageTemplate"; 

export default function GenPasswordPage() {
  const [password, setPassword] = useState<string>("");
  const [length, setLength] = useState(12);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const generatePassword = () => {
    const newPassword = generator.generate({
      length: length,
      numbers: includeNumbers,
      symbols: includeSymbols,
      uppercase: true,
      lowercase: true,
      excludeSimilarCharacters: true,
      strict: true,
    });
    setPassword(newPassword);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success("Sukces!", {
        description: "Hasło zostało skopiowane do schowka.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Błąd kopiowania:", error);
      toast.error("Błąd!", {
        description: "Wystąpił błąd podczas kopiowania hasła.",
        duration: 3000,
      });
    }
  };

  return (
    <PageTemplate title="Manager haseł - Generator">
      <div className="flex justify-center select-none">
        <div className="flex flex-1 flex-col gap-4 px-4 py-10 max-w-4xl">
          <div className="flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg rounded-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold">Generator Haseł</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input value={password} readOnly className="flex-1" />
                  <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    <ClipboardCopy className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>Długość: {length}</span>
                  <Slider
                    defaultValue={[12]}
                    min={8}
                    max={30}
                    step={1}
                    onValueChange={(value) => setLength(value[0])}
                    className="w-32"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>Cyfry</span>
                  <Switch checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
                </div>

                <div className="flex items-center justify-between">
                  <span>Znaki specjalne</span>
                  <Switch checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
                </div>

                <Button className="w-full" onClick={generatePassword}>
                  <RefreshCcw className="w-5 h-5 mr-2" />
                  Generuj hasło
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Toaster />
    </PageTemplate>
  );
}