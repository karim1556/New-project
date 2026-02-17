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

  return (
    <div className="container-grid">
      <Sidebar title={title} items={items} activePath={pathname} />
      <div className="content-area">
        <header className="shell-topbar panel">
          <div>
            <p className="shell-eyebrow">{title}</p>
            <h1 className="shell-title">{pageLabel}</h1>
          </div>
          <p className="shell-time">{new Date().toLocaleDateString()}</p>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
