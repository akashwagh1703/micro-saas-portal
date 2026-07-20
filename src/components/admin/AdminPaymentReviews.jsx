import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, ImageIcon, Loader2, QrCode, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { formatInr } from './AdminCharts';
import { REJECTION_REASON_TEMPLATES, formatAuditAction } from './adminBillingHelpers';

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusPill({ status }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
}

export default function AdminPaymentReviews({ onOverviewRefresh }) {
  const [submissions, setSubmissions] = useState({ data: [], total: 0, page: 1, per_page: 20 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState(REJECTION_REASON_TEMPLATES[0]);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [auditLog, setAuditLog] = useState({ data: [], total: 0 });
  const [auditLoading, setAuditLoading] = useState(false);
  const qrInputRef = useRef(null);

  const loadSubmissions = useCallback(async (page = 1, status = statusFilter) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/payment-submissions', {
        params: { page, status: status || undefined },
      });
      setSubmissions(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load payment submissions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const loadConfig = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/payment-config');
      setPaymentConfig(data);
    } catch {
      setPaymentConfig(null);
    }
  }, []);

  const loadAuditLog = useCallback(async () => {
    setAuditLoading(true);
    try {
      const { data } = await api.get('/admin/platform-audit-log', {
        params: { page: 1, action: 'payment' },
      });
      setAuditLog(data);
    } catch {
      setAuditLog({ data: [], total: 0 });
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions(1);
    loadConfig();
    loadAuditLog();
  }, [loadSubmissions, loadConfig, loadAuditLog]);

  useEffect(() => {
    return () => {
      if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
    };
  }, [screenshotUrl]);

  const openSubmission = async (row) => {
    setSelected(row);
    setRejectReason('Payment could not be verified. Please check amount and UTR.');
    if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
    setScreenshotUrl(null);
    try {
      const { data } = await api.get(`/admin/payment-submissions/${row.id}/screenshot`, {
        responseType: 'blob',
      });
      setScreenshotUrl(URL.createObjectURL(data));
    } catch {
      toast.error('Could not load screenshot');
    }
  };

  const closeModal = () => {
    setSelected(null);
    if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
    setScreenshotUrl(null);
  };

  const approve = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/payment-submissions/${selected.id}/approve`);
      toast.success('Payment approved — subscription activated');
      closeModal();
      loadSubmissions(submissions.page);
      loadAuditLog();
      onOverviewRefresh?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approve failed');
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/payment-submissions/${selected.id}/reject`, {
        reason: rejectReason,
      });
      toast.success('Payment rejected');
      closeModal();
      loadSubmissions(submissions.page);
      loadAuditLog();
      onOverviewRefresh?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reject failed');
    } finally {
      setActionLoading(false);
    }
  };

  const uploadQr = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/admin/payment-config/upi-qr', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('UPI QR updated');
      setPaymentConfig((prev) => ({ ...prev, upi_qr_url: data.upi_qr_url, upi_configured: true }));
      loadConfig();
    } catch (err) {
      toast.error(err.response?.data?.message || 'QR upload failed');
    } finally {
      setUploadingQr(false);
      if (qrInputRef.current) qrInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Platform UPI setup">
        <p className="mb-4 text-sm text-slate-600">
          Set <span className="font-mono">PLATFORM_UPI_VPA</span> in API env, then upload your static UPI QR here.
          Tenants see this on Plan & billing.
        </p>
        <div className="flex flex-wrap items-start gap-6">
          {paymentConfig?.upi_qr_url ? (
            <img
              src={`${paymentConfig.upi_qr_url}?t=${Date.now()}`}
              alt="Platform UPI QR"
              className="h-40 w-40 rounded-xl border border-slate-200 bg-white object-contain p-2"
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
              <QrCode className="text-slate-400" size={32} />
            </div>
          )}
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-slate-500">UPI ID:</span>{' '}
              <span className="font-mono font-medium">{paymentConfig?.upi_vpa || '—'}</span>
            </p>
            <p>
              <span className="text-slate-500">Payee:</span>{' '}
              {paymentConfig?.upi_payee_name || '—'}
            </p>
            <p>
              <span className="text-slate-500">Prices:</span> ₹{paymentConfig?.monthly_inr}/mo · ₹
              {paymentConfig?.yearly_inr}/yr
            </p>
            <input
              ref={qrInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={uploadQr}
            />
            <Button
              variant="secondary"
              loading={uploadingQr}
              onClick={() => qrInputRef.current?.click()}
            >
              <Upload size={16} className="mr-1 inline" />
              Upload UPI QR
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Payment review queue">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="w-44">
            <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                loadSubmissions(1, e.target.value);
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="">All</option>
            </select>
          </div>
          <Button variant="secondary" onClick={() => loadSubmissions(submissions.page)}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Loading submissions…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4">Submitted</th>
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">UTR</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {submissions.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No submissions in this filter
                    </td>
                  </tr>
                ) : (
                  submissions.data.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                      <td className="py-3 pr-4 text-slate-600">{formatDateTime(row.created_at)}</td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-900">{row.user_name}</p>
                        <p className="text-xs text-slate-500">{row.user_email}</p>
                      </td>
                      <td className="py-3 pr-4 capitalize">{row.plan}</td>
                      <td className="py-3 pr-4 font-medium">{formatInr(row.amount_inr)}</td>
                      <td className="py-3 pr-4 font-mono text-xs">{row.upi_transaction_id}</td>
                      <td className="py-3 pr-4">
                        <StatusPill status={row.status} />
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="secondary" onClick={() => openSubmission(row)}>
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {submissions.total > submissions.per_page && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>
              Page {submissions.page} · {submissions.total} submissions
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={submissions.page <= 1}
                onClick={() => loadSubmissions(submissions.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={submissions.page * submissions.per_page >= submissions.total}
                onClick={() => loadSubmissions(submissions.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card title="Payment audit log">
        <p className="mb-3 text-sm text-slate-600">
          Recent UPI payment actions — approve, reject, duplicate UTR, and auto-expire events.
        </p>
        {auditLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Loading audit log…
          </div>
        ) : auditLog.data.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No payment audit entries yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Action</th>
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.data.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 text-slate-600">{formatDateTime(row.created_at)}</td>
                    <td className="py-2 pr-4 font-medium text-slate-900">
                      {formatAuditAction(row.action)}
                    </td>
                    <td className="py-2 pr-4">
                      {row.target_user_email ? (
                        <>
                          <p className="text-slate-900">{row.target_user_name}</p>
                          <p className="text-xs text-slate-500">{row.target_user_email}</p>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2 text-xs text-slate-600">
                      {row.details?.upi_transaction_id
                        ? `UTR ${row.details.upi_transaction_id}`
                        : row.details?.reason || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Review payment</h2>
                <p className="text-sm text-slate-500">
                  {selected.user_name} · {selected.user_email}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-4 sm:flex-col sm:justify-start">
                <dt className="text-slate-500">Plan</dt>
                <dd className="font-medium capitalize">{selected.plan}</dd>
              </div>
              <div className="flex justify-between gap-4 sm:flex-col sm:justify-start">
                <dt className="text-slate-500">Amount</dt>
                <dd className="font-medium">{formatInr(selected.amount_inr)}</dd>
              </div>
              <div className="flex justify-between gap-4 sm:col-span-2 sm:flex-col">
                <dt className="text-slate-500">UPI transaction ID</dt>
                <dd className="font-mono text-xs">{selected.upi_transaction_id}</dd>
              </div>
              <div className="flex justify-between gap-4 sm:flex-col sm:justify-start">
                <dt className="text-slate-500">Submitted</dt>
                <dd>{formatDateTime(selected.created_at)}</dd>
              </div>
              <div className="flex justify-between gap-4 sm:flex-col sm:justify-start">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <StatusPill status={selected.status} />
                </dd>
              </div>
            </dl>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-800">
                <ImageIcon size={16} />
                Payment screenshot
              </p>
              {screenshotUrl ? (
                <img
                  src={screenshotUrl}
                  alt="Payment proof"
                  className="max-h-72 w-full rounded-lg object-contain bg-white"
                />
              ) : (
                <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
                  <Loader2 size={16} className="animate-spin" />
                  Loading screenshot…
                </div>
              )}
            </div>

            {selected.status === 'pending' && (
              <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
                <Button className="w-full" loading={actionLoading} onClick={approve}>
                  <CheckCircle2 size={16} className="mr-1 inline" />
                  Approve & activate subscription
                </Button>
                <div className="flex flex-wrap gap-1.5">
                  {REJECTION_REASON_TEMPLATES.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setRejectReason(reason)}
                      className={`rounded-lg px-2 py-1 text-[11px] ${
                        rejectReason === reason
                          ? 'bg-slate-200 font-medium text-slate-900'
                          : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200'
                      }`}
                    >
                      {reason.length > 48 ? `${reason.slice(0, 48)}…` : reason}
                    </button>
                  ))}
                </div>
                <Input
                  label="Rejection reason (if rejecting)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <Button variant="danger" className="w-full" loading={actionLoading} onClick={reject}>
                  Reject payment
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
