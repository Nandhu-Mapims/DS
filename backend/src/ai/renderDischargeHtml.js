/**
 * Render validated discharge JSON as MAPIMS-style hospital discharge summary HTML.
 * Follows the exact MAPIMS template layout with:
 *   - Clinical Summary (Reason for Admission + Clinical Examination inline)
 *   - Significant Findings & Examination
 *   - Laboratory Investigations (table)
 *   - Imaging & Diagnostic Reports
 *   - Final Diagnosis
 *   - Hospital Course & Care Provided
 *   - Procedures Performed (table)
 *   - Medical Devices / Implants (table)
 *   - Condition at Discharge
 *   - Post-Discharge Instructions (medications table)
 *   - Follow-up Advice
 *   - Urgent Care Instructions
 *   - Dietary and Activity Advice
 *   - Signatures & Footer
 */

const HOSPITAL_NAME = 'MAPIMS';
const HOSPITAL_TAGLINE = 'Melmaruvathur Adhiparasakthi Institute of Medical Sciences and Research';
const HOSPITAL_ADDRESS = 'Melmaruvathur, Kancheepuram Dist, Tamil Nadu - 603319';
const HOSPITAL_CONTACT = 'Contact: +91-44-27529401 | Email: info@mapims.edu.in';
const LOGO_URL = 'https://mh.mapims.edu.in/static/images/logo.png';

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function para(text) {
  if (!text || !String(text).trim()) return '';
  const safe = escapeHtml(String(text).trim()).replace(/\n/g, '</p><p>');
  return `<p>${safe}</p>`;
}

const MAPIMS_CSS = `
:root {
  --primary-color: #004a99;
  --secondary-color: #003366;
  --accent-color: #e6f0fa;
  --border-color: #d1d9e6;
  --text-dark: #2c3e50;
  --text-muted: #546e7a;
}
@page { size: A4; margin: 0; }
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f7f9;
  color: var(--text-dark);
  line-height: 1.4;
  font-size: 10pt;
  -webkit-print-color-adjust: exact;
}
.container {
  width: 210mm;
  margin: 20px auto;
  background-color: #fff;
  padding: 20mm;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  box-sizing: border-box;
}
@media print {
  body { background-color: #fff; }
  .container { margin: 0; box-shadow: none; width: 210mm; padding: 15mm 20mm 10mm 20mm; }
  .no-print { display: none; }
  .new-page-section { break-before: page; padding-top: 15mm; }
  section, table, .info-group, .diagnosis-box, .signature-area { break-inside: avoid; }
  .report-title { margin-top: 10mm; }
}
.hospital-header {
  display: flex;
  align-items: center;
  border-bottom: 3px solid var(--primary-color);
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.logo { flex: 0 0 120px; }
.logo img { max-width: 100%; height: auto; }
.hospital-details { flex: 1; padding-left: 20px; }
.hospital-details h1 { margin: 0; font-size: 20pt; color: var(--primary-color); text-transform: uppercase; }
.hospital-details p { margin: 2px 0; font-size: 9pt; color: var(--text-muted); }
.report-title {
  text-align: center;
  background-color: var(--accent-color);
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 4px;
}
.report-title h2 { margin: 0; font-size: 14pt; color: var(--secondary-color); letter-spacing: 1px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
.info-group { border: 1px solid var(--border-color); border-radius: 4px; padding: 10px; }
.info-group-title {
  font-weight: bold;
  font-size: 9pt;
  color: var(--primary-color);
  text-transform: uppercase;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 4px;
}
.info-row { display: flex; margin-bottom: 4px; }
.info-label { flex: 0 0 120px; font-weight: 600; color: var(--text-muted); font-size: 8.5pt; }
.info-value { flex: 1; font-size: 9pt; }
.section-title {
  background-color: var(--secondary-color);
  color: white;
  padding: 6px 12px;
  font-size: 11pt;
  margin-top: 15px;
  margin-bottom: 10px;
  border-radius: 2px;
  text-transform: uppercase;
}
.content-text { text-align: justify; margin-bottom: 15px; }
.diagnosis-box {
  background-color: #fafafa;
  border: 1px dashed var(--border-color);
  padding: 10px 20px;
  margin-bottom: 15px;
}
table { width: 100%; border-collapse: collapse; margin: 15px 0; }
th {
  background-color: #f0f4f8;
  color: var(--secondary-color);
  font-weight: 600;
  text-align: left;
  padding: 10px;
  border: 1px solid var(--border-color);
  font-size: 9pt;
}
td { padding: 8px 10px; border: 1px solid var(--border-color); font-size: 9pt; }
tr:nth-child(even) { background-color: #fcfcfc; }
.footer {
  margin-top: 40px;
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
  text-align: center;
  font-size: 8pt;
  color: var(--text-muted);
}
.signature-area { margin-top: 40px; display: flex; justify-content: space-between; break-inside: avoid; }
.sig-box { text-align: center; width: 200px; }
.sig-line { border-top: 1px solid var(--text-dark); margin-bottom: 5px; }
ul { padding-left: 20px; margin: 5px 0; }
.lab-results { font-size: 8.5pt; }
`.replace(/\n\s+/g, ' ').trim();

/**
 * @param {object} json - Validated discharge JSON (dischargeJsonSchema shape)
 * @returns {string} Full HTML document (MAPIMS-style)
 */
export function renderDischargeHtml(json) {
  if (!json) return '';
  const p = json.patient || {};
  const a = json.admission || {};
  const d = json.diagnoses || {};
  const inst = json.instructions || {};
  const ageGender = [p.age, p.gender].filter(Boolean).join(' / ') || '—';
  const uhidIpid = [p.uhid, p.ipid].filter(Boolean).join(' / ') || '—';
  const address = p.address || (p.mobile ? `Contact: ${p.mobile}` : '—');

  const patientProfile = [
    ['Name:', p.name || '—'],
    ['UHID / IP No:', uhidIpid],
    ['Age / Gender:', ageGender],
    ['Address:', address],
  ];
  const admissionDetails = [
    ['Admission Date:', a.admissionDate || '—'],
    ['Discharge Date:', a.dischargeDate || '—'],
    ['Consultant:', a.consultant || a.department || '—'],
    ['Ward / Bed:', a.wardBed || '—'],
  ];

  let html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Discharge Summary - ${escapeHtml(HOSPITAL_NAME)}</title><style>${MAPIMS_CSS}</style></head><body><div class="container">`;

  // Hospital Header
  html += `<header class="hospital-header"><div class="logo"><img src="${escapeHtml(LOGO_URL)}" alt="${escapeHtml(HOSPITAL_NAME)} Logo" onerror="this.src='https://via.placeholder.com/120x60?text=MAPIMS+LOGO'"></div><div class="hospital-details"><h1>${escapeHtml(HOSPITAL_NAME)}</h1><p>${escapeHtml(HOSPITAL_TAGLINE)}</p><p>${escapeHtml(HOSPITAL_ADDRESS)}</p><p>${escapeHtml(HOSPITAL_CONTACT)}</p></div></header>`;
  html += `<div class="report-title"><h2>HOSPITAL DISCHARGE SUMMARY</h2></div>`;

  // Patient Profile & Admission Details grid
  html += '<div class="info-grid">';
  html += '<div class="info-group"><div class="info-group-title">Patient Profile</div>';
  patientProfile.forEach(([label, val]) => { html += `<div class="info-row"><span class="info-label">${escapeHtml(label)}</span><span class="info-value">${escapeHtml(String(val))}</span></div>`; });
  html += '</div><div class="info-group"><div class="info-group-title">Admission Details</div>';
  admissionDetails.forEach(([label, val]) => { html += `<div class="info-row"><span class="info-label">${escapeHtml(label)}</span><span class="info-value">${escapeHtml(String(val))}</span></div>`; });
  html += '</div></div>';

  // Section 1: Clinical Summary (Reason for Admission + Clinical Examination combined)
  const hasReason = json.reasonForAdmission && String(json.reasonForAdmission).trim();
  const hasClinicalExam = json.clinicalExamination && String(json.clinicalExamination).trim();
  if (hasReason || hasClinicalExam) {
    html += '<section><div class="section-title">Clinical Summary</div><div class="content-text">';
    if (hasReason) {
      html += `<p><strong>Reason for Admission:</strong> ${escapeHtml(String(json.reasonForAdmission).trim())}</p>`;
    }
    if (hasClinicalExam) {
      html += `<p><strong>Clinical Examination:</strong> ${escapeHtml(String(json.clinicalExamination).trim())}</p>`;
    }
    html += '</div>';
  }

  // Significant Findings & Examination
  if (json.significantFindings && String(json.significantFindings).trim()) {
    html += '<div class="section-title">Significant Findings &amp; Examination</div><div class="content-text">';
    html += para(json.significantFindings);
    html += '</div>';
  }

  // Close the clinical summary section
  if (hasReason || hasClinicalExam || (json.significantFindings && String(json.significantFindings).trim())) {
    html += '</section>';
  }

  // Section 2: Laboratory Investigations (TABLE)
  const invs = json.investigations;
  const hasLabTable = Array.isArray(invs) && invs.length > 0;
  const hasImaging = json.imagingReports && String(json.imagingReports).trim();
  const hasDiagnosis = d.final || d.provisional || (d.icd10Codes && d.icd10Codes.length);

  if (hasLabTable || hasImaging || hasDiagnosis) {
    html += '<section class="new-page-section">';

    // Lab investigations table
    if (hasLabTable) {
      html += '<div class="section-title">Laboratory Investigations</div>';
      html += '<table class="lab-results"><thead><tr><th>Investigation</th><th>Result (Admission)</th><th>Result (Discharge)</th><th>Reference Range</th></tr></thead><tbody>';
      invs.forEach((inv) => {
        html += '<tr>';
        html += `<td>${escapeHtml(String(inv.name ?? ''))}</td>`;
        html += `<td>${escapeHtml(String(inv.resultAdmission ?? '-'))}</td>`;
        html += `<td>${escapeHtml(String(inv.resultDischarge ?? '-'))}</td>`;
        html += `<td>${escapeHtml(String(inv.referenceRange ?? '-'))}</td>`;
        html += '</tr>';
      });
      html += '</tbody></table>';
    } else if (typeof invs === 'string' && invs.trim()) {
      html += '<div class="section-title">Laboratory Investigations</div><div class="content-text">';
      html += para(invs);
      html += '</div>';
    }

    // Imaging & Diagnostic Reports
    if (hasImaging) {
      html += '<div class="section-title">Imaging &amp; Diagnostic Reports</div><div class="content-text">';
      html += para(json.imagingReports);
      html += '</div>';
    }

    // Final Diagnosis
    if (hasDiagnosis) {
      html += '<div class="section-title">Final Diagnosis</div><div class="diagnosis-box">';
      if (d.final) html += `<p><strong>Primary Diagnosis:</strong> ${escapeHtml(d.final)}.</p>`;
      if (d.provisional && d.provisional !== d.final) {
        html += `<p style="margin-top: 10px; font-weight: bold; color: var(--primary-color);">Secondary Diagnoses / Provisional:</p>`;
        html += `<ul><li>${escapeHtml(d.provisional)}</li></ul>`;
      } else if (d.provisional) {
        html += `<p><strong>Provisional:</strong> ${escapeHtml(d.provisional)}.</p>`;
      }
      if (d.icd10Codes && d.icd10Codes.length) {
        html += `<p><strong>ICD-10 Codes:</strong></p><ul>`;
        d.icd10Codes.forEach((code) => { html += `<li>${escapeHtml(code)}</li>`; });
        html += '</ul>';
      }
      html += '</div>';
    }

    html += '</section>';
  }

  // Section 3: Hospital Course & Care Provided
  const hasHospCourse = json.hospitalCourse && String(json.hospitalCourse).trim();
  const procs = json.procedures;
  const hasProcTable = Array.isArray(procs) && procs.length > 0;
  const hasProcText = typeof procs === 'string' && procs.trim();
  const devs = json.medicalDevices;
  const hasDevices = Array.isArray(devs) && devs.length > 0;
  const hasCondition = a.dischargeCondition && String(a.dischargeCondition).trim();

  if (hasHospCourse || hasProcTable || hasProcText || hasDevices) {
    html += '<section class="new-page-section">';

    // Hospital Course
    if (hasHospCourse) {
      html += '<div class="section-title">Hospital Course &amp; Care Provided</div><div class="content-text">';
      html += para(json.hospitalCourse);
      html += '</div>';
    }

    // Procedures Performed (TABLE)
    if (hasProcTable) {
      html += '<div class="section-title">Procedures Performed</div>';
      html += '<table><thead><tr><th>Date</th><th>Procedure Name</th><th>Indication &amp; Outcome</th></tr></thead><tbody>';
      procs.forEach((proc) => {
        html += '<tr>';
        html += `<td>${escapeHtml(String(proc.date ?? ''))}</td>`;
        html += `<td>${escapeHtml(String(proc.name ?? ''))}</td>`;
        html += `<td>${escapeHtml(String(proc.indicationOutcome ?? ''))}</td>`;
        html += '</tr>';
      });
      html += '</tbody></table>';
    } else if (hasProcText) {
      html += '<div class="section-title">Procedures Performed</div><div class="content-text">';
      html += para(procs);
      html += '</div>';
    }

    // Medical Devices / Implants (TABLE) - Only show if data exists
    if (hasDevices) {
      html += '<div class="section-title">Medical Devices / Implants</div>';
      html += '<table><thead><tr><th>Device Type</th><th>Model / Serial No.</th><th>Location / Position</th><th>Implant Date</th></tr></thead><tbody>';
      devs.forEach((dev) => {
        html += '<tr>';
        html += `<td>${escapeHtml(String(dev.deviceType ?? ''))}</td>`;
        html += `<td>${escapeHtml(String(dev.model ?? ''))}</td>`;
        html += `<td>${escapeHtml(String(dev.location ?? ''))}</td>`;
        html += `<td>${escapeHtml(String(dev.implantDate ?? ''))}</td>`;
        html += '</tr>';
      });
      html += '</tbody></table>';
    }

    // Condition at Discharge
    html += '<div class="section-title">Condition at Discharge</div><div class="content-text">';
    html += para(a.dischargeCondition || 'Stable. Patient fit for discharge as per unit protocol.');
    html += '</div>';

    html += '</section>';
  } else {
    // Even without course/procedures, still show condition at discharge
    html += '<section><div class="section-title">Condition at Discharge</div><div class="content-text">';
    html += para(a.dischargeCondition || 'Stable. Patient fit for discharge as per unit protocol.');
    html += '</div></section>';
  }

  // Section 4: Post-Discharge Instructions
  const meds = json.medications;
  const hasPostDischarge = (Array.isArray(meds) && meds.length > 0) || (inst.followUp && String(inst.followUp).trim()) || (inst.redFlags && String(inst.redFlags).trim()) || inst.diet || inst.activity || inst.advice;
  if (hasPostDischarge) {
    html += '<section class="new-page-section"><div class="section-title">Post-Discharge Instructions</div>';

    // Discharge Medications table
    if (Array.isArray(meds) && meds.length > 0) {
      html += '<p style="font-weight: bold; margin-bottom: -10px;">Discharge Medications</p>';
      html += '<table><thead><tr><th>Medication Name</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead><tbody>';
      meds.forEach((m) => {
        html += '<tr>';
        html += `<td>${escapeHtml(String(m.name ?? ''))}</td>`;
        html += `<td>${escapeHtml(String(m.dose ?? ''))}</td>`;
        html += `<td>${escapeHtml(String(m.frequency ?? ''))}</td>`;
        html += `<td>${escapeHtml(String(m.duration ?? ''))}</td>`;
        html += `<td>${escapeHtml(String(m.notes ?? ''))}</td>`;
        html += '</tr>';
      });
      html += '</tbody></table>';
    }

    // Follow-up Advice
    if (inst.followUp && String(inst.followUp).trim()) {
      html += '<div class="section-title">Follow-up Advice</div><div class="content-text">' + para(inst.followUp) + '</div>';
    }

    // Urgent Care Instructions (Warning Signs)
    if (inst.redFlags && String(inst.redFlags).trim()) {
      html += '<div class="section-title">Urgent Care Instructions (Warning Signs)</div><div class="content-text">' + para(inst.redFlags) + '</div>';
    }

    // Dietary and Activity Advice
    if (inst.diet || inst.activity || inst.advice) {
      const parts = [inst.diet, inst.activity, inst.advice].filter(Boolean);
      html += '<div class="section-title">Dietary and Activity Advice</div><div class="content-text">' + para(parts.join('\n\n')) + '</div>';
    }

    // Signature area (inside post-discharge section like the template)
    const consultantName = a.consultant || a.department || 'Consultant';
    html += '<div class="signature-area"><div class="sig-box"><div class="sig-line"></div><p>Patient / Attendant Signature</p></div><div class="sig-box"><div class="sig-line"></div>';
    html += `<p><strong>${escapeHtml(consultantName)}</strong></p>`;
    html += `<p>${escapeHtml(a.department ? a.department : 'Discharge Summary')}</p>`;
    html += '</div></div>';

    html += `<div class="footer"><p>This is a computer-generated summary from ${escapeHtml(HOSPITAL_NAME)}. Please correlate clinically.</p><p>&copy; ${new Date().getFullYear()} ${escapeHtml(HOSPITAL_TAGLINE)}</p></div>`;
    html += '</section>';
  } else {
    // Signatures and footer even if no post-discharge section
    const consultantName = a.consultant || a.department || 'Consultant';
    html += '<div class="signature-area"><div class="sig-box"><div class="sig-line"></div><p>Patient / Attendant Signature</p></div><div class="sig-box"><div class="sig-line"></div>';
    html += `<p><strong>${escapeHtml(consultantName)}</strong></p>`;
    html += `<p>${escapeHtml(a.department ? a.department : 'Discharge Summary')}</p>`;
    html += '</div></div>';
    html += `<div class="footer"><p>This is a computer-generated summary from ${escapeHtml(HOSPITAL_NAME)}. Please correlate clinically.</p><p>&copy; ${new Date().getFullYear()} ${escapeHtml(HOSPITAL_TAGLINE)}</p></div>`;
  }

  html += '</div></body></html>';
  return html;
}
