import { supabase } from "@/lib/db";
import { recordFeedback } from "@/lib/ai/feedback-loop";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const practiceId = data.practiceId || "demo-practice";

    // 1. Save consultation with full transcript
    const { data: consultation, error: err } = await supabase
      .from("dos_consultations")
      .insert({
        patient_id: data.patientId || null,
        practice_id: practiceId,
        transcript: data.transcript,
        soap_subjective: data.soap?.subjective,
        soap_objective: data.soap?.objective,
        soap_assessment: data.soap?.assessment,
        soap_plan: data.soap?.plan,
        icd10_codes: data.icd10Codes || [],
        nappi_codes: data.nappiCodes || [],
        red_flags: data.redFlags || [],
        chief_complaint: data.chiefComplaint,
        status: data.verified ? "verified" : "completed",
      })
      .select()
      .single();

    if (err) {
      console.error("[scribe/save] Error:", err);
      return Response.json({ error: "Save failed" }, { status: 500 });
    }

    // 2. Save medical record for patient timeline
    if (data.patientId) {
      await supabase.from("dos_medical_records").insert({
        patient_id: data.patientId,
        type: "consultation",
        title: `Consultation — ${data.chiefComplaint || "General"}`,
        description: JSON.stringify({ soap: data.soap, redFlags: data.redFlags, transcript: data.transcript }),
        diagnosis: data.icd10Codes?.map((c: { code: string; description: string }) => `${c.code}: ${c.description}`).join("; "),
        treatment: data.soap?.plan,
        provider: "Visio AI Scribe",
      });
    }

    // 3. Auto-draft claim
    let claimId = null;
    if (data.icd10Codes?.length > 0 && data.patientId) {
      const { data: patient } = await supabase
        .from("dos_patients")
        .select("name, id_number, medical_aid, medical_aid_no")
        .eq("id", data.patientId)
        .single();

      if (patient) {
        const { data: claim } = await supabase
          .from("dos_claims")
          .insert({
            practice_id: practiceId,
            consultation_id: consultation.id,
            patient_name: patient.name,
            patient_id_number: patient.id_number,
            medical_aid: patient.medical_aid,
            medical_aid_no: patient.medical_aid_no,
            icd10_codes: data.icd10Codes,
            tariff_codes: [{ code: "0190", description: "General consultation", amount: 450 }],
            total_amount: 450,
            status: "drafted",
          })
          .select("id")
          .single();
        claimId = claim?.id;
      }
    }

    // 4. Record as feedback if doctor edited (learning)
    if (data.doctorEdited && data.editedDocument) {
      recordFeedback({
        persona: "doctor-scribe",
        query: data.transcript?.slice(0, 200) || "",
        response: data.originalDocument || "",
        type: "correction",
        correctedResponse: data.editedDocument,
      });
    }

    // 5. Save to chat history
    const { data: thread } = await supabase
      .from("dos_chat_threads")
      .insert({ practice_id: practiceId, title: `Scribe — ${data.chiefComplaint || "Consultation"}` })
      .select("id")
      .single();

    if (thread) {
      await supabase.from("dos_chat_messages").insert([
        { thread_id: thread.id, role: "user", content: `[Transcript]\n${data.transcript}` },
        { thread_id: thread.id, role: "assistant", content: data.editedDocument || data.originalDocument || JSON.stringify(data.soap) },
      ]);
    }

    return Response.json({
      saved: true,
      consultationId: consultation.id,
      claimId,
      threadId: thread?.id,
      syncStatus: {
        careon: { ready: true, message: "Ready for HL7v2 ADT sync" },
        heal: { ready: true, message: "Ready for A2D24 sync" },
      },
    });
  } catch (error) {
    console.error("[scribe/save] Error:", error);
    return Response.json({ error: "Save failed" }, { status: 500 });
  }
}
