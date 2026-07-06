import { withAuth } from "@workos-inc/authkit-nextjs";
import { compositions } from "@workspace/compositions/registry";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { GalleryMount } from "@/components/gallery/gallery-mount";
import { SiteFooter } from "@/components/site-footer";

export default async function DashboardPage() {
  const { user } = await withAuth();
  if (!user) redirect("/api/auth/signin");

  const sceneCount = compositions.filter(
    (c) => c.category !== "background",
  ).length;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <DashboardTopbar
          label={`${sceneCount} scenes · Remotion · renders to MP4`}
        />

        <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
          <div className="mb-8">
            <h1 className="text-pretty font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Components
            </h1>
            <p className="mt-2.5 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground">
              A library of cinematic scenes for Remotion. Browse, preview, and
              drop straight into a video.
            </p>
          </div>

          <GalleryMount />
        </main>

        <SiteFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
