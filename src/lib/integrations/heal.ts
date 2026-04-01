// HEAL Adapter — Medicross Primary Care EMR Bridge
// Connects to A2D24 proprietary API (stubbed with mock data until API published)

import type { UnifiedPatientRecord, GPConsultation } from "./types";

const MOCK_PATIENTS: Record<string, UnifiedPatientRecord> = {
  "MC-10001": {
    sourceSystem: "heal", patientId: "MC-10001", name: "Sipho Mthembu",
    dateOfBirth: "1985-01-01", gender: "male", idNumber: "8501015800085",
    phone: "+27821234567", medicalAid: "Discovery Health", medicalAidNo: "DH-12345",
    allergies: ["Penicillin"], clinicName: "Medicross Sandton",
    medications: [
      { name: "Amlodipine", nappiCode: "7119501", dosage: "5mg", frequency: "Once daily", isChronic: true },
      { name: "Metformin", nappiCode: "7175002", dosage: "850mg", frequency: "Twice daily", isChronic: true },
    ],
    lastVisit: "2026-03-15",
  },
  "MC-10002": {
    sourceSystem: "heal", patientId: "MC-10002", name: "Thandiwe Dlamini",
    dateOfBirth: "1992-06-15", gender: "female", idNumber: "9206150543082",
    phone: "+27831234567", medicalAid: "Bonitas", medicalAidNo: "BN-67890",
    allergies: [], clinicName: "Medicross Midrand",
    medications: [
      { name: "Oral contraceptive (Triphasil)", nappiCode: "0714259", dosage: "1 tab", frequency: "Daily", isChronic: true },
    ],
    lastVisit: "2026-03-20",
  },
  "MC-10003": {
    sourceSystem: "heal", patientId: "MC-10003", name: "Johannes Pretorius",
    dateOfBirth: "1961-03-22", gender: "male", idNumber: "6103225100086",
    phone: "+27711234567", medicalAid: "GEMS", medicalAidNo: "GE-11111",
    allergies: ["Sulfonamides"], clinicName: "Medicross Parow",
    medications: [
      { name: "Metformin", nappiCode: "7175002", dosage: "1000mg", frequency: "Twice daily", isChronic: true },
      { name: "Amlodipine", nappiCode: "7119501", dosage: "10mg", frequency: "Once daily", isChronic: true },
      { name: "Simvastatin", nappiCode: "7024601", dosage: "20mg", frequency: "At night", isChronic: true },
      { name: "Enalapril", nappiCode: "7031401", dosage: "10mg", frequency: "Once daily", isChronic: true },
    ],
    lastVisit: "2026-03-28",
  },
};

const MOCK_CONSULTATIONS: Record<string, GPConsultation[]> = {
  "MC-10001": [
    {
      consultationId: "CON-001", patientId: "MC-10001", clinicName: "Medicross Sandton",
      date: "2026-03-15", practitioner: "Dr A. Naidoo",
      chiefComplaint: "Routine chronic check — hypertension follow-up",
      diagnoses: [{ code: "I10", description: "Essential hypertension", isPrimary: true }],
      prescriptions: [{ medicationName: "Amlodipine 5mg", nappiCode: "7119501", dosage: "5mg", frequency: "Once daily" }],
    },
  ],
  "MC-10003": [
    {
      consultationId: "CON-003", patientId: "MC-10003", clinicName: "Medicross Parow",
      date: "2026-03-28", practitioner: "Dr J. van der Merwe",
      chiefComplaint: "Type 2 diabetes review — HbA1c results",
      diagnoses: [
        { code: "E11.65", description: "Type 2 DM with hyperglycaemia", isPrimary: true },
        { code: "I10", description: "Essential hypertension", isPrimary: false },
      ],
      prescriptions: [
        { medicationName: "Metformin 1000mg", nappiCode: "7175002", dosage: "1000mg", frequency: "Twice daily" },
        { medicationName: "Simvastatin 20mg", nappiCode: "7024601", dosage: "20mg", frequency: "At night" },
      ],
    },
  ],
};

export class HEALAdapter {
  async getPatient(patientId: string): Promise<UnifiedPatientRecord | null> {
    return MOCK_PATIENTS[patientId] || null;
  }

  async getConsultations(patientId: string): Promise<GPConsultation[]> {
    return MOCK_CONSULTATIONS[patientId] || [];
  }

  async findBySaId(saIdNumber: string): Promise<UnifiedPatientRecord | null> {
    return Object.values(MOCK_PATIENTS).find(p => p.idNumber === saIdNumber) || null;
  }

  async syncPatient(patientId: string): Promise<{ success: boolean; direction: string; recordsUpdated: number }> {
    const patient = MOCK_PATIENTS[patientId];
    if (!patient) return { success: false, direction: "none", recordsUpdated: 0 };
    return { success: true, direction: "pull", recordsUpdated: 1 };
  }
}
