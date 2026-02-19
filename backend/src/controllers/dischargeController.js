import { DischargeSummary } from '../models/DischargeSummary.js';
import { DischargeTemplate } from '../models/DischargeTemplate.js';
import { enhanceDischargeWithAI } from '../services/aiService.js';
import { sendDischarge } from '../services/whatsappService.js';
import { success, error } from '../utils/response.js';
import { dischargeToClient, listToClient } from '../utils/dischargeSerializer.js';

const VALID_TRANSITIONS = {
  DRAFT: ['AI_ENHANCED', 'DRAFT'],
  AI_ENHANCED: ['PENDING_APPROVAL', 'DRAFT'],
  PENDING_APPROVAL: ['CHIEF_EDITED', 'APPROVED', 'REJECTED'],
  CHIEF_EDITED: ['APPROVED', 'REJECTED'],
  REJECTED: ['DRAFT'],
  APPROVED: [],
};

const STATUS_LOWER_TO_UPPER = {
  draft: 'DRAFT',
  ai_enhanced: 'AI_ENHANCED',
  pending_approval: 'PENDING_APPROVAL',
  chief_edited: 'CHIEF_EDITED',
  approved: 'APPROVED',
  rejected: 'REJECTED',
};

function normalizeStatus(s) {
  return STATUS_LOWER_TO_UPPER[String(s).toLowerCase()] || s;
}

function canTransition(from, to) {
  const allowed = VALID_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
}

const CREATABLE_FIELDS = [
  'patientName', 'age', 'gender', 'address', 'admissionDate', 'dischargeDate', 'department', 'consultant', 'wardBed',
  'provisionalDiagnosis', 'finalDiagnosis', 'icd10Codes',
  'courseInHospital', 'investigations', 'treatment', 'procedures',
  'dischargeCondition', 'medications', 'advice', 'followUp', 'redFlags', 'doctorDraftText',
];

export async function create(req, res) {
  const { templateId, uhid, ipid, mobile, ...rest } = req.body;
  if (!uhid || !ipid || !mobile) {
    return error(res, 'uhid, ipid and mobile are required', 400);
  }
  let template = null;
  if (templateId) {
    template = await DischargeTemplate.findOne({ _id: templateId, isActive: true });
    if (!template) return error(res, 'Template not found or inactive', 400);
  }
  const payload = {
    uhid: String(uhid).trim(),
    ipid: String(ipid).trim(),
    mobile: String(mobile).trim(),
    status: 'DRAFT',
    templateId: template?._id,
    templateVersion: template?.version,
    createdBy: req.user._id,
  };
  for (const key of CREATABLE_FIELDS) {
    if (rest[key] === undefined) continue;
    if (key === 'icd10Codes') {
      payload[key] = Array.isArray(rest[key]) ? rest[key].map((s) => (s != null ? String(s).trim() : '')) : [];
    } else {
      payload[key] = rest[key] == null ? '' : String(rest[key]).trim();
    }
  }
  let doc;
  try {
    doc = await DischargeSummary.create(payload);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors || {}).map((e) => e.message).join('; ') || err.message;
      return error(res, msg || 'Validation failed', 400);
    }
    throw err;
  }
  const populated = await DischargeSummary.findById(doc._id).populate('templateId', 'name layout').lean();
  return success(res, dischargeToClient(populated), 'Draft created', 201);
}

const UPDATABLE_FIELDS = [
  'uhid', 'ipid', 'mobile', 'patientName', 'age', 'gender', 'address',
  'admissionDate', 'dischargeDate', 'department', 'consultant', 'wardBed',
  'provisionalDiagnosis', 'finalDiagnosis', 'icd10Codes',
  'courseInHospital', 'investigations', 'treatment', 'procedures',
  'dischargeCondition', 'medications', 'advice', 'followUp', 'redFlags',
  'doctorDraftText', 'doctorEditedText',
];

export async function update(req, res) {
  const doc = await DischargeSummary.findById(req.params.id);
  if (!doc) return error(res, 'Discharge not found', 404);
  if (doc.status !== 'DRAFT' && doc.status !== 'AI_ENHANCED') {
    return error(res, 'Can only update draft or AI-enhanced summary', 400);
  }
  const { templateId, status: _status, ...rest } = req.body;
  // Only apply known fields so we never overwrite status or other server-only fields
  const updates = {};
  for (const key of UPDATABLE_FIELDS) {
    if (rest[key] !== undefined) updates[key] = rest[key];
  }
  if (templateId !== undefined) {
    if (doc.status !== 'DRAFT') {
      return error(res, 'templateId can only be changed before submit', 400);
    }
    if (templateId) {
      const template = await DischargeTemplate.findOne({ _id: templateId, isActive: true });
      if (!template) return error(res, 'Template not found or inactive', 400);
      doc.templateId = template._id;
      doc.templateVersion = template.version;
    } else {
      doc.templateId = undefined;
      doc.templateVersion = undefined;
    }
  }
  Object.assign(doc, updates);
  try {
    await doc.save();
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors || {}).map((e) => e.message).join('; ') || err.message;
      return error(res, msg || 'Validation failed', 400);
    }
    throw err;
  }
  const populated = await DischargeSummary.findById(doc._id).populate('templateId', 'name layout').lean();
  return success(res, dischargeToClient(populated), 'Updated');
}

export async function aiEnhance(req, res) {
  const doc = await DischargeSummary.findById(req.params.id);
  if (!doc) return error(res, 'Discharge not found', 404);
  if (!canTransition(doc.status, 'AI_ENHANCED')) {
    return error(res, `Invalid transition: ${doc.status} -> AI_ENHANCED`, 400);
  }
  const template = doc.templateId
    ? await DischargeTemplate.findById(doc.templateId).lean()
    : { layout: 'CLASSIC', sections: [] };
  const dischargeData = doc.toObject();
  const result = await enhanceDischargeWithAI({
    dischargeData,
    template: template || { layout: 'CLASSIC', sections: [] },
  });
  const { enhancedText, renderedHtml, aiEnhancedJson, missingFields, warnings, promptVersion } = result;
  doc.aiEnhancedText = enhancedText;
  doc.renderedHtml = renderedHtml;
  doc.status = 'AI_ENHANCED';
  if (template) doc.templateVersion = template.version;
  if (aiEnhancedJson != null) {
    doc.aiEnhancedJson = aiEnhancedJson;
    doc.missingFields = Array.isArray(missingFields) ? missingFields : [];
    doc.warnings = Array.isArray(warnings) ? warnings : [];
    doc.aiMeta = {
      model: 'gemini-1.5-flash',
      promptVersion: promptVersion || '1',
      generatedAt: new Date(),
    };
  }
  await doc.save();
  const populated = await DischargeSummary.findById(doc._id).populate('templateId', 'name layout').lean();
  return success(res, dischargeToClient(populated), 'AI enhancement applied');
}

export async function submit(req, res) {
  const doc = await DischargeSummary.findById(req.params.id);
  if (!doc) return error(res, 'Discharge not found', 404);
  if (!canTransition(doc.status, 'PENDING_APPROVAL')) {
    return error(res, `Invalid transition: ${doc.status} -> PENDING_APPROVAL`, 400);
  }
  doc.status = 'PENDING_APPROVAL';
  doc.submittedAt = new Date();
  if (req.body.doctorEditedText != null) doc.doctorEditedText = req.body.doctorEditedText;
  await doc.save();
  const populated = await DischargeSummary.findById(doc._id).populate('templateId', 'name layout').lean();
  return success(res, dischargeToClient(populated), 'Submitted for approval');
}

export async function listPending(req, res) {
  const { search, fromDate, toDate, department } = req.query;
  const filter = { status: { $in: ['PENDING_APPROVAL', 'CHIEF_EDITED'] } };
  if (search && search.trim()) {
    const s = search.trim();
    filter.$or = [
      { uhid: new RegExp(s, 'i') },
      { ipid: new RegExp(s, 'i') },
      { mobile: new RegExp(s, 'i') },
    ];
  }
  if (fromDate) filter.createdAt = { ...filter.createdAt, $gte: new Date(fromDate) };
  if (toDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(toDate) };
  if (department && department.trim()) filter.department = new RegExp(department.trim(), 'i');
  const list = await DischargeSummary.find(filter)
    .sort({ submittedAt: -1, updatedAt: -1 })
    .populate('templateId', 'name layout')
    .lean();
  return success(res, listToClient(list));
}

export async function chiefEdit(req, res) {
  const doc = await DischargeSummary.findById(req.params.id);
  if (!doc) return error(res, 'Discharge not found', 404);
  if (!['PENDING_APPROVAL', 'CHIEF_EDITED'].includes(doc.status)) {
    return error(res, 'Only pending or chief-edited summaries can be edited', 400);
  }
  const { chiefEditedText } = req.body;
  doc.chiefEditedText = chiefEditedText != null ? chiefEditedText : doc.chiefEditedText;
  doc.status = 'CHIEF_EDITED';
  doc.chiefEditedAt = new Date();
  await doc.save();
  const populated = await DischargeSummary.findById(doc._id).populate('templateId', 'name layout').lean();
  return success(res, dischargeToClient(populated), 'Chief edits saved');
}

export async function approve(req, res) {
  const doc = await DischargeSummary.findById(req.params.id);
  if (!doc) return error(res, 'Discharge not found', 404);
  if (!canTransition(doc.status, 'APPROVED')) {
    return error(res, `Invalid transition: ${doc.status} -> APPROVED`, 400);
  }
  doc.finalVerifiedText = (doc.chiefEditedText || doc.aiEnhancedText || doc.doctorEditedText || '').trim() || doc.aiEnhancedText || '';
  doc.status = 'APPROVED';
  doc.approvedAt = new Date();
  await doc.save();

  try {
    await sendDischarge({
      mobile: doc.mobile,
      text: doc.finalVerifiedText,
      pdfUrl: null,
    });
  } catch (_) {
    // log but don't fail approval
  }

  const populated = await DischargeSummary.findById(doc._id).populate('templateId', 'name layout').lean();
  return success(res, dischargeToClient(populated), 'Approved');
}

export async function reject(req, res) {
  const doc = await DischargeSummary.findById(req.params.id);
  if (!doc) return error(res, 'Discharge not found', 404);
  if (!canTransition(doc.status, 'REJECTED')) {
    return error(res, `Invalid transition: ${doc.status} -> REJECTED`, 400);
  }
  doc.status = 'REJECTED';
  doc.rejectedAt = new Date();
  doc.rejectionRemarks = req.body.remarks || '';
  await doc.save();
  const populated = await DischargeSummary.findById(doc._id).populate('templateId', 'name layout').lean();
  return success(res, dischargeToClient(populated), 'Rejected');
}

export async function listVerified(req, res) {
  const { search, fromDate, toDate } = req.query;
  const filter = { status: 'APPROVED' };
  if (search && search.trim()) {
    const s = search.trim();
    filter.$or = [
      { uhid: new RegExp(s, 'i') },
      { ipid: new RegExp(s, 'i') },
      { mobile: new RegExp(s, 'i') },
    ];
  }
  if (fromDate) filter.approvedAt = { ...filter.approvedAt, $gte: new Date(fromDate) };
  if (toDate) filter.approvedAt = { ...filter.approvedAt, $lte: new Date(toDate) };
  const list = await DischargeSummary.find(filter)
    .sort({ approvedAt: -1 })
    .populate('templateId', 'name layout')
    .lean();
  return success(res, listToClient(list));
}

export async function list(req, res) {
  const { status, search, fromDate, toDate, department } = req.query;
  const filter = {};
  if (status) {
    const statuses = String(status)
      .split(',')
      .map((s) => normalizeStatus(s.trim()))
      .filter(Boolean);
    if (statuses.length) filter.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
  }
  if (search && search.trim()) {
    const s = search.trim();
    filter.$or = [
      { uhid: new RegExp(s, 'i') },
      { ipid: new RegExp(s, 'i') },
      { mobile: new RegExp(s, 'i') },
    ];
  }
  if (fromDate) filter.createdAt = { ...filter.createdAt, $gte: new Date(fromDate) };
  if (toDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(toDate) };
  if (department && department.trim()) filter.department = new RegExp(department.trim(), 'i');
  const list = await DischargeSummary.find(filter)
    .sort({ updatedAt: -1 })
    .populate('templateId', 'name layout')
    .lean();
  return success(res, listToClient(list));
}

export async function getById(req, res) {
  const doc = await DischargeSummary.findById(req.params.id)
    .populate('templateId', 'name layout version')
    .lean();
  if (!doc) return error(res, 'Discharge not found', 404);
  return success(res, dischargeToClient(doc));
}

const PRINT_STYLES = `
  @page { size: A4; margin: 15mm 20mm; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px; font-family: 'DM Sans', system-ui, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .ds-document-header { background: #0d9488; color: #fff; padding: 16px 24px; margin: -24px -24px 24px -24px; text-align: center; }
  .ds-document-header__title { font-size: 1.35rem; font-weight: 700; margin-bottom: 4px; }
  .ds-document-header__subtitle { font-size: 0.9rem; opacity: 0.95; }
  .ds-document-patient-strip { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 20px; margin-bottom: 24px; }
  .ds-document-patient-strip__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px 24px; }
  .ds-document-patient-strip__label { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
  .ds-document-patient-strip__value { font-size: 0.9rem; font-weight: 500; color: #1e293b; }
  .ds-summary-main-title { font-size: 1.1rem; font-weight: 700; color: #0f766e; border-bottom: 3px solid #0d9488; padding-bottom: 10px; margin-bottom: 20px; }
  .ds-summary-body { white-space: pre-wrap; line-height: 1.7; color: #1e293b; }
  @media print { body { padding: 0; max-width: 170mm; margin: 0 auto; } }
`.replace(/\n\s+/g, '\n').trim();

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildDischargeHtml(doc) {
  const text = doc.finalVerifiedText || doc.chiefEditedText || doc.aiEnhancedText || '';
  const name = doc.patientName || 'Patient';
  const uhid = doc.uhid || '—';
  const dischargeDate = doc.dischargeDate || doc.discharge_date || '—';
  const patientStrip = `
    <div class="ds-document-patient-strip">
      <div class="ds-document-patient-strip__grid">
        <div><span class="ds-document-patient-strip__label">UHID</span><div class="ds-document-patient-strip__value">${escapeHtml(String(doc.uhid || '—'))}</div></div>
        <div><span class="ds-document-patient-strip__label">IPID</span><div class="ds-document-patient-strip__value">${escapeHtml(String(doc.ipid || '—'))}</div></div>
        <div><span class="ds-document-patient-strip__label">Name</span><div class="ds-document-patient-strip__value">${escapeHtml(String(name))}</div></div>
        <div><span class="ds-document-patient-strip__label">Mobile</span><div class="ds-document-patient-strip__value">${escapeHtml(String(doc.mobile || '—'))}</div></div>
        <div><span class="ds-document-patient-strip__label">Age / Gender</span><div class="ds-document-patient-strip__value">${escapeHtml([doc.age, doc.gender].filter(Boolean).join(' / ') || '—')}</div></div>
        <div><span class="ds-document-patient-strip__label">Discharge date</span><div class="ds-document-patient-strip__value">${escapeHtml(String(dischargeDate))}</div></div>
      </div>
    </div>`;
  const header = `<header class="ds-document-header"><div class="ds-document-header__title">Discharge Summary</div><div class="ds-document-header__subtitle">${escapeHtml(name)} · UHID ${escapeHtml(uhid)} · Discharged ${escapeHtml(String(dischargeDate))}</div></header>`;
  const bodyContent = `<h2 class="ds-summary-main-title">Clinical summary</h2><div class="ds-summary-body">${escapeHtml(text) || 'No summary text.'}</div>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Discharge Summary - ${escapeHtml(name)}</title><style>${PRINT_STYLES}</style></head><body>${header}${patientStrip}${bodyContent}</body></html>`;
}

export async function downloadPdf(req, res) {
  const doc = await DischargeSummary.findById(req.params.id).lean();
  if (!doc) return error(res, 'Discharge not found', 404);
  if (doc.status !== 'APPROVED') return error(res, 'Only approved summaries can be downloaded as PDF', 400);
  const html = doc.renderedHtml && doc.renderedHtml.trim() ? doc.renderedHtml : buildDischargeHtml(doc);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="discharge-summary.html"');
  res.send(html);
}

export async function sendWhatsApp(req, res) {
  const doc = await DischargeSummary.findById(req.params.id).lean();
  if (!doc) return error(res, 'Discharge not found', 404);
  if (doc.status !== 'APPROVED') return error(res, 'Only approved summaries can be sent via WhatsApp', 400);
  const result = await sendDischarge({
    mobile: doc.mobile,
    text: doc.finalVerifiedText || doc.chiefEditedText || doc.aiEnhancedText || '',
    pdfUrl: null,
  });
  return success(res, result, 'WhatsApp sent');
}
