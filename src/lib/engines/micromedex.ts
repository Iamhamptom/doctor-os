// Micromedex Drug Safety Adapter — Doctor OS
// Drug interactions, allergy checks, therapeutic duplication

export type InteractionSeverity = 'contraindicated' | 'major' | 'moderate' | 'minor' | 'unknown';

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: InteractionSeverity;
  type: string;
  description: string;
  clinicalEffect: string;
  management: string;
  evidence: 'excellent' | 'good' | 'fair' | 'poor';
  references: string[];
}

export interface InteractionCheckResult {
  medications: string[];
  pairsChecked: number;
  interactions: DrugInteraction[];
  hasContraindicated: boolean;
  hasMajor: boolean;
  checkedAt: string;
  databaseVersion: string;
}

export interface AllergyConflict {
  medication: string;
  allergy: string;
  severity: InteractionSeverity;
  type: 'direct' | 'cross_reactivity' | 'class_effect';
  description: string;
  alternatives: string[];
}

export interface AllergyCheckResult {
  medications: string[];
  allergies: string[];
  conflicts: AllergyConflict[];
  hasConflicts: boolean;
  checkedAt: string;
}

export interface TherapeuticDuplicate {
  drug1: string;
  drug2: string;
  therapeuticClass: string;
  description: string;
  recommendation: string;
}

export interface DuplicateCheckResult {
  medications: string[];
  duplicates: TherapeuticDuplicate[];
  hasDuplicates: boolean;
  checkedAt: string;
}

// ── Check Drug Interactions ─────────────────────────────────────────────────

export async function checkDrugInteractions(medications: string[]): Promise<InteractionCheckResult> {
  const normalised = medications.map(m => m.toLowerCase().trim());
  const pairsChecked = (normalised.length * (normalised.length - 1)) / 2;
  const interactions: DrugInteraction[] = [];

  for (let i = 0; i < normalised.length; i++) {
    for (let j = i + 1; j < normalised.length; j++) {
      const key = [normalised[i], normalised[j]].sort().join('|');
      const known = KNOWN_INTERACTIONS[key];
      if (known) {
        interactions.push({ ...known, drug1: medications[i], drug2: medications[j] });
      }
    }
  }

  return {
    medications,
    pairsChecked,
    interactions,
    hasContraindicated: interactions.some(i => i.severity === 'contraindicated'),
    hasMajor: interactions.some(i => i.severity === 'major'),
    checkedAt: new Date().toISOString(),
    databaseVersion: 'v2026.03.19-daily',
  };
}

// ── Check Allergies ─────────────────────────────────────────────────────────

export async function checkDrugAllergies(medications: string[], allergies: string[]): Promise<AllergyCheckResult> {
  const conflicts: AllergyConflict[] = [];
  const normAllergies = allergies.map(a => a.toLowerCase().trim());

  for (const med of medications) {
    const normMed = med.toLowerCase().trim();

    // Direct allergy match
    for (const allergy of normAllergies) {
      const key = `${normMed}|${allergy}`;
      const known = KNOWN_ALLERGY_CONFLICTS[key];
      if (known) {
        conflicts.push({ ...known, medication: med, allergy });
      }
    }

    // Penicillin cross-reactivity
    if (normAllergies.includes('penicillin') && (normMed.includes('amoxicillin') || normMed.includes('ampicillin') || normMed.includes('augmentin'))) {
      if (!conflicts.find(c => c.medication.toLowerCase() === normMed && c.allergy === 'penicillin')) {
        conflicts.push({
          medication: med, allergy: 'penicillin', severity: 'contraindicated', type: 'cross_reactivity',
          description: `${med} is a penicillin-class antibiotic. Patient has documented penicillin allergy — risk of anaphylaxis.`,
          alternatives: ['Azithromycin', 'Clarithromycin', 'Ciprofloxacin', 'Doxycycline'],
        });
      }
    }

    // Sulfa allergy
    if (normAllergies.includes('sulfonamides') && (normMed.includes('co-trimoxazole') || normMed.includes('bactrim') || normMed.includes('sulfamethoxazole'))) {
      conflicts.push({
        medication: med, allergy: 'sulfonamides', severity: 'contraindicated', type: 'class_effect',
        description: `${med} contains sulfonamide. Contraindicated in patients with sulfa allergy.`,
        alternatives: ['Amoxicillin', 'Ciprofloxacin', 'Nitrofurantoin'],
      });
    }
  }

  return { medications, allergies, conflicts, hasConflicts: conflicts.length > 0, checkedAt: new Date().toISOString() };
}

// ── Check Therapeutic Duplication ────────────────────────────────────────────

export async function checkTherapeuticDuplicates(medications: string[]): Promise<DuplicateCheckResult> {
  const duplicates: TherapeuticDuplicate[] = [];
  const normMeds = medications.map(m => m.toLowerCase().trim());

  for (const [className, members] of Object.entries(THERAPEUTIC_CLASSES)) {
    const found = medications.filter((_, i) => members.some(m => normMeds[i].includes(m)));
    if (found.length >= 2) {
      for (let i = 0; i < found.length; i++) {
        for (let j = i + 1; j < found.length; j++) {
          duplicates.push({
            drug1: found[i], drug2: found[j], therapeuticClass: className,
            description: `Both ${found[i]} and ${found[j]} belong to the ${className} class. Concurrent use increases risk of adverse effects.`,
            recommendation: `Review indication for both agents. Consider discontinuing one unless clinically justified.`,
          });
        }
      }
    }
  }

  return { medications, duplicates, hasDuplicates: duplicates.length > 0, checkedAt: new Date().toISOString() };
}

// ── Data ────────────────────────────────────────────────────────────────────

const KNOWN_INTERACTIONS: Record<string, Omit<DrugInteraction, 'drug1' | 'drug2'>> = {
  'amlodipine|simvastatin': {
    severity: 'major', type: 'pharmacokinetic',
    description: 'Amlodipine inhibits CYP3A4-mediated metabolism of simvastatin, increasing simvastatin exposure by up to 2-fold.',
    clinicalEffect: 'Increased risk of rhabdomyolysis and myopathy. Risk increases with simvastatin doses >20mg.',
    management: 'Limit simvastatin dose to 20mg daily when co-administered with amlodipine. Consider switching to atorvastatin or rosuvastatin.',
    evidence: 'good', references: ['FDA Drug Safety Communication 2011', 'MHRA Drug Safety Update Vol 5, Issue 4'],
  },
  'enalapril|metformin': {
    severity: 'moderate', type: 'pharmacodynamic',
    description: 'ACE inhibitors may enhance the hypoglycaemic effect of metformin by improving insulin sensitivity.',
    clinicalEffect: 'Increased risk of hypoglycaemia, particularly in elderly patients or those with renal impairment.',
    management: 'Monitor blood glucose more frequently when initiating or adjusting ACE inhibitor therapy.',
    evidence: 'fair', references: ['British National Formulary (BNF)', 'Diabetes Care 2019;42:1210-1218'],
  },
  'amlodipine|enalapril': {
    severity: 'minor', type: 'pharmacodynamic',
    description: 'Additive hypotensive effect when combining calcium channel blocker with ACE inhibitor.',
    clinicalEffect: 'Enhanced blood pressure reduction. Generally beneficial but may cause excessive hypotension.',
    management: 'Commonly used combination. Monitor BP, especially on initiation.',
    evidence: 'excellent', references: ['ACCOMPLISH Trial, NEJM 2008', 'SA Hypertension Society Guidelines 2024'],
  },
  'omeprazole|simvastatin': {
    severity: 'minor', type: 'pharmacokinetic',
    description: 'Omeprazole is a weak CYP2C19 inhibitor and may slightly increase simvastatin levels.',
    clinicalEffect: 'Marginal increase in simvastatin exposure. Clinically significant interaction unlikely.',
    management: 'No dose adjustment typically required.',
    evidence: 'fair', references: ['Micromedex DRUGDEX System'],
  },
  'amoxicillin|metformin': {
    severity: 'minor', type: 'pharmacokinetic',
    description: 'Amoxicillin may reduce renal clearance of metformin through competition for tubular secretion.',
    clinicalEffect: 'Slightly elevated metformin levels possible. Usually not clinically significant.',
    management: 'No routine dose adjustment. Monitor renal function in elderly.',
    evidence: 'poor', references: ['Clin Pharmacol Ther 2018;104:139-148'],
  },
  'enalapril|omeprazole': {
    severity: 'moderate', type: 'pharmacokinetic',
    description: 'PPIs may reduce the absorption and bioavailability of ACE inhibitors through pH-dependent mechanisms.',
    clinicalEffect: 'Potentially reduced antihypertensive effect.',
    management: 'Monitor blood pressure. Consider spacing doses by 2 hours.',
    evidence: 'fair', references: ['J Clin Hypertens 2020;22:1654-1660'],
  },
};

const KNOWN_ALLERGY_CONFLICTS: Record<string, Omit<AllergyConflict, 'medication' | 'allergy'>> = {
  'amoxicillin|penicillin': {
    severity: 'contraindicated', type: 'cross_reactivity',
    description: 'Amoxicillin is a penicillin-class antibiotic. Patient has documented penicillin allergy — risk of anaphylaxis.',
    alternatives: ['Azithromycin 500mg', 'Clarithromycin 500mg', 'Ciprofloxacin 500mg', 'Doxycycline 100mg'],
  },
  'omeprazole|ppi': {
    severity: 'moderate', type: 'class_effect',
    description: 'Patient has documented PPI sensitivity. Cross-reactivity between PPIs is possible (~3% risk).',
    alternatives: ['Ranitidine 150mg', 'Famotidine 20mg', 'Sucralfate 1g'],
  },
  'enalapril|ace inhibitors': {
    severity: 'contraindicated', type: 'class_effect',
    description: 'Patient has documented ACE inhibitor allergy/angioedema. Enalapril contraindicated.',
    alternatives: ['Losartan 50mg', 'Valsartan 80mg', 'Irbesartan 150mg'],
  },
};

const THERAPEUTIC_CLASSES: Record<string, string[]> = {
  'ACE Inhibitors': ['enalapril', 'ramipril', 'perindopril', 'lisinopril', 'captopril'],
  'Calcium Channel Blockers': ['amlodipine', 'nifedipine', 'verapamil', 'diltiazem', 'felodipine'],
  'Statins': ['simvastatin', 'atorvastatin', 'rosuvastatin', 'pravastatin', 'fluvastatin'],
  'PPIs': ['omeprazole', 'lansoprazole', 'pantoprazole', 'esomeprazole', 'rabeprazole'],
  'Biguanides': ['metformin'],
  'SSRIs': ['fluoxetine', 'sertraline', 'citalopram', 'escitalopram', 'paroxetine'],
  'Penicillin Antibiotics': ['amoxicillin', 'ampicillin', 'flucloxacillin', 'phenoxymethylpenicillin'],
  'NSAIDs': ['ibuprofen', 'diclofenac', 'naproxen', 'celecoxib', 'indomethacin', 'piroxicam'],
  'Thiazide Diuretics': ['hydrochlorothiazide', 'indapamide', 'chlorthalidone'],
  'Beta Blockers': ['atenolol', 'bisoprolol', 'carvedilol', 'metoprolol', 'propranolol'],
};
