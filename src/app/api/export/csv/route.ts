import { supabase } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") || "patients";
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const practiceId = "demo-practice";

  try {
    let headers: string[] = [];
    let rows: string[][] = [];

    switch (type) {
      case "patients": {
        headers = ["ID", "Name", "DOB", "Gender", "ID Number", "Phone", "Email", "Medical Aid", "Medical Aid No", "Plan"];
        const { data } = await supabase.from("dos_patients").select("*").eq("practice_id", practiceId);
        rows = (data || []).map((p: Record<string, unknown>) => [
          p.id, p.name, p.date_of_birth, p.gender, p.id_number, p.phone, p.email, p.medical_aid, p.medical_aid_no, p.medical_aid_plan,
        ].map(v => String(v || "")));
        break;
      }
      case "consultations": {
        headers = ["ID", "Patient ID", "Chief Complaint", "Status", "ICD-10 Codes", "Specialty", "Date"];
        let query = supabase.from("dos_consultations").select("*").eq("practice_id", practiceId);
        if (from) query = query.gte("created_at", from);
        if (to) query = query.lte("created_at", to);
        const { data } = await query;
        rows = (data || []).map((c: Record<string, unknown>) => [
          c.id, c.patient_id, c.chief_complaint, c.status,
          Array.isArray(c.icd10_codes) ? (c.icd10_codes as Array<{ code: string }>).map(x => x.code).join("; ") : "",
          "general_practice", c.created_at,
        ].map(v => String(v || "")));
        break;
      }
      case "claims": {
        headers = ["ID", "Patient", "Medical Aid", "ICD-10", "Tariff", "Amount", "Status", "Date"];
        let query = supabase.from("dos_claims").select("*").eq("practice_id", practiceId);
        if (from) query = query.gte("created_at", from);
        if (to) query = query.lte("created_at", to);
        const { data } = await query;
        rows = (data || []).map((c: Record<string, unknown>) => [
          c.id, c.patient_name, c.medical_aid,
          Array.isArray(c.icd10_codes) ? (c.icd10_codes as Array<{ code: string }>).map(x => x.code).join("; ") : "",
          Array.isArray(c.tariff_codes) ? (c.tariff_codes as Array<{ code: string }>).map(x => x.code).join("; ") : "",
          c.total_amount, c.status, c.created_at,
        ].map(v => String(v || "")));
        break;
      }
      case "invoices": {
        headers = ["ID", "Patient ID", "Total", "Paid", "Status", "Date"];
        let query = supabase.from("dos_invoices").select("*").eq("practice_id", practiceId);
        if (from) query = query.gte("created_at", from);
        if (to) query = query.lte("created_at", to);
        const { data } = await query;
        rows = (data || []).map((i: Record<string, unknown>) => [
          i.id, i.patient_id, i.total_amount, i.paid_amount, i.status, i.created_at,
        ].map(v => String(v || "")));
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Invalid type. Use: patients, consultations, claims, invoices" }), { status: 400 });
    }

    // Build CSV
    const escape = (s: string) => s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    const csv = [headers.join(","), ...rows.map(r => r.map(escape).join(","))].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="doctor-os-${type}-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("[export/csv] Error:", error);
    return new Response(JSON.stringify({ error: "Export failed" }), { status: 500 });
  }
}
