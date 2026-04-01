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
