import { useState } from 'react';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import Button from '../ui/Button';
import api from '../../services/api';
import { loadRazorpay } from '../../utils/loadRazorpay';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const styles = {
    trial: 'bg-amber-100 text-amber-800',
    active: 'bg-emerald-100 text-emerald-800',
    expired: 'bg-red-100 text-red-800',
    cancelled: 'bg-slate-100 text-slate-700',
  };
  const labels = {
    trial: 'Free trial',
    active: 'Active',
    expired: 'Expired',
    cancelled: 'Cancelled',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] || styles.expired}`}>
      {labels[status] || status}
    </span>
  );
}

export default function PlanBillingTab({ billing, onStatusChange }) {
  const [paying, setPaying] = useState(null);

  if (!billing) {
    return (
      <Card>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin" />
          Loading plan details…
        </div>
      </Card>
    );
  }

  if (!billing.billing_enabled) {
    return (
      <Card>
        <p className="text-sm text-slate-600">
          Billing is not enabled on this server — you have full platform access.
        </p>
      </Card>
    );
  }

  const { status, plan, days_left, trial_ends_at, current_period_end, prices, razorpay_configured, has_access } =
    billing;

  const startCheckout = async (planType) => {
    setPaying(planType);
    try {
      const { data } = await api.post('/billing/subscribe', { plan: planType });
      const Razorpay = await loadRazorpay();

      const rzp = new Razorpay({
        key: data.key_id,
        subscription_id: data.subscription_id,
        name: 'AutoWave',
        description: planType === 'yearly' ? 'Platform — Yearly' : 'Platform — Monthly',
        prefill: {},
        theme: { color: '#059669' },
        handler: async (response) => {
          try {
            const { data: verified } = await api.post('/billing/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Subscription active! You can go live on your auto-replies.');
            onStatusChange?.(verified.status);
          } catch {
            toast.error('Payment received — refreshing status…');
            onStatusChange?.();
          }
        },
        modal: {
          ondismiss: () => setPaying(null),
        },
      });

      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setPaying(null);
      });

      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start checkout');
      setPaying(null);
    }
  };

  const canSubscribe = status !== 'active';

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard size={20} className="text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">Your plan</h2>
              <StatusBadge status={status} />
            </div>
            <p className="mt-2 text-sm text-slate-600">
              One platform fee — full access to WhatsApp and Instagram auto-replies, unified inbox, leads, and contacts.
              Meta messaging and AI costs are billed separately in your own accounts.
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {status === 'trial' && (
            <>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Trial days left</dt>
                <dd className="text-lg font-bold text-slate-900">{days_left}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Trial ends</dt>
                <dd className="text-sm font-medium text-slate-900">{formatDate(trial_ends_at)}</dd>
              </div>
            </>
          )}
          {status === 'active' && (
            <>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Billing cycle</dt>
                <dd className="text-sm font-medium capitalize text-slate-900">{plan || '—'}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Renews on</dt>
                <dd className="text-sm font-medium text-slate-900">{formatDate(current_period_end)}</dd>
              </div>
            </>
          )}
          {(status === 'expired' || status === 'cancelled') && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 sm:col-span-2">
              <p className="text-sm font-medium text-red-900">
                {has_access ? 'Active' : 'Auto-replies are paused until you subscribe.'}
              </p>
              <p className="mt-1 text-xs text-red-800/80">
                Your data is safe. Subscribe below to go live again.
              </p>
            </div>
          )}
        </dl>
      </Card>

      {canSubscribe && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="!p-5">
            <p className="text-sm font-medium text-slate-500">Monthly</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              ₹{prices.monthly_inr}
              <span className="text-base font-normal text-slate-500">/mo</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" /> WhatsApp + Instagram channels
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" /> Full platform access
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" /> Cancel anytime
              </li>
            </ul>
            <Button
              className="mt-4 w-full"
              onClick={() => startCheckout('monthly')}
              loading={paying === 'monthly'}
              disabled={!razorpay_configured || paying === 'yearly'}
            >
              Subscribe monthly
            </Button>
          </Card>

          <Card className="!p-5 ring-2 ring-emerald-500/30">
            <p className="text-sm font-medium text-emerald-700">Yearly · best value</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              ₹{prices.yearly_inr}
              <span className="text-base font-normal text-slate-500">/yr</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" /> WhatsApp + Instagram channels
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" /> Everything in monthly
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" /> Save vs 12 months
              </li>
            </ul>
            <Button
              className="mt-4 w-full"
              onClick={() => startCheckout('yearly')}
              loading={paying === 'yearly'}
              disabled={!razorpay_configured || paying === 'monthly'}
            >
              Subscribe yearly
            </Button>
          </Card>
        </div>
      )}

      {canSubscribe && !razorpay_configured && (
        <p className="text-center text-xs text-amber-700">
          Online payments are not configured on this server yet. Contact the administrator.
        </p>
      )}

      {status === 'active' && (
        <Card>
          <p className="text-sm text-slate-600">
            Your platform subscription is active. To change or cancel billing, use the Razorpay
            receipt email or contact support.
          </p>
        </Card>
      )}
    </div>
  );
}
