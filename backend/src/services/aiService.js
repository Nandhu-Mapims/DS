import { config } from '../config/index.js';
import { validateDischargeJson } from '../ai/dischargeSchema.js';
import { renderDischargeHtml } from '../ai/renderDischargeHtml.js';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const PROMPT_VERSION = '1';

/**
 * Call Gemini API to enhance discharge draft text. Returns null on missing key or API error.
 */
async function callGemini(prompt) {
  const apiKey = config.geminiApiKey?.trim();
  if (!apiKey) return null;
  try {
    const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('Gemini API error:', res.status, err);
      return null;
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || null;
  } catch (e) {
    console.error('Gemini request failed:', e.message);
    return null;
  }
}

/**
 * Call Gemini with JSON-only instruction. Returns raw text or null.
 */
async function callGeminiJson(systemRule, userPrompt) {
  const apiKey = config.geminiApiKey?.trim();
  if (!apiKey) return null;
  try {
    const fullPrompt = `${systemRule}\n\n${userPrompt}`;
    const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || null;
  } catch (e) {
    console.error('Gemini JSON request failed:', e.message);
    return null;
  }
}

function parseJsonFromResponse(text) {
  if (!text || typeof text !== 'string') return null;
  let raw = text.trim();
  const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) raw = codeBlock[1].trim();
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Fact guard: if AI output contains diagnosis/procedure/medication not in input, add warning.
 * Does not block; returns json with updated warnings array.
 */
function addFactGuardWarnings(json, input) {
  const warnings = [...(json.warnings || [])];
  const norm = (s) => (s || '').toLowerCase().trim();
  const toList = (v) =>
    Array.isArray(v) ? v.map((x) => norm(String(x))) : typeof v === 'string' && v ? v.split(/[,;]/).map((x) => norm(x)).filter(Boolean) : [];
  const inputDiag = toList(input.finalDiagnosis).concat(toList(input.provisionalDiagnosis));
  const inputIcd = toList(Array.isArray(input.icd10Codes) ? input.icd10Codes : [input.icd10Codes].filter(Boolean));
  const inputProcedures = toList(input.procedures);
  const inputMeds = toList(input.medications);

  const d = json.diagnoses || {};
  const outDiag = [d.final, d.provisional].filter(Boolean).map(norm);
  const outIcd = (d.icd10Codes || []).map(norm);
  outDiag.forEach((dVal) => {
    if (dVal && !inputDiag.some((i) => i.includes(dVal) || dVal.includes(i))) warnings.push('Potential hallucination: diagnosis introduced by AI');
  });
  outIcd.forEach((c) => {
    if (c && !inputIcd.some((i) => i.includes(c) || c.includes(i))) warnings.push('Potential hallucination: ICD-10 introduced by AI');
  });

  const outProcedures = (json.procedures || '').split(/[,;.\n]/).map(norm).filter(Boolean).slice(0, 15);
  outProcedures.forEach((p) => {
    if (p && !inputProcedures.some((i) => i.includes(p) || p.includes(i))) warnings.push('Potential hallucination: procedure introduced by AI');
  });

  (json.medications || []).forEach((m) => {
    const name = norm(m?.name || m);
    if (name && !inputMeds.some((i) => i.includes(name) || name.includes(i))) warnings.push('Potential hallucination: medication introduced by AI');
  });

  return { ...json, warnings };
}

const JSON_SYSTEM_RULE = `You are a medical discharge summary assistant. Return ONLY valid JSON. No markdown, no code fences, no extra keys, no commentary.
Use exactly these top-level keys: patient (object: uhid, ipid, name, age, gender, mobile), admission (object: admissionDate, dischargeDate, department, dischargeCondition), diagnoses (object: provisional, final, icd10Codes array), hospitalCourse (string), procedures (string), investigations (string), medications (array of objects with name, dose, route, frequency, duration, notes), instructions (object: diet, activity, woundCare, followUp, redFlags, advice), missingFields (array of field keys that were not in the draft), warnings (array of strings), finalNarrativeText (string: brief clinical summary).
If a field is not present in the draft, set it to null and add the field key to missingFields. Do NOT invent any data. Only use information from the draft.`;

/**
 * Generate structured discharge JSON from draft input. Retries once on parse failure.
 * Returns parsed object or null.
 */
export async function generateDischargeJson(aiInput) {
  const draft = aiInput?.doctorDraftText?.trim() || '';
  const userPrompt = `Draft discharge summary to structure into JSON:\n\n${draft}\n\nAlso include this context for patient/admission only (copy exactly, do not invent): UHID=${aiInput.uhid || ''}, IPID=${aiInput.ipid || ''}, Name=${aiInput.patientName || ''}, Mobile=${aiInput.mobile || ''}, Age=${aiInput.age || ''}, Gender=${aiInput.gender || ''}, Admission=${aiInput.admissionDate || ''}, Discharge=${aiInput.dischargeDate || ''}, Department=${aiInput.department || ''}, Provisional diagnosis=${aiInput.provisionalDiagnosis || ''}, Final diagnosis=${aiInput.finalDiagnosis || ''}, ICD10=${(aiInput.icd10Codes || []).join(', ')}, Procedures=${aiInput.procedures || ''}, Medications=${aiInput.medications || ''}. Output valid JSON only.`;

  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await callGeminiJson(JSON_SYSTEM_RULE, userPrompt);
    const parsed = parseJsonFromResponse(text);
    if (parsed && typeof parsed === 'object') return parsed;
  }
  return null;
}

/**
 * AI enhancement: tries JSON-first pipeline (generateDischargeJson -> validate -> render);
 * on success returns enhancedText, renderedHtml, aiEnhancedJson, missingFields, warnings.
 * On failure falls back to markdown-based enhancement or deterministic formatting.
 */
export async function enhanceDischargeWithAI({ dischargeData, template }) {
  const draft = dischargeData?.doctorDraftText?.trim();
  const apiKey = config.geminiApiKey?.trim();

  if (apiKey && draft) {
    const parsed = await generateDischargeJson(dischargeData);
    if (parsed) {
      const withWarnings = addFactGuardWarnings(parsed, dischargeData);
      const validated = validateDischargeJson(withWarnings);
      if (validated.success) {
        const data = validated.data;
        const enhancedText = (data.finalNarrativeText && data.finalNarrativeText.trim()) || buildFallbackTextFromJson(data);
        const renderedHtml = renderDischargeHtml(data);
        return {
          enhancedText,
          renderedHtml,
          aiEnhancedJson: data,
          missingFields: data.missingFields || [],
          warnings: data.warnings || [],
          promptVersion: PROMPT_VERSION,
        };
      }
    }

    const patientContext = [dischargeData?.patientName, dischargeData?.uhid].filter(Boolean).join(' · ');
    const prompt = `You are a medical discharge summary assistant. Your task is to improve the following discharge summary draft for clarity, grammar, and professional wording only.

Rules:
- Preserve all factual data exactly (patient IDs, dates, diagnoses, medications, findings). Do not add, remove, or infer any clinical information.
- Do not add any preamble, explanation, or commentary. Output must start directly with the summary content.
- Use this structure so the document can be rendered correctly:
  1. Separate major sections with a blank line, then "---", then a blank line.
  2. Start each section with a heading on its own line: "## Section Name" (e.g. ## Patient Identifiers, ## Admission / Discharge, ## Diagnosis, ## Course in Hospital, ## Investigations, ## Treatment, ## Medications, ## Advice, ## Follow-up).
  3. For key-value blocks (e.g. patient identifiers, admission/discharge dates), use a markdown table:
     ## Section Name
     | Label | Value |
     |-------|-------|
     | UHID  | ...   |
     | Name  | ...   |
  4. For narrative sections, use "## Section Name" then plain paragraphs; use line breaks where appropriate.

Use only the sections that have content in the draft. Order sections logically (identifiers and dates first, then diagnosis, course, investigations, treatment, medications, advice, follow-up). Output nothing except the formatted discharge summary.${patientContext ? `\n\nContext (for reference only): ${patientContext}` : ''}

--- DRAFT ---

${draft}`;
    let enhancedText = await callGemini(prompt);
    if (enhancedText) {
      enhancedText = enhancedText.replace(/^[\s\S]*?(?=\n##\s|\n\n---\n\n)/, (m) => (m.trim().toLowerCase().startsWith('##') || m.trim().startsWith('---') ? m : '')).trim() || enhancedText;
    }
    if (enhancedText) {
      const partsForHtml = enhancedText.split(/\n\n---\n\n|\n##\s+/).filter(Boolean).map((block) => {
        const firstLine = block.split('\n')[0] || '';
        const title = firstLine.replace(/^#+\s*/, '').trim() || 'Section';
        const body = block.replace(/^#+\s*[^\n]*\n?/, '').trim();
        return formatParagraphHtml(title, body);
      });
      if (partsForHtml.length === 0) partsForHtml.push(formatParagraphHtml('Discharge Summary', enhancedText));
      const layout = template?.layout || 'CLASSIC';
      const renderedHtml = formatDocumentHtml(partsForHtml, layout, template?.defaultCss, false);
      return { enhancedText, renderedHtml };
    }
  }

  return enhanceDischarge({ dischargeData, template });
}

function buildFallbackTextFromJson(data) {
  const parts = [];
  const p = data.patient || {};
  const a = data.admission || {};
  const d = data.diagnoses || {};
  parts.push(`Patient: ${[p.name, p.uhid, p.ipid, p.mobile, p.age, p.gender].filter(Boolean).join(', ') || '—'}`);
  parts.push(`Admission: ${a.admissionDate || '—'} | Discharge: ${a.dischargeDate || '—'} | ${a.department || '—'}`);
  parts.push(`Diagnosis: Provisional ${d.provisional || '—'}; Final ${d.final || '—'}; ICD-10: ${(d.icd10Codes || []).join(', ') || '—'}`);
  if (data.hospitalCourse?.trim()) parts.push(`Hospital course: ${data.hospitalCourse}`);
  if (data.procedures?.trim()) parts.push(`Procedures: ${data.procedures}`);
  if (data.investigations?.trim()) parts.push(`Investigations: ${data.investigations}`);
  if (Array.isArray(data.medications) && data.medications.length) parts.push(`Medications: ${data.medications.map((m) => m.name || m.dose || '').filter(Boolean).join('; ')}`);
  const inst = data.instructions || {};
  if (inst.followUp?.trim() || inst.advice?.trim()) parts.push(`Follow-up: ${inst.followUp || ''} ${inst.advice || ''}`.trim());
  return parts.join('\n\n');
}

/**
 * Deterministic AI enhancement: format discharge data into template sections.
 * Premium templates use tables and flows; no external API calls.
 */
export function enhanceDischarge({ dischargeData, template }) {
  const sections = template?.sections?.length
    ? [...template.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : getDefaultSections();

  const layout = template?.layout || 'CLASSIC';
  const parts = [];
  const partsForHtml = [];

  for (const section of sections) {
    const key = section.key || section.label?.toLowerCase().replace(/\s+/g, '_');
    const display = section.display || 'paragraph';
    const value = getFieldValue(dischargeData, key);
    if (value === undefined || value === null) continue;

    const label = section.label || key;
    const isTable = display === 'table';
    const rows = isTable && section.flow === 'label_value' ? getRowsForSection(key, dischargeData) : null;

    if (isTable && rows && rows.length > 0) {
      const textBlock = formatSectionAsTableText(label, rows);
      const htmlBlock = formatSectionAsTableHtml(label, rows);
      parts.push(textBlock);
      partsForHtml.push(htmlBlock);
    } else if (value !== '' && String(value).trim() !== '') {
      const formatted = formatSectionContent(key, String(value).trim(), layout);
      parts.push(`## ${label}\n\n${formatted}`);
      partsForHtml.push(formatParagraphHtml(label, formatted));
    }
  }

  const enhancedText = parts.join('\n\n---\n\n');
  const renderedHtml = formatDocumentHtml(partsForHtml, layout, template?.defaultCss, !!template?.sections?.some((s) => s.display === 'table'));
  return { enhancedText, renderedHtml };
}

function getDefaultSections() {
  return [
    { key: 'header', label: 'Header', order: 0, display: 'paragraph' },
    { key: 'patient_identifiers', label: 'Patient Identifiers', order: 1, display: 'table', flow: 'label_value' },
    { key: 'admission_discharge', label: 'Admission / Discharge', order: 2, display: 'table', flow: 'label_value' },
    { key: 'diagnosis', label: 'Diagnosis', order: 3, display: 'table', flow: 'label_value' },
    { key: 'course', label: 'Course in Hospital', order: 4, display: 'paragraph' },
    { key: 'investigations', label: 'Investigations', order: 5, display: 'paragraph' },
    { key: 'treatment', label: 'Treatment', order: 6, display: 'paragraph' },
    { key: 'medications', label: 'Medications', order: 7, display: 'paragraph' },
    { key: 'advice', label: 'Advice', order: 8, display: 'paragraph' },
    { key: 'follow_up', label: 'Follow-up', order: 9, display: 'paragraph' },
    { key: 'red_flags', label: 'Red Flags', order: 10, display: 'paragraph' },
    { key: 'signatures', label: 'Signatures', order: 11, display: 'table', flow: 'label_value' },
  ];
}

function getRowsForSection(key, data) {
  const tables = {
    patient_identifiers: [
      ['UHID', data.uhid],
      ['IPID', data.ipid],
      ['Patient Name', data.patientName],
      ['Mobile', data.mobile],
      ['Age', data.age],
      ['Gender', data.gender],
    ],
    admission_discharge: [
      ['Admission Date', data.admissionDate],
      ['Discharge Date', data.dischargeDate],
      ['Department', data.department],
    ],
    diagnosis: [
      ['Provisional Diagnosis', data.provisionalDiagnosis],
      ['Final Diagnosis', data.finalDiagnosis],
      ['ICD-10 Codes', Array.isArray(data.icd10Codes) ? data.icd10Codes.join(', ') : ''],
    ],
    signatures: [
      ['Consultant', '______________________'],
      ['Date', '______________________'],
    ],
  };
  const rows = tables[key];
  if (rows) return rows.filter(([, v]) => v != null && String(v).trim() !== '');
  return [];
}

function getFieldValue(data, key) {
  const map = {
    header: () => `Discharge Summary - ${data.patientName || data.uhid || 'Patient'}`,
    patient_identifiers: () =>
      [['UHID', data.uhid], ['IPID', data.ipid], ['Name', data.patientName], ['Mobile', data.mobile], ['Age', data.age], ['Gender', data.gender]]
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n'),
    admission_discharge: () =>
      [['Admission', data.admissionDate], ['Discharge', data.dischargeDate]]
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n'),
    diagnosis: () => [
      data.provisionalDiagnosis && `Provisional: ${data.provisionalDiagnosis}`,
      data.finalDiagnosis && `Final: ${data.finalDiagnosis}`,
      Array.isArray(data.icd10Codes) && data.icd10Codes.length && `ICD-10: ${data.icd10Codes.join(', ')}`,
    ]
      .filter(Boolean)
      .join('\n'),
    course: data.courseInHospital,
    investigations: data.investigations,
    treatment: data.treatment,
    procedures: data.procedures,
    medications: data.medications,
    advice: data.advice,
    follow_up: data.followUp,
    red_flags: data.redFlags,
    discharge_condition: data.dischargeCondition,
    signatures: () => '______________________\nDr. ______________________',
  };
  const fn = map[key];
  return typeof fn === 'function' ? fn() : data[key];
}

function formatSectionAsTableText(label, rows) {
  const header = `## ${label}\n`;
  const colWidths = [20, 50];
  const sep = '| ' + colWidths.map((w) => '-'.repeat(Math.max(0, w - 2))).join(' | ') + ' |';
  const headRow = '| Label              | Value                                              |';
  const bodyRows = rows.map(([k, v]) => `| ${pad(k, colWidths[0])} | ${pad(String(v ?? ''), colWidths[1])} |`).join('\n');
  return header + '\n' + headRow + '\n' + sep + '\n' + bodyRows;
}

function pad(s, n) {
  const t = String(s).slice(0, n);
  return t.padEnd(n);
}

function formatSectionAsTableHtml(label, rows) {
  const header = escapeHtml(label);
  const body = rows
    .map(([k, v]) => `<tr><th>${escapeHtml(String(k))}</th><td>${escapeHtml(String(v ?? ''))}</td></tr>`)
    .join('');
  return `<section><h3>${header}</h3><table class="ds-table"><thead><tr><th>Label</th><th>Value</th></tr></thead><tbody>${body}</tbody></table></section>`;
}

function formatSectionContent(key, value, layout) {
  if (layout === 'COMPACT' || layout === 'PREMIUM_TABLE') return value.replace(/\n/g, ' | ');
  if (layout === 'MODERN') return value.split('\n').map((line) => `• ${line}`).join('\n');
  return value;
}

function formatParagraphHtml(title, body) {
  const safeBody = escapeHtml(body).replace(/\n/g, '<br/>');
  return `<section><h3>${escapeHtml(title)}</h3><div class="section-body">${safeBody}</div></section>`;
}

function formatDocumentHtml(blocks, layout, defaultCss, hasTables) {
  const bodyClass = hasTables ? `layout-premium-table layout-${layout}` : `layout-${layout}`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>${defaultCss ? `<style>${defaultCss}</style>` : ''}</head><body class="${bodyClass}">${blocks.join('')}</body></html>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
