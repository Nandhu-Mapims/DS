import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Modal,
  Badge,
  ListGroup,
} from 'react-bootstrap';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import {
  getDischarge,
  chiefEdit,
  approveDischarge,
  rejectDischarge,
} from '../../api/dischargeApi';
import { DISCHARGE_STATUS } from '../../api/dischargeApi';
import { SubmitButton } from '../../components/SubmitButton';

function formatDate(val) {
  if (!val) return '—';
  try {
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
  } catch {
    return '—';
  }
}

/** Editor content priority: chiefEditedText || aiEnhancedText || doctorEditedText || doctorDraftText */
function getEditorInitialContent(d) {
  if (!d) return '';
  return (
    d.chiefEditedText?.trim() ||
    d.aiEnhancedText?.trim() ||
    d.doctorEditedText?.trim() ||
    d.doctorDraftText?.trim() ||
    ''
  );
}

export function ChiefReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [discharge, setDischarge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editorText, setEditorText] = useState('');
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');

  const loadDischarge = useCallback(async () => {
    if (!id) return null;
    const d = await getDischarge(id);
    setDischarge(d);
    setEditorText(getEditorInitialContent(d));
    return d;
  }, [id]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getDischarge(id)
      .then((d) => {
        setDischarge(d);
        setEditorText(getEditorInitialContent(d));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, toast]);

  const handleSaveEdits = useCallback(() => {
    if (!id) return;
    setSaving(true);
    chiefEdit(id, editorText)
      .then((updated) => {
        setDischarge((prev) => (prev ? { ...prev, ...updated, chiefEditedText: editorText } : updated));
        toast.success('Edits saved');
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  }, [id, editorText, toast]);

  const handleApproveClick = () => {
    if (!editorText.trim()) {
      toast.warning('Editor is empty. Add content before approving.');
      return;
    }
    setShowApproveConfirm(true);
  };

  const handleApproveConfirm = useCallback(() => {
    if (!id) return;
    setShowApproveConfirm(false);
    setApproving(true);
    approveDischarge(id)
      .then(() => {
        toast.success('Approved');
        navigate(`/verified/${id}`);
      })
      .catch(() => {})
      .finally(() => setApproving(false));
  }, [id, navigate, toast]);

  const handleRejectOpen = () => {
    setRejectRemarks('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = useCallback(() => {
    if (!id) return;
    setRejecting(true);
    rejectDischarge(id, { remarks: rejectRemarks.trim() })
      .then(() => {
        setShowRejectModal(false);
        setRejectRemarks('');
        toast.success('Rejected with remarks');
        navigate('/chief');
      })
      .catch(() => {})
      .finally(() => setRejecting(false));
  }, [id, rejectRemarks, navigate, toast]);

  const editorEmpty = !editorText.trim();

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
        <Button as={Link} to="/chief" variant="outline-primary">
          Back to queue
        </Button>
      </div>
    );
  }

  return (
    <div className="ds-page-enter ds-page-enter-active ds-page">
      <PageHeader
        breadcrumbs={[{ to: '/', label: 'Home' }, { to: '/chief', label: 'Chief Queue' }, { label: 'Review' }]}
        title="Chief Review"
        description={`UHID ${discharge.uhid ?? '—'} · Edit the summary, then approve or reject with remarks.`}
        action={
          <Button as={Link} to="/chief" variant="outline-secondary" size="sm" className="ds-focus-ring">
            ← Back to queue
          </Button>
        }
      />

      {(discharge.missingFields?.length > 0 || discharge.warnings?.length > 0) && (
        <Card className="ds-card mb-3 border-warning">
          <Card.Header className="py-2 fw-semibold">Missing fields &amp; warnings</Card.Header>
          <Card.Body className="py-2">
            {discharge.missingFields?.length > 0 && (
              <div className="mb-2">
                <span className="text-muted small fw-semibold">Missing fields: </span>
                {(discharge.missingFields || []).map((key, i) => (
                  <Badge key={i} bg="secondary" text="dark" className="me-1">{key}</Badge>
                ))}
              </div>
            )}
            {discharge.warnings?.length > 0 && (
              <div>
                <span className="text-warning small fw-semibold">Warnings:</span>
                <ListGroup variant="flush" className="small mt-1">
                  {(discharge.warnings || []).map((msg, i) => (
                    <ListGroup.Item key={i} className="py-1 text-warning-emphasis">{msg}</ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      <Row className="g-3">
        {/* Left: Patient info card */}
        <Col lg={4} xl={3}>
          <Card className="ds-card h-100">
            <Card.Header className="fw-semibold">Patient info</Card.Header>
            <Card.Body>
              <dl className="mb-0 small">
                <dt className="text-muted">UHID</dt>
                <dd className="mb-2">{discharge.uhid ?? '—'}</dd>
                <dt className="text-muted">IPID</dt>
                <dd className="mb-2">{discharge.ipid ?? '—'}</dd>
                <dt className="text-muted">Name</dt>
                <dd className="mb-2">{discharge.patientName ?? '—'}</dd>
                <dt className="text-muted">Mobile</dt>
                <dd className="mb-2">{discharge.mobile ?? '—'}</dd>
                <dt className="text-muted">Age / Gender</dt>
                <dd className="mb-2">{[discharge.age, discharge.gender].filter(Boolean).join(' / ') || '—'}</dd>
                <dt className="text-muted">Department</dt>
                <dd className="mb-2">{discharge.department ?? '—'}</dd>
              </dl>
            </Card.Body>
            <Card.Footer className="bg-transparent border-top small text-muted">
              <strong>Audit</strong>
              <dl className="mb-0 mt-1">
                <dt className="text-muted">Created by</dt>
                <dd className="mb-1">{discharge.createdBy ?? '—'}</dd>
                <dt className="text-muted">Submitted at</dt>
                <dd className="mb-1">{formatDate(discharge.submittedAt ?? discharge.submitted_at)}</dd>
                <dt className="text-muted">Chief edited at</dt>
                <dd className="mb-0">{formatDate(discharge.chiefEditedAt ?? discharge.chief_edited_at)}</dd>
              </dl>
            </Card.Footer>
          </Card>
        </Col>

        {/* Right: Editor card */}
        <Col lg={8} xl={9}>
          <Card className="ds-card h-100 d-flex flex-column">
            <Card.Header className="fw-semibold d-flex align-items-center justify-content-between flex-wrap gap-2">
              <span>Summary content</span>
              <Badge bg={discharge.status === DISCHARGE_STATUS.CHIEF_EDITED ? 'info' : 'warning'}>
                {discharge.status ?? 'pending_approval'}
              </Badge>
            </Card.Header>
            <Card.Body className="flex-grow-1 d-flex flex-column p-0">
              <Form.Control
                as="textarea"
                rows={20}
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                className="border-0 flex-grow-1 rounded-0 px-3 py-3 font-monospace small"
                style={{
                  minHeight: 360,
                  resize: 'vertical',
                  backgroundColor: 'var(--ds-bg-elevated)',
                  color: 'var(--ds-text)',
                }}
                placeholder="Content loads from chief edits, AI-enhanced text, or doctor draft."
                aria-label="Editable summary content"
              />
            </Card.Body>
          </Card>

          {/* Sticky action bar */}
          <div
            className="position-sticky bottom-0 py-3 mt-3 px-0 mx-n3 mx-md-n4 mb-n3 mb-md-n4 px-3 px-md-4 rounded-top shadow"
            style={{
              backgroundColor: 'var(--ds-bg-elevated)',
              borderTop: '1px solid var(--ds-border-subtle)',
            }}
          >
            <div className="d-flex flex-wrap align-items-center gap-2">
              <SubmitButton
                type="button"
                variant="outline-primary"
                onClick={handleSaveEdits}
                loading={saving}
              >
                Save Edits
              </SubmitButton>
              <SubmitButton
                type="button"
                variant="success"
                onClick={handleApproveClick}
                loading={approving}
                disabled={editorEmpty}
              >
                Approve
              </SubmitButton>
              <Button
                type="button"
                variant="outline-danger"
                className="ds-focus-ring"
                onClick={handleRejectOpen}
                disabled={rejecting}
              >
                Reject with remarks
              </Button>
            </div>
            {editorEmpty && (
              <p className="text-muted small mb-0 mt-2">Approve is disabled until the editor has content.</p>
            )}
          </div>
        </Col>
      </Row>

      {/* Approve confirmation modal */}
      <Modal
        show={showApproveConfirm}
        onHide={() => setShowApproveConfirm(false)}
        centered
        aria-labelledby="approve-confirm-title"
        aria-describedby="approve-confirm-desc"
      >
        <Modal.Header closeButton>
          <Modal.Title id="approve-confirm-title">Confirm approval</Modal.Title>
        </Modal.Header>
        <Modal.Body id="approve-confirm-desc">
          Approve this discharge summary? It will move to the Verified portal.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApproveConfirm(false)} className="ds-focus-ring">
            Cancel
          </Button>
          <SubmitButton variant="success" onClick={handleApproveConfirm} loading={approving}>
            Approve
          </SubmitButton>
        </Modal.Footer>
      </Modal>

      {/* Reject with remarks modal */}
      <Modal
        show={showRejectModal}
        onHide={() => !rejecting && setShowRejectModal(false)}
        centered
        aria-labelledby="reject-modal-title"
        aria-describedby="reject-modal-desc"
      >
        <Modal.Header closeButton>
          <Modal.Title id="reject-modal-title">Reject with remarks</Modal.Title>
        </Modal.Header>
        <Modal.Body id="reject-modal-desc">
          <Form.Group>
            <Form.Label htmlFor="reject-remarks">Remarks (optional)</Form.Label>
            <Form.Control
              id="reject-remarks"
              as="textarea"
              rows={3}
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              placeholder="Reason for rejection or feedback for the doctor"
              className="ds-focus-ring"
              aria-describedby="reject-remarks-hint"
            />
            <Form.Text id="reject-remarks-hint" className="text-muted">
              These remarks will be sent to the doctor.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRejectModal(false)}
            disabled={rejecting}
            className="ds-focus-ring"
          >
            Cancel
          </Button>
          <SubmitButton variant="danger" onClick={handleRejectSubmit} loading={rejecting}>
            Reject
          </SubmitButton>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
