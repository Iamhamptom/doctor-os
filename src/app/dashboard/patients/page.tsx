"use client";

import { Search, Plus } from "lucide-react";

export default function PatientsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Patients</h1>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#3DA9D1] text-white text-sm font-medium hover:bg-[#3DA9D1]/90 transition">
          <Plus className="w-4 h-4" /> New Patient
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search by name, ID, phone, or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-[#3DA9D1]/50"
        />
      </div>

      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
        <p className="text-white/30 text-sm">Connect a database to see your patients.</p>
        <p className="text-white/20 text-xs mt-1">Or ask the agent: &quot;Create a patient named Sipho Mthembu&quot;</p>
      </div>
    </div>
  );
}
