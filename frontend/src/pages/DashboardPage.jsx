import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import { PageHeader } from '../components/PageHeader';
import { TableSkeleton } from '../components/SkeletonLoader';
import { getStoredUser } from '../api/axios';
import { listDischarges, listVerifiedDischarges, listChiefQueue } from '../api/dischargeApi';

function formatDate(d) {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function DashboardPage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const role = user?.role;

  const [pendingCount, setPendingCount] = useState(null);
  const [approvedCount, setApprovedCount] = useState(null);
  const [recent, setRecent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      try {
        const canFetchChiefQueue = role === 'CHIEF' || role === 'ADMIN';
        const [pendingRes, approvedRes, listRes] = await Promise.all([
          canFetchChiefQueue ? listChiefQueue().catch(() => []) : Promise.resolve([]),
          listVerifiedDischarges().catch(() => []),
          listDischarges().catch(() => []),
        ]);
        if (cancelled) return;
        const all = Array.isArray(listRes) ? listRes : [];
        const pendingNum = canFetchChiefQueue && Array.isArray(pendingRes)
          ? pendingRes.length
          : all.filter((d) => d.status === 'pending_approval').length;
        setPendingCount(pendingNum);
        setApprovedCount(Array.isArray(approvedRes) ? approvedRes.length : 0);
        setRecent(all.slice(0, 10));
      } catch (_) {
        if (!cancelled) {
          setPendingCount(0);
          setApprovedCount(0);
          setRecent([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [role]);

  return (
    <div className="ds-page-enter ds-page-enter-active ds-page">
      <PageHeader
        breadcrumbs={[{ to: '/', label: 'Home' }, { label: 'Dashboard' }]}
        title="Dashboard"
        description="Overview of the discharge summary workflow. Use the quick links below to jump to your section."
      />

      <section className="mb-4">
        <h2 className="ds-section-title">
          Quick links
        </h2>
        <div className="row g-3">
          {(role === 'DOCTOR' || role === 'ADMIN') && (
            <div className="col-sm-6 col-md-4">
              <Card className="ds-card h-100">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h6 text-muted">My Summaries</Card.Title>
                  <p className="small text-muted mb-2 flex-grow-1">Drafts and summaries you created.</p>
                  <Button variant="outline-primary" size="sm" onClick={() => navigate('/doctor')} className="ds-focus-ring align-self-start">
                    Open
                  </Button>
                </Card.Body>
              </Card>
            </div>
          )}
          {(role === 'CHIEF' || role === 'ADMIN') && (
            <div className="col-sm-6 col-md-4">
              <Card className="ds-card h-100">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h6 text-muted">Chief Queue</Card.Title>
                  <p className="small text-muted mb-2 flex-grow-1">Summaries pending your approval.</p>
                  <Button variant="outline-primary" size="sm" onClick={() => navigate('/chief')} className="ds-focus-ring align-self-start">
                    Open
                  </Button>
                </Card.Body>
              </Card>
            </div>
          )}
          <div className="col-sm-6 col-md-4">
            <Card className="ds-card h-100">
              <Card.Body className="d-flex flex-column">
                <Card.Title className="h6 text-muted">Verified</Card.Title>
                <p className="small text-muted mb-2 flex-grow-1">Approved summaries (view, PDF, WhatsApp).</p>
                <Button variant="outline-primary" size="sm" onClick={() => navigate('/verified')} className="ds-focus-ring align-self-start">
                  Open
                </Button>
              </Card.Body>
            </Card>
          </div>
        </div>
      </section>

      <section className="mb-4">
        <h2 className="ds-section-title">
          Summary counts
        </h2>
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-lg-3">
            <Card className="ds-card">
              <Card.Body>
                <Card.Title className="h6 text-muted">Pending</Card.Title>
                <Card.Text className="h4 mb-0">
                  {loading ? '…' : typeof pendingCount === 'number' ? pendingCount : '—'}
                </Card.Text>
                <small className="text-muted">Awaiting Chief approval</small>
              </Card.Body>
            </Card>
          </div>
          <div className="col-sm-6 col-lg-3">
            <Card className="ds-card">
              <Card.Body>
                <Card.Title className="h6 text-muted">Approved</Card.Title>
                <Card.Text className="h4 mb-0">
                  {loading ? '…' : typeof approvedCount === 'number' ? approvedCount : '—'}
                </Card.Text>
                <small className="text-muted">Verified summaries</small>
              </Card.Body>
            </Card>
          </div>
        </div>
      </section>

      <section>
        <h2 className="ds-section-title">
          Recent activity
        </h2>
        <Card className="ds-card">
          <Card.Body className="p-0">
            {loading ? (
              <TableSkeleton rows={4} cols={4} />
            ) : recent && recent.length > 0 ? (
              <div className="ds-table-wrapper">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>UHID</th>
                      <th>Status</th>
                      <th>Updated</th>
                      <th aria-hidden="true" />
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((row) => (
                      <tr key={row._id}>
                        <td>{row.patientName ?? '—'}</td>
                        <td>{row.uhid ?? '—'}</td>
                        <td>
                          <span className="badge bg-secondary text-capitalize">
                            {(row.status ?? '').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>{formatDate(row.updatedAt ?? row.updated_at)}</td>
                        <td>
                          {row.status === 'approved' ? (
                            <Button variant="outline-primary" size="sm" as={Link} to={`/verified/${row._id}`} className="ds-focus-ring">
                              View
                            </Button>
                          ) : (role === 'CHIEF' || role === 'ADMIN') && (row.status === 'pending_approval' || row.status === 'chief_edited') ? (
                            <Button variant="outline-primary" size="sm" as={Link} to={`/chief/review/${row._id}`} className="ds-focus-ring">
                              Review
                            </Button>
                          ) : (
                            <Button variant="outline-primary" size="sm" as={Link} to={`/doctor/preview/${row._id}`} className="ds-focus-ring">
                              View
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="ds-empty-state">
                <p className="mb-0">No recent activity.</p>
                <small className="text-muted">Summaries will appear here once created.</small>
              </div>
            )}
          </Card.Body>
        </Card>
      </section>
    </div>
  );
}
