import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Modal } from 'react-bootstrap';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { getDischarge, resendWhatsApp } from '../../api/dischargeApi';
import { SubmitButton } from '../../components/SubmitButton';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import {
  parseDischargeSummaryText,
  extractBodyContent,
  getSectionEmoji,
} from '../../utils/dischargeSummaryParser';

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

/** Inline CSS for print window – A4 size, colours, tables, section styles */
function getPrintStyles() {
  return `
    @page { size: A4; margin: 15mm 20mm; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px; font-family: 'DM Sans', system-ui, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .ds-print-patient-block { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #0d9488; }
    .ds-print-patient-block h2 { font-size: 1.1rem; font-weight: 600; color: #0f766e; margin: 0 0 12px 0; }
    .ds-print-patient-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; font-size: 0.9rem; }
    .ds-print-patient-grid strong { color: #64748b; }
    .ds-summary-content h2 { font-size: 1.1rem; font-weight: 600; color: #0f766e; margin: 0 0 16px 0; }
    .ds-summary-section { margin-bottom: 20px; }
    .ds-summary-section-title { font-size: 1rem; font-weight: 600; color: #0d9488; margin: 0 0 10px 0; }
    .ds-summary-section-body { white-space: pre-wrap; color: #1e293b; margin: 0; }
    .ds-table-wrapper { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
    .ds-summary-table, .ds-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .ds-summary-table thead th, .ds-table thead th { background: #0d9488; color: #fff; padding: 10px 14px; text-align: left; font-weight: 600; }
    .ds-summary-table tbody td, .ds-table tbody td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; }
    .ds-summary-table tbody tr:nth-child(even), .ds-table tbody tr:nth-child(even) { background: rgba(13, 148, 136, 0.06); }
    .ds-summary-html section { margin-bottom: 20px; }
    .ds-summary-html h3 { font-size: 1rem; font-weight: 600; color: #0d9488; margin: 0 0 10px 0; }
    .ds-summary-html .section-body { white-space: pre-wrap; margin: 0; }
    @media print { body { padding: 0; max-width: 170mm; margin: 0 auto; } .ds-print-patient-block, .ds-summary-section, .ds-summary-html section { break-inside: avoid; } }
  `.replace(/\s+/g, ' ').trim();
}

export function VerifiedView() {
  const { id } = useParams();
  const toast = useToast();
  const printRef = useRef(null);
  const [discharge, setDischarge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [showResendConfirm, setShowResendConfirm] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getDischarge(id)
      .then(setDischarge)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, toast]);

  const hasRenderedDoc = !!discharge?.renderedHtml?.trim();

  const handlePrint = useCallback(() => {
    if (hasRenderedDoc) {
      const win = window.open('', '_blank');
      if (!win) return;
      win.document.write(discharge.renderedHtml);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
        win.close();
      }, 250);
      return;
    }
    if (!printRef.current) return;
    const printContent = printRef.current;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"/><title>Discharge Summary</title><style>${getPrintStyles()}</style></head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 250);
  }, [toast, hasRenderedDoc, discharge?.renderedHtml]);

  const handleDownloadPdf = useCallback(() => {
    setDownloading(true);
    try {
      if (hasRenderedDoc) {
        const blob = new Blob([discharge.renderedHtml], { type: 'text/html;charset=utf-8' });
        const name = discharge?.patientName ? `discharge-summary-${String(discharge.patientName).replace(/\s+/g, '-')}.html` : 'discharge-summary.html';
        triggerBlobDownload(blob, name);
      } else if (printRef.current) {
        const content = printRef.current.innerHTML;
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Discharge Summary</title><style>${getPrintStyles()}</style></head><body>${content}</body></html>`;
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const name = discharge?.patientName ? `discharge-summary-${String(discharge.patientName).replace(/\s+/g, '-')}.html` : 'discharge-summary.html';
        triggerBlobDownload(blob, name);
      }
      toast.success('Summary downloaded. Open in a browser, then use Print → Save as PDF for a PDF.');
    } catch (_) {
      toast.success('Download failed. Use Print and choose "Save as PDF" instead.');
    } finally {
      setDownloading(false);
    }
  }, [discharge?.patientName, discharge?.renderedHtml, hasRenderedDoc, toast]);

  const handleResendClick = () => setShowResendConfirm(true);

  const handleResendConfirm = useCallback(() => {
    if (!id) return;
    setShowResendConfirm(false);
    setSendingWhatsApp(true);
    resendWhatsApp(id)
      .then(() => toast.success('WhatsApp sent successfully'))
      .catch(() => {})
      .finally(() => setSendingWhatsApp(false));
  }, [id, toast]);

  if (loading) {
    return (
      <div className="ds-page-enter ds-page-enter-active">
        <h1 className="h3 mb-3">Verified Summary</h1>
        <SkeletonLoader lines={12} />
      </div>
    );
  }

  if (!discharge) {
    return (
      <div className="ds-page-enter ds-page-enter-active">
        <p className="text-muted">Summary not found.</p>
        <Button as={Link} to="/verified" variant="outline-primary" className="ds-focus-ring">
          Back to list
        </Button>
      </div>
    );
  }

  const finalText = discharge.finalVerifiedText ?? discharge.finalVerified ?? discharge.chiefEditedText ?? discharge.aiEnhancedText ?? '';
  const bodyHtml = !hasRenderedDoc && discharge.renderedHtml ? extractBodyContent(discharge.renderedHtml) : null;
  const sections = bodyHtml ? null : parseDischargeSummaryText(finalText);

  return (
    <div className="ds-page-enter ds-page-enter-active ds-page">
      <PageHeader
        breadcrumbs={[{ to: '/', label: 'Home' }, { to: '/verified', label: 'Verified' }, { label: 'Summary' }]}
        title="Discharge Summary"
        description={`${discharge.patientName ?? 'Patient'} · UHID ${discharge.uhid ?? '—'}`}
        action={
          <Button as={Link} to="/verified" variant="outline-secondary" size="sm" className="ds-focus-ring">
            ← Back to list
          </Button>
        }
      />

      {/* Action bar */}
      <div
        className="d-flex flex-wrap align-items-center gap-2 mb-3 py-2 px-3 rounded"
        style={{
          backgroundColor: 'var(--ds-bg-elevated)',
          border: '1px solid var(--ds-border-subtle)',
        }}
      >
        <SubmitButton
          variant="outline-primary"
          onClick={handleDownloadPdf}
          loading={downloading}
        >
          Download PDF
        </SubmitButton>
        <SubmitButton
          variant="outline-success"
          onClick={handleResendClick}
          loading={sendingWhatsApp}
        >
          Resend WhatsApp
        </SubmitButton>
        <Button variant="outline-secondary" onClick={handlePrint} className="ds-focus-ring">
          Print
        </Button>
      </div>

      {/* Print-ready content: full MAPIMS-style document in iframe, or card layout */}
      <Card className="ds-card">
        <Card.Body className="p-4">
          {hasRenderedDoc ? (
            <iframe
              title="Discharge Summary"
              srcDoc={discharge.renderedHtml}
              className="w-100 border-0 rounded"
              style={{ minHeight: 900, height: '90vh' }}
            />
          ) : (
            <div ref={printRef}>
              <div className="ds-print-patient-block mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--ds-border-subtle)' }}>
                <h2 className="ds-summary-main-title h5 mb-3">👤 Patient details</h2>
                <div className="ds-print-patient-grid row g-2 small">
                  <div className="col-md-6"><strong>UHID:</strong> {discharge.uhid ?? '—'}</div>
                  <div className="col-md-6"><strong>IPID:</strong> {discharge.ipid ?? '—'}</div>
                  <div className="col-md-6"><strong>Name:</strong> {discharge.patientName ?? '—'}</div>
                  <div className="col-md-6"><strong>Mobile:</strong> {discharge.mobile ?? '—'}</div>
                  <div className="col-md-6"><strong>Age / Gender:</strong> {[discharge.age, discharge.gender].filter(Boolean).join(' / ') || '—'}</div>
                  <div className="col-md-6"><strong>Discharge date:</strong> {discharge.dischargeDate ?? discharge.discharge_date ?? '—'}</div>
                </div>
              </div>
              <div className="verified-summary-body ds-summary-content">
                <h2 className="ds-summary-main-title h5 mb-3">📋 Discharge summary</h2>
                {bodyHtml ? (
                  <div className="ds-summary-html" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                ) : sections && sections.length > 0 ? (
                  <div className="ds-summary-sections">
                    {sections.map((sec, idx) => (
                      <section key={idx} className="ds-summary-section">
                        {sec.type === 'table' && (
                          <>
                            {sec.title && <h3 className="ds-summary-section-title">{getSectionEmoji(sec.title)} {sec.title}</h3>}
                            <div className="ds-table-wrapper">
                              <table className="table ds-summary-table">
                                <thead><tr>{(sec.headers || []).map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
                                <tbody>
                                  {(sec.rows || []).map((row, ri) => (
                                    <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}
                        {sec.type === 'paragraph' && (
                          <>
                            {sec.title && <h3 className="ds-summary-section-title">{getSectionEmoji(sec.title)} {sec.title}</h3>}
                            {sec.content ? <div className="ds-summary-section-body" style={{ whiteSpace: 'pre-wrap' }}>{sec.content}</div> : null}
                          </>
                        )}
                      </section>
                    ))}
                  </div>
                ) : (
                  <div className="text-break" style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--bs-body-font-family)', lineHeight: 1.6 }}>
                    {finalText || 'No summary text available.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        show={showResendConfirm}
        onHide={() => setShowResendConfirm(false)}
        centered
        aria-labelledby="verified-resend-title"
        aria-describedby="verified-resend-desc"
      >
        <Modal.Header closeButton>
          <Modal.Title id="verified-resend-title">Resend via WhatsApp</Modal.Title>
        </Modal.Header>
        <Modal.Body id="verified-resend-desc">
          Send this discharge summary to the patient&apos;s WhatsApp number again?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResendConfirm(false)} className="ds-focus-ring">
            Cancel
          </Button>
          <SubmitButton variant="success" onClick={handleResendConfirm} loading={sendingWhatsApp}>
            Send
          </SubmitButton>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
