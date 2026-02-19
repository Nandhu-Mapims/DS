import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Form, Button, Nav, Collapse, ListGroup, Badge } from 'react-bootstrap';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { getDischarge, updateDoctorEditedText, submitForApproval } from '../../api/dischargeApi';
import { SubmitButton } from '../../components/SubmitButton';
import { parseDischargeSummaryText, getSectionEmoji } from '../../utils/dischargeSummaryParser';

function StructuredJsonPreview({ json }) {
  const [open, setOpen] = useState({});
  const toggle = (key) => setOpen((p) => ({ ...p, [key]: !p[key] }));
  const p = json.patient || {};
  const a = json.admission || {};
  const d = json.diagnoses || {};
  const inst = json.instructions || {};
  const sections = [
    { key: 'patient', title: 'Patient details', content: [['UHID', p.uhid], ['IPID', p.ipid], ['Name', p.name], ['Mobile', p.mobile], ['Age', p.age], ['Gender', p.gender]].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(' · ') || '—' },
    { key: 'admission', title: 'Admission & discharge', content: [['Admission', a.admissionDate], ['Discharge', a.dischargeDate], ['Department', a.department], ['Condition', a.dischargeCondition]].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(' · ') || '—' },
    { key: 'diagnoses', title: 'Diagnoses & ICD-10', content: [d.provisional && `Provisional: ${d.provisional}`, d.final && `Final: ${d.final}`, (d.icd10Codes?.length && `ICD-10: ${d.icd10Codes.join(', ')}`)].filter(Boolean).join('\n') || '—' },
    { key: 'hospitalCourse', title: 'Hospital course', content: json.hospitalCourse || '—' },
    { key: 'procedures', title: 'Procedures', content: json.procedures || '—' },
    { key: 'investigations', title: 'Investigations', content: json.investigations || '—' },
    { key: 'medications', title: 'Discharge medications', isTable: true, rows: (json.medications || []).map((m) => [m.name, m.dose, m.route, m.frequency, m.duration, m.notes].map((x) => x ?? '—')) },
    { key: 'instructions', title: 'Instructions', content: [inst.diet && `Diet: ${inst.diet}`, inst.activity && `Activity: ${inst.activity}`, inst.woundCare && `Wound care: ${inst.woundCare}`, inst.followUp && `Follow-up: ${inst.followUp}`, inst.redFlags && `Red flags: ${inst.redFlags}`, inst.advice && `Advice: ${inst.advice}`].filter(Boolean).join('\n') || '—' },
    { key: 'finalNarrative', title: 'Clinical summary', content: json.finalNarrativeText || '—' },
  ];
  return (
    <div className="ds-structured-preview">
      {sections.map(({ key, title, content, isTable, rows }) => (
        <div key={key} className="mb-2">
          <Button
            variant="link"
            size="sm"
            className="p-0 text-start fw-semibold text-decoration-none ds-focus-ring"
            onClick={() => toggle(key)}
            aria-expanded={open[key]}
          >
            {open[key] ? '▼' : '▶'} {title}
          </Button>
          <Collapse in={open[key]}>
            <div>
              {isTable && rows?.length > 0 ? (
                <table className="table table-sm ds-summary-table mt-1">
                  <thead><tr><th>Name</th><th>Dose</th><th>Route</th><th>Frequency</th><th>Duration</th><th>Notes</th></tr></thead>
                  <tbody>{rows.map((row, ri) => (<tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>))}</tbody>
                </table>
              ) : (
                <div className="small mt-1 ps-2" style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
              )}
            </div>
          </Collapse>
        </div>
      ))}
    </div>
  );
}

export function DoctorPreviewEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [discharge, setDischarge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [monospace, setMonospace] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getDischarge(id)
      .then((d) => {
        setDischarge(d);
        setEditedText(d?.doctorEditedText ?? d?.aiEnhancedText ?? '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, toast]);

  const handleSaveEdits = useCallback(() => {
    if (!id) return;
    setSaving(true);
    updateDoctorEditedText(id, editedText)
      .then(() => {
        setDischarge((prev) => (prev ? { ...prev, doctorEditedText: editedText } : null));
        toast.success('Edits saved');
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  }, [id, editedText, toast]);

  const handleSubmitToChief = useCallback(() => {
    if (!id) return;
    setSubmitting(true);
    const payload = editedText ? { doctorEditedText: editedText } : {};
    submitForApproval(id, payload)
      .then(() => {
        toast.success('Submitted to Chief');
        navigate('/doctor');
      })
      .catch(() => {})
      .finally(() => setSubmitting(false));
  }, [id, editedText, navigate, toast]);

  if (loading) {
    return (
      <div className="ds-page-enter ds-page-enter-active">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!discharge) {
    return (
      <div className="ds-page-enter ds-page-enter-active">
        <p className="text-muted">Discharge not found.</p>
        <Button as={Link} to="/doctor" variant="outline-primary">Back to list</Button>
      </div>
    );
  }

  return (
    <div className="ds-page-enter ds-page-enter-active ds-page">
      <PageHeader
        breadcrumbs={[{ to: '/', label: 'Home' }, { to: '/doctor', label: 'My Summaries' }, { label: 'Preview & Edit' }]}
        title="Preview & Edit — AI Enhanced Summary"
        description="Review and edit the AI-enhanced text, then submit for Chief approval."
        action={
          <Button as={Link} to="/doctor" variant="outline-secondary" size="sm" className="ds-focus-ring">
            ← Back to list
          </Button>
        }
      />

      {(discharge.missingFields?.length > 0 || discharge.warnings?.length > 0) && (
        <Card className="ds-card mb-3 border-warning">
          <Card.Header className="py-2 fw-semibold">Missing fields &amp; warnings</Card.Header>
          <Card.Body className="py-2">
            {discharge.missingFields?.length > 0 && (
              <div className="mb-2">
                <span className="text-muted small fw-semibold">Missing fields:</span>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {discharge.missingFields.map((key, i) => (
                    <Badge key={i} bg="secondary" text="dark">{key}</Badge>
                  ))}
                </div>
              </div>
            )}
            {discharge.warnings?.length > 0 && (
              <div>
                <span className="text-warning small fw-semibold">Warnings:</span>
                <ListGroup variant="flush" className="small mt-1">
                  {discharge.warnings.map((msg, i) => (
                    <ListGroup.Item key={i} className="py-1 text-warning-emphasis">{msg}</ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      <Card className="ds-card mb-3">
        <Card.Header className="d-flex align-items-center border-bottom border-secondary-subtle py-2">
          <Nav variant="tabs" className="nav-tabs-card border-0 flex-grow-1" activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'edit')}>
            <Nav.Item>
              <Nav.Link eventKey="edit" className="fw-semibold ds-focus-ring">
                ✏️ Edit
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="preview" className="fw-semibold ds-focus-ring">
                📋 Formatted preview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="structured" className="fw-semibold ds-focus-ring">
                📑 Structured (AI JSON)
              </Nav.Link>
            </Nav.Item>
          </Nav>
          {activeTab === 'edit' && (
            <Form.Check
              type="switch"
              id="monospace-preview"
              label="Monospace"
              checked={monospace}
              onChange={(e) => setMonospace(e.target.checked)}
              className="ds-focus-ring ms-2 mb-0"
            />
          )}
        </Card.Header>
        <Card.Body>
          {activeTab === 'edit' && (
            <>
              <Form.Label className="mb-2 fw-semibold">Summary text (markdown with ## sections and tables)</Form.Label>
              <Form.Control
                as="textarea"
                rows={18}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className={`ds-focus-ring ${monospace ? 'font-monospace' : ''}`}
                style={{
                  minHeight: 320,
                  backgroundColor: 'var(--ds-bg-elevated)',
                  color: 'var(--ds-text)',
                }}
                placeholder="AI-enhanced summary will appear here. You can edit before submitting to Chief."
                aria-label="Editable summary text"
              />
            </>
          )}
          {activeTab === 'preview' && (
            <div className="ds-summary-content ds-summary-preview-block" style={{ minHeight: 320 }}>
              <p className="text-muted small mb-3">This is how the summary will look on the Verified page and in print. Tables and sections are rendered from your current text.</p>
              {editedText.trim() ? (
                (() => {
                  const sections = parseDischargeSummaryText(editedText);
                  return sections.length > 0 ? (
                    <div className="ds-summary-sections">
                      {sections.map((sec, idx) => (
                        <section key={idx} className="ds-summary-section">
                          {sec.type === 'table' && (
                            <>
                              {sec.title != null && sec.title !== '' && (
                                <h3 className="ds-summary-section-title">{getSectionEmoji(sec.title)} {sec.title}</h3>
                              )}
                              <div className="ds-table-wrapper">
                                <table className="table ds-summary-table">
                                  <thead>
                                    <tr>
                                      {(sec.headers || []).map((h, i) => (
                                        <th key={i}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(sec.rows || []).map((row, ri) => (
                                      <tr key={ri}>
                                        {row.map((cell, ci) => (
                                          <td key={ci}>{cell}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          )}
                          {sec.type === 'paragraph' && (
                            <>
                              {sec.title != null && sec.title !== '' && (
                                <h3 className="ds-summary-section-title">{getSectionEmoji(sec.title)} {sec.title}</h3>
                              )}
                              {sec.content ? (
                                <div className="ds-summary-section-body" style={{ whiteSpace: 'pre-wrap' }}>
                                  {sec.content}
                                </div>
                              ) : null}
                            </>
                          )}
                        </section>
                      ))}
                    </div>
                  ) : (
                    <div className="text-break" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {editedText}
                    </div>
                  );
                })()
              ) : (
                <p className="text-muted mb-0">No summary text yet. Switch to Edit to paste or type content.</p>
              )}
            </div>
          )}
          {activeTab === 'structured' && (
            <div className="ds-summary-content" style={{ minHeight: 320 }}>
              {discharge.aiEnhancedJson ? (
                <StructuredJsonPreview json={discharge.aiEnhancedJson} />
              ) : (
                <p className="text-muted mb-0">No structured AI data. This summary may have been enhanced with the legacy flow.</p>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      <div
        className="d-flex flex-wrap align-items-center gap-2 py-3"
        style={{
          backgroundColor: 'var(--ds-bg-elevated)',
          borderTop: '1px solid var(--ds-border-subtle)',
          borderRadius: 'var(--ds-radius-md)',
          paddingLeft: '1rem',
          paddingRight: '1rem',
        }}
      >
        <SubmitButton
          type="button"
          variant="outline-primary"
          onClick={handleSaveEdits}
          loading={saving}
        >
          Save edits
        </SubmitButton>
        <SubmitButton
          type="button"
          variant="success"
          onClick={handleSubmitToChief}
          loading={submitting}
        >
          Submit to Chief
        </SubmitButton>
      </div>
    </div>
  );
}
