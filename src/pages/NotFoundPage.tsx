import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
    const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6 text-center">
      <div className="animate-fade-in flex flex-col items-center space-y-4">
        <Ghost className="h-16 w-16 text-gray-500" />
        <h1 className="text-4xl font-bold text-gray-800">404 - Strona nie znaleziona</h1>
        <p className="text-gray-600">
          Wygląda na to, że strona, której szukasz, nie istnieje.
        </p>
        <Button variant="default" onClick={() => navigate("/")}>
          Wróć na stronę główną
        </Button>
      </div>
    </div>
  );
}
