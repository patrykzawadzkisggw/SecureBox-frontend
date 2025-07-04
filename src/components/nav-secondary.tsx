import React from "react"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom"

/**
 * Komponent nawigacji drugorzędnej aplikacji.
 * Renderuje grupę elementów menu bocznego z opcjonalnymi odznakami (badges), korzystając z komponentów `SidebarGroup` i `Link` z `react-router-dom`.
 * Każdy element menu zawiera ikonę, tytuł oraz opcjonalną odznakę, a nawigacja jest realizowana poprzez linki.
 *
 * @function NavSecondary
 * @param {React.ReactNode} [props.items[].badge] - Opcjonalna odznaka wyświetlana obok elementu menu.
 * @param {React.ComponentPropsWithoutRef<typeof SidebarGroup>} [props] - Dodatkowe właściwości przekazywane do komponentu `SidebarGroup`.
 * @returns {JSX.Element} Komponent grupy menu bocznego z elementami nawigacyjnymi.
 *
 * @example
 * ```tsx
 * import { Calendar, Mail } from "lucide-react";
 * import { NavSecondary } from "@/components/NavSecondary";
 *
 * const navItems = [
 *   { title: "Kalendarz", url: "/calendar", icon: Calendar, badge: 5 },
 *   { title: "Poczta", url: "/mail", icon: Mail },
 * ];
 *
 * <NavSecondary items={navItems} className="mt-4" />
 * ```
 */
export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    badge?: React.ReactNode
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
