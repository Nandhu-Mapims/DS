import mongoose from 'mongoose';

const STATUSES = [
  'DRAFT',
  'AI_ENHANCED',
  'PENDING_APPROVAL',
  'CHIEF_EDITED',
  'APPROVED',
  'REJECTED',
];

const dischargeSchema = new mongoose.Schema(
  {
    uhid: { type: String, required: true, trim: true },
    ipid: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    status: { type: String, enum: STATUSES, default: 'DRAFT' },

    patientName: String,
    age: String,
    gender: String,
    address: String,
    admissionDate: String,
    dischargeDate: String,
    department: String,
    consultant: String,
    wardBed: String,

    provisionalDiagnosis: String,
    finalDiagnosis: String,
    icd10Codes: [String],
    courseInHospital: String,
    investigations: String,
    treatment: String,
    procedures: String,
    dischargeCondition: String,
    medications: String,
    advice: String,
    followUp: String,
    redFlags: String,

    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'DischargeTemplate' },
    templateVersion: String,
    renderedHtml: String,

    doctorDraftText: String,
    aiEnhancedText: String,
    doctorEditedText: String,
    chiefEditedText: String,
    finalVerifiedText: String,

    aiEnhancedJson: { type: mongoose.Schema.Types.Mixed },
    missingFields: [String],
    warnings: [String],
    aiMeta: {
      model: String,
      promptVersion: String,
      generatedAt: Date,
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submittedAt: Date,
    chiefEditedAt: Date,
    approvedAt: Date,
    rejectedAt: Date,
    rejectionRemarks: String,
  },
  { timestamps: true }
);

dischargeSchema.index({ status: 1 });
dischargeSchema.index({ uhid: 1, ipid: 1, mobile: 1 });
dischargeSchema.index({ createdAt: -1 });

export const DischargeSummary = mongoose.model('DischargeSummary', dischargeSchema);
export { STATUSES as DISCHARGE_STATUSES };
