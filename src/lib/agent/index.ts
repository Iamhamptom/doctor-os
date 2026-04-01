// Doctor OS Agent — One agent, every tool

import { setPracticeId } from "./context";
import * as patientTools from "./tools/patient-tools";
import * as clinicalTools from "./tools/clinical-tools";
import * as scribeTools from "./tools/scribe-tools";
import * as documentTools from "./tools/document-tools";
import * as billingTools from "./tools/billing-tools";
import * as queueTools from "./tools/queue-tools";
import * as bookingTools from "./tools/booking-tools";
import * as exportTools from "./tools/export-tools";
import * as briefingTools from "./tools/briefing-tools";
import * as integrationTools from "./tools/integration-tools";

const allTools = {
  ...patientTools,
  ...clinicalTools,
  ...scribeTools,
  ...documentTools,
  ...billingTools,
  ...queueTools,
  ...bookingTools,
  ...exportTools,
  ...briefingTools,
  ...integrationTools,
};

export function createTools(practiceId: string) {
  setPracticeId(practiceId);
  return allTools;
}

export { DOCTOR_OS_SYSTEM_PROMPT } from "./system-prompt";
