"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ExternalLink,
  Images,
  MessageSquareQuote,
  PackageOpen,
  Scissors,
  Settings2,
  UserCog,
  Users,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Bookings", icon: CalendarDays },
  { href: "/admin/services", label: "Services", icon: Scissors },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote },
  { href: "/admin/content", label: "Content", icon: PackageOpen },
  { href: "/admin/users", label: "Desk users", icon: UserCog },
  { href: "/admin/settings", label: "Settings", icon: Settings2 },
];

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="admin-sidebar-nav">
      {links.map((link) => {
        const current = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            onClick={onNavigate}
          >
            <Icon aria-hidden="true" size={18} />
            {link.label}
          </Link>
        );
      })}
      <Link className="admin-sidebar-nav-external" href="/" onClick={onNavigate}>
        <ExternalLink aria-hidden="true" size={18} />
        View site
      </Link>
    </nav>
  );
}
