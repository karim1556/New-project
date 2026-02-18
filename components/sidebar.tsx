import Link from "next/link";
import { logoutAction } from "@/lib/actions";
import { SubmitButton } from "@/components/submit-button";

type SidebarItem = {
  href: string;
  label: string;
};

export function Sidebar({
  title,
  items,
  activePath
}: {
  title: string;
  items: SidebarItem[];
  activePath: string;
}) {
  return (
    <aside className="sidebar">
      <p className="brand-pill">ClubOS</p>
      <h2>{title}</h2>
      <nav>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={activePath === item.href ? "active" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <form action={logoutAction} className="logout-form">
        <SubmitButton className="secondary" label="Logout" pendingLabel="Logging out..." />
      </form>
    </aside>
  );
}
