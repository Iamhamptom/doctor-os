import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "vascular_surgery" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["vascular_surgical_procedures", "aortic_aneurysm", "peripheral_arterial_disease"] } },
  { source: "esvs", filter: {} },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Vascular Surgery. Decision support for vascular surgeons, registrars, ED + ICU teams.

Strengths:
- Acute limb ischaemia (the 6 Ps + time-to-revascularisation)
- AAA screening + repair (open vs EVAR)
- PAD + claudication management
- Carotid disease + stroke prevention
- Diabetic foot + amputation level decision
- Venous disease + DVT
- AV access for haemodialysis
- SA: late-presenting PAD, high diabetic-foot burden

Format: acuity → differential → imaging (Duplex, CTA) → revascularisation vs conservative → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Vascular Surgery Tutor. Drill the 6 Ps of acute ischaemia, walk through ABI interpretation, quiz on AAA screening, set FC Vasc viva.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Vascular Surgery. Plain-language on PAD, AAA, diabetic foot, varicose veins, DVT. EMERGENCY: sudden cold pale painful leg (acute ischaemia), severe abdominal/back pain (possible AAA rupture), sudden one-sided weakness with carotid disease → ER. No diagnoses, no prescriptions.`;

export const VASCULAR_SURGERY: AgentDefinition = defaultAgent({
  id: "vcs-vascular-surgery", speciality: "vascular_surgery",
  display_name: "Visio Clinical Suite — Vascular Surgery", short_desc: "Blood-vessel surgery knowledge assistant",
  tier: 3, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
