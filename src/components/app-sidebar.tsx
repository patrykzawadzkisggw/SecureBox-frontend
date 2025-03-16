import * as React from "react"
import {
  AudioWaveform,
  Blocks,
  Calendar,
  Command,
  Home,
  Inbox,
  MessageCircleQuestion,
  Search,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  teams: [
    {
      name: "Abc xyz",
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
  
  
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        
        
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
