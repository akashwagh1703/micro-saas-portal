import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import { toDateInputValue } from './adminBillingHelpers';

const STATUS_OPTIONS = [
  { value: 'trial', label: 'Trial' },
  { value: 'active', label: 'Active' },
  { value: 'pending_verification', label: 'Pending UPI' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PLAN_OPTIONS = [
  { value: '', label: 'No plan' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function AdminSubscriptionControls({ user, loading, onApply }) {
  const billing = user?.billing;
  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  useEffect(() => {
    setStatus(billing?.status ?? user?.subscription_status ?? '');
    setPlan(user?.subscription_plan ?? '');
    setPeriodEnd(toDateInputValue(user?.current_period_end));
  }, [user?.id, billing?.status, user?.subscription_status, user?.subscription_plan, user?.current_period_end]);

  if (!user || user.is_super_admin) return null;

  const saveStructured = () => {
    const payload = {};
    const currentStatus = billing?.status ?? user.subscription_status;
    const currentPlan = user.subscription_plan ?? '';
    const currentPeriod = toDateInputValue(user.current_period_end);

    if (status && status !== currentStatus) {
      payload.subscription_status = status;
    }
    if (plan !== currentPlan) {
      payload.plan = plan || undefined;
    }
    if (periodEnd && periodEnd !== currentPeriod) {
      payload.set_period_end = new Date(`${periodEnd}T23:59:59`).toISOString();
    }

    if (Object.keys(payload).length === 0) {
      return;
    }
    onApply(payload);
  };

  const hasPendingChanges =
    status !== (billing?.status ?? user.subscription_status) ||
    plan !== (user.subscription_plan ?? '') ||
    periodEnd !== toDateInputValue(user.current_period_end);

  return (
    <div className="mt-6 space-y-4 border-t border-slate-100 pt-4">
      <div>
        <p className="text-sm font-medium text-slate-900">Subscription controls</p>
        <p className="text-xs text-slate-500">
          Edit status, plan, and period end — or use quick actions below.
        </p>
      </div>

      {billing?.cancel_at_period_end ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200">
          Cancellation scheduled — access until period end, then expires.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Plan</label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            {PLAN_OPTIONS.map((opt) => (
              <option key={opt.value || 'none'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Period ends</label>
          <input
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      <Button
        className="w-full sm:w-auto"
        loading={loading}
        disabled={!hasPendingChanges}
        onClick={saveStructured}
      >
        Save subscription changes
      </Button>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          variant="secondary"
          className="w-full"
          loading={loading}
          onClick={() =>
            onApply({
              extend_period_days: 30,
              plan: user.subscription_plan || plan || 'monthly',
            })
          }
        >
          Extend +30 days
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          loading={loading}
          onClick={() =>
            onApply({
              plan: 'yearly',
              grant_period_days: 365,
            })
          }
        >
          Grant yearly (+365 days)
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          loading={loading}
          onClick={() =>
            onApply({
              plan: 'monthly',
              grant_period_days: 30,
            })
          }
        >
          Reactivate monthly (+30 days)
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          loading={loading}
          onClick={() => onApply({ cancel_at_period_end: true })}
          disabled={!user.current_period_end || billing?.status !== 'active'}
        >
          Cancel at period end
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          loading={loading}
          onClick={() => onApply({ cancel_at_period_end: false })}
          disabled={!billing?.cancel_at_period_end}
        >
          Undo scheduled cancel
        </Button>
        <Button
          variant="danger"
          className="w-full"
          loading={loading}
          onClick={() => onApply({ subscription_status: 'expired' })}
        >
          Deactivate now
        </Button>
      </div>
    </div>
  );
}
