// Clinical database types — Doctor OS

export interface ICD10Entry {
  code: string;
  description: string;
  chapter: number;
  chapterTitle: string;
  category: string;
  isValid: boolean;
  maxSpecificity: number;
  genderRestriction?: "M" | "F";
  ageMin?: number;
  ageMax?: number;
  isAsterisk?: boolean;
  isDagger?: boolean;
  isExternalCause?: boolean;
  requiresExternalCause?: boolean;
  isPMB?: boolean;
  isSequela?: boolean;
}

export interface NAPPIEntry {
  code: string;
  description: string;
  strength?: string;
  packSize?: string;
  manufacturer?: string;
  schedule?: string; // S0-S8
  category: string;
}

// ── Claims Engine Types (from Netcare Health OS) ────────

export interface ClaimLineItem {
  lineNumber: number;
  patientName?: string;
  patientGender?: "M" | "F" | "U";
  patientAge?: number;
  primaryICD10: string;
  rawICD10?: string;
  secondaryICD10?: string[];
  tariffCode?: string;
  nappiCode?: string;
  quantity?: number;
  amount?: number;
  modifier?: string;
  practitionerType?: string;
  dependentCode?: string;
  dateOfService?: string;
  scheme?: string;
  membershipNumber?: string;
  patientIdNumber?: string;
  treatingProviderNumber?: string;
  authorizationNumber?: string;
  schemeOptionCode?: string;
  practiceNumber?: string;
  motivationText?: string;
  rawAmount?: string;
  rawDateOfService?: string;
  placeOfService?: string;
  referringProviderNumber?: string;
  admissionDate?: string;
  dischargeDate?: string;
  accidentDate?: string;
  prescriptionNumber?: string;
  dispensingDate?: string;
  vatRate?: number;
  depositAmount?: number;
  isIOD?: boolean;
  isMVA?: boolean;
  isMaternity?: boolean;
  isOutpatient?: boolean;
}

export interface ClaimBatchMetadata {
  batchNumber?: string;
  batchCreationDate?: string;
  messageReferenceNumber?: string;
  correctionType?: "ADJ" | "ADD" | "REV" | "RSV" | "INT";
  originalClaimReference?: string;
  isResubmission?: boolean;
  isRealTime?: boolean;
  isEmergency?: boolean;
  lateSubmissionMotivation?: string;
  submittingPracticeNumber?: string;
  renderingPracticeNumber?: string;
}

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  lineNumber: number;
  field: string;
  code: string;
  severity: ValidationSeverity;
  rule: string;
  message: string;
  suggestion?: string;
}

export interface BatchInsight {
  rule: string;
  affectedCount: number;
  percentage: number;
  severity: string;
  explanation: string;
  fix: string;
}

export interface LineValidationResult {
  lineNumber: number;
  status: "valid" | "error" | "warning";
  issues: ValidationIssue[];
  claimData: ClaimLineItem;
}

export interface ValidationSummary {
  errorCount: number;
  warningCount: number;
  infoCount: number;
  byRule: Record<string, number>;
  estimatedRejectionRate: number;
  estimatedSavings: number;
  topIssues: { rule: string; count: number; severity: ValidationSeverity }[];
}

export interface ValidationResult {
  totalClaims: number;
  validClaims: number;
  invalidClaims: number;
  warningClaims: number;
  issues: ValidationIssue[];
  summary: ValidationSummary;
  lineResults: LineValidationResult[];
  batchInsights?: BatchInsight[];
}

export interface CSVParseResult {
  headers: string[];
  rows: Record<string, string>[];
  errors: string[];
}

export interface ColumnMapping {
  primaryICD10: string;
  secondaryICD10?: string;
  patientGender?: string;
  patientAge?: string;
  amount?: string;
  quantity?: string;
}
