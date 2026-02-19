import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Table, Pagination, Button } from 'react-bootstrap';
import { PageHeader } from '../components/PageHeader';
import { TableSkeleton } from '../components/SkeletonLoader';
import { getStoredUser } from '../api/axios';
import { listDischarges } from '../api/dischargeApi';

const PAGE_SIZE = 10;

function formatDate(d) {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function SummariesPage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const role = user?.role;
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listDischarges({ search: searchDebounced })
      .then((data) => {
        if (!cancelled) setList(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setList([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [searchDebounced]);

  useEffect(() => {
    setPage(1);
  }, [searchDebounced]);

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const paginatedList = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const empty = list.length === 0 && !loading;

  return (
    <div className="ds-page-enter ds-page-enter-active ds-page">
      <PageHeader
        breadcrumbs={[{ to: '/', label: 'Home' }, { label: 'Summaries' }]}
        title="Summaries"
        description="Browse and search discharge summaries across the workflow. Create new ones from My Summaries (Doctor) or view approved ones in Verified."
      />

      <Card className="ds-card mb-3">
        <Card.Header>Search</Card.Header>
        <Card.Body>
          <Form.Group className="mb-0">
            <Form.Control
              type="search"
              placeholder="Search by UHID, IPID, patient name, or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ds-focus-ring"
              aria-label="Search summaries"
            />
          </Form.Group>
        </Card.Body>
      </Card>

      <Card className="ds-card">
        <Card.Body className="p-0">
          {loading && <TableSkeleton rows={6} cols={5} />}
          {!loading && empty && (
            <div className="ds-empty-state">
              <div className="ds-empty-state-icon">📑</div>
              <p className="mb-0">No summaries to list here yet.</p>
              <small className="d-block mb-3">
                {(role === 'DOCTOR' || role === 'ADMIN') && 'Create and manage discharge summaries from My Summaries.'}
                {(role === 'CHIEF' || role === 'ADMIN') && 'Summaries submitted by doctors appear in Chief Queue. Approved ones are in Verified.'}
                {(!role || (role !== 'DOCTOR' && role !== 'CHIEF' && role !== 'ADMIN')) && 'Use the navigation to open My Summaries or Verified.'}
              </small>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                {(role === 'DOCTOR' || role === 'ADMIN') && (
                  <Button variant="primary" size="sm" onClick={() => navigate('/doctor')} className="ds-focus-ring">
                    My Summaries
                  </Button>
                )}
                <Button variant="outline-primary" size="sm" onClick={() => navigate('/verified')} className="ds-focus-ring">
                  Verified
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => navigate('/')} className="ds-focus-ring">
                  Home
                </Button>
              </div>
            </div>
          )}
          {!loading && !empty && (
            <>
              <div className="ds-table-wrapper">
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>UHID</th>
                      <th>Patient</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th aria-hidden="true" />
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedList.map((row) => (
                      <tr key={row._id}>
                        <td>{row.uhid ?? '—'}</td>
                        <td>{row.patientName ?? '—'}</td>
                        <td>
                          <span className="badge bg-secondary text-capitalize">
                            {(row.status ?? '').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>{formatDate(row.createdAt ?? row.created_at)}</td>
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
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <small className="text-muted">
                    Page {page} of {totalPages} · {list.length} total
                  </small>
                  <Pagination className="mb-0">
                    <Pagination.Prev
                      disabled={page <= 1}
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage((p) => (p - 1));
                      }}
                      href="#"
                    />
                    <Pagination.Item active>{page}</Pagination.Item>
                    <Pagination.Next
                      disabled={page >= totalPages}
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage((p) => (p + 1));
                      }}
                      href="#"
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
