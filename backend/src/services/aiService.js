import { config } from '../config/index.js';
import { validateDischargeJson } from '../ai/dischargeSchema.js';
import { renderDischargeHtml } from '../ai/renderDischargeHtml.js';

const SARVAM_URL = 'https://api.sarvam.ai/v1/chat/completions';
const SARVAM_MODEL = 'sarvam-m';
const PROMPT_VERSION = '2';

/**
 * Call Sarvam API to enhance discharge draft text. Returns null on missing key or API error.
 */
async function callSarvam(prompt) {
  const apiKey = config.sarvamApiKey?.trim();
  if (!apiKey) return null;
  try {
    const res = await fetch(SARVAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` // Use Bearer token for Sarvam
      },
      body: JSON.stringify({
        model: SARVAM_MODEL,
        messages: [{ role: 'user', content: prompt }], // OpenAI format
        temperature: 0.2,
        max_tokens: 2048, // Adjusted for Sarvam, ensure this is within limits
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('Sarvam API error:', res.status, err);
      return null;
    }
    const data = await res.json();
    // Parse OpenAI-style response
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch (e) {
    console.error('Sarvam request failed:', e.message);
    return null;
  }
}

/**
 * Call Sarvam with JSON-only instruction. Returns raw text or null.
 */
async function callSarvamJson(systemRule, userPrompt) {
  const apiKey = config.sarvamApiKey?.trim();
  if (!apiKey) return null;
  try {
    const res = await fetch(SARVAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: SARVAM_MODEL,
        messages: [
          { role: 'system', content: systemRule },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 4096,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('Sarvam JSON request failed:', res.status, err);
      return null;
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch (e) {
    console.error('Sarvam JSON request failed:', e.message);
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

  let outProcedures = [];
  if (Array.isArray(json.procedures)) {
    outProcedures = json.procedures.map((p) => p.name || JSON.stringify(p)).map(norm).filter(Boolean);
  } else if (typeof json.procedures === 'string') {
    outProcedures = json.procedures.split(/[,;.\n]/).map(norm).filter(Boolean);
  }
  outProcedures = outProcedures.slice(0, 15);

  outProcedures.forEach((p) => {
    // simpler check: if procedure name is not in input, finding potential hallucination
    // Relax logic: strict string match might trigger false positives if input form is structured differently.
    // For now, only warn if input has SOME procedures but this one is missing.
    if (inputProcedures.length > 0 && p && !inputProcedures.some((i) => i.includes(p) || p.includes(i))) {
      warnings.push('Potential hallucination: procedure introduced by AI');
    }
  });

  (json.medications || []).forEach((m) => {
    const name = norm(m?.name || m);
    if (name && !inputMeds.some((i) => i.includes(name) || name.includes(i))) warnings.push('Potential hallucination: medication introduced by AI');
  });

  return { ...json, warnings };
}

const JSON_SYSTEM_RULE = `You are a medical discharge summary assistant for a hospital.
Your task is to take the provided input data (which may be partial or unstructured) and produce a professional, structured JSON discharge summary.

CRITICAL RULES:
1. **Analyze ALL provided fields**. The input contains structured fields. You must use this data.
2. **EXPAND, DO NOT SUMMARIZE**. The goal is to produce a detailed, formal medical record.
   - **Transform brief notes into full, descriptive paragraphs.**
   - If input is "Fever x 2 days", output "The patient presented with a history of fever for 2 days."
   - If input is "Stable", output "The patient's condition was hemodynamically stable."
   - **Do NOT leave out details.** If the input lists 5 specific events, include all 5 in the narrative.
3. **Strict Fidelity**. Do NOT change clinical facts (dates, values, names). Do NOT invent new symptoms or diagnoses.
4. **Structure**. Return ONLY valid JSON matching the schema below.
5. **Missing Data**. If a field is empty, return null/empty string. Do not make up data.

Use exactly these top-level keys:
- patient (object: uhid, ipid, name, age, gender, mobile, address)
- admission (object: admissionDate, dischargeDate, department, dischargeCondition, consultant, wardBed)
- diagnoses (object: provisional, final, icd10Codes array)
- reasonForAdmission (string: detailed paragraph. MUST start with "Mr./Mrs. [Name], a [Age]-year-old [Gender]..." followed by presenting complaints and history in full sentences.)
- clinicalExamination (string: Narrative of clinical findings ON ADMISSION. Include general survey and admission vitals.)
- significantFindings (string: Must contain two sections. First, "*Systemic Review*:" covering relevant history (e.g. diabetes, hypertension) and systemic examination (CNS, CVS, Abdomen). Second, "*Vital Signs Summary*:" detailing BP, HR, SpO2 trends throughout the stay.)
- hospitalCourse (string: detailed, multi-sentence narrative of the stay. Expand brief events into a professional medical story of the patient's progress.)
- procedures (array of objects: date, name, indicationOutcome)
- investigations (array of objects: name, resultAdmission, resultDischarge, referenceRange)
- imagingReports (string)
- medicalDevices (array of objects: deviceType, model, location, implantDate)
- medications (array of objects: name, dose, frequency, duration, notes)
- instructions (object: diet, activity, followUp, redFlags, advice)
- missingFields (array of keys)
- warnings (array of strings)
- finalNarrativeText (string)`;

/**
 * Generate structured discharge JSON from draft input.
 */
export async function generateDischargeJson(aiInput) {
  const draft = aiInput?.doctorDraftText?.trim() || '';

  // Helper to stringify arrays of objects for better readability by LLM
  const formatList = (list) => {
    if (!list) return '';
    if (typeof list === 'string') return list;
    if (Array.isArray(list)) {
      return list.map(item => {
        if (typeof item === 'object') return JSON.stringify(item);
        return String(item);
      }).join('; ');
    }
    return String(list);
  };

  // Construct a comprehensive input block with ALL fields
  const inputData = [
    `Patient: Name=${aiInput.patientName}, UHID=${aiInput.uhid}, IPID=${aiInput.ipid}, Age=${aiInput.age}, Gender=${aiInput.gender}, Mobile=${aiInput.mobile}, Address=${aiInput.address || ''}`,
    `Admission: Date=${aiInput.admissionDate}, Discharge=${aiInput.dischargeDate}, Dept=${aiInput.department}, Consultant=${aiInput.consultant}, Ward=${aiInput.wardBed}`,
    `Diagnosis: Provisional=${aiInput.provisionalDiagnosis}, Final=${aiInput.finalDiagnosis}, ICD10=${formatList(aiInput.icd10Codes)}`,
    `Clinical: Reason=${aiInput.reasonForAdmission}, Exam=${aiInput.clinicalExamination}, Findings=${aiInput.significantFindings}`,
    `Course: ${aiInput.courseInHospital}`,
    `Treatment/Medications Given: ${aiInput.treatment}`,
    `Investigations: ${formatList(aiInput.investigations || aiInput.labResults)}, Imaging=${aiInput.imagingReports}`,
    `Procedures: ${formatList(aiInput.procedures || aiInput.procedureList)}`,
    `Discharge Medications: ${formatList(aiInput.medications || aiInput.medicationList)}`,
    `Medical Devices: ${formatList(aiInput.medicalDevices || aiInput.deviceList)}`,
    `Discharge Condition: ${aiInput.dischargeCondition}`,
    `Instructions: Advice=${aiInput.advice}, FollowUp=${aiInput.followUp}, RedFlags=${aiInput.redFlags}, Diet=${aiInput.diet || aiInput.instructions?.diet}, Activity=${aiInput.activity || aiInput.instructions?.activity}`,
    `Draft Text: ${draft}`
  ].join('\n\n');

  const userPrompt = `Input Data for Discharge Summary:\n\n${inputData}\n\nTask: Organize and enhance this data into the specified JSON structure. Preserve all clinical details exactly.`;

  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await callSarvamJson(JSON_SYSTEM_RULE, userPrompt);
    const parsed = parseJsonFromResponse(text);
    if (parsed && typeof parsed === 'object') {
      // Filter out noisy missing fields (e.g. specific array indices)
      if (Array.isArray(parsed.missingFields)) {
        parsed.missingFields = parsed.missingFields.filter(f => !f.includes('[') && !f.includes('.'));
      }
      return parsed;
    }
  }
  return null;
}

/**
 * AI enhancement: always outputs JSON for the template.
 * Pipeline: generateDischargeJson -> validate -> renderDischargeHtml.
 * If first attempt fails, retries with a simplified prompt.
 * Final fallback: deterministic formatting (no AI).
 */
export async function enhanceDischargeWithAI({ dischargeData, template }) {
  const draft = dischargeData?.doctorDraftText?.trim() || '';
  const apiKey = config.sarvamApiKey?.trim();
  const hasData = draft || Object.values(dischargeData || {}).some(v => v && String(v).length > 0);

  if (apiKey && hasData) {
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

    // Retry: try JSON generation one more time with a simplified prompt
    const retryPrompt = `Structure this discharge data into JSON. Use ONLY the data provided. Do NOT invent or add anything.\n\nPatient: ${dischargeData.patientName || ''}, UHID: ${dischargeData.uhid || ''}, IPID: ${dischargeData.ipid || ''}, Age: ${dischargeData.age || ''}, Gender: ${dischargeData.gender || ''}, Mobile: ${dischargeData.mobile || ''}\nAdmission: ${dischargeData.admissionDate || ''}, Discharge: ${dischargeData.dischargeDate || ''}, Department: ${dischargeData.department || ''}, Consultant: ${dischargeData.consultant || ''}, Ward: ${dischargeData.wardBed || ''}\nDiagnosis: Provisional=${dischargeData.provisionalDiagnosis || ''}, Final=${dischargeData.finalDiagnosis || ''}, ICD10=${(dischargeData.icd10Codes || []).join(', ')}\n\nDraft text:\n${draft}`;
    const retryText = await callSarvamJson(JSON_SYSTEM_RULE, retryPrompt);
    const retryParsed = parseJsonFromResponse(retryText);
    if (retryParsed && typeof retryParsed === 'object') {
      const retryValidated = validateDischargeJson(retryParsed);
      if (retryValidated.success) {
        const data = retryValidated.data;
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
  if (data.reasonForAdmission?.trim()) parts.push(`Reason for Admission: ${data.reasonForAdmission}`);
  if (data.clinicalExamination?.trim()) parts.push(`Clinical Examination: ${data.clinicalExamination}`);
  if (data.significantFindings?.trim()) parts.push(`Significant Findings: ${data.significantFindings}`);
  if (data.hospitalCourse?.trim()) parts.push(`Hospital course: ${data.hospitalCourse}`);
  if (Array.isArray(data.procedures) && data.procedures.length) {
    parts.push(`Procedures: ${data.procedures.map((pr) => pr.name || '').filter(Boolean).join('; ')}`);
  } else if (typeof data.procedures === 'string' && data.procedures.trim()) {
    parts.push(`Procedures: ${data.procedures}`);
  }
  if (Array.isArray(data.investigations) && data.investigations.length) {
    parts.push(`Investigations: ${data.investigations.map((inv) => inv.name || '').filter(Boolean).join(', ')}`);
  } else if (typeof data.investigations === 'string' && data.investigations.trim()) {
    parts.push(`Investigations: ${data.investigations}`);
  }
  if (data.imagingReports?.trim()) parts.push(`Imaging Reports: ${data.imagingReports}`);
  if (Array.isArray(data.medicalDevices) && data.medicalDevices.length) {
    parts.push(`Medical Devices: ${data.medicalDevices.map((dev) => dev.deviceType || '').filter(Boolean).join('; ')}`);
  }
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

  // Create fallback JSON structure for frontend editing if AI fails
  const aiEnhancedJson = {
    patient: {
      uhid: dischargeData.uhid,
      ipid: dischargeData.ipid,
      name: dischargeData.patientName,
      age: dischargeData.age,
      gender: dischargeData.gender,
      mobile: dischargeData.mobile,
      address: dischargeData.address,
    },
    admission: {
      admissionDate: dischargeData.admissionDate,
      dischargeDate: dischargeData.dischargeDate,
      department: dischargeData.department,
      consultant: dischargeData.consultant,
      wardBed: dischargeData.wardBed,
      dischargeCondition: dischargeData.dischargeCondition,
    },
    diagnoses: {
      provisional: dischargeData.provisionalDiagnosis,
      final: dischargeData.finalDiagnosis,
      icd10Codes: Array.isArray(dischargeData.icd10Codes) ? dischargeData.icd10Codes : [],
    },
    reasonForAdmission: dischargeData.reasonForAdmission,
    clinicalExamination: dischargeData.clinicalExamination,
    significantFindings: dischargeData.significantFindings,
    hospitalCourse: dischargeData.courseInHospital,
    procedures: (Array.isArray(dischargeData.procedureList) && dischargeData.procedureList.length)
      ? dischargeData.procedureList
      : (dischargeData.procedures ? [{ name: dischargeData.procedures }] : []),
    investigations: (Array.isArray(dischargeData.labResults) && dischargeData.labResults.length)
      ? dischargeData.labResults.map(l => ({ name: l.investigation, resultAdmission: l.resultAdmission, resultDischarge: l.resultDischarge, referenceRange: l.referenceRange }))
      : (dischargeData.investigations ? [{ name: dischargeData.investigations }] : []),
    imagingReports: dischargeData.imagingReports,
    medications: (Array.isArray(dischargeData.medicationList) && dischargeData.medicationList.length)
      ? dischargeData.medicationList
      : (dischargeData.medications ? [{ name: dischargeData.medications }] : []),
    medicalDevices: (Array.isArray(dischargeData.deviceList) && dischargeData.deviceList.length)
      ? dischargeData.deviceList
      : [],
    instructions: {
      advice: dischargeData.advice,
      followUp: dischargeData.followUp,
      redFlags: dischargeData.redFlags,
    },
    missingFields: [],
    warnings: ['Note: Content generated from structured data (AI generation unavailable).'],
    finalNarrativeText: enhancedText,
  };

  return { enhancedText, renderedHtml, aiEnhancedJson };
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

/**
 * AI-powered ICD-10 code suggestion.
 * Accepts diagnosis strings and optional context. Returns array of { code, description }.
 */
export async function suggestIcd10Codes({ provisionalDiagnosis, finalDiagnosis, clinicalDetails }) {
  const apiKey = config.sarvamApiKey?.trim();
  if (!apiKey) return { codes: [], error: 'AI service unavailable (no API key)' };

  const diagParts = [
    provisionalDiagnosis && `Provisional Diagnosis: ${provisionalDiagnosis}`,
    finalDiagnosis && `Final Diagnosis: ${finalDiagnosis}`,
    clinicalDetails && `Clinical Details: ${clinicalDetails}`,
  ].filter(Boolean).join('\n');

  if (!diagParts.trim()) return { codes: [], error: 'No diagnosis information provided' };

  const systemPrompt = `You are a medical coding assistant specialising in ICD-10 coding for hospital discharge summaries.

RULES:
1. Return ONLY valid JSON — an array of objects, each with "code" and "description" keys.
2. Map EACH diagnosis or condition mentioned in the input to its most specific ICD-10-CM/WHO code.
3. Include both primary and secondary diagnoses.
4. Do NOT invent conditions that are not mentioned or clearly implied.
5. Use the standard format, e.g. "I63.5" not "I63.50".
6. Return at most 10 codes, ordered by clinical relevance (primary first).
7. No markdown, no code fences, no commentary.

Example output:
[{"code":"I63.5","description":"Cerebral infarction due to unspecified occlusion or stenosis of cerebral arteries"},{"code":"I10","description":"Essential primary hypertension"}]`;

  const userPrompt = `Generate ICD-10 codes for the following patient diagnoses:\n\n${diagParts}`;

  const rawText = await callSarvamJson(systemPrompt, userPrompt);
  const parsed = parseJsonFromResponse(rawText);

  if (Array.isArray(parsed) && parsed.length > 0) {
    const codes = parsed
      .filter(item => item && item.code && item.description)
      .map(item => ({ code: String(item.code).trim(), description: String(item.description).trim() }))
      .slice(0, 10);
    return { codes };
  }

  return { codes: [], error: 'AI could not generate ICD-10 codes. Please enter them manually.' };
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
