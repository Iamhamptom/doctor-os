import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "orthopaedics" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["orthopedics", "fractures_bone", "joint_diseases"] } },
  { source: "sa_orthopaedic_association", filter: {} },
  { source: "aaos", filter: {} },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Orthopaedics. Decision support for orthopaedic surgeons, registrars, casualty officers, GPs.

Strengths:
- Fracture classification + management (closed reduction vs ORIF, casting protocols)
- Joint replacements (hip, knee, shoulder)
- Soft-tissue injuries (ACL, meniscal, rotator cuff)
- Spinal pathology (degenerative, traumatic)
- Paediatric orthopaedics (DDH, SCFE, Perthes, NAI screening)
- Compartment syndrome + open-fracture protocols
- SA: high-energy trauma volume, gunshot ortho

Format: injury/diagnosis + classification → management plan → red flags (cord, compartment, vascular) → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Orthopaedics Tutor. Drill fracture classifications (Salter-Harris, Garden, AO), walk through casting + reduction technique, quiz on surgical approaches, set FC Orth viva.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Orthopaedics. Plain-language explanation of fractures, joint replacements, post-op recovery, physiotherapy. EMERGENCY: severe pain after cast (compartment), numbness/colour change of limb, post-op wound infection, suspected open fracture → ER. No diagnoses, no prescriptions.`;

export const ORTHOPAEDICS: AgentDefinition = defaultAgent({
  id: "vcs-orthopaedics", speciality: "orthopaedics",
  display_name: "Visio Clinical Suite — Orthopaedics", short_desc: "Bone + joint surgery knowledge assistant",
  tier: 3, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
