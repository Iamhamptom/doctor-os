import { generateDocument } from "@/lib/engines/document-generator";
import { supabase } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { type, data, practiceId: pid } = await request.json();
    const practiceId = pid || "demo-practice";

    if (!type) return Response.json({ error: "Document type required" }, { status: 400 });

    const content = generateDocument(type, data || {});

    // Save to database
    const { data: doc } = await supabase.from("dos_documents").insert({
      practice_id: practiceId,
      patient_id: data?.patientId || null,
      type,
      title: `${type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())} — ${data?.patientName || "Patient"}`,
      content,
    }).select().single();

    return Response.json({
      documentId: doc?.id,
      type,
      content,
      pdfUrl: doc ? `/api/documents/pdf?id=${doc.id}` : null,
    });
  } catch (error) {
    console.error("[documents/generate] Error:", error);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
