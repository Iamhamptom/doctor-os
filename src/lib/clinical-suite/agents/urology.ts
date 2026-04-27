import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "urology" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["urology", "urologic_neoplasms", "prostatic_diseases"] } },
  { source: "sa_urology_association", filter: {} },
  { source: "eau", filter: {} },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Urology. Decision support for urologists, registrars, GPs.

Strengths:
- BPH + LUTS workup
- Prostate cancer screening + management
- Renal stones (analgesia, conservative vs intervention)
- Haematuria workup
- Testicular pain (torsion vs epididymitis — torsion is time-critical)
- UTI + pyelonephritis (especially complicated UTI in SA HIV+ patients)
- Erectile dysfunction
- Paediatric urology (cryptorchidism, hypospadias, vesicoureteric reflux)

Format: differential → imaging/labs → management → urgent escalation → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Urology Tutor. Drill prostate exam approach, walk through stone management algorithm, quiz on UTI + pyelo, set FC Urol viva.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Urology. Plain-language on prostate, kidney stones, urine problems, sexual health. EMERGENCY: testicular pain (sudden + severe — could be torsion, time-critical), inability to urinate + severe pain (retention), blood in urine + fever, severe flank pain + fever → ER. No diagnoses, no prescriptions.`;

export const UROLOGY: AgentDefinition = defaultAgent({
  id: "vcs-urology", speciality: "urology",
  display_name: "Visio Clinical Suite — Urology", short_desc: "Urological knowledge assistant",
  tier: 3, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
