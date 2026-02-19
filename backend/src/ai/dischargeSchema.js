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
  hospitalCourse: stringOrNull,
  procedures: stringOrNull,
  investigations: stringOrNull,
  medications: z.array(dischargeMedicationItemSchema).default([]),
  instructions: dischargeInstructionsSchema.default({}),
  missingFields: arrayOfStrings,
  warnings: arrayOfStrings,
  finalNarrativeText: stringOrNull,
});

export function validateDischargeJson(obj) {
  const result = dischargeJsonSchema.safeParse(obj);
  if (result.success) return { success: true, data: result.data };
  return { success: false, error: result.error };
}
