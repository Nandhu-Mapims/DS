import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, Form, Table, Badge, Button, Row, Col } from 'react-bootstrap';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { listChiefQueue } from '../../api/dischargeApi';
import { DISCHARGE_STATUS } from '../../api/dischargeApi';
import { TableSkeleton } from '../../components/SkeletonLoader';

const PAGE_SIZE = 10;

function statusVariant(status) {
  switch (status) {
    case DISCHARGE_STATUS.PENDING_APPROVAL:
      return 'warning';
    case DISCHARGE_STATUS.CHIEF_EDITED:
      return 'info';
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

export function ChiefQueue() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [department, setDepartment] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listChiefQueue({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        department: department.trim() || undefined,
        search: appliedSearch,
      });
      const items = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
      setList(Array.isArray(items) ? items : []);
    } catch (_e) {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, department, appliedSearch, toast]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setPage(1);
    setLoading(true);
    listChiefQueue({
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      department: department.trim() || undefined,
      search: searchInput.trim(),
    })
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
        setList(Array.isArray(items) ? items : []);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
    setDepartment('');
    setSearchInput('');
    setAppliedSearch('');
    setPage(1);
  };

  const displayList = list;
  const totalPages = Math.max(1, Math.ceil(displayList.length / PAGE_SIZE));
  const paginatedList = displayList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const empty = !loading && displayList.length === 0;
  const hasFilters = fromDate || toDate || department || appliedSearch;

  return (
    <div className="ds-page-enter ds-page-enter-active ds-page">
      <PageHeader
        breadcrumbs={[{ to: '/', label: 'Home' }, { label: 'Chief Queue' }]}
        title="Chief Queue"
        description="Summaries submitted for your approval or with your edits. Review, edit, approve, or reject with remarks."
      />

      <Card className="ds-card mb-3">
        <Card.Header>Filters</Card.Header>
        <Card.Body>
          <Form onSubmit={handleFilterSubmit}>
            <Row className="g-3">
              <Col md={6} lg={2}>
                <Form.Group>
                  <Form.Label className="small">From date</Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="ds-focus-ring"
                    aria-label="From date"
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={2}>
                <Form.Group>
                  <Form.Label className="small">To date</Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="ds-focus-ring"
                    aria-label="To date"
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={2}>
                <Form.Group>
                  <Form.Label className="small">Department</Form.Label>
                  <Form.Control
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Optional"
                    className="ds-focus-ring"
                    aria-label="Department"
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label className="small">Search UHID / IPID / Mobile</Form.Label>
                  <Form.Control
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="UHID, IPID or Mobile"
                    className="ds-focus-ring"
                    aria-label="Search"
                  />
                </Form.Group>
              </Col>
              <Col md={12} lg={3} className="d-flex align-items-end gap-2 flex-wrap">
                <Button type="submit" variant="primary" className="ds-focus-ring">
                  Apply
                </Button>
                {hasFilters && (
                  <Button type="button" variant="outline-secondary" onClick={handleClearFilters} className="ds-focus-ring">
                    Clear
                  </Button>
                )}
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className="ds-card">
        <Card.Body className="p-0">
          {loading && <TableSkeleton rows={8} cols={7} />}
          {!loading && empty && (
            <div className="ds-empty-state">
              <div className="ds-empty-state-icon">✓</div>
              <p className="mb-0">No summaries in queue.</p>
              <small>Summaries submitted by doctors will appear here. Try adjusting date or search filters, or check back later.</small>
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
                      <th>Department</th>
                      <th>Status</th>
                      <th>Submitted</th>
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
                          <td>{row.department ?? '—'}</td>
                          <td>
                            <Badge bg={statusVariant(row.status)}>{row.status ?? '—'}</Badge>
                          </td>
                          <td>{formatDate(row.submittedAt ?? row.submitted_at ?? row.updatedAt ?? row.updated_at)}</td>
                          <td>
                            <Button
                              as={Link}
                              to={`/chief/review/${id}`}
                              variant="outline-primary"
                              size="sm"
                              className="ds-focus-ring"
                            >
                              Review
                            </Button>
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
                  <div className="d-flex gap-1">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, (p - 1)))}
                      className="ds-focus-ring"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, (p + 1)))}
                      className="ds-focus-ring"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
