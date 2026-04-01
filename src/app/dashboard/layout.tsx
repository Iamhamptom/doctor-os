"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import {
  Stethoscope, LayoutDashboard, MessageCircle, Mic, Search,
  Activity, Users, FileText, Receipt, CreditCard, Download,
  Plug, Settings, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const MOBILE_NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/chat", label: "Agent", icon: MessageCircle },
  { href: "/dashboard/scribe", label: "AI Scribe", icon: Mic },
  { href: "/dashboard/coding", label: "Clinical Coding", icon: Search },
  { href: "/dashboard/queue", label: "Queue", icon: Activity },
  { href: "/dashboard/patients", label: "Patients", icon: Users },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/claims", label: "Claims", icon: Receipt },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/exports", label: "Exports", icon: Download },
  { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 h-12 border-b border-border bg-background/95 backdrop-blur flex items-center px-4 gap-2">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1 -ml-1">
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <Stethoscope className="w-4 h-4" />
          <span className="text-[13px] font-semibold">Doctor OS</span>
          <Link href="/dashboard/coding" className="ml-auto text-[11px] px-2 py-1 rounded-md ring-1 ring-border hover:bg-accent transition">
            <Search className="w-3 h-3 inline mr-1" />Coding
          </Link>
        </header>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="lg:hidden absolute top-12 left-0 right-0 z-50 bg-background border-b border-border py-2 px-3 shadow-lg">
            {MOBILE_NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-[13px] transition",
                  pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            ))}
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
