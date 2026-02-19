import React from 'react';

/**
 * Helper: given an aiEnhancedJson object or a flat discharge record,
 * return a normalised shape that matches the new template fields.
 */
function normalise(data) {
    if (!data) return null;
    const json = data.aiEnhancedJson;
    if (json && typeof json === 'object') {
        // We have the structured AI JSON — use it directly
        const p = json.patient || {};
        const a = json.admission || {};
        const d = json.diagnoses || {};
        const inst = json.instructions || {};
        return {
            patientName: p.name,
            uhid: p.uhid,
            ipid: p.ipid,
            age: p.age,
            gender: p.gender,
            mobile: p.mobile,
            address: p.address,
            admissionDate: a.admissionDate,
            dischargeDate: a.dischargeDate,
            consultant: a.consultant,
            department: a.department,
            wardBed: a.wardBed,
            dischargeCondition: a.dischargeCondition,
            provisionalDiagnosis: d.provisional,
            finalDiagnosis: d.final,
            icd10Codes: d.icd10Codes || [],
            reasonForAdmission: json.reasonForAdmission,
            clinicalExamination: json.clinicalExamination,
            significantFindings: json.significantFindings,
            courseInHospital: json.hospitalCourse,
            investigations: json.investigations,
            imagingReports: json.imagingReports,
            procedures: json.procedures,
            medicalDevices: json.medicalDevices || [],
            medications: json.medications || [],
            followUp: inst.followUp,
            redFlags: inst.redFlags,
            advice: [inst.diet, inst.activity, inst.advice].filter(Boolean).join('\n\n') || null,
            // Also fallback to flat fields for legacy
            labResults: data.labResults,
            procedureList: data.procedureList,
            deviceList: data.deviceList,
            medicationList: data.medicationList,
        };
    }
    // Fallback: use flat fields from Mongoose document
    return {
        patientName: data.patientName,
        uhid: data.uhid,
        ipid: data.ipid,
        age: data.age,
        gender: data.gender,
        mobile: data.mobile,
        address: data.address,
        admissionDate: data.admissionDate,
        dischargeDate: data.dischargeDate,
        consultant: data.consultant,
        department: data.department,
        wardBed: data.wardBed,
        dischargeCondition: data.dischargeCondition,
        provisionalDiagnosis: data.provisionalDiagnosis,
        finalDiagnosis: data.finalDiagnosis,
        icd10Codes: data.icd10Codes || [],
        reasonForAdmission: data.reasonForAdmission,
        clinicalExamination: data.clinicalExamination,
        significantFindings: data.significantFindings,
        courseInHospital: data.courseInHospital,
        investigations: data.investigations,
        imagingReports: data.imagingReports,
        procedures: data.procedures,
        medicalDevices: [],
        medications: [],
        followUp: data.followUp,
        redFlags: data.redFlags,
        advice: data.advice,
        labResults: data.labResults,
        procedureList: data.procedureList,
        deviceList: data.deviceList,
        medicationList: data.medicationList,
    };
}

export const DischargePrintView = ({ data }) => {
    const d = normalise(data);
    if (!d) return null;

    // Resolve arrays: prefer aiEnhancedJson arrays, fallback to flat arrays
    const labResults = Array.isArray(d.investigations) && d.investigations.length > 0
        ? d.investigations.map(inv => ({
            investigation: inv.name,
            resultAdmission: inv.resultAdmission,
            resultDischarge: inv.resultDischarge,
            referenceRange: inv.referenceRange,
        }))
        : d.labResults || [];

    const procedures = Array.isArray(d.procedures) && d.procedures.length > 0
        ? d.procedures
        : d.procedureList || [];

    const devices = (d.medicalDevices && d.medicalDevices.length > 0)
        ? d.medicalDevices
        : d.deviceList || [];

    const meds = (d.medications && d.medications.length > 0)
        ? d.medications.map(m => ({
            name: m.name,
            dosage: m.dose || m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            instructions: m.notes || m.instructions,
        }))
        : d.medicationList || [];

    const investigationsText = typeof d.investigations === 'string' ? d.investigations : null;
    const proceduresText = typeof data?.procedures === 'string' ? data.procedures : null;

    return (
        <div className="ds-print-container">
            <style>{`
        :root {
            --primary-color: #004a99;
            --secondary-color: #003366;
            --accent-color: #e6f0fa;
            --border-color: #d1d9e6;
            --text-dark: #2c3e50;
            --text-muted: #546e7a;
        }

        @media print {
            @page {
                size: A4;
                margin: 0;
            }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #fff; 
                -webkit-print-color-adjust: exact;
            }
            .ds-print-container {
                width: 210mm;
                margin: 0; 
                box-shadow: none; 
                padding: 15mm 20mm 10mm 20mm;
            }
            .no-print { display: none; }
            
            .new-page-section {
                break-before: page;
                padding-top: 15mm;
            }

            section, table, .info-group, .diagnosis-box, .signature-area {
                break-inside: avoid;
            }

            .report-title {
                margin-top: 10mm;
            }
        }

        /* Screen Preview Styles */
        .ds-print-container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #fff;
            color: var(--text-dark);
            line-height: 1.4;
            font-size: 10pt;
            width: 210mm;
            margin: 20px auto;
            padding: 20mm;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            box-sizing: border-box;
        }

        /* Header UI */
        .hospital-header {
            display: flex;
            align-items: center;
            border-bottom: 3px solid var(--primary-color);
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .logo {
            flex: 0 0 120px;
        }

        .logo img {
            max-width: 100%;
            height: auto;
        }

        .hospital-details {
            flex: 1;
            padding-left: 20px;
        }

        .hospital-details h1 {
            margin: 0;
            font-size: 20pt;
            color: var(--primary-color);
            text-transform: uppercase;
        }

        .hospital-details p {
            margin: 2px 0;
            font-size: 9pt;
            color: var(--text-muted);
        }

        .report-title {
            text-align: center;
            background-color: var(--accent-color);
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
        }

        .report-title h2 {
            margin: 0;
            font-size: 14pt;
            color: var(--secondary-color);
            letter-spacing: 1px;
        }

        /* Information Grids */
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }

        .info-group {
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 10px;
        }

        .info-group-title {
            font-weight: bold;
            font-size: 9pt;
            color: var(--primary-color);
            text-transform: uppercase;
            margin-bottom: 8px;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 4px;
        }

        .info-row {
            display: flex;
            margin-bottom: 4px;
        }

        .info-label {
            flex: 0 0 120px;
            font-weight: 600;
            color: var(--text-muted);
            font-size: 8.5pt;
        }

        .info-value {
            flex: 1;
            font-size: 9pt;
        }

        /* Sections */
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

        .content-text {
            text-align: justify;
            margin-bottom: 15px;
        }
        
        .content-text p {
            margin-bottom: 8px;
        }

        .diagnosis-box {
            background-color: #fafafa;
            border: 1px dashed var(--border-color);
            padding: 10px 20px;
            margin-bottom: 15px;
        }

        /* Table Styling */
        table.print-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }

        table.print-table th {
            background-color: #f0f4f8;
            color: var(--secondary-color);
            font-weight: 600;
            text-align: left;
            padding: 10px;
            border: 1px solid var(--border-color);
            font-size: 9pt;
        }

        table.print-table td {
            padding: 8px 10px;
            border: 1px solid var(--border-color);
            font-size: 9pt;
        }

        table.print-table tr:nth-child(even) {
            background-color: #fcfcfc;
        }

        .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid var(--border-color);
            text-align: center;
            font-size: 8pt;
            color: var(--text-muted);
        }

        .signature-area {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            break-inside: avoid;
        }

        .sig-box {
            text-align: center;
            width: 200px;
        }

        .sig-line {
            border-top: 1px solid var(--text-dark);
            margin-bottom: 5px;
        }

        ul {
            padding-left: 20px;
            margin: 5px 0;
        }

        .lab-results {
            font-size: 8.5pt;
        }
      `}</style>

            {/* Hospital Header */}
            <header className="hospital-header">
                <div className="logo">
                    <img src="https://mh.mapims.edu.in/static/images/logo.png" alt="MAPIMS Logo" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/120x60?text=MAPIMS+LOGO'; }} />
                </div>
                <div className="hospital-details">
                    <h1>MAPIMS</h1>
                    <p>Melmaruvathur Adhiparasakthi Institute of Medical Sciences and Research</p>
                    <p>Melmaruvathur, Kancheepuram Dist, Tamil Nadu - 603319</p>
                    <p>Contact: +91-44-27529401 | Email: info@mapims.edu.in</p>
                </div>
            </header>

            <div className="report-title">
                <h2>HOSPITAL DISCHARGE SUMMARY</h2>
            </div>

            {/* Patient & Visit Info Grid */}
            <div className="info-grid">
                <div className="info-group">
                    <div className="info-group-title">Patient Profile</div>
                    <div className="info-row"><span className="info-label">Name:</span><span className="info-value">{d.patientName || '—'}</span></div>
                    <div className="info-row"><span className="info-label">UHID / IP No:</span><span className="info-value">{d.uhid || '—'} / {d.ipid || '—'}</span></div>
                    <div className="info-row"><span className="info-label">Age / Gender:</span><span className="info-value">{d.age || '—'} / {d.gender || '—'}</span></div>
                    <div className="info-row"><span className="info-label">Address:</span><span className="info-value">{d.address || '—'}</span></div>
                </div>
                <div className="info-group">
                    <div className="info-group-title">Admission Details</div>
                    <div className="info-row"><span className="info-label">Admission Date:</span><span className="info-value">{d.admissionDate || '—'}</span></div>
                    <div className="info-row"><span className="info-label">Discharge Date:</span><span className="info-value">{d.dischargeDate || '—'}</span></div>
                    <div className="info-row"><span className="info-label">Consultant:</span><span className="info-value">{d.consultant || '—'}</span></div>
                    <div className="info-row"><span className="info-label">Ward / Bed:</span><span className="info-value">{d.wardBed || '—'}</span></div>
                </div>
            </div>

            {/* Section 1: Clinical Summary */}
            {(d.reasonForAdmission || d.clinicalExamination || d.significantFindings) && (
                <section>
                    <div className="section-title">Clinical Summary</div>
                    <div className="content-text" style={{ whiteSpace: 'pre-wrap' }}>
                        {d.reasonForAdmission && (
                            <p><strong>Reason for Admission:</strong> {d.reasonForAdmission}</p>
                        )}
                        {d.clinicalExamination && (
                            <p><strong>Clinical Examination:</strong> {d.clinicalExamination}</p>
                        )}
                    </div>
                    {d.significantFindings && (
                        <>
                            <div className="section-title">Significant Findings &amp; Examination</div>
                            <div className="content-text" style={{ whiteSpace: 'pre-wrap' }}>
                                <p>{d.significantFindings}</p>
                            </div>
                        </>
                    )}
                </section>
            )}

            {/* Section 2: Investigations, Imaging & Diagnosis */}
            <section className="new-page-section">
                {/* Laboratory Investigations Table */}
                <div className="section-title">Laboratory Investigations</div>
                {labResults.length > 0 ? (
                    <table className="print-table lab-results">
                        <thead>
                            <tr>
                                <th>Investigation</th>
                                <th>Result (Admission)</th>
                                <th>Result (Discharge)</th>
                                <th>Reference Range</th>
                            </tr>
                        </thead>
                        <tbody>
                            {labResults.map((lab, i) => (
                                <tr key={i}>
                                    <td>{lab.investigation || lab.name || ''}</td>
                                    <td>{lab.resultAdmission || '-'}</td>
                                    <td>{lab.resultDischarge || '-'}</td>
                                    <td>{lab.referenceRange || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="content-text" style={{ whiteSpace: 'pre-wrap' }}>
                        {investigationsText || 'No structured lab results.'}
                    </div>
                )}

                {/* Imaging & Diagnostic Reports */}
                {d.imagingReports && (
                    <>
                        <div className="section-title">Imaging &amp; Diagnostic Reports</div>
                        <div className="content-text" style={{ whiteSpace: 'pre-wrap' }}>
                            <p>{d.imagingReports}</p>
                        </div>
                    </>
                )}

                {/* Final Diagnosis */}
                <div className="section-title">Final Diagnosis</div>
                <div className="diagnosis-box">
                    <p><strong>Primary Diagnosis:</strong> {d.finalDiagnosis || '—'}</p>
                    {d.provisionalDiagnosis && d.provisionalDiagnosis !== d.finalDiagnosis && (
                        <>
                            <p style={{ marginTop: '10px', fontWeight: 'bold', color: 'var(--primary-color)' }}>Secondary Diagnoses / Provisional:</p>
                            <p>{d.provisionalDiagnosis}</p>
                        </>
                    )}
                    {d.icd10Codes && d.icd10Codes.length > 0 && (
                        <>
                            <p style={{ marginTop: '10px', fontWeight: 'bold', color: 'var(--primary-color)' }}>ICD-10 Codes:</p>
                            <ul>
                                {d.icd10Codes.map((code, i) => <li key={i}>{code}</li>)}
                            </ul>
                        </>
                    )}
                </div>
            </section>

            {/* Section 3: Hospital Course, Procedures, Devices, Condition */}
            <section className="new-page-section">
                {/* Hospital Course */}
                {d.courseInHospital && (
                    <>
                        <div className="section-title">Hospital Course &amp; Care Provided</div>
                        <div className="content-text" style={{ whiteSpace: 'pre-wrap' }}>
                            <p>{d.courseInHospital}</p>
                        </div>
                    </>
                )}

                {/* Procedures Table */}
                <div className="section-title">Procedures Performed</div>
                {procedures.length > 0 ? (
                    <table className="print-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Procedure Name</th>
                                <th>Indication &amp; Outcome</th>
                            </tr>
                        </thead>
                        <tbody>
                            {procedures.map((proc, i) => (
                                <tr key={i}>
                                    <td>{proc.date || '—'}</td>
                                    <td>{proc.name || ''}</td>
                                    <td>{proc.indicationOutcome || ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="content-text" style={{ whiteSpace: 'pre-wrap' }}>
                        {proceduresText || '—'}
                    </div>
                )}

                {/* Medical Devices / Implants */}
                {devices.length > 0 && (
                    <>
                        <div className="section-title">Medical Devices / Implants</div>
                        <table className="print-table">
                            <thead>
                                <tr>
                                    <th>Device Type</th>
                                    <th>Model / Serial No.</th>
                                    <th>Location / Position</th>
                                    <th>Implant Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.map((dev, i) => (
                                    <tr key={i}>
                                        <td>{dev.deviceType || ''}</td>
                                        <td>{dev.model || ''}</td>
                                        <td>{dev.location || ''}</td>
                                        <td>{dev.implantDate || ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                <div className="section-title">Condition at Discharge</div>
                <div className="content-text" style={{ whiteSpace: 'pre-wrap' }}>
                    <p>{d.dischargeCondition || 'Stable. Patient fit for discharge as per unit protocol.'}</p>
                </div>
            </section>

            {/* Section 4: Post-Discharge Instructions */}
            <section className="new-page-section">
                <div className="section-title">Post-Discharge Instructions</div>

                <p style={{ fontWeight: 'bold', marginBottom: '-10px' }}>Discharge Medications</p>
                {meds.length > 0 ? (
                    <table className="print-table">
                        <thead>
                            <tr>
                                <th>Medication Name</th>
                                <th>Dosage</th>
                                <th>Frequency</th>
                                <th>Duration</th>
                                <th>Instructions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {meds.map((med, i) => (
                                <tr key={i}>
                                    <td>{med.name || ''}</td>
                                    <td>{med.dosage || med.dose || ''}</td>
                                    <td>{med.frequency || ''}</td>
                                    <td>{med.duration || ''}</td>
                                    <td>{med.instructions || med.notes || ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="content-text" style={{ whiteSpace: 'pre-wrap', marginTop: '15px' }}>
                        {data?.medications || '—'}
                    </div>
                )}

                <div className="section-title">Follow-up Advice</div>
                <div className="content-text" style={{ whiteSpace: 'pre-wrap' }}>
                    <p>{d.followUp || '—'}</p>
                </div>

                <div className="section-title">Urgent Care Instructions (Warning Signs)</div>
                <div className="content-text" style={{ whiteSpace: 'pre-wrap' }}>
                    <p>{d.redFlags || '—'}</p>
                </div>

                <div className="section-title">Dietary and Activity Advice</div>
                <div className="content-text" style={{ whiteSpace: 'pre-wrap' }}>
                    <p>{d.advice || '—'}</p>
                </div>

                {/* Certification */}
                <div className="signature-area">
                    <div className="sig-box">
                        <div className="sig-line"></div>
                        <p>Patient / Attendant Signature</p>
                    </div>
                    <div className="sig-box">
                        <div className="sig-line"></div>
                        <p><strong>{d.consultant || 'Doctor Signature'}</strong></p>
                        <p>{d.department || 'Consultant'}</p>
                    </div>
                </div>

                <div className="footer">
                    <p>This is a computer-generated summary from MAPIMS. Please correlate clinically.</p>
                    <p>&copy; {new Date().getFullYear()} Melmaruvathur Adhiparasakthi Institute of Medical Sciences</p>
                </div>
            </section>
        </div>
    );
};
