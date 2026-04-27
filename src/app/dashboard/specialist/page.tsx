import { SpecialistChat } from "./SpecialistChat";

export const dynamic = "force-dynamic";

export default async function SpecialistPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
          Visio Clinical Suite · 61 specialists
        </p>
        <h1 className="text-3xl md:text-4xl font-light tracking-tight">
          Ask a specialist.
        </h1>
        <p className="text-slate-400 font-light mt-2 max-w-2xl">
          South African scope · ICD-10-ZA / NAPPI / CCSA grounded · HPCSA-compliant decision-support framing · audit-logged for SOC 2 and POPIA.
        </p>
      </div>
      <SpecialistChat />
    </div>
  );
}
