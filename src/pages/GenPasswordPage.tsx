import { AppSidebar } from "@/components/app-sidebar"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ClipboardCopy, RefreshCcw } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
export default function GenPasswordPage() {
    const [password, setPassword] = useState("");
  const [length, setLength] = useState(12);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const generatePassword = () => {
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_-+=<>?/{}[]";
    let characters = letters;
    if (includeNumbers) characters += numbers;
    if (includeSymbols) characters += symbols;

    let newPassword = "";
    for (let i = 0; i < length; i++) {
      newPassword += characters[Math.floor(Math.random() * characters.length)];
    }
    setPassword(newPassword);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
    } catch (error) {
      console.error("Błąd kopiowania:", error);
    }
  };
  return (

    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    Manager haseł
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-3">
           
          </div>
        </header>
        <div className="flex justify-center">
  <div className="flex flex-1 flex-col gap-4 px-4 py-10 max-w-4xl">
  <div className="flex items-center justify-center  p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Generator Haseł</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input value={password} readOnly className="flex-1" />
            <Button variant="outline" size="icon" >
              <ClipboardCopy className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <span>Długość: {length}</span>
            <Slider
              defaultValue={[12]}
              min={6}
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

          <Button className="w-full" >
            <RefreshCcw className="w-5 h-5 mr-2" />
            Generuj hasło
          </Button>
        </CardContent>
      </Card>
    </div>


  </div>
</div>


      </SidebarInset>
    </SidebarProvider>
  )
}
