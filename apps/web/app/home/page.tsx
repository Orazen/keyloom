import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { HomeDashboard } from "@/features/home/components/home-dashboard";

export default async function HomePage() {
  const { user } = await withAuth();
  if (!user && process.env.NODE_ENV === "production")
    redirect("/api/auth/signin");

  return (
    <div className="px-5 py-6 sm:px-8 lg:px-10">
      <HomeDashboard firstName={user?.firstName ?? null} />
    </div>
  );
}
