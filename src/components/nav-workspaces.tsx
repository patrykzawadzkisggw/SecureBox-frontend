import { ChevronRight, MoreHorizontal, Plus } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

/**
 * Komponent nawigacji przestrzeni roboczych.
 * Korzysta z komponentów `Collapsible` i `SidebarGroup`.
 */
export function NavWorkspaces({
  workspaces,
}: {
  workspaces: {
    name: string
    emoji: React.ReactNode
    pages: {
      name: string
      emoji: React.ReactNode
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {workspaces.map((workspace) => (
            <Collapsible key={workspace.name}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <span>
                    <span>{workspace.emoji}</span>
                    <span>{workspace.name}</span>
                  </span>
                </SidebarMenuButton>
                <CollapsibleTrigger asChild>
                  <SidebarMenuAction
                    className="bg-sidebar-accent text-sidebar-accent-foreground left-2 data-[state=open]:rotate-90"
                    showOnHover
                  >
                    <ChevronRight />
                  </SidebarMenuAction>
                </CollapsibleTrigger>
                <SidebarMenuAction showOnHover>
                  <Plus />
                </SidebarMenuAction>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {workspace.pages.map((page) => (
                      <SidebarMenuSubItem key={page.name}>
                        <SidebarMenuSubButton asChild>
                          <span>
                            <span>{page.emoji}</span>
                            <span>{page.name}</span>
                          </span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <MoreHorizontal />
              <span>More</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
