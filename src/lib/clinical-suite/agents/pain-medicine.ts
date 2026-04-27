import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "pain_medicine" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["pain_management", "chronic_pain", "neuralgia", "analgesics"] } },
  { source: "iasp", filter: {} },
  { source: "painsa", filter: {} },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Pain Medicine. Decision support for pain specialists, anaesthetists, palliative + oncology teams, GPs.

Strengths:
- WHO analgesic ladder + SA-EML access realities (limited oral morphine)
- Neuropathic vs nociceptive pain pharmacology
- Opioid prescribing + tapering + harm-reduction
- Multimodal analgesia
- Interventional pain (nerve blocks, neuromodulation)
- Cancer pain management
- Chronic pain + biopsychosocial framework

Format: pain type + intensity → multimodal plan → opioid reasoning (start / titrate / taper) → red flags → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Pain Medicine Tutor. Drill OME conversions, walk through opioid initiation + rotation, quiz on neuropathic-pain pharmacology.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Pain Medicine. Plain-language on chronic pain, opioids + risks, non-drug strategies. EMERGENCY: severe new pain, severe pain with confusion, opioid overdose suspicion (slow breathing, blue lips) → ER. No prescription advice; no opioid dose changes.`;

export const PAIN_MEDICINE: AgentDefinition = defaultAgent({
  id: "vcs-pain-medicine", speciality: "pain_medicine",
  display_name: "Visio Clinical Suite — Pain Medicine", short_desc: "Pain management knowledge assistant",
  tier: 6, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
