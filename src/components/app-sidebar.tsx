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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = usePasswordContext(); 

  const data = {
    teams: [
      {
        name: state.currentUser
          ? `${state.currentUser.first_name} ${state.currentUser.last_name}` 
          : "Brak użytkownika", 
        logo: Command,
        plan: "Enterprise",
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
        badge: "10",
      },
    ],
  };

  return (
    <Sidebar className="border-r-0 select-none" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent></SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}