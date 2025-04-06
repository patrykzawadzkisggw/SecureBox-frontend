import { useLocation } from "react-router-dom";
import { type LucideIcon } from "lucide-react";
import { Link } from 'react-router-dom'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

/**
 * Komponent nawigacji głównej.
 * Korzysta z `useLocation` i `Link` z `react-router-dom`.
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
