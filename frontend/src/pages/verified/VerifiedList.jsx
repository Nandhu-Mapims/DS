import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, Form, Table, Button, Row, Col, Modal } from 'react-bootstrap';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import {
  listVerifiedDischarges,
  downloadDischargePdf,
  resendWhatsApp,
} from '../../api/dischargeApi';
import { TableSkeleton } from '../../components/SkeletonLoader';
import { SubmitButton } from '../../components/SubmitButton';

const PAGE_SIZE = 10;

function formatDate(val) {
  if (!val) return '—';
  try {
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
  } catch {
    return '—';
  }
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function VerifiedList() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [resendId, setResendId] = useState(null);
  const [showResendConfirm, setShowResendConfirm] = useState(false);
  const [resendTargetId, setResendTargetId] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listVerifiedDischarges({
        search: appliedSearch,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      const items = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
      setList(Array.isArray(items) ? items : []);
    } catch (_e) {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, fromDate, toDate, toast]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setPage(1);
    setLoading(true);
    listVerifiedDischarges({
      search: searchInput.trim(),
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
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
    setSearchInput('');
    setAppliedSearch('');
    setPage(1);
  };

  const handleDownloadPdf = useCallback(
    (id) => {
      setDownloadingId(id);
      downloadDischargePdf(id)
        .then((blob) => {
          triggerBlobDownload(blob, 'discharge-summary.html');
          toast.success('Summary downloaded. Open in browser, then Print → Save as PDF for a PDF.');
        })
        .catch(() => {})
        .finally(() => setDownloadingId(null));
    },
    [toast]
  );

  const openResendConfirm = (id) => {
    setResendTargetId(id);
    setShowResendConfirm(true);
  };

  const handleResendConfirm = useCallback(() => {
    if (!resendTargetId) return;
    setResendId(resendTargetId);
    setShowResendConfirm(false);
    resendWhatsApp(resendTargetId)
      .then(() => {
        toast.success('WhatsApp sent successfully');
        setResendTargetId(null);
      })
      .catch(() => {})
      .finally(() => setResendId(null));
    setResendTargetId(null);
  }, [resendTargetId, toast]);

  const displayList = list;
  const totalPages = Math.max(1, Math.ceil(displayList.length / PAGE_SIZE));
  const paginatedList = displayList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const empty = !loading && displayList.length === 0;
  const hasFilters = fromDate || toDate || appliedSearch;

  return (
    <div className="ds-page-enter ds-page-enter-active ds-page">
      <PageHeader
        breadcrumbs={[{ to: '/', label: 'Home' }, { label: 'Verified' }]}
        title="Verified Discharge Summaries"
        description="Read-only list of approved summaries. View, download PDF, or resend via WhatsApp."
      />

      <Card className="ds-card mb-0">
        <Card.Header>Search</Card.Header>
        <Card.Body className="p-4">
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
              <Col md={6} lg={4}>
                <Form.Group>
                  <Form.Label className="small">UHID / IPID / Mobile</Form.Label>
                  <Form.Control
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by UHID, IPID or Mobile"
                    className="ds-focus-ring"
                    aria-label="Search"
                  />
                </Form.Group>
              </Col>
              <Col md={12} lg={4} className="d-flex align-items-end gap-2 flex-wrap">
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
          {loading && <TableSkeleton rows={8} cols={8} />}
          {!loading && empty && (
            <div className="ds-empty-state">
              <div className="ds-empty-state-icon">📄</div>
              <p className="mb-0">No verified summaries found.</p>
              <small>Approved summaries will appear here. Try a different date range or search by UHID, IPID, or mobile.</small>
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
                      <th>Approved at</th>
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
                          <td>{formatDate(row.approvedAt ?? row.approved_at ?? row.updatedAt ?? row.updated_at)}</td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              <Button
                                as={Link}
                                to={`/verified/${id}`}
                                variant="outline-primary"
                                size="sm"
                                className="ds-focus-ring"
                              >
                                View
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="ds-focus-ring"
                                disabled={downloadingId === id}
                                onClick={() => handleDownloadPdf(id)}
                              >
                                {downloadingId === id ? '…' : 'Download PDF'}
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="ds-focus-ring"
                                disabled={resendId === id}
                                onClick={() => openResendConfirm(id)}
                              >
                                {resendId === id ? '…' : 'Resend WhatsApp'}
                              </Button>
                            </div>
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

      <Modal
        show={showResendConfirm}
        onHide={() => setShowResendConfirm(false)}
        centered
        aria-labelledby="resend-confirm-title"
        aria-describedby="resend-confirm-desc"
      >
        <Modal.Header closeButton>
          <Modal.Title id="resend-confirm-title">Resend via WhatsApp</Modal.Title>
        </Modal.Header>
        <Modal.Body id="resend-confirm-desc">
          Send this discharge summary to the patient&apos;s WhatsApp number again?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResendConfirm(false)} className="ds-focus-ring">
            Cancel
          </Button>
          <SubmitButton variant="success" onClick={handleResendConfirm} loading={!!resendId}>
            Send
          </SubmitButton>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
