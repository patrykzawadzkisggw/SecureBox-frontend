import { useLocation } from "react-router-dom";
import { type LucideIcon } from "lucide-react";
import { Link } from 'react-router-dom'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

/**
 * Komponent nawigacji głównej aplikacji.
 * Renderuje menu boczne z elementami nawigacyjnymi, korzystając z `react-router-dom` do zarządzania routingiem.
 * Każdy element menu zawiera ikonę i tytuł, a aktywny element jest wyróżniany na podstawie aktualnej ścieżki URL.
 *
 * @function NavMain
 * @param {Object} props - Właściwości komponentu.
 * @param {Array<Object>} props.items - Lista elementów nawigacyjnych.
 * @returns {JSX.Element} Komponent menu bocznego z elementami nawigacyjnymi.
 *
 * @example
 * ```tsx
 * import { Home, Settings } from "lucide-react";
 * import { NavMain } from "@/components/NavMain";
 *
 * const navItems = [
 *   { title: "Strona główna", url: "/", icon: Home },
 *   { title: "Ustawienia", url: "/settings", icon: Settings },
 * ];
 *
 * <NavMain items={navItems} />
 * ```
 */
export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const location = useLocation(); 

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = location.pathname === item.url; 

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link to={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
