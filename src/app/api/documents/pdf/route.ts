import { NextRequest } from "next/server";
import { buildPDF } from "@/lib/engines/pdf-builder";
import { supabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return new Response(JSON.stringify({ error: "Document ID required" }), { status: 400 });

  try {
    const { data: doc } = await supabase.from("dos_documents").select("*").eq("id", id).single();
    if (!doc) return new Response(JSON.stringify({ error: "Document not found" }), { status: 404 });

    const pdf = buildPDF(doc.title, doc.content, doc.practice_id || "Practice", doc.type);

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${doc.title.replace(/\s+/g, "_")}.pdf"`,
        "Content-Length": String(pdf.length),
      },
    });
  } catch (error) {
    console.error("[documents/pdf] Error:", error);
    return new Response(JSON.stringify({ error: "PDF generation failed" }), { status: 500 });
  }
}

// Also accept POST with raw content (no document ID needed)
export async function POST(request: Request) {
  try {
    const { title, content, type, practiceName } = await request.json();
    if (!content) return new Response(JSON.stringify({ error: "Content required" }), { status: 400 });

    const pdf = buildPDF(title || "Document", content, practiceName || "Doctor OS", type || "document");

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${(title || "document").replace(/\s+/g, "_")}.pdf"`,
        "Content-Length": String(pdf.length),
      },
    });
  } catch (error) {
    console.error("[documents/pdf] Error:", error);
    return new Response(JSON.stringify({ error: "PDF generation failed" }), { status: 500 });
  }
}
