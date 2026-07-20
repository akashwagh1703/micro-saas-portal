import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, ImageIcon, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { formatInr } from '../admin/AdminCharts';

const REJECTION_TEMPLATES = [
  'Payment could not be verified. Please check amount and UTR.',
  'Screenshot does not show a successful UPI payment.',
  'Amount paid does not match the selected plan.',
  'Duplicate or invalid UPI transaction ID.',
];

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
    expired: 'bg-slate-100 text-slate-700',
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[status] || 'bg-slate-100 text-slate-700'}`}
    >
      {status}
    </span>
  );
}

export default function CareerSeekerPaymentReviews() {
  const [submissions, setSubmissions] = useState({ data: [], total: 0, page: 1, per_page: 20 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState(REJECTION_TEMPLATES[0]);

  const loadSubmissions = useCallback(async (page = 1, status = statusFilter) => {
    setLoading(true);
    try {
      const { data } = await api.get('/career/payment-submissions', {
        params: { page, status: status || undefined },
      });
      setSubmissions(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load payment submissions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadSubmissions(1);
  }, [loadSubmissions]);

  useEffect(() => {
    return () => {
      if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
    };
  }, [screenshotUrl]);

  const openSubmission = async (row) => {
    setSelected(row);
    setRejectReason(REJECTION_TEMPLATES[0]);
    if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
    setScreenshotUrl(null);
    try {
      const { data } = await api.get(`/career/payment-submissions/${row.id}/screenshot`, {
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
      await api.post(`/career/payment-submissions/${selected.id}/approve`);
      toast.success('Payment approved — seeker access activated');
      closeModal();
      loadSubmissions(submissions.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not approve payment');
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await api.post(`/career/payment-submissions/${selected.id}/reject`, {
        reason: rejectReason.trim(),
      });
      toast.success('Payment rejected');
      closeModal();
      loadSubmissions(submissions.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reject payment');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Seeker UPI payments">
        <p className="mb-4 text-sm text-slate-600">
          Review UPI payment proofs from job seekers. Approve to activate their CareerAI subscription.
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {['pending', 'approved', 'rejected', 'expired', ''].map((status) => (
            <button
              key={status || 'all'}
              type="button"
              onClick={() => {
                setStatusFilter(status);
                loadSubmissions(1, status);
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                statusFilter === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Loading submissions…
          </div>
        ) : submissions.data.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No payment submissions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4">Seeker</th>
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">UTR</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {submissions.data.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                    onClick={() => openSubmission(row)}
                  >
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{row.profile_name || '—'}</p>
                      <p className="text-xs text-slate-500">{row.profile_email || row.profile_phone || '—'}</p>
                    </td>
                    <td className="py-3 pr-4 capitalize">{row.plan}</td>
                    <td className="py-3 pr-4">{formatInr(row.amount_inr)}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{row.upi_transaction_id}</td>
                    <td className="py-3 pr-4">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="py-3 text-xs text-slate-500">{formatDateTime(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Review payment</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {selected.profile_name || 'Seeker'} · {selected.profile_email || selected.profile_phone || '—'}
                </p>
              </div>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Plan</dt>
                <dd className="font-medium capitalize">{selected.plan}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Amount</dt>
                <dd className="font-medium">{formatInr(selected.amount_inr)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">UPI transaction ID</dt>
                <dd className="font-mono text-sm">{selected.upi_transaction_id}</dd>
              </div>
            </dl>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              {screenshotUrl ? (
                <img src={screenshotUrl} alt="Payment proof" className="mx-auto max-h-80 object-contain" />
              ) : (
                <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
                  <ImageIcon size={20} />
                  Loading screenshot…
                </div>
              )}
            </div>

            {selected.status === 'pending' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-800">Rejection reason</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {REJECTION_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl}
                        type="button"
                        onClick={() => setRejectReason(tpl)}
                        className={`rounded-lg px-2 py-1 text-xs ${
                          rejectReason === tpl
                            ? 'bg-red-100 text-red-800 ring-1 ring-red-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tpl.slice(0, 40)}…
                      </button>
                    ))}
                  </div>
                  <Input
                    className="mt-2"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button loading={actionLoading} onClick={approve}>
                    <CheckCircle2 size={16} className="mr-1 inline" />
                    Approve
                  </Button>
                  <Button variant="secondary" loading={actionLoading} onClick={reject}>
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
