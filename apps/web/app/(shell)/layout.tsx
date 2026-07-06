import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { SiteFooter } from "@/components/site-footer";

export default function ShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <DashboardTopbar />
        <main className="min-w-0 flex-1">{children}</main>
        <SiteFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
