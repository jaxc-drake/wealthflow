"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Clock, Upload } from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/transactions", label: "Transaksi", icon: FileText },
  { href: "/dashboard/budget", label: "Budget", icon: Clock },
  { href: "/dashboard/export", label: "Export", icon: Upload },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={clsx("bottom-nav-item", active && "active")}
          >
            <Icon size={21} strokeWidth={active ? 2.6 : 2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
