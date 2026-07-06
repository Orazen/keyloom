"use client";

import {
  Film01Icon,
  GridViewIcon,
  McpServerIcon,
  SmartPhone01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@workspace/ui/components/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { BrandLink } from "@/components/brand-link";
import { ThemeToggle } from "@/components/theme-toggle";

const AccountMenu = React.lazy(() =>
  import("@/components/account-menu").then((m) => ({ default: m.AccountMenu })),
);

function AccountMenuFallback() {
  return (
    <Button variant="outline" size="sm" className="gap-1.5" disabled>
      <span className="text-xs">Account</span>
    </Button>
  );
}

type NavItem = {
  label: string;
  href: string;
  icon: typeof GridViewIcon;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Library",
    items: [
      { label: "Components", href: "/", icon: GridViewIcon },
      { label: "Creators", href: "/creators", icon: UserGroupIcon },
    ],
  },
  {
    label: "Create",
    items: [
      { label: "Studio", href: "/studio", icon: Film01Icon },
      { label: "Shorts", href: "/shorts", icon: SmartPhone01Icon },
    ],
  },
  {
    label: "Integration",
    items: [{ label: "MCP", href: "/account", icon: McpServerIcon }],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="h-14 justify-center border-b border-dashed border-sidebar-border px-4">
        <BrandLink />
      </SidebarHeader>
      <SidebarContent className="px-1 py-2">
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.16em]">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link href={item.href}>
                          <HugeiconsIcon icon={item.icon} className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-dashed border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2">
          <React.Suspense fallback={<AccountMenuFallback />}>
            <AccountMenu />
          </React.Suspense>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
