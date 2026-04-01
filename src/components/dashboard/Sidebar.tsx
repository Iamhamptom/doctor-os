"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Stethoscope, MessageCircle, Users, Mic, FileText, Receipt,
  CreditCard, Download, Settings, Activity, Search, Shield,
  LayoutDashboard, Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/chat", label: "Agent", icon: MessageCircle },
    ],
  },
  {
    label: "Clinical",
    items: [
      { href: "/dashboard/scribe", label: "AI Scribe", icon: Mic },
      { href: "/dashboard/coding", label: "Clinical Coding", icon: Search },
      { href: "/dashboard/queue", label: "Queue", icon: Activity },
      { href: "/dashboard/patients", label: "Patients", icon: Users },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/dashboard/documents", label: "Documents", icon: FileText },
      { href: "/dashboard/claims", label: "Claims", icon: Receipt },
      { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
      { href: "/dashboard/exports", label: "Exports", icon: Download },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-52 h-screen sticky top-0 flex-col border-r border-border bg-background">
      {/* Logo */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Stethoscope className="w-4 h-4 text-foreground" />
        <span className="text-[13px] font-semibold tracking-tight">Doctor OS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className="mb-1">
            {group.label && (
              <div className="px-4 pt-3 pb-1">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </span>
              </div>
            )}
            {group.items.map((item) => {
              const isActive = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 mx-2 px-2 py-[5px] rounded-md text-[13px] transition-colors",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Tools badge */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground font-mono">
            38 tools · 61K codes
          </span>
        </div>
      </div>
    </aside>
  );
}
