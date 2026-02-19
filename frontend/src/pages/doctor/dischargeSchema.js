import * as yup from 'yup';

const mobilePattern = /^[6-9]\d{9}$/;

export const dischargeFormSchema = yup.object({
  // A) Identification
  uhid: yup.string().required('UHID is required').trim(),
  ipid: yup.string().required('IPID is required').trim(),
  mobile: yup
    .string()
    .required('Mobile is required')
    .matches(mobilePattern, 'Enter a valid 10-digit mobile number'),
  // B) Patient profile (template: Patient Profile)
  patientName: yup.string().trim(),
  age: yup.string().trim(),
  gender: yup.string().trim(),
  address: yup.string().trim(),
  // C) Admission details (template: Admission Details)
  admissionDate: yup.string().trim(),
  dischargeDate: yup.string().trim(),
  department: yup.string().trim(),
  consultant: yup.string().trim(),
  wardBed: yup.string().trim(),
  // D) Diagnosis
  provisionalDiagnosis: yup.string().trim(),
  finalDiagnosis: yup.string().trim(),
  icd10Codes: yup.array().of(yup.string().trim()).default([]),
  // E) Course
  courseInHospital: yup.string().trim(),
  investigations: yup.string().trim(),
  treatment: yup.string().trim(),
  procedures: yup.string().trim(),
  // F) Discharge
  dischargeCondition: yup.string().trim(),
  medications: yup.string().trim(),
  advice: yup.string().trim(),
  followUp: yup.string().trim(),
  redFlags: yup.string().trim(),
});

export const defaultDischargeValues = {
  uhid: '',
  ipid: '',
  mobile: '',
  patientName: '',
  age: '',
  gender: '',
  address: '',
  admissionDate: '',
  dischargeDate: '',
  department: '',
  consultant: '',
  wardBed: '',
  provisionalDiagnosis: '',
  finalDiagnosis: '',
  icd10Codes: [],
  courseInHospital: '',
  investigations: '',
  treatment: '',
  procedures: '',
  dischargeCondition: '',
  medications: '',
  advice: '',
  followUp: '',
  redFlags: '',
};
