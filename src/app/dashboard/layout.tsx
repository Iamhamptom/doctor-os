import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Stethoscope } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-50 h-12 border-b border-border bg-background/80 backdrop-blur flex items-center px-4 gap-2">
          <Stethoscope className="w-4 h-4" />
          <span className="text-[13px] font-semibold">Doctor OS</span>
          <Link href="/dashboard/chat" className="ml-auto text-[11px] text-muted-foreground hover:text-foreground">Agent</Link>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
