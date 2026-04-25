"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutIcon },
  { href: "/audiences", label: "Audiences", icon: UsersIcon },
  { href: "/segments", label: "Segments", icon: PieIcon },
  { href: "/agent-feed", label: "Agent Feed", icon: ZapIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-border-subtle bg-surface">
      <div className="flex h-14 items-center border-b border-border-subtle px-5">
        <Logo variant="horizontal" theme="dark" size="sm" />
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-neon-glow text-white"
                  : "text-muted hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {active && (
                <span className="absolute left-0 h-5 w-[2px] rounded-r bg-neon" />
              )}
              <Icon active={active} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border-subtle px-5 py-3">
        <p className="text-[11px] text-muted/50 font-mono">v0.1.0</p>
      </div>
    </aside>
  );
}

function LayoutIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={active ? "text-neon" : "text-muted group-hover:text-white/60"}>
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function UsersIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={active ? "text-neon" : "text-muted group-hover:text-white/60"}>
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 14c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="11.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M10.5 9.5c.3-.1.6-.1 1-.1 2 0 3.5 1.5 3.5 3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function PieIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={active ? "text-neon" : "text-muted group-hover:text-white/60"}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 2v6h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ZapIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={active ? "text-neon" : "text-muted group-hover:text-white/60"}>
      <path d="M8.5 1.5L3 9h4.5l-1 5.5L13 7H8.5l1-5.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
