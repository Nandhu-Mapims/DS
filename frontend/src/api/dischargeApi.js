import { api } from './axios';

/** Unwrap backend response { success, data } to data */
function unwrap(res) {
  return res.data?.data !== undefined ? res.data.data : res.data;
}

/** Status values for discharge summaries */
export const DISCHARGE_STATUS = {
  DRAFT: 'draft',
  AI_ENHANCED: 'ai_enhanced',
  PENDING_APPROVAL: 'pending_approval',
  CHIEF_EDITED: 'chief_edited',
  REJECTED: 'rejected',
  APPROVED: 'approved',
};

const DISCHARGE_BASE = '/discharge';

/**
 * Create a new draft (no body or minimal). Returns { data: { _id, ... } }
 */
export async function createDraft(payload = {}) {
  const res = await api.post(DISCHARGE_BASE, { status: DISCHARGE_STATUS.DRAFT, ...payload });
  return unwrap(res);
}

/**
 * Save draft payload. PATCH /discharge/:id
 */
export async function saveDraft(id, payload) {
  const res = await api.patch(`${DISCHARGE_BASE}/${id}`, payload);
  return unwrap(res);
}

/**
 * List discharges with optional status, search, date range, department
 */
export async function listDischarges({ status, search = '', fromDate, toDate, department } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (search.trim()) params.set('search', search.trim());
  if (fromDate) params.set('fromDate', fromDate);
  if (toDate) params.set('toDate', toDate);
  if (department) params.set('department', department);
  const res = await api.get(`${DISCHARGE_BASE}?${params.toString()}`);
  return unwrap(res);
}

/**
 * List items for chief queue: PENDING_APPROVAL or CHIEF_EDITED
 */
export async function listChiefQueue({ fromDate, toDate, department, search = '' } = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  if (fromDate) params.set('fromDate', fromDate);
  if (toDate) params.set('toDate', toDate);
  if (department) params.set('department', department);
  const res = await api.get(`${DISCHARGE_BASE}/pending?${params.toString()}`);
  return unwrap(res);
}

/**
 * Get single discharge by id
 */
export async function getDischarge(id) {
  const res = await api.get(`${DISCHARGE_BASE}/${id}`);
  return unwrap(res);
}

/**
 * Trigger AI enhancement for a draft. Returns updated discharge with aiEnhancedText
 */
export async function generateAIDraft(id) {
  const res = await api.post(`${DISCHARGE_BASE}/${id}/ai-enhance`);
  return unwrap(res);
}

/**
 * Submit for chief approval (from doctor). Can send doctorEditedText if edited after AI
 */
export async function submitForApproval(id, payload = {}) {
  const res = await api.post(`${DISCHARGE_BASE}/${id}/submit`, payload);
  return unwrap(res);
}

/**
 * Update doctor-edited text (aiEnhancedText override) on preview screen.
 * Also sends aiEnhancedJson if the doctor edited structured fields.
 */
export async function updateDoctorEditedText(id, doctorEditedText, aiEnhancedJson) {
  const payload = { doctorEditedText };
  if (aiEnhancedJson) payload.aiEnhancedJson = aiEnhancedJson;
  const res = await api.patch(`${DISCHARGE_BASE}/${id}`, payload);
  return unwrap(res);
}

/**
 * Chief: Save edited content. PUT /discharge/:id/chief-edit
 */
export async function chiefEdit(id, chiefEditedText) {
  const res = await api.put(`${DISCHARGE_BASE}/${id}/chief-edit`, { chiefEditedText });
  return unwrap(res);
}

/**
 * Chief: Approve discharge. POST /discharge/:id/approve
 */
export async function approveDischarge(id) {
  const res = await api.post(`${DISCHARGE_BASE}/${id}/approve`);
  return unwrap(res);
}

/**
 * Chief: Reject with remarks. POST /discharge/:id/reject
 */
export async function rejectDischarge(id, { remarks }) {
  const res = await api.post(`${DISCHARGE_BASE}/${id}/reject`, { remarks: remarks || '' });
  return unwrap(res);
}

/**
 * List verified (approved) discharges. Status fixed to APPROVED.
 */
export async function listVerifiedDischarges({ search = '', fromDate, toDate } = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  if (fromDate) params.set('fromDate', fromDate);
  if (toDate) params.set('toDate', toDate);
  const res = await api.get(`${DISCHARGE_BASE}/verified?${params.toString()}`);
  return unwrap(res);
}

/**
 * Download discharge as PDF. Returns blob; backend may return HTML or PDF.
 */
export async function downloadDischargePdf(id) {
  const res = await api.get(`${DISCHARGE_BASE}/${id}/pdf`, { responseType: 'blob' });
  return res.data;
}

/**
 * Resend summary to patient via WhatsApp.
 */
export async function resendWhatsApp(id) {
  const res = await api.post(`${DISCHARGE_BASE}/${id}/whatsapp`);
  return unwrap(res);
}

/**
 * AI-powered ICD-10 code suggestion.
 * @param {{ provisionalDiagnosis?: string, finalDiagnosis?: string, clinicalDetails?: string }} payload
 * @returns {Promise<{ codes: Array<{ code: string, description: string }> }>}
 */
export async function suggestIcd10Codes(payload) {
  const res = await api.post(`${DISCHARGE_BASE}/suggest-icd10`, payload);
  return unwrap(res);
}
