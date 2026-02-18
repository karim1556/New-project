"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageLabel = items.find((item) => item.href === pathname)?.label ?? "Overview";
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  const toastFromUrl = useMemo(() => {
    const message = searchParams.get("toast");
    const type = searchParams.get("toastType");
    if (!message || (type !== "success" && type !== "error")) return null;
    return { message, type } as { message: string; type: "success" | "error" };
  }, [searchParams]);

  useEffect(() => {
    if (!toastFromUrl) return;
    setToast(toastFromUrl);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    params.delete("toastType");
    const nextUrl = params.size ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });

    const timeout = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timeout);
  }, [pathname, router, searchParams, toastFromUrl]);

  return (
    <div className="container-grid">
      <Sidebar title={title} items={items} activePath={pathname} />
      <div className="content-area">
        {toast ? (
          <div className={`toast-banner ${toast.type === "success" ? "toast-success" : "toast-error"}`}>
            {toast.message}
          </div>
        ) : null}
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
