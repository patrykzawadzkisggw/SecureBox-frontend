import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePasswordContext } from "../data/PasswordContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const { state, updateUser } = usePasswordContext();
  const currentUser = state.currentUser;
    const navigate = useNavigate();
  const [firstName, setFirstName] = useState(currentUser?.first_name || "");
  const [lastName, setLastName] = useState(currentUser?.last_name || "");
  const [password, setPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.first_name);
      setLastName(currentUser.last_name);
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;

    setIsSaving(true);
    try {
      await updateUser(
        currentUser.id,
        firstName !== currentUser.first_name ? firstName : undefined,
        lastName !== currentUser.last_name ? lastName : undefined,
        undefined, 
        password || undefined 
      );
      setPassword(""); 
      setIsEditing(false);
      toast.success("Profil zaktualizowany!", {
        description: "Zmiany zostały zapisane.",
        duration: 3000,
      });
    } catch (error) {
     
    } finally {
      setIsSaving(false);
        navigate("/settings");
    }
  };

  if (state.loading) {
    return <div className="text-center">Ładowanie danych użytkownika...</div>;
  }

  if (!currentUser) {
    return <div className="text-center">Brak danych użytkownika.</div>;
  }

  return (
    <div className="w-full max-w-md">
     
      <>
        <div className="space-y-4">
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="login" className="text-right">
              Login
            </Label>
            <Input
              id="login"
              value={currentUser.login}
              className="col-span-3"
              disabled
            />
          </div>

          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              Imię
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="col-span-3"
              disabled={!isEditing || isSaving}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              Nazwisko
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="col-span-3"
              disabled={!isEditing || isSaving}
            />
          </div>

          {isEditing && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Nowe hasło
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                placeholder="Wprowadź nowe hasło (opcjonalne)"
                disabled={isSaving}
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  className="select-none"
                  onClick={() => {
                    setFirstName(currentUser.first_name);
                    setLastName(currentUser.last_name);
                    setPassword("");
                    setIsEditing(false);
                  }}
                  disabled={isSaving}
                >
                  Anuluj
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="select-none">
                  {isSaving ? "Zapisywanie..." : "Zapisz"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="select-none">Edytuj</Button>
            )}
          </div>
        </div>
      </>
    </div>
  );
}