// Unified integration types — Doctor OS

export interface UnifiedPatientRecord {
  sourceSystem: "heal" | "careon";
  patientId: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  idNumber?: string;
  phone?: string;
  medicalAid?: string;
  medicalAidNo?: string;
  allergies: string[];
  medications: Array<{ name: string; nappiCode?: string; dosage: string; frequency: string; isChronic: boolean }>;
  lastVisit?: string;
  clinicName?: string;
}

export interface GPConsultation {
  consultationId: string;
  patientId: string;
  clinicName: string;
  date: string;
  practitioner: string;
  chiefComplaint: string;
  diagnoses: Array<{ code: string; description: string; isPrimary: boolean }>;
  prescriptions: Array<{ medicationName: string; nappiCode: string; dosage: string; frequency: string }>;
}

export interface BridgeAdvisory {
  id: string;
  category: "billing" | "eligibility" | "clinical" | "compliance";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  actionRequired: boolean;
  createdAt: string;
}
