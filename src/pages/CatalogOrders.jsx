import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import Input from '../components/ui/Input';
import AuthMediaImg from '../components/catalog/AuthMediaImg';
import {
  attachCatalogOrderScreenshot,
  catalogUploadErrorMessage,
  confirmCatalogOrder,
  createCatalogOrder,
  getCatalogSite,
  listCatalogOrders,
  rejectCatalogOrder,
  uploadCatalogMedia,
} from '../services/catalogApi';

const ORDER_STATUS_STYLES = {
  pending_payment: 'bg-slate-100 text-slate-700',
  pending_verification: 'bg-amber-50 text-amber-800',
  confirmed: 'bg-emerald-50 text-emerald-800',
  rejected: 'bg-red-50 text-red-800',
  cancelled: 'bg-slate-100 text-slate-600',
  completed: 'bg-blue-50 text-blue-800',
};

function formatMoney(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function formatWhen(iso) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return String(iso);
  }
}

function statusLabel(status) {
  return String(status || '').replace(/_/g, ' ');
}

export default function CatalogOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [siteStatus, setSiteStatus] = useState('draft');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending_verification');
  const [selectedId, setSelectedId] = useState(searchParams.get('id') || null);
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [creating, setCreating] = useState(false);
  const [testProductId, setTestProductId] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testName, setTestName] = useState('');
  const [attaching, setAttaching] = useState(false);

  const load = useCallback(
    (filterOverride) => {
      setLoading(true);
      const filter = filterOverride ?? statusFilter;
      const params = filter && filter !== 'all' ? { order_status: filter } : {};
      Promise.all([listCatalogOrders(params), getCatalogSite()])
        .then(([ordersRes, site]) => {
          setOrders(ordersRes?.orders || []);
          setProducts((site?.products || []).filter((p) => p.is_active));
          setSiteStatus(site?.status || 'draft');
          setTestProductId((prev) => {
            if (prev) return prev;
            const firstInStock = (site?.products || []).find(
              (p) => p.is_active && (p.stock_quantity ?? 0) > 0,
            );
            return firstInStock ? String(firstInStock.id) : '';
          });
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || 'Failed to load orders');
        })
        .finally(() => setLoading(false));
    },
    [statusFilter],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) setSelectedId(id);
  }, [searchParams]);

  const selected = orders.find((o) => String(o.id) === String(selectedId)) || null;

  const openDetail = (order) => {
    setSelectedId(String(order.id));
    setSearchParams({ id: String(order.id) });
    setRejectReason('');
  };

  const closeDetail = () => {
    setSelectedId(null);
    setSearchParams({});
    setRejectReason('');
  };

  const handleConfirm = async () => {
    if (!selected || selected.order_status !== 'pending_verification') return;
    if (
      !window.confirm(
        'Confirm this payment? Stock will be deducted and the customer will be notified on WhatsApp.',
      )
    ) {
      return;
    }
    setConfirming(true);
    try {
      await confirmCatalogOrder(selected.id);
      toast.success('Payment confirmed — stock updated');
      closeDetail();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not confirm order');
    } finally {
      setConfirming(false);
    }
  };

  const handleReject = async () => {
    if (!selected || selected.order_status !== 'pending_verification') return;
    if (!window.confirm('Reject this payment? Stock will not change.')) return;
    setRejecting(true);
    try {
      await rejectCatalogOrder(selected.id, rejectReason.trim() || null);
      toast.success('Payment rejected — customer notified');
      closeDetail();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reject order');
    } finally {
      setRejecting(false);
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!testProductId) {
      toast.error('Select a product');
      return;
    }
    setCreating(true);
    try {
      const order = await createCatalogOrder({
        product_id: Number(testProductId),
        customer_phone: testPhone.trim() || null,
        customer_name: testName.trim() || null,
      });
      toast.success(`Order ${order.order_number} created — attach a screenshot to verify`);
      setSelectedId(String(order.id));
      setSearchParams({ id: String(order.id) });
      setStatusFilter('pending_payment');
      load('pending_payment');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create order');
    } finally {
      setCreating(false);
    }
  };

  const handleAttachScreenshot = async (file) => {
    if (!selected || !file) return;
    setAttaching(true);
    try {
      const media = await uploadCatalogMedia(file, {
        kind: 'image',
        alt: `Payment screenshot ${selected.order_number}`,
      });
      await attachCatalogOrderScreenshot(selected.id, media.id);
      toast.success('Screenshot attached — ready to verify');
      setStatusFilter('pending_verification');
      load('pending_verification');
    } catch (err) {
      toast.error(catalogUploadErrorMessage(err) || 'Could not attach screenshot');
    } finally {
      setAttaching(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Catalog commerce"
        title="Orders"
        description="Verify customer UPI payments, then confirm to deduct stock. Reject leaves stock unchanged."
        action={
          <Link to="/website">
            <Button variant="secondary">Website & products</Button>
          </Link>
        }
      />

      <Card className="!p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="pending_verification">Needs verification</option>
            <option value="pending_payment">Awaiting payment</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
            <option value="all">All orders</option>
          </select>
          <Button variant="secondary" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>
      </Card>

      <Card className="!p-4">
        <h2 className="text-sm font-semibold text-slate-900">Create test order</h2>
        <p className="mt-1 text-xs text-slate-500">
          Until WhatsApp shop (Phase 4) is live, create an order here, attach a screenshot, then
          confirm or reject.
        </p>
        <form onSubmit={handleCreateTest} className="mt-3 grid gap-3 sm:grid-cols-4">
          <select
            value={testProductId}
            onChange={(e) => setTestProductId(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
            required
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name} · stock {p.stock_quantity ?? 0} · {formatMoney(p.price_amount)}
              </option>
            ))}
          </select>
          <Input
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Customer name"
          />
          <Input
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="WhatsApp phone"
          />
          <div className="sm:col-span-4">
            <Button type="submit" loading={creating}>
              Create order
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="!p-0 overflow-hidden lg:col-span-3">
          {loading ? (
            <p className="p-6 text-sm text-slate-500">Loading…</p>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No orders in this filter"
              description="Create a test order above, or wait for customers once WhatsApp shop is enabled."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => openDetail(order)}
                  className={`w-full px-5 py-4 text-left transition hover:bg-slate-50 ${
                    String(order.id) === String(selectedId) ? 'bg-emerald-50/60' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{order.product_name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        ORDER_STATUS_STYLES[order.order_status] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {statusLabel(order.order_status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {order.order_number} · {formatMoney(order.amount_inr)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {order.customer_name || order.customer_phone || 'No customer'} ·{' '}
                    {formatWhen(order.created_at)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="!p-5 lg:col-span-2">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">Order details</h2>
                <button
                  type="button"
                  onClick={closeDetail}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Order
                  </dt>
                  <dd className="mt-0.5 text-slate-800">{selected.order_number}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Product
                  </dt>
                  <dd className="mt-0.5 text-slate-800">{selected.product_name}</dd>
                  <dd className="text-xs text-slate-500">
                    Qty {selected.quantity} · {formatMoney(selected.amount_inr)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Customer
                  </dt>
                  <dd className="mt-0.5 text-slate-800">
                    {selected.customer_name || '—'}
                  </dd>
                  <dd className="text-xs text-slate-500">{selected.customer_phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Status
                  </dt>
                  <dd className="mt-0.5 capitalize text-slate-800">
                    {statusLabel(selected.order_status)} · {statusLabel(selected.payment_status)}
                  </dd>
                </div>
                {selected.rejection_reason ? (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Rejection reason
                    </dt>
                    <dd className="mt-0.5 text-slate-800">{selected.rejection_reason}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Payment screenshot
                </p>
                {selected.payment_screenshot_media_id ? (
                  <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <AuthMediaImg
                      media={
                        selected.payment_screenshot || {
                          id: selected.payment_screenshot_media_id,
                        }
                      }
                      siteStatus={siteStatus}
                      alt="Payment screenshot"
                      className="max-h-64 w-full object-contain"
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No screenshot yet.</p>
                )}
                {(selected.order_status === 'pending_payment' ||
                  selected.order_status === 'pending_verification') && (
                  <label className="mt-3 inline-flex cursor-pointer">
                    <span className="sr-only">Upload screenshot</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={attaching}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        handleAttachScreenshot(file);
                      }}
                    />
                    <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      {attaching ? 'Uploading…' : 'Upload / replace screenshot'}
                    </span>
                  </label>
                )}
              </div>

              {selected.order_status === 'pending_verification' && (
                <div className="mt-6 space-y-3">
                  <Button className="w-full" onClick={handleConfirm} loading={confirming}>
                    Confirm payment
                  </Button>
                  <Input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Rejection reason (optional)"
                  />
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={handleReject}
                    loading={rejecting}
                  >
                    Reject payment
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Select an order to view the screenshot and confirm or reject payment.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
