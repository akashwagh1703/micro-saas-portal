import { useRef, useState } from 'react';
import { CheckCircle2, Copy, Loader2, QrCode, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

function copyText(text, label) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(
    () => toast.success(`${label} copied`),
    () => toast.error('Could not copy'),
  );
}

export default function CareerSeekerUpiPaymentSection({
  token,
  publicApi,
  billing,
  paymentConfig,
  configLoading,
  onStatusChange,
}) {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const prices = paymentConfig || billing?.prices || { monthly_inr: 199, yearly_inr: 1999 };
  const amount = selectedPlan === 'yearly' ? prices.yearly_inr : prices.monthly_inr;
  const canSubmit =
    billing?.status !== 'active' &&
    billing?.status !== 'pending_verification' &&
    billing?.status !== 'past_due';

  const qrSrc = paymentConfig?.upi_qr_url
    ? `${paymentConfig.upi_qr_url}${paymentConfig.upi_qr_url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
    : null;

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
      toast.error('Use a JPEG, PNG, or WebP screenshot');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Screenshot must be 5 MB or smaller');
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  const submitPayment = async () => {
    const file = fileRef.current?.files?.[0];
    if (!utr.trim()) {
      toast.error('Enter your UPI transaction ID / UTR');
      return;
    }
    if (!file) {
      toast.error('Upload a payment screenshot');
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('token', token);
      form.append('plan', selectedPlan);
      form.append('upi_transaction_id', utr.trim());
      form.append('file', file);

      const { data } = await publicApi.post('/career/public/billing/manual-payment', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Payment submitted! Your coach will verify within 24 hours.');
      onStatusChange?.(data.status);
      setUtr('');
      if (fileRef.current) fileRef.current.value = '';
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (configLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 size={16} className="animate-spin" />
        Loading UPI payment details…
      </div>
    );
  }

  if (!paymentConfig?.upi_configured) {
    return (
      <p className="text-sm text-amber-800">
        UPI payments are not configured yet. Contact your career coach or reply on WhatsApp for help.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <QrCode size={20} className="text-emerald-600" />
        <h4 className="font-semibold text-slate-900">Pay via UPI</h4>
      </div>
      <p className="text-sm text-slate-600">
        Scan the QR code, pay the exact amount, then submit your transaction ID and screenshot below.
        Access unlocks after your coach verifies the payment.
      </p>

      <div className="flex flex-wrap gap-2">
        {['monthly', 'yearly'].map((plan) => (
          <button
            key={plan}
            type="button"
            disabled={!canSubmit}
            onClick={() => setSelectedPlan(plan)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition ${
              selectedPlan === plan
                ? 'bg-emerald-600 text-white ring-emerald-600'
                : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {plan === 'yearly' ? 'Yearly' : 'Monthly'} · ₹
            {plan === 'yearly' ? prices.yearly_inr : prices.monthly_inr}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          {qrSrc ? (
            <img src={qrSrc} alt="UPI QR code" className="mx-auto max-h-56 w-full max-w-xs object-contain" />
          ) : (
            <p className="text-center text-sm text-slate-500">QR code not available</p>
          )}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Pay to</span>
              <span className="font-medium text-slate-900">
                {paymentConfig.upi_payee_name || 'CareerAI'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">UPI ID</span>
              <button
                type="button"
                onClick={() => copyText(paymentConfig.upi_vpa, 'UPI ID')}
                className="inline-flex items-center gap-1 font-mono text-sm font-medium text-emerald-700 hover:underline"
              >
                {paymentConfig.upi_vpa}
                <Copy size={14} />
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Amount</span>
              <span className="text-lg font-bold text-slate-900">₹{amount}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {canSubmit ? (
            <>
              <div>
                <label className="text-sm font-medium text-slate-800">UPI transaction ID / UTR</label>
                <input
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="e.g. 123456789012"
                  maxLength={64}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-800">Payment screenshot</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={onFileChange}
                />
                {preview ? (
                  <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
                    <img
                      src={preview}
                      alt="Payment proof preview"
                      className="max-h-40 w-full bg-slate-50 object-contain"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-600 hover:bg-slate-100"
                  >
                    <Upload size={18} />
                    Upload screenshot from your UPI app
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={submitPayment}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit for verification'}
              </button>
            </>
          ) : billing?.status === 'pending_verification' ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-medium">Payment under review</p>
              <p className="mt-1 text-xs text-amber-800/90">
                Your submission is being verified. CareerAI access is paused until approval.
              </p>
              {billing.pending_submission && (
                <ul className="mt-3 space-y-1 text-xs">
                  <li>
                    Plan: <strong className="capitalize">{billing.pending_submission.plan}</strong>
                  </li>
                  <li>
                    Amount: <strong>₹{billing.pending_submission.amount_inr}</strong>
                  </li>
                  <li>
                    UTR:{' '}
                    <strong className="font-mono">{billing.pending_submission.upi_transaction_id}</strong>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={16} />
                Subscription active
              </p>
            </div>
          )}

          {billing?.pending_submission?.status === 'rejected' &&
            billing?.status !== 'pending_verification' && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <p className="font-medium">Last payment rejected</p>
                <p className="mt-1 text-xs">
                  {billing.pending_submission.rejection_reason || 'Could not verify payment.'}
                </p>
                <p className="mt-2 text-xs">You can submit again with the correct UTR and screenshot.</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
