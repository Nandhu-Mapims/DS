import { useNavigate } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import { getStoredUser } from '../api/axios';

const FLOW_STEPS = [
  { step: 1, label: 'Doctor', desc: 'Create draft with patient details' },
  { step: 2, label: 'AI', desc: 'Enhance draft with AI' },
  { step: 3, label: 'Chief', desc: 'Edit and approve' },
  { step: 4, label: 'Verified', desc: 'Approved summaries portal' },
  { step: 5, label: 'WhatsApp', desc: 'Send to patient' },
];

export function HomePage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const role = user?.role;

  return (
    <div className="ds-page-enter ds-page-enter-active ds-page">
      {/* Hero + flow */}
      <section className="mb-5">
        <h1 className="display-6 fw-bold mb-2" style={{ color: 'var(--ds-text)', letterSpacing: '-0.02em' }}>
          Discharge Summary Workflow
        </h1>
        <p className="text-muted mb-4" style={{ fontSize: '1.05rem', maxWidth: '48ch' }}>
          Create, enhance, approve, and share discharge summaries in one place. Follow the steps below to complete the workflow.
        </p>

        <div className="mb-4">
          <h2 className="ds-section-title">
            How it works
          </h2>
          <div className="d-flex flex-wrap align-items-stretch gap-2 gap-md-3">
            {FLOW_STEPS.map((item, i) => (
              <div
                key={item.step}
                className="d-flex align-items-center"
                style={{ flex: '1 1 auto', minWidth: '120px' }}
              >
                <div
                  className="rounded-3 p-3 border bg-white shadow-sm text-center"
                  style={{
                    borderColor: 'var(--ds-border-subtle)',
                    minWidth: '100%',
                  }}
                >
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                    style={{
                      width: 28,
                      height: 28,
                      background: 'var(--ds-primary-light)',
                      color: 'var(--ds-primary-hover)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    {item.step}
                  </span>
                  <div className="fw-semibold small" style={{ color: 'var(--ds-text)' }}>
                    {item.label}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {item.desc}
                  </div>
                </div>
                {i < (FLOW_STEPS.length - 1) && (
                  <span className="d-none d-md-inline text-muted mx-1 align-self-center" style={{ fontSize: '0.9rem' }} aria-hidden>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-based quick actions */}
      <section className="mb-4">
        <h2 className="ds-section-title">
          Quick actions
        </h2>
        <div className="row g-4">
          {(role === 'DOCTOR' || role === 'ADMIN') && (
            <>
              <div className="col-md-6 col-lg-4">
                <Card className="ds-card h-100 border-0">
                  <Card.Body className="p-4">
                    <div
                      className="rounded-3 mb-3 d-inline-flex align-items-center justify-content-center"
                      style={{ width: 48, height: 48, background: 'var(--ds-primary-light)', color: 'var(--ds-primary)' }}
                      aria-hidden
                    >
                      <span style={{ fontSize: '1.5rem' }}>📋</span>
                    </div>
                    <Card.Title className="h5 mb-2">My Summaries</Card.Title>
                    <Card.Text className="text-muted small mb-3">
                      View and manage your drafts, AI-enhanced summaries, and those pending approval.
                    </Card.Text>
                    <Button variant="primary" size="sm" onClick={() => navigate('/doctor')} className="ds-focus-ring">
                      Open My Summaries
                    </Button>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-6 col-lg-4">
                <Card className="ds-card h-100 border-0">
                  <Card.Body className="p-4">
                    <div
                      className="rounded-3 mb-3 d-inline-flex align-items-center justify-content-center"
                      style={{ width: 48, height: 48, background: 'var(--ds-primary-light)', color: 'var(--ds-primary)' }}
                      aria-hidden
                    >
                      <span style={{ fontSize: '1.5rem' }}>➕</span>
                    </div>
                    <Card.Title className="h5 mb-2">New Summary</Card.Title>
                    <Card.Text className="text-muted small mb-3">
                      Create a new discharge summary. Fill patient details, save draft, then generate AI draft.
                    </Card.Text>
                    <Button variant="outline-primary" size="sm" onClick={() => navigate('/doctor/create')} className="ds-focus-ring">
                      Create New
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            </>
          )}
          {(role === 'CHIEF' || role === 'ADMIN') && (
            <div className="col-md-6 col-lg-4">
              <Card className="ds-card h-100 border-0">
                <Card.Body className="p-4">
                  <div
                    className="rounded-3 mb-3 d-inline-flex align-items-center justify-content-center"
                    style={{ width: 48, height: 48, background: 'var(--ds-primary-light)', color: 'var(--ds-primary)' }}
                    aria-hidden
                  >
                    <span style={{ fontSize: '1.5rem' }}>✓</span>
                  </div>
                  <Card.Title className="h5 mb-2">Chief Queue</Card.Title>
                  <Card.Text className="text-muted small mb-3">
                    Review summaries submitted by doctors. Edit, approve, or reject with remarks.
                  </Card.Text>
                  <Button variant="primary" size="sm" onClick={() => navigate('/chief')} className="ds-focus-ring">
                    Open Queue
                  </Button>
                </Card.Body>
              </Card>
            </div>
          )}
          <div className="col-md-6 col-lg-4">
            <Card className="ds-card h-100 border-0">
              <Card.Body className="p-4">
                <div
                  className="rounded-3 mb-3 d-inline-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, background: 'var(--ds-primary-light)', color: 'var(--ds-primary)' }}
                  aria-hidden
                >
                  <span style={{ fontSize: '1.5rem' }}>📄</span>
                </div>
                <Card.Title className="h5 mb-2">Verified</Card.Title>
                <Card.Text className="text-muted small mb-3">
                  Read-only list of approved summaries. View, download PDF, or resend via WhatsApp.
                </Card.Text>
                <Button variant="outline-primary" size="sm" onClick={() => navigate('/verified')} className="ds-focus-ring">
                  Open Verified
                </Button>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-6 col-lg-4">
            <Card className="ds-card h-100 border-0">
              <Card.Body className="p-4">
                <div
                  className="rounded-3 mb-3 d-inline-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, background: 'var(--ds-primary-light)', color: 'var(--ds-primary)' }}
                  aria-hidden
                >
                  <span style={{ fontSize: '1.5rem' }}>📊</span>
                </div>
                <Card.Title className="h5 mb-2">Dashboard</Card.Title>
                <Card.Text className="text-muted small mb-3">
                  Overview of summaries and workflow status.
                </Card.Text>
                <Button variant="outline-primary" size="sm" onClick={() => navigate('/dashboard')} className="ds-focus-ring">
                  Open Dashboard
                </Button>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-6 col-lg-4">
            <Card className="ds-card h-100 border-0">
              <Card.Body className="p-4">
                <div
                  className="rounded-3 mb-3 d-inline-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, background: 'var(--ds-primary-light)', color: 'var(--ds-primary)' }}
                  aria-hidden
                >
                  <span style={{ fontSize: '1.5rem' }}>📑</span>
                </div>
                <Card.Title className="h5 mb-2">Summaries</Card.Title>
                <Card.Text className="text-muted small mb-3">
                  Browse and search all summaries across the workflow.
                </Card.Text>
                <Button variant="outline-primary" size="sm" onClick={() => navigate('/summaries')} className="ds-focus-ring">
                  Open Summaries
                </Button>
              </Card.Body>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
