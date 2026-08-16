import { HomeDashboard } from "@/features/home/components/home-dashboard";
import { withAuth } from "@/lib/auth";

export default async function HomePage() {
  const { user } = await withAuth();

  return (
    <div className="px-5 py-6 sm:px-8 lg:px-10">
      <HomeDashboard firstName={user.firstName} />
    </div>
  );
}
