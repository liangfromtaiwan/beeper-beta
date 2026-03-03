"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/focus", label: "Focus" },
  { href: "/settings", label: "Settings" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-2xl items-center gap-6 px-4 py-3">
        <Link
          href="/inbox"
          className="text-lg font-medium text-[var(--foreground)] no-underline"
        >
          Inbox
        </Link>
        <div className="flex gap-4">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm no-underline ${
                pathname === href
                  ? "text-[var(--foreground)] font-medium"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
