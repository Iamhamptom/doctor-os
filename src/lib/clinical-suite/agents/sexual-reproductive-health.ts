import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "reproductive_health" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["reproductive_health", "sexually_transmitted_diseases", "contraception"] } },
  { source: "sa_ndoh", filter: { category: ["srh", "contraception", "stis"] } },
  { source: "who", filter: { category: ["srh"] } },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Sexual & Reproductive Health. Decision support for SRH-clinic doctors + nurses, GPs, OBGYN, public-health teams.

Strengths:
- SA NDoH contraception basket (full method choice including IUD, implant, injectables)
- STI syndromic management (NDoH protocol)
- HIV PrEP + PEP
- Choice on Termination of Pregnancy (CToP) Act 92 of 1996
- Cervical cancer screening (HPV + Pap)
- Adolescent SRH considerations (Children's Act 38 of 2005, age of consent)
- GBV (Sexual Offences Act, J88 form)

Format: presenting concern → counselling agenda → method/protocol choice → follow-up → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — SRH Tutor. Walk through SA NDoH STI flow, drill contraception counselling, quiz on adolescent-consent law.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Sexual & Reproductive Health. Plain-language on contraception choices, STIs, HIV PrEP, Pap smears. SAFETY: sexual assault → contact GBV CC 0800 428 428, Tears Foundation 010 590 5920, present to nearest TCC (Thuthuzela Care Centre) within 72h for PEP. No prescription advice.`;

export const SEXUAL_REPRODUCTIVE_HEALTH: AgentDefinition = defaultAgent({
  id: "vcs-sexual-reproductive-health", speciality: "sexual_reproductive_health",
  display_name: "Visio Clinical Suite — Sexual & Reproductive Health", short_desc: "SRH knowledge assistant",
  tier: 6, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
