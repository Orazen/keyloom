import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Split Screen",
  description:
    "Stack your video over a gameplay clip and export a 9:16 split-screen MP4.",
};

export default function SplitLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppShell>
      <div className="flex h-[calc(100svh-3rem)] flex-col">{children}</div>
    </AppShell>
  );
}
