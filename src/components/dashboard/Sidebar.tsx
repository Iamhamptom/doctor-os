"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, MessageCircle, Users, Mic, FileText, Receipt,
  CreditCard, Download, Settings, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/chat", label: "Agent Chat", icon: MessageCircle },
  { href: "/dashboard/queue", label: "Queue", icon: Activity },
  { href: "/dashboard/patients", label: "Patients", icon: Users },
  { href: "/dashboard/scribe", label: "AI Scribe", icon: Mic },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/claims", label: "Claims", icon: Receipt },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/exports", label: "Exports", icon: Download },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-16 lg:w-56 h-full bg-[var(--sidebar)] border-r border-white/5 flex flex-col py-4 shrink-0">
      {/* Logo */}
      <div className="px-3 lg:px-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3DA9D1] flex items-center justify-center text-white font-bold text-sm">
            D
          </div>
          <span className="hidden lg:block text-sm font-semibold tracking-tight">
            Doctor OS
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-2 lg:px-3 py-2 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-[#3DA9D1]/15 text-[#3DA9D1] font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 lg:px-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#3DA9D1]/20 flex items-center justify-center text-[#3DA9D1] text-xs font-medium">
            Dr
          </div>
          <span className="hidden lg:block text-xs text-white/50 truncate">
            Demo Practice
          </span>
        </div>
      </div>
    </aside>
  );
}
