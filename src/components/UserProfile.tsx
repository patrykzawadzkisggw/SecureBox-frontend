import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {  User } from "../data/PasswordContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/**
 * Komponent profilu użytkownika do edycji danych osobowych i hasła.
 * Umożliwia wyświetlanie i edytowanie imienia, nazwiska oraz opcjonalną zmianę hasła użytkownika.
 * Zawiera walidację danych wejściowych i integrację z powiadomieniami.
 *
 * @function UserProfile
 * @param {UserProfileProps} props - Właściwości komponentu.
 * @param {(userId: string, first_name?: string, last_name?: string, login?: string, password?: string) => Promise<void>} props.updateUser - Funkcja aktualizująca dane użytkownika.
 * @param {User | null} props.currentUser - Obiekt bieżącego użytkownika lub null, jeśli brak danych.
 * @param {boolean} props.loading - Flaga wskazująca, czy dane użytkownika są w trakcie ładowania.
 * @returns {JSX.Element} Formularz profilu użytkownika z polami do edycji danych.
 *
 * @example
 * ```tsx
 * import UserProfile from '@/components/UserProfile';
 *
 * const updateUser = async (userId, first_name, last_name, login, password) => {
 *   console.log('Zaktualizowano użytkownika:', { userId, first_name, last_name, password });
 * };
 * const currentUser = { id: '1', login: 'user@example.com', first_name: 'Jan', last_name: 'Kowalski' };
 *
 * <UserProfile updateUser={updateUser} currentUser={currentUser} loading={false} />
 * ```
 *
 * @remarks
 * - Komponent używa `Input`, `Button` i `Label` z biblioteki UI do renderowania formularza.
 * - Walidacja obejmuje:
 *   - Imię i nazwisko: niepuste, minimum 3 litery, brak cyfr.
 *   - Hasło (jeśli podane): minimum 8 znaków, zawiera literę, cyfrę i znak specjalny.
 * - Błędy walidacji są wyświetlane pod polami z czerwoną ramką i komunikatami.
 * - Stan edycji (`isEditing`) kontroluje, czy pola są edytowalne.
 * - Funkcja `updateUser` jest wywoływana tylko po pomyślnej walidacji.
 * - Powiadomienia (`toast`) informują o sukcesie lub błędach podczas zapisywania.
 * - Po zapisaniu zmian użytkownik jest przekierowywany na stronę `/settings`.
 * - Pole login jest wyświetlane, ale nieedytowalne.
 * - Przy anulowaniu edycji przywracane są pierwotne dane i czyszczone błędy.
 * - Stan ładowania jest kontrolowany przez prop `loading`, który wyświetla komunikat o ładowaniu, gdy jest `true`.
 *
 * @see {@link User} - Definicja typu `User`.
 */
export default function UserProfile({ updateUser, currentUser, loading }: { updateUser: (userId: string, first_name?: string, last_name?: string, login?: string, password?: string) => Promise<void>, currentUser: User | null, loading: boolean }) {
 const navigate = useNavigate();
 const [firstName, setFirstName] = useState(currentUser?.first_name || "");
 const [lastName, setLastName] = useState(currentUser?.last_name || "");
 const [password, setPassword] = useState("");
 const [isEditing, setIsEditing] = useState(false);
 const [isSaving, setIsSaving] = useState(false);
 const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; password?: string }>({});

 React.useEffect(() => {
 if (currentUser) {
 setFirstName(currentUser.first_name);
 setLastName(currentUser.last_name);
 }
 }, [currentUser]);

 const validateForm = () => {
 const newErrors: { firstName?: string; lastName?: string; password?: string } = {};


 if (!firstName) {
 newErrors.firstName = "Imię jest wymagane";
 } else if (firstName.length < 3) {
 newErrors.firstName = "Imię musi mieć co najmniej 3 litery";
 } else if (/\d/.test(firstName)) {
 newErrors.firstName = "Imię nie może zawierać cyfr";
 }

 if (!lastName) {
 newErrors.lastName = "Nazwisko jest wymagane";
 } else if (lastName.length < 3) {
 newErrors.lastName = "Nazwisko musi mieć co najmniej 3 litery";
 } else if (/\d/.test(lastName)) {
 newErrors.lastName = "Nazwisko nie może zawierać cyfr";
 }

 if (password) {
 if (password.length < 8) {
 newErrors.password = "Hasło musi mieć co najmniej 8 znaków";
 } else if (!/[A-Za-z]/.test(password)) {
 newErrors.password = "Hasło musi zawierać przynajmniej jedną literę";
 } else if (!/\d/.test(password)) {
 newErrors.password = "Hasło musi zawierać przynajmniej jedną cyfrę";
 } else if (!/[!@#$%^&*]/.test(password)) {
 newErrors.password = "Hasło musi zawierać przynajmniej jeden znak specjalny";
 }
 }

 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 const handleSave = async () => {
 if (!currentUser) return;

 if (!validateForm()) {
 toast.error("Popraw błędy w formularzu");
 return;
 }

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
 toast.error("Wystąpił błąd podczas zapisywania");
 } finally {
 setIsSaving(false);
 navigate("/settings");
 }
 };

 if (loading) {
 return <div className="text-center">Ładowanie danych użytkownika...</div>;
 }

 if (!currentUser) {
 return <div className="text-center">Brak danych użytkownika.</div>;
 }

 return (
 <div className="w-full max-w-md">
 <div className="space-y-4">
 <div className="grid grid-cols-4 items-center gap-4">
 <Label htmlFor="login" className="text-right">
 Login
 </Label>
 <Input id="login" value={currentUser.login} className="col-span-3" disabled />
 </div>

 <div className="grid grid-cols-4 items-center gap-4">
 <Label htmlFor="firstName" className="text-right">
 Imię
 </Label>
 <div className="col-span-3">
 <Input
 id="firstName"
 value={firstName}
 onChange={(e) => setFirstName(e.target.value)}
 className={errors.firstName ? "border-red-500" : ""}
 disabled={!isEditing || isSaving}
 />
 {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>} 
 </div>
 </div>

 <div className="grid grid-cols-4 items-center gap-4">
 <Label htmlFor="lastName" className="text-right">
 Nazwisko
 </Label>
 <div className="col-span-3">
 <Input
 id="lastName"
 value={lastName}
 onChange={(e) => setLastName(e.target.value)}
 className={errors.lastName ? "border-red-500" : ""}
 disabled={!isEditing || isSaving}
 />
 {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
 </div>
 </div>

 {isEditing && (
 <div className="grid grid-cols-4 items-center gap-4">
 <Label htmlFor="password" className="text-right">
 Nowe hasło
 </Label>
 <div className="col-span-3">
 <Input
 id="password"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className={errors.password ? "border-red-500" : ""}
 placeholder="Wprowadź nowe hasło (opcjonalne)"
 disabled={isSaving}
 />
 {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
 </div>
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
 setErrors({});
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
 <Button onClick={() => setIsEditing(true)} className="select-none">
 Edytuj
 </Button>
 )}
 </div>
 </div>
 </div>
 );
}