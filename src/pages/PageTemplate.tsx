import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ReactNode } from "react";

/**
 * Interfejs właściwości komponentu `PageTemplate`.
 *
 * @interface PageTemplateProps
 * @property {string} title - Tytuł strony wyświetlany w nawigacji okruszkowej.
 * @property {ReactNode} children - Zawartość strony renderowana w obszarze `SidebarInset`.
 * @property {ReactNode} [headerActions] - Opcjonalne akcje nagłówka (np. przyciski) wyświetlane po prawej stronie nagłówka.
 */
export interface PageTemplateProps {
  title: string;
  children: ReactNode; 
  headerActions?: ReactNode; 
}

/**
 * Szablon strony aplikacji.
 * Zapewnia spójny układ strony z bocznym paskiem nawigacyjnym (`AppSidebar`), nagłówkiem zawierającym nawigację okruszkową (`Breadcrumb`)
 * oraz opcjonalne akcje nagłówka. Zawartość strony jest renderowana w obszarze `SidebarInset`, zapewniając responsywny układ zintegrowany z paskiem bocznym.
 * Komponent korzysta z `SidebarProvider` do zarządzania stanem paska bocznego oraz komponentów `SidebarTrigger` i `Separator` dla interakcji i stylizacji.
 *
 * @function PageTemplate
 * @param {PageTemplateProps} props - Właściwości komponentu.
 * @param {string} props.title - Tytuł strony wyświetlany w nawigacji okruszkowej.
 * @param {ReactNode} props.children - Zawartość strony renderowana w obszarze `SidebarInset`.
 * @param {ReactNode} [props.headerActions] - Opcjonalne akcje nagłówka (np. przyciski) wyświetlane po prawej stronie nagłówka.
 * @returns {JSX.Element} Szablon strony z paskiem bocznym, nawigacją okruszkową i zawartością.
 *
 * @example
 * ```tsx
 * import PageTemplate from "@/components/PageTemplate";
 * import { Button } from "@/components/ui/button";
 *
 * const MyPage = () => (
 *   <PageTemplate
 *     title="Moja Strona"
 *     headerActions={<Button variant="outline">Wyloguj</Button>}
 *   >
 *     <div>Zawartość mojej strony</div>
 *   </PageTemplate>
 * );
 *
 * export default MyPage;
 * ```
 *
 * @remarks
 * - Komponent używa Tailwind CSS do stylizacji (np. `flex`, `px-3`, `h-14`, `line-clamp-1`).
 * - `AppSidebar` i komponenty `ui/sidebar` muszą być zdefiniowane i poprawnie skonfigurowane w aplikacji.
 * - Nawigacja okruszkowa (`Breadcrumb`) wyświetla tylko jeden element (`title`). Dla bardziej złożonych ścieżek nawigacyjnych należy rozszerzyć komponent.
 * - Dostępność: `BreadcrumbPage` używa `line-clamp-1` dla obcięcia tekstu, co może wpływać na czytniki ekranu. Rozważ dodanie atrybutów ARIA, jeśli wymagana jest pełna dostępność.
 * - Komponent zakłada, że `SidebarProvider` zarządza stanem paska bocznego. Upewnij się, że kontekst paska bocznego jest prawidłowo zainicjalizowany.
 */
export default function PageTemplate({ title, children, headerActions }: PageTemplateProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {headerActions && <div className="ml-auto px-3">{headerActions}</div>}
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}