import * as React from "react"
import { ChevronDown, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

/**
 * Komponent przełącznika zespołów w bocznym pasku nawigacyjnym.
 * Wyświetla menu rozwijane z listą zespołów, umożliwiając wybór aktywnego zespołu oraz wylogowanie.
 * 
 * @function TeamSwitcher
 * @param {TeamSwitcherProps} props - Właściwości komponentu.
 * @param {{name: string, logo: React.ElementType}[]} props.teams - Lista zespołów do wyświetlenia w menu.
 * @param {() => void} props.logout - Funkcja wywoływana przy wylogowaniu.
 * @param {any} props.currentUser - Obiekt użytkownika, zawierający dane takie jak imię i nazwisko.
 * @returns {JSX.Element | null} Menu rozwijane z przełącznikiem zespołów lub null, jeśli brak aktywnych zespołów.
 * 
 * @example
 * ```tsx
 * import { TeamSwitcher } from '@/components/TeamSwitcher';
 * import { Command } from 'lucide-react';
 * 
 * const teams = [
 *   { name: 'Abc Xyz', logo: Command },
 * ];
 * const logout = () => console.log('Wylogowano');
 * const currentUser = { first_name: 'Abc', last_name: 'Xyz' };
 * 
 * <TeamSwitcher teams={teams} logout={logout} currentUser={currentUser} />
 * ```
 * 
 * @remarks
 * - Komponent używa `DropdownMenu` z biblioteki UI do renderowania menu rozwijanego.
 * - Aktywny zespół jest przechowywany w stanie lokalnym za pomocą `useState`.
 * - Jeśli lista `teams` jest pusta lub brak aktywnego zespołu, komponent zwraca `null`.
 * - Ikony zespołów (`logo`) są renderowane jako komponenty React (np. ikony z `lucide-react`).
 * - Nazwa użytkownika (`currentUser.first_name` i `currentUser.last_name`) jest wyświetlana w przycisku menu, jeśli użytkownik istnieje.
 * - Funkcja `logout` jest wywoływana po kliknięciu opcji "Wyloguj".
 * - Komponent integruje się z `SidebarMenu` i `SidebarMenuButton` dla spójnego wyglądu w bocznym pasku.
 * 
 * @see {@link https://lucide.dev} - Biblioteka ikon `lucide-react` dla ikon `ChevronDown` i `LogOut`.
 */
export function TeamSwitcher({
  teams,logout, currentUser
}: {
  teams: {
    name: string
    logo: React.ElementType
  }[], logout: () => void, currentUser: any
}) {
  
  const [activeTeam, setActiveTeam] = React.useState(teams[0])
  if (!activeTeam) {
    return null
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-fit px-1.5">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-5 items-center justify-center rounded-md">
                <activeTeam.logo className="size-3" />
              </div>
              <span className="truncate font-medium">{currentUser?.first_name + " "+ currentUser?.last_name}</span>
              <ChevronDown className="opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Konto
            </DropdownMenuLabel>
            {teams.map((team, ) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-xs border">
                  <team.logo className="size-4 shrink-0" />
                </div>
                {team.name}
                
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" onClick={() => {logout()}}>
              <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                <LogOut className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium" >Wyloguj</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
