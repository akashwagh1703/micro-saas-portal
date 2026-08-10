import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, FileText, Package, Truck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import Input from '../components/ui/Input';
import AuthMediaImg from '../components/catalog/AuthMediaImg';
import CatalogSalesAnalytics from '../components/catalog/CatalogSalesAnalytics';
import {
  attachCatalogOrderScreenshot,
  bulkMarkCatalogOrdersShipped,
  catalogUploadErrorMessage,
  confirmCatalogOrder,
  createCatalogOrder,
  exportCatalogOrdersCsv,
  fetchCatalogPackingSlipPdf,
  getCatalogSite,
  listCatalogOrders,
  markCatalogOrderDelivered,
  markCatalogOrderShipped,
  rejectCatalogOrder,
  setCatalogOrderShippingAddress,
  uploadCatalogMedia,
} from '../services/catalogApi';

const ORDER_STATUS_STYLES = {
  pending_payment: 'bg-slate-100 text-slate-700',
  pending_verification: 'bg-amber-50 text-amber-800',
  confirmed: 'bg-sky-50 text-sky-800',
  ready_to_ship: 'bg-violet-50 text-violet-800',
  shipped: 'bg-indigo-50 text-indigo-800',
  delivered: 'bg-emerald-50 text-emerald-800',
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

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CatalogOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [siteStatus, setSiteStatus] = useState('draft');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending_verification');
  const [searchQ, setSearchQ] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedId, setSelectedId] = useState(searchParams.get('id') || null);
  const [confirming, setConfirming] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [creating, setCreating] = useState(false);
  const [testProductId, setTestProductId] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testName, setTestName] = useState('');
  const [attaching, setAttaching] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [addressForm, setAddressForm] = useState({
    shipping_name: '',
    shipping_address_line: '',
    shipping_city: '',
    shipping_state: '',
    shipping_pincode: '',
    shipping_landmark: '',
    shipping_phone: '',
  });
  const [shipForm, setShipForm] = useState({ tracking_number: '', courier_name: '' });
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCourier, setBulkCourier] = useState('');
  const [bulkTracking, setBulkTracking] = useState({});
  const [bulkShipping, setBulkShipping] = useState(false);

  const listParams = useCallback(
    (filterOverride) => {
      const filter = filterOverride ?? statusFilter;
      const params = {};
      if (filter && filter !== 'all') params.order_status = filter;
      if (searchQ.trim()) params.q = searchQ.trim();
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      return params;
    },
    [statusFilter, searchQ, fromDate, toDate],
  );

  const load = useCallback(
    (filterOverride) => {
      setLoading(true);
      const params = listParams(filterOverride);
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
    [listParams],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setSelectedIds(new Set());
    setBulkOpen(false);
  }, [statusFilter, searchQ, fromDate, toDate]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) setSelectedId(id);
  }, [searchParams]);

  const selected = orders.find((o) => String(o.id) === String(selectedId)) || null;

  useEffect(() => {
    if (!selected) return;
    setAddressForm({
      shipping_name: selected.shipping_name || selected.customer_name || '',
      shipping_address_line: selected.shipping_address_line || '',
      shipping_city: selected.shipping_city || '',
      shipping_state: selected.shipping_state || '',
      shipping_pincode: selected.shipping_pincode || '',
      shipping_landmark: selected.shipping_landmark || '',
      shipping_phone: selected.shipping_phone || selected.customer_phone || '',
    });
    setShipForm({
      tracking_number: selected.tracking_number || '',
      courier_name: selected.courier_name || '',
    });
  }, [selected?.id]);

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
        'Confirm this payment? Stock will be deducted and the customer will be asked for a delivery address on WhatsApp.',
      )
    ) {
      return;
    }
    setConfirming(true);
    try {
      await confirmCatalogOrder(selected.id);
      toast.success('Payment confirmed — customer asked for address');
      setStatusFilter('confirmed');
      load('confirmed');
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

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!selected) return;
    if (!addressForm.shipping_address_line.trim() || !addressForm.shipping_pincode.trim()) {
      toast.error('Address and pincode are required');
      return;
    }
    setSavingAddress(true);
    try {
      await setCatalogOrderShippingAddress(selected.id, {
        shipping_name: addressForm.shipping_name.trim() || null,
        shipping_address_line: addressForm.shipping_address_line.trim(),
        shipping_city: addressForm.shipping_city.trim() || null,
        shipping_state: addressForm.shipping_state.trim() || null,
        shipping_pincode: addressForm.shipping_pincode.trim(),
        shipping_landmark: addressForm.shipping_landmark.trim() || null,
        shipping_phone: addressForm.shipping_phone.trim() || null,
      });
      toast.success('Address saved — ready to ship');
      setStatusFilter('ready_to_ship');
      load('ready_to_ship');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleShip = async (e) => {
    e.preventDefault();
    if (!selected) return;
    if (!shipForm.tracking_number.trim()) {
      toast.error('Tracking number is required');
      return;
    }
    setShipping(true);
    try {
      await markCatalogOrderShipped(selected.id, {
        tracking_number: shipForm.tracking_number.trim(),
        courier_name: shipForm.courier_name.trim() || null,
      });
      toast.success('Marked shipped — customer notified');
      setStatusFilter('shipped');
      load('shipped');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not mark shipped');
    } finally {
      setShipping(false);
    }
  };

  const handleDeliver = async () => {
    if (!selected || selected.order_status !== 'shipped') return;
    setDelivering(true);
    try {
      await markCatalogOrderDelivered(selected.id);
      toast.success('Marked delivered');
      setStatusFilter('delivered');
      load('delivered');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not mark delivered');
    } finally {
      setDelivering(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportCatalogOrdersCsv(listParams());
      downloadBlob(blob, `catalog-orders-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success('Exported for Excel');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const toggleSelect = (orderId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const selectAllReady = () => {
    const ready = orders.filter(
      (o) => o.order_status === 'ready_to_ship' && o.has_shipping_address,
    );
    setSelectedIds(new Set(ready.map((o) => o.id)));
  };

  const openBulkShip = () => {
    if (!selectedIds.size) {
      toast.error('Select at least one ready-to-ship order');
      return;
    }
    const tracking = {};
    for (const id of selectedIds) tracking[id] = '';
    setBulkTracking(tracking);
    setBulkOpen(true);
  };

  const handleBulkShip = async (e) => {
    e.preventDefault();
    const items = [...selectedIds].map((orderId) => ({
      order_id: orderId,
      tracking_number: String(bulkTracking[orderId] || '').trim(),
      courier_name: bulkCourier.trim() || null,
    }));
    if (items.some((i) => i.tracking_number.length < 3)) {
      toast.error('Enter a tracking number for each selected order');
      return;
    }
    setBulkShipping(true);
    try {
      const res = await bulkMarkCatalogOrdersShipped(items);
      toast.success(`Shipped ${res.shipped || 0} order(s)${res.failed ? ` · ${res.failed} failed` : ''}`);
      setBulkOpen(false);
      setSelectedIds(new Set());
      setStatusFilter('shipped');
      load('shipped');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk ship failed');
    } finally {
      setBulkShipping(false);
    }
  };

  const handlePrintSlips = async (ids) => {
    const list = Array.isArray(ids) ? ids : [ids];
    if (!list.length) {
      toast.error('Select orders to print');
      return;
    }
    try {
      const blob = await fetchCatalogPackingSlipPdf(list);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not open packing slip');
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
        description="Sales analytics, verify payments, ship orders, packing slips, and Excel export."
        action={
          <Link to="/website">
            <Button variant="secondary">Website & products</Button>
          </Link>
        }
      />

      <CatalogSalesAnalytics />

      {selectedIds.size > 0 ? (
        <Card className="!p-3 border-violet-200 bg-violet-50/50">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-violet-900">
              {selectedIds.size} selected
            </p>
            <Button
              variant="secondary"
              className="!py-1.5 !text-xs"
              onClick={() => handlePrintSlips([...selectedIds])}
            >
              <FileText size={14} />
              Print packing slips
            </Button>
            <Button
              className="!py-1.5 !text-xs"
              onClick={openBulkShip}
            >
              <Truck size={14} />
              Bulk mark shipped
            </Button>
            <Button
              variant="ghost"
              className="!py-1.5 !text-xs"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
          </div>
        </Card>
      ) : null}

      {bulkOpen ? (
        <Card className="!p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Bulk mark shipped</h2>
              <p className="mt-1 text-xs text-slate-500">
                Enter AWB/tracking for each order. Customers get a WhatsApp message with tracking link.
              </p>
            </div>
            <button type="button" onClick={() => setBulkOpen(false)} className="p-1 text-slate-400">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleBulkShip} className="mt-3 space-y-3">
            <Input
              value={bulkCourier}
              onChange={(e) => setBulkCourier(e.target.value)}
              placeholder="Courier for all (e.g. Delhivery)"
            />
            {[...selectedIds].map((id) => {
              const order = orders.find((o) => o.id === id);
              return (
                <div key={id} className="grid gap-2 sm:grid-cols-[1fr_1fr] items-end">
                  <p className="text-sm text-slate-700">
                    {order?.order_number || id} · {order?.product_name || 'Order'}
                  </p>
                  <Input
                    value={bulkTracking[id] || ''}
                    onChange={(e) =>
                      setBulkTracking((prev) => ({ ...prev, [id]: e.target.value }))
                    }
                    placeholder="Tracking / AWB"
                    required
                  />
                </div>
              );
            })}
            <Button type="submit" loading={bulkShipping}>
              Ship {selectedIds.size} order(s)
            </Button>
          </form>
        </Card>
      ) : null}

      <Card className="!p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs text-slate-600">
            Status
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="pending_verification">Needs verification</option>
              <option value="pending_payment">Awaiting payment</option>
              <option value="confirmed">Awaiting address</option>
              <option value="ready_to_ship">Ready to ship</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="rejected">Rejected</option>
              <option value="all">All orders</option>
            </select>
          </label>
          <label className="text-xs text-slate-600">
            Search
            <Input
              className="mt-1 !py-2"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Order #, phone, name…"
            />
          </label>
          <label className="text-xs text-slate-600">
            From
            <Input
              type="date"
              className="mt-1 !py-2"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>
          <label className="text-xs text-slate-600">
            To
            <Input
              type="date"
              className="mt-1 !py-2"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>
          <Button variant="secondary" onClick={() => load()} disabled={loading}>
            Refresh
          </Button>
          <Button variant="secondary" onClick={handleExport} loading={exporting}>
            <Download size={16} />
            Export Excel
          </Button>
          {statusFilter === 'ready_to_ship' ? (
            <Button variant="secondary" onClick={selectAllReady}>
              Select all ready
            </Button>
          ) : null}
        </div>
      </Card>

      <Card className="!p-4">
        <h2 className="text-sm font-semibold text-slate-900">Create test order</h2>
        <p className="mt-1 text-xs text-slate-500">
          Create an order, attach a screenshot, confirm, then add address / ship.
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
              description="Adjust filters, or wait for customers from WhatsApp / website."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map((order) => {
                const selectable =
                  order.order_status === 'ready_to_ship' && order.has_shipping_address;
                return (
                  <div
                    key={order.id}
                    className={`flex items-start gap-3 px-5 py-4 transition hover:bg-slate-50 ${
                      String(order.id) === String(selectedId) ? 'bg-emerald-50/60' : ''
                    }`}
                  >
                    {selectable ? (
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selectedIds.has(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        aria-label={`Select ${order.order_number}`}
                      />
                    ) : (
                      <span className="mt-1 w-4" />
                    )}
                    <button
                      type="button"
                      onClick={() => openDetail(order)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">{order.product_name}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                            ORDER_STATUS_STYLES[order.order_status] ||
                            'bg-slate-100 text-slate-600'
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
                        {order.shipping_pincode ? ` · PIN ${order.shipping_pincode}` : ''}
                      </p>
                    </button>
                  </div>
                );
              })}
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
                  <dd className="mt-0.5 text-slate-800">{selected.customer_name || '—'}</dd>
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
                {selected.has_shipping_address ? (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Ship to
                    </dt>
                    <dd className="mt-0.5 whitespace-pre-line text-slate-800">
                      {[
                        selected.shipping_name,
                        selected.shipping_address_line,
                        [selected.shipping_city, selected.shipping_state]
                          .filter(Boolean)
                          .join(', '),
                        selected.shipping_pincode ? `PIN ${selected.shipping_pincode}` : null,
                        selected.shipping_landmark
                          ? `Landmark: ${selected.shipping_landmark}`
                          : null,
                        selected.shipping_phone,
                      ]
                        .filter(Boolean)
                        .join('\n')}
                    </dd>
                  </div>
                ) : null}
                {selected.tracking_number ? (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Tracking
                    </dt>
                    <dd className="mt-0.5 text-slate-800">
                      {selected.courier_name ? `${selected.courier_name} · ` : ''}
                      {selected.tracking_number}
                    </dd>
                  </div>
                ) : null}
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

              {(selected.order_status === 'confirmed' ||
                selected.order_status === 'ready_to_ship') && (
                <form onSubmit={handleSaveAddress} className="mt-6 space-y-2 border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-slate-900">Shipping address</p>
                  <p className="text-xs text-slate-500">
                    Customer can also reply on WhatsApp after confirm. You can enter or edit here.
                  </p>
                  <Input
                    value={addressForm.shipping_name}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, shipping_name: e.target.value }))
                    }
                    placeholder="Receiver name"
                  />
                  <Input
                    value={addressForm.shipping_address_line}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, shipping_address_line: e.target.value }))
                    }
                    placeholder="Address line"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={addressForm.shipping_city}
                      onChange={(e) =>
                        setAddressForm((f) => ({ ...f, shipping_city: e.target.value }))
                      }
                      placeholder="City"
                    />
                    <Input
                      value={addressForm.shipping_state}
                      onChange={(e) =>
                        setAddressForm((f) => ({ ...f, shipping_state: e.target.value }))
                      }
                      placeholder="State"
                    />
                  </div>
                  <Input
                    value={addressForm.shipping_pincode}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, shipping_pincode: e.target.value }))
                    }
                    placeholder="Pincode"
                    required
                  />
                  <Input
                    value={addressForm.shipping_landmark}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, shipping_landmark: e.target.value }))
                    }
                    placeholder="Landmark (optional)"
                  />
                  <Input
                    value={addressForm.shipping_phone}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, shipping_phone: e.target.value }))
                    }
                    placeholder="Shipping phone"
                  />
                  <Button type="submit" className="w-full" loading={savingAddress}>
                    Save address & ready to ship
                  </Button>
                </form>
              )}

              {(selected.order_status === 'ready_to_ship' ||
                selected.order_status === 'shipped' ||
                selected.has_shipping_address) && (
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => handlePrintSlips([selected.id])}
                  >
                    <FileText size={16} />
                    Print packing slip
                  </Button>
                </div>
              )}

              {selected.order_status === 'ready_to_ship' && selected.has_shipping_address && (
                <form onSubmit={handleShip} className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-slate-900">Mark shipped</p>
                  <Input
                    value={shipForm.courier_name}
                    onChange={(e) =>
                      setShipForm((f) => ({ ...f, courier_name: e.target.value }))
                    }
                    placeholder="Courier (e.g. Delhivery)"
                  />
                  <Input
                    value={shipForm.tracking_number}
                    onChange={(e) =>
                      setShipForm((f) => ({ ...f, tracking_number: e.target.value }))
                    }
                    placeholder="Tracking / AWB number"
                    required
                  />
                  <Button type="submit" className="w-full" loading={shipping}>
                    Mark shipped
                  </Button>
                </form>
              )}

              {selected.order_status === 'shipped' && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <Button className="w-full" onClick={handleDeliver} loading={delivering}>
                    Mark delivered
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Select an order to verify payment, add address, or ship.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
