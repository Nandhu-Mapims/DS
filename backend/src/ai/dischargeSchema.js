import { z } from 'zod';

const stringOrNull = z.string().nullable().optional();
const arrayOfStrings = z.array(z.string()).default([]);

export const dischargePatientSchema = z.object({
  uhid: stringOrNull,
  ipid: stringOrNull,
  name: stringOrNull,
  age: stringOrNull,
  gender: stringOrNull,
  mobile: stringOrNull,
  address: stringOrNull,
});

export const dischargeAdmissionSchema = z.object({
  admissionDate: stringOrNull,
  dischargeDate: stringOrNull,
  department: stringOrNull,
  dischargeCondition: stringOrNull,
  consultant: stringOrNull,
  wardBed: stringOrNull,
});

export const dischargeDiagnosisSchema = z.object({
  provisional: stringOrNull,
  final: stringOrNull,
  icd10Codes: z.array(z.string()).default([]),
});

export const dischargeMedicationItemSchema = z.object({
  name: z.string().optional().nullable(),
  dose: stringOrNull,
  route: stringOrNull,
  frequency: stringOrNull,
  duration: stringOrNull,
  notes: stringOrNull,
});

/** Lab investigation row: test name, admission result, discharge result, reference range */
export const dischargeInvestigationItemSchema = z.object({
  name: z.string().optional().nullable(),
  resultAdmission: stringOrNull,
  resultDischarge: stringOrNull,
  referenceRange: stringOrNull,
});

/** Procedure row: date, name, indication & outcome */
export const dischargeProcedureItemSchema = z.object({
  date: stringOrNull,
  name: z.string().optional().nullable(),
  indicationOutcome: stringOrNull,
});

/** Medical device/implant row */
export const dischargeMedicalDeviceItemSchema = z.object({
  deviceType: z.string().optional().nullable(),
  model: stringOrNull,
  location: stringOrNull,
  implantDate: stringOrNull,
});

export const dischargeInstructionsSchema = z.object({
  diet: stringOrNull,
  activity: stringOrNull,
  woundCare: stringOrNull,
  followUp: stringOrNull,
  redFlags: stringOrNull,
  advice: stringOrNull,
});

export const dischargeJsonSchema = z.object({
  patient: dischargePatientSchema.default({}),
  admission: dischargeAdmissionSchema.default({}),
  diagnoses: dischargeDiagnosisSchema.default({}),
  reasonForAdmission: stringOrNull,
  clinicalExamination: stringOrNull,
  significantFindings: stringOrNull,
  hospitalCourse: stringOrNull,
  procedures: z.union([
    z.array(dischargeProcedureItemSchema),
    z.string().nullable(),
  ]).default([]),
  investigations: z.union([
    z.array(dischargeInvestigationItemSchema),
    z.string().nullable(),
  ]).default([]),
  imagingReports: stringOrNull,
  medicalDevices: z.array(dischargeMedicalDeviceItemSchema).default([]),
  medications: z.array(dischargeMedicationItemSchema).default([]),
  instructions: dischargeInstructionsSchema.default({}),
  missingFields: arrayOfStrings,
  warnings: arrayOfStrings,
  finalNarrativeText: stringOrNull,
});

export function validateDischargeJson(obj) {
  // If investigations came as a string, convert to array
  if (obj && typeof obj.investigations === 'string' && obj.investigations.trim()) {
    const str = obj.investigations;
    obj.investigations = [{ name: str, resultAdmission: null, resultDischarge: null, referenceRange: null }];
  }
  // If procedures came as a string, convert to array
  if (obj && typeof obj.procedures === 'string' && obj.procedures.trim()) {
    const str = obj.procedures;
    obj.procedures = [{ date: null, name: str, indicationOutcome: null }];
  }
  const result = dischargeJsonSchema.safeParse(obj);
  if (result.success) return { success: true, data: result.data };
  return { success: false, error: result.error };
}
