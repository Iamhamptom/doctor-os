import { supabase } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const practiceId = data.practiceId || "demo-practice";

    // 1. Save consultation
    const { data: consultation, error: consultError } = await supabase
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
        status: "completed",
      })
      .select()
      .single();

    if (consultError) {
      console.error("[scribe/save] Consultation save error:", consultError);
      return Response.json({ error: "Failed to save consultation" }, { status: 500 });
    }

    // 2. Save medical record for patient timeline
    if (data.patientId) {
      await supabase.from("dos_medical_records").insert({
        patient_id: data.patientId,
        type: "consultation",
        title: `AI Scribe — ${data.chiefComplaint || "Consultation"}`,
        description: JSON.stringify({
          soap: data.soap,
          redFlags: data.redFlags,
        }),
        diagnosis: data.icd10Codes?.map((c: { code: string; description: string }) =>
          `${c.code}: ${c.description}`
        ).join("; "),
        treatment: data.soap?.plan,
        provider: "Doctor OS AI Scribe",
      });
    }

    // 3. Generate claim draft if ICD-10 codes present
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

    // 4. CareOn sync flag (for hospital consultations)
    const syncStatus = {
      careon: { ready: true, synced: false, message: "Ready to sync via HL7v2 ADT when hospital endpoint configured" },
      heal: { ready: true, synced: false, message: "Ready to sync when A2D24 API published" },
    };

    return Response.json({
      saved: true,
      consultationId: consultation.id,
      claimId,
      syncStatus,
    });
  } catch (error) {
    console.error("[scribe/save] Error:", error);
    return Response.json({ error: "Save failed" }, { status: 500 });
  }
}
