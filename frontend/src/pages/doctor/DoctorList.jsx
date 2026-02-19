import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, Form, Table, Tabs, Tab, Badge, Button, Pagination } from 'react-bootstrap';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { listDischarges } from '../../api/dischargeApi';
import { DISCHARGE_STATUS } from '../../api/dischargeApi';
import { TableSkeleton } from '../../components/SkeletonLoader';

const TAB_STATUS = [
  { key: DISCHARGE_STATUS.DRAFT, label: 'Draft' },
  { key: DISCHARGE_STATUS.AI_ENHANCED, label: 'AI Enhanced' },
  { key: DISCHARGE_STATUS.PENDING_APPROVAL, label: 'Pending Approval' },
  { key: DISCHARGE_STATUS.REJECTED, label: 'Rejected' },
];

const PAGE_SIZE = 10;

function statusVariant(status) {
  switch (status) {
    case DISCHARGE_STATUS.DRAFT:
      return 'secondary';
    case DISCHARGE_STATUS.AI_ENHANCED:
      return 'info';
    case DISCHARGE_STATUS.PENDING_APPROVAL:
      return 'warning';
    case DISCHARGE_STATUS.REJECTED:
      return 'danger';
    case DISCHARGE_STATUS.APPROVED:
      return 'success';
    default:
      return 'light';
  }
}

function formatDate(val) {
  if (!val) return '—';
  try {
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
  } catch {
    return '—';
  }
}

export function DoctorList() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(DISCHARGE_STATUS.DRAFT);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchList = useCallback(
    async (status, q, pageNum = 1) => {
      setLoading(true);
      try {
        const data = await listDischarges({ status, search: q });
        const items = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
        setList(Array.isArray(items) ? items : []);
      } catch (_e) {
        setList([]);
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchList(activeTab, search);
  }, [activeTab, search, fetchList]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const displayList = list;
  const totalPages = Math.max(1, Math.ceil(displayList.length / PAGE_SIZE));
  const paginatedList = displayList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const empty = !loading && displayList.length === 0;

  return (
    <div className="ds-page-enter ds-page-enter-active ds-page">
      <PageHeader
        breadcrumbs={[{ to: '/', label: 'Home' }, { label: 'My Summaries' }]}
        title="My Discharge Summaries"
        description="Drafts, AI-enhanced, pending approval, and rejected. Create a new summary or continue editing."
        action={
          <Button as={Link} to="/doctor/create" variant="primary" className="ds-focus-ring">
            + New Summary
          </Button>
        }
      />

      <Card className="ds-card mb-0">
        <Card.Body className="p-4">
          <Tabs activeKey={activeTab} onSelect={(k) => { setActiveTab(k); setPage(1); }} className="mb-3">
            {TAB_STATUS.map(({ key, label }) => (
              <Tab key={key} eventKey={key} title={label} />
            ))}
          </Tabs>
          <Form onSubmit={handleSearchSubmit} className="mb-0">
            <Form.Group>
              <Form.Control
                type="search"
                placeholder="Search by UHID, IPID or Mobile..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="ds-focus-ring"
                aria-label="Search by UHID, IPID or Mobile"
              />
            </Form.Group>
            <div className="d-flex gap-2 mt-2">
              <Button type="submit" variant="primary" size="sm" className="ds-focus-ring">Search</Button>
              {(search || searchInput) && (
                <Button
                  type="button"
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
                >
                  Clear
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className="ds-card">
        <Card.Body className="p-0">
          {loading && <TableSkeleton rows={6} cols={6} />}
          {!loading && empty && (
            <div className="ds-empty-state">
              <div className="ds-empty-state-icon">📋</div>
              <p className="mb-0">No summaries in this tab.</p>
              <small className="d-block mb-3">Create your first discharge summary or try a different tab or search.</small>
              <Button as={Link} to="/doctor/create" variant="primary" size="sm" className="ds-focus-ring">
                Create New Summary
              </Button>
            </div>
          )}
          {!loading && !empty && (
            <>
              <div className="ds-table-wrapper">
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>UHID</th>
                      <th>IPID</th>
                      <th>Patient</th>
                      <th>Mobile</th>
                      <th>Status</th>
                      <th>Last updated</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedList.map((row) => {
                      const id = row._id || row.id;
                      return (
                        <tr key={id}>
                          <td>{row.uhid ?? '—'}</td>
                          <td>{row.ipid ?? '—'}</td>
                          <td>{row.patientName ?? '—'}</td>
                          <td>{row.mobile ?? '—'}</td>
                          <td>
                            <Badge bg={statusVariant(row.status)}>{row.status ?? 'draft'}</Badge>
                          </td>
                          <td>{formatDate(row.updatedAt ?? row.updated_at ?? row.updated)}</td>
                          <td>
                            {row.status === DISCHARGE_STATUS.AI_ENHANCED || row.status === DISCHARGE_STATUS.DRAFT ? (
                              <Button
                                as={Link}
                                to={row.aiEnhancedText ? `/doctor/preview/${id}` : `/doctor/create?id=${id}`}
                                variant="outline-primary"
                                size="sm"
                                className="ds-focus-ring"
                              >
                                {row.aiEnhancedText ? 'Preview / Edit' : 'Edit'}
                              </Button>
                            ) : (
                              <Button
                                as={Link}
                                to={`/doctor/create?id=${id}`}
                                variant="outline-secondary"
                                size="sm"
                                className="ds-focus-ring"
                              >
                                View
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="ds-pagination-bar">
                  <small className="text-muted">
                    Page {page} of {totalPages} · {displayList.length} total
                  </small>
                  <Pagination className="mb-0">
                    <Pagination.Prev
                      disabled={page <= 1}
                      onClick={(e) => { e.preventDefault(); if (page > 1) setPage((p) => (p - 1)); }}
                      href="#"
                    />
                    <Pagination.Item active>{page}</Pagination.Item>
                    <Pagination.Next
                      disabled={page >= totalPages}
                      onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage((p) => (p + 1)); }}
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
