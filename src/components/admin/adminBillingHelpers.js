export const REJECTION_REASON_TEMPLATES = [
  'Payment could not be verified. Please check amount and UTR.',
  'Amount paid does not match the selected plan.',
  'UTR / transaction ID does not match the screenshot.',
  'Duplicate submission — this UTR was already used.',
  'Screenshot is unclear. Please upload a clearer image.',
];

export function formatBillingEventType(eventType) {
  const labels = {
    'payment.captured': 'Razorpay payment',
    'subscription.activated': 'Subscription started',
    'subscription.charged': 'Renewal',
    'subscription.cancel_requested': 'Cancel scheduled',
    'manual.approved': 'UPI approved',
    'manual.rejected': 'UPI rejected',
  };
  return labels[eventType] || eventType || '—';
}

export function toDateInputValue(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

export function formatAuditAction(action) {
  const labels = {
    'payment.submitted': 'Payment submitted',
    'payment.approved': 'Payment approved',
    'payment.rejected': 'Payment rejected',
    'payment.expired': 'Payment expired',
    'payment.duplicate_utr': 'Duplicate UTR blocked',
    'payment.approve_blocked_duplicate_utr': 'Approve blocked (duplicate UTR)',
  };
  return labels[action] || action || '—';
}
