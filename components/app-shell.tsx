"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

export type NavItem = {
  href: string;
  label: string;
};

export function AppShell({
  title,
  items,
  children
}: {
  title: string;
  items: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageLabel = items.find((item) => item.href === pathname)?.label ?? "Overview";
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="container-grid">
      <Sidebar title={title} items={items} activePath={pathname} />
      <div className="content-area">
        <header className="shell-topbar panel">
          <div>
            <p className="shell-eyebrow">{title}</p>
            <h1 className="shell-title">{pageLabel}</h1>
          </div>
          <p className="shell-time">{formattedDate}</p>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
