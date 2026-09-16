import { Globe } from 'lucide-react';
import Card from '../ui/Card';
import UpiManualPaymentSection from './UpiManualPaymentSection';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function WebsiteStatusBadge({ status }) {
  const styles = {
    none: 'bg-slate-100 text-slate-700',
    trial: 'bg-amber-100 text-amber-800',
    active: 'bg-emerald-100 text-emerald-800',
    expired: 'bg-red-100 text-red-800',
    cancelled: 'bg-slate-100 text-slate-700',
    pending_verification: 'bg-amber-100 text-amber-900',
  };
  const labels = {
    none: 'Not subscribed',
    trial: 'Included in trial',
    active: 'Active',
    expired: 'Expired',
    cancelled: 'Cancelled',
    pending_verification: 'Pending verification',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] || styles.none}`}>
      {labels[status] || status}
    </span>
  );
}

/**
 * Website brochure publish add-on — status + UPI (product=website).
 * Independent of the platform (bots) plan.
 */
export default function WebsiteAddonBillingSection({
  billing,
  paymentConfig,
  configLoading,
  showUpi,
  onStatusChange,
}) {
  const website = billing?.website;
  if (!website) return null;

  const prices = website.prices || paymentConfig?.website?.prices || {
    monthly_inr: 99,
    yearly_inr: 799,
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe size={20} className="text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">Website add-on</h2>
              <WebsiteStatusBadge status={website.status} />
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Optional add-on to publish your public page at{' '}
              <span className="font-mono text-xs">/c/your-slug</span>. Draft editing stays with your
              platform plan. Trial includes publish; after that this add-on is required to go live
              (already-published pages stay live).
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Publish access</dt>
            <dd className="text-sm font-medium text-slate-900">
              {website.has_access ? 'Allowed' : 'Locked — subscribe below'}
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs text-slate-500">Price</dt>
            <dd className="text-sm font-medium text-slate-900">
              ₹{prices.monthly_inr}/mo · ₹{prices.yearly_inr}/yr
            </dd>
          </div>
          {website.status === 'trial' && (
            <>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Trial days left</dt>
                <dd className="text-lg font-bold text-slate-900">{website.days_left}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Trial ends</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {formatDate(website.trial_ends_at)}
                </dd>
              </div>
            </>
          )}
          {website.status === 'active' && website.current_period_end && (
            <>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Billing cycle</dt>
                <dd className="text-sm font-medium capitalize text-slate-900">
                  {website.plan || '—'}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs text-slate-500">Renews on</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {formatDate(website.current_period_end)}
                </dd>
              </div>
            </>
          )}
        </dl>

        {!website.billing_enabled && (
          <p className="mt-4 text-sm text-slate-600">
            Website add-on billing is not enabled on this server — publish is available.
          </p>
        )}
      </Card>

      {website.billing_enabled && showUpi && (
        <UpiManualPaymentSection
          billing={billing}
          paymentConfig={paymentConfig}
          configLoading={configLoading}
          onStatusChange={onStatusChange}
          product="website"
          title="Pay for Website add-on"
          description="Scan the QR, pay the Website add-on amount, then submit your UTR and screenshot. Publish unlocks after verification (usually within 24 hours)."
          benefits={[
            'Publish your public website page',
            'Share /c/slug from WhatsApp',
            'Draft editing stays free with your plan',
          ]}
        />
      )}
    </div>
  );
}
