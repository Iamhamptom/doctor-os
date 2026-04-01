"use client";

import { useState } from "react";
import { Clock, UserCheck, LogOut } from "lucide-react";

interface CheckInItem {
  id: string;
  name: string;
  arrivedAt: string;
  status: "waiting" | "in_consultation" | "checked_out";
  notes?: string;
}

const DEMO_QUEUE: CheckInItem[] = [
  { id: "1", name: "Sipho Mthembu", arrivedAt: "08:30", status: "waiting", notes: "Chronic follow-up" },
  { id: "2", name: "Thandiwe Dlamini", arrivedAt: "08:45", status: "waiting", notes: "Sore throat" },
  { id: "3", name: "Johannes Pretorius", arrivedAt: "08:15", status: "in_consultation", notes: "Diabetes review" },
];

export default function QueuePage() {
  const [queue] = useState<CheckInItem[]>(DEMO_QUEUE);
  const waiting = queue.filter(q => q.status === "waiting");
  const consulting = queue.filter(q => q.status === "in_consultation");
  const done = queue.filter(q => q.status === "checked_out");

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-xl font-semibold mb-6">Patient Queue</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Column title="Waiting Room" icon={Clock} color="text-[#F59E0B]" items={waiting} />
        <Column title="In Consultation" icon={UserCheck} color="text-[#3DA9D1]" items={consulting} />
        <Column title="Done Today" icon={LogOut} color="text-white/30" items={done} />
      </div>
    </div>
  );
}

function Column({ title, icon: Icon, color, items }: {
  title: string; icon: React.ElementType; color: string; items: CheckInItem[];
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm font-medium">{title}</span>
        <span className="ml-auto text-xs text-white/30 font-mono">{items.length}</span>
      </div>
      <div className="p-3 space-y-2 min-h-[200px]">
        {items.map(item => (
          <div key={item.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs text-white/40 mt-1">{item.notes || "No notes"}</p>
            <p className="text-xs text-white/20 mt-1 font-mono">{item.arrivedAt}</p>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-white/20 text-center py-8">No patients</p>
        )}
      </div>
    </div>
  );
}
