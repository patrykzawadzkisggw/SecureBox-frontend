import * as React from "react";
import {
  Blocks,
  Command,
  Home,
  Settings2,
  Sparkles,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePasswordContext } from "@/data/PasswordContext";

/**
 * Typ danych dla bocznego paska nawigacyjnego.
 * @typedef {Object} SidebarData
 * @property {{name: string, logo: React.ComponentType, plan: string}[]} teams - Lista zespołów wyświetlanych w TeamSwitcher.
 * @property {{title: string, url: string, icon: React.ComponentType, isActive?: boolean, badge?: string}[]} navMain - Lista głównych elementów nawigacyjnych.
 */

/**
 * Komponent bocznego paska nawigacyjnego aplikacji.
 * Korzysta z kontekstu haseł (`usePasswordContext`) oraz komponentów `TeamSwitcher` i `NavMain`.
 * @function AppSidebar
 * @param {React.ComponentProps<typeof Sidebar>} props - Właściwości komponentu Sidebar.
 * @returns {JSX.Element} Boczny pasek nawigacyjny z przełącznikiem zespołów i główną nawigacją.
 * @example
 * ```tsx
 * import { AppSidebar } from '@/components/AppSidebar';
 * <AppSidebar collapsible="icon" />
 * ```
 * @see {@link usePasswordContext} - Kontekst haseł
 * @see {@link TeamSwitcher} - Komponent TeamSwitcher
 * @see {@link NavMain} - Komponent NavMain
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, logout } = usePasswordContext();

  const data = {
    teams: [
      {
        name: state.currentUser
          ? `${state.currentUser.first_name} ${state.currentUser.last_name}`
          : "Brak użytkownika",
        logo: Command,
      },
    ],
    navMain: [
      {
        title: "Główna",
        url: "/",
        icon: Home,
        isActive: true,
      },
      {
        title: "Hasła",
        url: "/passwords",
        icon: Blocks,
      },
      {
        title: "Generuj hasło",
        url: "/genpass",
        icon: Sparkles,
      },
      {
        title: "Ustawienia",
        url: "/settings",
        icon: Settings2,
      },
    ],
  };

  return (
    <Sidebar className="border-r-0 select-none" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} logout={logout} currentUser={state.currentUser}/>
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent></SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}