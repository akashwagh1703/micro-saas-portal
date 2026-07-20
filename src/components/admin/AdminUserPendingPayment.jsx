import { useEffect, useState } from 'react';
import { CheckCircle2, ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { formatInr } from './AdminCharts';
import { REJECTION_REASON_TEMPLATES } from './adminBillingHelpers';

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminUserPendingPayment({ user, loading, onUpdated }) {
  const submission = user?.billing?.pending_submission;
  const isPending = submission?.status === 'pending';
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [rejectReason, setRejectReason] = useState(REJECTION_REASON_TEMPLATES[0]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isPending || !submission?.id) {
      setScreenshotUrl(null);
      return undefined;
    }

    let cancelled = false;
    let objectUrl = null;

    (async () => {
      try {
        const { data } = await api.get(`/admin/payment-submissions/${submission.id}/screenshot`, {
          responseType: 'blob',
        });
        if (cancelled) return;
        objectUrl = URL.createObjectURL(data);
        setScreenshotUrl(objectUrl);
      } catch {
        if (!cancelled) setScreenshotUrl(null);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [isPending, submission?.id]);

  if (!isPending || !submission) return null;

  const approve = async () => {
    setActionLoading(true);
    try {
      await api.post(`/admin/payment-submissions/${submission.id}/approve`);
      toast.success('Payment approved — subscription active');
      onUpdated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approve failed');
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Enter a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/admin/payment-submissions/${submission.id}/reject`, {
        reason: rejectReason.trim(),
      });
      toast.success('Payment rejected');
      onUpdated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reject failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
      <p className="text-sm font-semibold text-amber-900">Pending UPI payment</p>
      <p className="mt-1 text-xs text-amber-800">
        Review and approve to unlock access for this tenant.
      </p>

      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-amber-700/80">Plan</dt>
          <dd className="font-medium capitalize text-amber-950">{submission.plan}</dd>
        </div>
        <div>
          <dt className="text-amber-700/80">Amount</dt>
          <dd className="font-medium text-amber-950">{formatInr(submission.amount_inr)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-amber-700/80">UTR</dt>
          <dd className="font-mono text-xs text-amber-950">{submission.upi_transaction_id}</dd>
        </div>
        <div>
          <dt className="text-amber-700/80">Submitted</dt>
          <dd className="text-amber-950">{formatDateTime(submission.created_at)}</dd>
        </div>
      </dl>

      <div className="mt-3 rounded-lg border border-amber-200/80 bg-white p-2">
        <p className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-700">
          <ImageIcon size={14} />
          Screenshot
        </p>
        {screenshotUrl ? (
          <img
            src={screenshotUrl}
            alt="Payment proof"
            className="max-h-48 w-full rounded-md object-contain"
          />
        ) : (
          <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Loading…
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <Button className="w-full" loading={actionLoading || loading} onClick={approve}>
          <CheckCircle2 size={16} className="mr-1 inline" />
          Approve & activate
        </Button>
        <div className="flex flex-wrap gap-1.5">
          {REJECTION_REASON_TEMPLATES.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => setRejectReason(reason)}
              className={`rounded-lg px-2 py-1 text-[11px] ${
                rejectReason === reason
                  ? 'bg-amber-200 font-medium text-amber-950'
                  : 'bg-white text-amber-800 ring-1 ring-amber-200'
              }`}
            >
              {reason.length > 42 ? `${reason.slice(0, 42)}…` : reason}
            </button>
          ))}
        </div>
        <Input label="Rejection reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
        <Button variant="danger" className="w-full" loading={actionLoading || loading} onClick={reject}>
          Reject payment
        </Button>
      </div>
    </div>
  );
}
