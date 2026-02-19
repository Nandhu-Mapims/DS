import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Form, Button, Nav, Badge, ListGroup, Row, Col, Table } from 'react-bootstrap';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { getDischarge, updateDoctorEditedText, submitForApproval, suggestIcd10Codes } from '../../api/dischargeApi';
import { SubmitButton } from '../../components/SubmitButton';
import { DischargePrintView } from '../../components/DischargePrintView';

/** Deep-clone JSON from discharge record */
function extractJson(discharge) {
  if (!discharge) return null;
  if (discharge.aiEnhancedJson && typeof discharge.aiEnhancedJson === 'object') {
    return JSON.parse(JSON.stringify(discharge.aiEnhancedJson));
  }
  return null;
}

/* ── tiny reusable components ──────────────────────────────────────────── */

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <h6
        className="fw-bold text-white px-3 py-2 mb-2"
        style={{
          backgroundColor: '#003366',
          borderRadius: 3,
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {title}
      </h6>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, rows = 1, type = 'text', placeholder = '' }) {
  if (rows > 1) {
    return (
      <Form.Group className="mb-2">
        <Form.Label className="mb-0 small fw-semibold text-muted">{label}</Form.Label>
        <Form.Control
          as="textarea"
          rows={rows}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="ds-focus-ring"
          placeholder={placeholder}
          style={{ fontSize: '0.88rem', lineHeight: 1.5 }}
        />
      </Form.Group>
    );
  }
  return (
    <Form.Group className="mb-2">
      <Form.Label className="mb-0 small fw-semibold text-muted">{label}</Form.Label>
      <Form.Control
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="ds-focus-ring"
        placeholder={placeholder}
        style={{ fontSize: '0.88rem' }}
      />
    </Form.Group>
  );
}

/* ── Editable table component ──────────────────────────────────────────── */

function EditableTable({ columns, rows, onRowChange, onAddRow, onRemoveRow, emptyTemplate }) {
  return (
    <>
      {rows.length > 0 && (
        <div className="table-responsive border rounded shadow-sm mb-2">
          <Table bordered hover size="sm" className="mb-0 bg-white">
            <thead className="bg-light text-secondary">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} style={col.style || {}}>{col.label}</th>
                ))}
                <th style={{ width: 36 }}></th>
              </tr>
            </thead>
            <tbody className="align-middle">
              {rows.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="p-1">
                      <Form.Control
                        type={col.type || 'text'}
                        size="sm"
                        value={row[col.key] ?? ''}
                        onChange={(e) => onRowChange(i, col.key, e.target.value)}
                        placeholder={col.placeholder || ''}
                        className="border-0 bg-transparent"
                        style={{ fontSize: '0.82rem' }}
                      />
                    </td>
                  ))}
                  <td className="text-center p-1">
                    <Button
                      variant="link"
                      className="text-danger p-0"
                      size="sm"
                      onClick={() => onRemoveRow(i)}
                      title="Remove row"
                    >
                      ✕
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => onAddRow(emptyTemplate)}
      >
        + Add Row
      </Button>
    </>
  );
}

/* ── Main component ────────────────────────────────────────────────────── */

export function DoctorPreviewEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [discharge, setDischarge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editedJson, setEditedJson] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [activeTab, setActiveTab] = useState('edit');
  const [suggestingIcd10, setSuggestingIcd10] = useState(false);
  const [showIcdPopup, setShowIcdPopup] = useState(false);
  const [icdSuggestions, setIcdSuggestions] = useState([]);
  const [selectedIcdCodes, setSelectedIcdCodes] = useState(new Set());

  const hasJson = !!editedJson;

  /* ── Load discharge ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    getDischarge(id)
      .then((d) => {
        setDischarge(d);
        const json = extractJson(d) || {
          patient: {},
          admission: {},
          diagnoses: {},
          instructions: {},
          investigations: [],
          procedures: [],
          medicalDevices: [],
          medications: [],
          reasonForAdmission: '',
          clinicalExamination: '',
          significantFindings: '',
          hospitalCourse: '',
          imagingReports: ''
        };
        setEditedJson(json);
        setEditedText(d?.doctorEditedText ?? d?.aiEnhancedText ?? '');
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Updater helpers ─────────────────────────────────────────────────── */
  const updateField = useCallback((key, value) => {
    setEditedJson((prev) => prev ? { ...prev, [key]: value } : prev);
  }, []);

  const updateNested = useCallback((path, value) => {
    setEditedJson((prev) => {
      if (!prev) return prev;
      const [parent, child] = path.split('.');
      return { ...prev, [parent]: { ...(prev[parent] || {}), [child]: value } };
    });
  }, []);

  /** Update a single cell inside an array-of-objects field */
  const updateArrayRow = useCallback((arrayKey, index, field, value) => {
    setEditedJson((prev) => {
      if (!prev) return prev;
      const arr = [...(prev[arrayKey] || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [arrayKey]: arr };
    });
  }, []);

  const addArrayRow = useCallback((arrayKey, template) => {
    setEditedJson((prev) => {
      if (!prev) return prev;
      return { ...prev, [arrayKey]: [...(prev[arrayKey] || []), { ...template }] };
    });
  }, []);

  const removeArrayRow = useCallback((arrayKey, index) => {
    setEditedJson((prev) => {
      if (!prev) return prev;
      const arr = [...(prev[arrayKey] || [])];
      arr.splice(index, 1);
      return { ...prev, [arrayKey]: arr };
    });
  }, []);

  /* ── Save / Submit ───────────────────────────────────────────────────── */
  const buildPayload = useCallback(() => {
    if (hasJson) return { aiEnhancedJson: editedJson, doctorEditedText: editedText };
    return { doctorEditedText: editedText };
  }, [hasJson, editedJson, editedText]);

  const handleSaveEdits = useCallback(() => {
    if (!id) return;
    setSaving(true);
    const payload = buildPayload();
    updateDoctorEditedText(id, payload.doctorEditedText, payload.aiEnhancedJson)
      .then(() => {
        setDischarge((prev) => prev ? { ...prev, ...payload } : null);
        toast.success('Edits saved');
      })
      .catch(() => { })
      .finally(() => setSaving(false));
  }, [id, buildPayload, toast]);

  const handleSubmitToChief = useCallback(() => {
    if (!id) return;
    setSubmitting(true);
    const payload = buildPayload();
    submitForApproval(id, payload)
      .then(() => { toast.success('Submitted to Chief'); navigate('/doctor'); })
      .catch(() => { })
      .finally(() => setSubmitting(false));
  }, [id, buildPayload, navigate, toast]);

  /* ── Preview data (live) ─────────────────────────────────────────────── */
  const previewDischarge = useMemo(() => {
    if (!discharge) return null;
    return hasJson ? { ...discharge, aiEnhancedJson: editedJson } : discharge;
  }, [discharge, editedJson, hasJson]);

  /* ── Loading / error states ──────────────────────────────────────────── */
  if (loading) {
    return <div className="ds-page-enter ds-page-enter-active"><p className="text-muted">Loading...</p></div>;
  }
  if (!discharge) {
    return (
      <div className="ds-page-enter ds-page-enter-active">
        <p className="text-muted">Discharge not found.</p>
        <Button as={Link} to="/doctor" variant="outline-primary">Back to list</Button>
      </div>
    );
  }

  /* ── Extract sections for the form ───────────────────────────────────── */
  const patient = editedJson?.patient || {};
  const admission = editedJson?.admission || {};
  const diagnoses = editedJson?.diagnoses || {};
  const instructions = editedJson?.instructions || {};
  const investigations = editedJson?.investigations || [];
  const procedures = editedJson?.procedures || [];
  const medicalDevices = editedJson?.medicalDevices || [];
  const medications = editedJson?.medications || [];

  /* ── Table column definitions ────────────────────────────────────────── */
  const labCols = [
    { key: 'name', label: 'Investigation', placeholder: 'e.g. Hemoglobin' },
    { key: 'resultAdmission', label: 'Admission', placeholder: 'e.g. 12.1 g/dL' },
    { key: 'resultDischarge', label: 'Discharge', placeholder: 'e.g. 13.0 g/dL' },
    { key: 'referenceRange', label: 'Ref. Range', placeholder: 'e.g. 13-17 g/dL' },
  ];
  const procCols = [
    { key: 'date', label: 'Date', type: 'date', style: { width: 140 } },
    { key: 'name', label: 'Procedure Name', placeholder: 'e.g. Coronary Angiography' },
    { key: 'indicationOutcome', label: 'Indication & Outcome', placeholder: '' },
  ];
  const deviceCols = [
    { key: 'deviceType', label: 'Device Type', placeholder: 'e.g. DES Stent' },
    { key: 'model', label: 'Model / Serial', placeholder: '' },
    { key: 'location', label: 'Location', placeholder: 'e.g. LAD' },
    { key: 'implantDate', label: 'Implant Date', type: 'date', style: { width: 140 } },
  ];
  const medCols = [
    { key: 'name', label: 'Medication', placeholder: 'e.g. Aspirin' },
    { key: 'dose', label: 'Dosage', placeholder: 'e.g. 150 mg' },
    { key: 'frequency', label: 'Frequency', placeholder: 'e.g. OD' },
    { key: 'duration', label: 'Duration', placeholder: 'e.g. 6 months' },
    { key: 'notes', label: 'Notes', placeholder: '' },
  ];

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className="ds-page-enter ds-page-enter-active ds-page">
      <PageHeader
        breadcrumbs={[{ to: '/', label: 'Home' }, { to: '/doctor', label: 'My Summaries' }, { label: 'Edit & Submit' }]}
        title="Edit AI-Enhanced Summary"
        description={hasJson ? 'Edit all sections below. Changes are reflected in Print View in real time.' : 'Edit plain text below.'}
        action={
          <Button as={Link} to="/doctor" variant="outline-secondary" size="sm" className="ds-focus-ring">← Back to list</Button>
        }
      />

      {/* Warnings */}
      {(discharge.missingFields?.length > 0 || discharge.warnings?.length > 0) && (
        <Card className="ds-card mb-3 border-warning">
          <Card.Header className="py-2 fw-semibold">Missing fields &amp; warnings</Card.Header>
          <Card.Body className="py-2">
            {discharge.missingFields?.length > 0 && (
              <div className="mb-2">
                <span className="text-muted small fw-semibold">Missing fields:</span>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {discharge.missingFields.map((key, i) => <Badge key={i} bg="secondary" text="dark">{key}</Badge>)}
                </div>
              </div>
            )}
            {discharge.warnings?.length > 0 && (
              <div>
                <span className="text-warning small fw-semibold">Warnings:</span>
                <ListGroup variant="flush" className="small mt-1">
                  {discharge.warnings.map((msg, i) => <ListGroup.Item key={i} className="py-1 text-warning-emphasis">{msg}</ListGroup.Item>)}
                </ListGroup>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Tabs: Edit | Print View */}
      <Card className="ds-card mb-3">
        <Card.Header className="d-flex align-items-center border-bottom border-secondary-subtle py-2">
          <Nav variant="tabs" className="nav-tabs-card border-0 flex-grow-1" activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'edit')}>
            <Nav.Item><Nav.Link eventKey="edit" className="fw-semibold ds-focus-ring">✏️ Edit</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="print" className="fw-semibold ds-focus-ring">🖨️ Print View</Nav.Link></Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body>
          {/* ═══════════════════ EDIT TAB (JSON mode) ═══════════════════ */}
          {activeTab === 'edit' && (
            <div style={{ maxHeight: '72vh', overflowY: 'auto', paddingRight: 8 }}>

              {/* ─── Patient Profile ─── */}
              <Section title="👤 Patient Profile">
                <Row>
                  <Col md={6}><Field label="Patient Name" value={patient.name} onChange={(v) => updateNested('patient.name', v)} /></Col>
                  <Col md={3}><Field label="UHID" value={patient.uhid} onChange={(v) => updateNested('patient.uhid', v)} /></Col>
                  <Col md={3}><Field label="IP No" value={patient.ipid} onChange={(v) => updateNested('patient.ipid', v)} /></Col>
                </Row>
                <Row>
                  <Col md={2}><Field label="Age" value={patient.age} onChange={(v) => updateNested('patient.age', v)} /></Col>
                  <Col md={2}>
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-0 small fw-semibold text-muted">Gender</Form.Label>
                      <Form.Select size="sm" value={patient.gender ?? ''} onChange={(e) => updateNested('patient.gender', e.target.value)} className="ds-focus-ring" style={{ fontSize: '0.88rem' }}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}><Field label="Mobile" value={patient.mobile} onChange={(v) => updateNested('patient.mobile', v)} /></Col>
                  <Col md={5}><Field label="Address" value={patient.address} onChange={(v) => updateNested('patient.address', v)} /></Col>
                </Row>
              </Section>

              {/* ─── Admission Details ─── */}
              <Section title="🏥 Admission Details">
                <Row>
                  <Col md={3}><Field label="Admission Date" value={admission.admissionDate} onChange={(v) => updateNested('admission.admissionDate', v)} type="date" /></Col>
                  <Col md={3}><Field label="Discharge Date" value={admission.dischargeDate} onChange={(v) => updateNested('admission.dischargeDate', v)} type="date" /></Col>
                  <Col md={3}><Field label="Department" value={admission.department} onChange={(v) => updateNested('admission.department', v)} /></Col>
                  <Col md={3}><Field label="Ward / Bed" value={admission.wardBed} onChange={(v) => updateNested('admission.wardBed', v)} /></Col>
                </Row>
                <Row>
                  <Col md={6}><Field label="Consultant" value={admission.consultant} onChange={(v) => updateNested('admission.consultant', v)} /></Col>
                </Row>
              </Section>

              {/* ─── Diagnosis ─── */}
              <Section title="🩺 Diagnosis">
                <Field label="Provisional Diagnosis" value={diagnoses.provisional} onChange={(v) => updateNested('diagnoses.provisional', v)} rows={2} />
                <Field label="Final Diagnosis" value={diagnoses.final} onChange={(v) => updateNested('diagnoses.final', v)} rows={2} />

                {/* ICD-10 Codes with AI Suggest Button */}
                <div style={{ position: 'relative' }}>
                  <Form.Group className="mb-2">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <Form.Label className="mb-0 small fw-semibold text-muted">ICD-10 Codes</Form.Label>
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="d-flex align-items-center gap-1"
                        style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: 20 }}
                        disabled={suggestingIcd10}
                        onClick={async () => {
                          if (showIcdPopup) {
                            setShowIcdPopup(false);
                            return;
                          }
                          setSuggestingIcd10(true);
                          try {
                            const result = await suggestIcd10Codes({
                              provisionalDiagnosis: diagnoses.provisional || '',
                              finalDiagnosis: diagnoses.final || '',
                              clinicalDetails: [
                                editedJson?.reasonForAdmission,
                                editedJson?.clinicalExamination,
                                editedJson?.significantFindings,
                                editedJson?.hospitalCourse,
                              ].filter(Boolean).join('. '),
                            });
                            if (result?.codes?.length > 0) {
                              setIcdSuggestions(result.codes);
                              const existing = new Set(diagnoses.icd10Codes || []);
                              const preSelected = new Set(result.codes.map(c => c.code).filter(c => !existing.has(c)));
                              setSelectedIcdCodes(preSelected);
                              setShowIcdPopup(true);
                            } else {
                              toast.warning('No ICD-10 codes suggested. Try adding more details.');
                            }
                          } catch {
                            toast.warning('AI suggestion failed.');
                          } finally {
                            setSuggestingIcd10(false);
                          }
                        }}
                      >
                        {suggestingIcd10 ? (
                          <><span className="spinner-border spinner-border-sm" role="status" /> Generating...</>
                        ) : (
                          <>🤖 AI Suggest ICD-10</>
                        )}
                      </Button>
                    </div>
                    <Form.Control
                      type="text"
                      value={(diagnoses.icd10Codes || []).join(', ')}
                      onChange={(e) => updateNested('diagnoses.icd10Codes', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      className="ds-focus-ring"
                      style={{ fontSize: '0.88rem' }}
                      placeholder="e.g. I63.5, I10, E11.9"
                    />
                    {/* Badges */}
                    {(diagnoses.icd10Codes || []).length > 0 && (
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {(diagnoses.icd10Codes || []).map((code, i) => (
                          <Badge
                            key={i}
                            bg="primary"
                            className="d-flex align-items-center gap-1"
                            style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                          >
                            {code}
                            <span
                              style={{ cursor: 'pointer', marginLeft: 4, fontWeight: 700 }}
                              onClick={() => {
                                const updated = (diagnoses.icd10Codes || []).filter((_, idx) => idx !== i);
                                updateNested('diagnoses.icd10Codes', updated);
                              }}
                              title="Remove"
                            >
                              ×
                            </span>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Form.Group>

                  {/* Absolute Positioned Popup */}
                  {showIcdPopup && (
                    <div
                      className="shadow-lg border rounded p-0"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        width: '100%',
                        minWidth: '300px',
                        zIndex: 1050,
                        backgroundColor: '#fff',
                        marginTop: 4,
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between px-3 py-2 bg-light border-bottom rounded-top">
                        <span className="small fw-bold text-primary">🤖 Select Suggested Codes</span>
                        <Button variant="close" size="sm" onClick={() => setShowIcdPopup(false)} aria-label="Close" />
                      </div>
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {icdSuggestions.map((item, i) => {
                          const alreadyExists = (diagnoses.icd10Codes || []).includes(item.code);
                          const isSelected = selectedIcdCodes.has(item.code);
                          return (
                            <div
                              key={i}
                              className={`d-flex align-items-start gap-2 px-3 py-2 border-bottom ${isSelected || alreadyExists ? 'bg-primary-subtle' : ''}`}
                              style={{ cursor: alreadyExists ? 'default' : 'pointer' }}
                              onClick={() => {
                                if (alreadyExists) return;
                                setSelectedIcdCodes(prev => {
                                  const next = new Set(prev);
                                  if (next.has(item.code)) next.delete(item.code);
                                  else next.add(item.code);
                                  return next;
                                });
                              }}
                            >
                              <Form.Check
                                readOnly
                                checked={isSelected || alreadyExists}
                                disabled={alreadyExists}
                                style={{ marginTop: 3 }}
                              />
                              <div className="flex-grow-1" style={{ lineHeight: 1.2 }}>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <strong className="text-dark" style={{ fontSize: '0.85rem' }}>{item.code}</strong>
                                  {alreadyExists && <Badge bg="success" style={{ fontSize: '0.65rem' }}>Added</Badge>}
                                </div>
                                <div className="text-secondary small">{item.description}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="p-2 bg-light border-top rounded-bottom text-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="me-2"
                          onClick={() => setShowIcdPopup(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={selectedIcdCodes.size === 0}
                          onClick={() => {
                            const existing = diagnoses.icd10Codes || [];
                            const newCodes = [...selectedIcdCodes].filter(c => !existing.includes(c));
                            if (newCodes.length > 0) {
                              updateNested('diagnoses.icd10Codes', [...existing, ...newCodes]);
                              toast.success('Codes added');
                            }
                            setShowIcdPopup(false);
                            setIcdSuggestions([]);
                            setSelectedIcdCodes(new Set());
                          }}
                        >
                          Add Selected
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Section>

              {/* ─── Clinical Summary ─── */}
              <Section title="📝 Clinical Summary">
                <Field label="Reason for Admission" value={editedJson?.reasonForAdmission} onChange={(v) => updateField('reasonForAdmission', v)} rows={3} />
                <Field label="Clinical Examination" value={editedJson?.clinicalExamination} onChange={(v) => updateField('clinicalExamination', v)} rows={3} />
                <Field label="Significant Findings & Examination" value={editedJson?.significantFindings} onChange={(v) => updateField('significantFindings', v)} rows={3} />
              </Section>

              {/* ─── Laboratory Investigations ─── */}
              <Section title="🔬 Laboratory Investigations">
                <EditableTable
                  columns={labCols}
                  rows={investigations}
                  onRowChange={(i, key, val) => updateArrayRow('investigations', i, key, val)}
                  onAddRow={() => addArrayRow('investigations', { name: '', resultAdmission: '', resultDischarge: '', referenceRange: '' })}
                  onRemoveRow={(i) => removeArrayRow('investigations', i)}
                  emptyTemplate={{ name: '', resultAdmission: '', resultDischarge: '', referenceRange: '' }}
                />
              </Section>

              {/* ─── Imaging & Diagnostic Reports ─── */}
              <Section title="📷 Imaging & Diagnostic Reports">
                <Field label="Imaging Reports" value={editedJson?.imagingReports} onChange={(v) => updateField('imagingReports', v)} rows={4} placeholder="e.g. Chest X-Ray: findings... ECG: findings..." />
              </Section>

              {/* ─── Hospital Course ─── */}
              <Section title="📋 Hospital Course & Care Provided">
                <Field label="Hospital Course" value={editedJson?.hospitalCourse} onChange={(v) => updateField('hospitalCourse', v)} rows={5} />
              </Section>

              {/* ─── Procedures ─── */}
              <Section title="🏥 Procedures Performed">
                <EditableTable
                  columns={procCols}
                  rows={procedures}
                  onRowChange={(i, key, val) => updateArrayRow('procedures', i, key, val)}
                  onAddRow={() => addArrayRow('procedures', { date: '', name: '', indicationOutcome: '' })}
                  onRemoveRow={(i) => removeArrayRow('procedures', i)}
                  emptyTemplate={{ date: '', name: '', indicationOutcome: '' }}
                />
              </Section>

              {/* ─── Medical Devices ─── */}
              <Section title="⚙️ Medical Devices / Implants">
                <EditableTable
                  columns={deviceCols}
                  rows={medicalDevices}
                  onRowChange={(i, key, val) => updateArrayRow('medicalDevices', i, key, val)}
                  onAddRow={() => addArrayRow('medicalDevices', { deviceType: '', model: '', location: '', implantDate: '' })}
                  onRemoveRow={(i) => removeArrayRow('medicalDevices', i)}
                  emptyTemplate={{ deviceType: '', model: '', location: '', implantDate: '' }}
                />
              </Section>

              {/* ─── Condition at Discharge ─── */}
              <Section title="✅ Condition at Discharge">
                <Field label="Discharge Condition" value={admission.dischargeCondition} onChange={(v) => updateNested('admission.dischargeCondition', v)} rows={2} />
              </Section>

              {/* ─── Medications ─── */}
              <Section title="💊 Discharge Medications">
                <EditableTable
                  columns={medCols}
                  rows={medications}
                  onRowChange={(i, key, val) => updateArrayRow('medications', i, key, val)}
                  onAddRow={() => addArrayRow('medications', { name: '', dose: '', frequency: '', duration: '', notes: '' })}
                  onRemoveRow={(i) => removeArrayRow('medications', i)}
                  emptyTemplate={{ name: '', dose: '', frequency: '', duration: '', notes: '' }}
                />
              </Section>

              {/* ─── Post-Discharge Instructions ─── */}
              <Section title="📋 Post-Discharge Instructions">
                <Field label="Follow-up Advice" value={instructions.followUp} onChange={(v) => updateNested('instructions.followUp', v)} rows={2} />
                <Field label="Warning Signs / Red Flags" value={instructions.redFlags} onChange={(v) => updateNested('instructions.redFlags', v)} rows={2} />
                <Field label="Diet" value={instructions.diet} onChange={(v) => updateNested('instructions.diet', v)} rows={1} />
                <Field label="Activity" value={instructions.activity} onChange={(v) => updateNested('instructions.activity', v)} rows={1} />
                <Field label="General Advice" value={instructions.advice} onChange={(v) => updateNested('instructions.advice', v)} rows={2} />
              </Section>

            </div>
          )}



          {/* ═══════════════════ PRINT VIEW TAB ═════════════════════════ */}
          {activeTab === 'print' && (
            <div className="overflow-auto border p-3 bg-light">
              <DischargePrintView data={previewDischarge} />
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ── Action bar ─────────────────────────────────────────────────── */}
      <div
        className="d-flex flex-wrap align-items-center gap-2 py-3"
        style={{ backgroundColor: 'var(--ds-bg-elevated)', borderTop: '1px solid var(--ds-border-subtle)', borderRadius: 'var(--ds-radius-md)', paddingLeft: '1rem', paddingRight: '1rem' }}
      >
        <SubmitButton type="button" variant="outline-primary" onClick={handleSaveEdits} loading={saving}>
          Save edits
        </SubmitButton>
        <SubmitButton type="button" variant="success" onClick={handleSubmitToChief} loading={submitting}>
          Submit to Chief
        </SubmitButton>
      </div>

    </div>
  );
}
