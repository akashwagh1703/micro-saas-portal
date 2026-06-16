import { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, Loader2, Receipt } from 'lucide-react';
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

function formatAmount(amountInr, currency = 'INR') {
  if (amountInr == null) return '—';
  if (currency === 'INR') return `₹${amountInr}`;
  return `${amountInr} ${currency}`;
}

function StatusBadge({ status }) {
  const styles = {
    trial: 'bg-amber-100 text-amber-800',
    active: 'bg-emerald-100 text-emerald-800',
    past_due: 'bg-orange-100 text-orange-800',
    expired: 'bg-red-100 text-red-800',
    cancelled: 'bg-slate-100 text-slate-700',
  };
  const labels = {
    trial: 'Free trial',
    active: 'Active',
    past_due: 'Payment issue',
    expired: 'Expired',
    cancelled: 'Cancelled',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] || styles.expired}`}>
      {labels[status] || status}
    </span>
  );
}

function eventLabel(eventType) {
  const map = {
    'subscription.activated': 'Subscription started',
    'subscription.charged': 'Renewal payment',
    'subscription.cancel_requested': 'Cancellation scheduled',
    'payment.captured': 'Payment received',
  };
  return map[eventType] || eventType?.replace(/[._]/g, ' ') || 'Transaction';
}

export default function PlanBillingTab({ billing, onStatusChange }) {
  const [paying, setPaying] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    if (!billing?.billing_enabled) return;
    setTransactionsLoading(true);
    api
      .get('/billing/transactions')
      .then((r) => setTransactions(Array.isArray(r.data) ? r.data : r.data?.data || []))
      .catch(() => setTransactions([]))
      .finally(() => setTransactionsLoading(false));
  }, [billing?.billing_enabled, billing?.status]);

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

  const {
    status,
    plan,
    days_left,
    trial_ends_at,
    current_period_end,
    prices,
    razorpay_configured,
    has_access,
    cancel_at_period_end,
  } = billing;

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

  const cancelSubscription = async () => {
    if (!window.confirm('Cancel at the end of your current billing period? You keep access until then.')) {
      return;
    }
    setCancelling(true);
    try {
      await api.post('/billing/cancel');
      toast.success('Subscription will cancel at period end. Access continues until then.');
      onStatusChange?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const canSubscribe = status !== 'active' && status !== 'past_due';
  const showCancel = status === 'active' && !cancel_at_period_end;

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

        {status === 'past_due' && (
          <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
            <p className="text-sm font-medium text-orange-900">Payment failed on your last renewal</p>
            <p className="mt-1 text-xs text-orange-800/90">
              {has_access
                ? `Access continues until ${formatDate(current_period_end)}. Update your payment method in Razorpay or subscribe again below.`
                : 'Your auto-replies are paused. Subscribe below to restore access.'}
            </p>
          </div>
        )}

        {cancel_at_period_end && current_period_end && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-medium text-amber-900">Cancellation scheduled</p>
            <p className="mt-1 text-xs text-amber-800/90">
              Your subscription ends on {formatDate(current_period_end)}. You keep full access until then.
            </p>
          </div>
        )}

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
          {(status === 'active' || status === 'past_due') && (
            <>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Billing cycle</dt>
                <dd className="text-sm font-medium capitalize text-slate-900">{plan || '—'}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">{cancel_at_period_end ? 'Access until' : 'Renews on'}</dt>
                <dd className="text-sm font-medium text-slate-900">{formatDate(current_period_end)}</dd>
              </div>
            </>
          )}
          {(status === 'expired' || status === 'cancelled') && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 sm:col-span-2">
              <p className="text-sm font-medium text-red-900">
                {has_access ? 'Access active until period end' : 'Auto-replies are paused until you subscribe.'}
              </p>
              <p className="mt-1 text-xs text-red-800/80">
                Your data is safe. Subscribe below to go live again.
              </p>
            </div>
          )}
        </dl>

        {showCancel && (
          <div className="mt-6 border-t border-slate-100 pt-4">
            <Button variant="danger" onClick={cancelSubscription} loading={cancelling}>
              Cancel subscription
            </Button>
            <p className="mt-2 text-xs text-slate-500">
              Cancels at period end — no immediate cutoff. You can resubscribe anytime before then.
            </p>
          </div>
        )}
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
          Online payments are not configured on this server yet. Set RAZORPAY_* variables in API env.
        </p>
      )}

      {razorpay_configured && billing.razorpay_webhook_url && (
        <Card>
          <p className="text-sm font-medium text-slate-900">Razorpay webhook (server admin)</p>
          <p className="mt-1 text-xs text-slate-500">
            Add this URL in Razorpay Dashboard with secret from server{' '}
            <span className="font-mono">RAZORPAY_WEBHOOK_SECRET</span>.
          </p>
          <p className="mt-2 break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700">
            {billing.razorpay_webhook_url}
          </p>
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-2">
          <Receipt size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-900">Payment history</h3>
        </div>
        {transactionsLoading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={14} className="animate-spin" />
            Loading receipts…
          </div>
        ) : transactions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No payments recorded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-slate-500">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-50">
                    <td className="py-2.5 text-slate-600">{formatDate(tx.created_at)}</td>
                    <td className="py-2.5">
                      <span className="text-slate-900">{eventLabel(tx.event_type)}</span>
                      {tx.plan && (
                        <span className="ml-1 text-xs capitalize text-slate-500">({tx.plan})</span>
                      )}
                    </td>
                    <td className="py-2.5 font-medium text-slate-900">
                      {formatAmount(tx.amount_inr, tx.currency)}
                    </td>
                    <td className="py-2.5">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-700">
                        {tx.status || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
