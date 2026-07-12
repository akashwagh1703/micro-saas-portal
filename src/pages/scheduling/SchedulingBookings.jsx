import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams, useOutletContext } from 'react-router-dom';

import { CalendarClock, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import api from '../../services/api';
import {
  addDaysDateStr,
  formatSlotTime,
  isSchedulingApiUnavailable,
  resourceLabelPlural,
  todayDateStr,
} from '../../utils/scheduling';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-800',
  confirmed: 'bg-emerald-50 text-emerald-800',
  cancelled: 'bg-slate-100 text-slate-600',
  completed: 'bg-blue-50 text-blue-800',
};

export default function SchedulingBookings() {
  const { businessProfile } = useOutletContext() ?? {};
  const labelPlural = resourceLabelPlural(businessProfile);
  const [searchParams, setSearchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDisabled, setApiDisabled] = useState(false);
  const [range, setRange] = useState('week');
  const [resourceFilter, setResourceFilter] = useState('');
  const [selectedId, setSelectedId] = useState(searchParams.get('id') || null);
  const [cancelling, setCancelling] = useState(false);

  const fromDate = todayDateStr();
  const toDate = range === 'today' ? fromDate : addDaysDateStr(fromDate, 7);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/availability/bookings', { params: { from: fromDate, to: toDate } }),
      api.get('/availability/resources'),
    ])
      .then(([bookingsRes, resourcesRes]) => {
        setBookings(bookingsRes.data?.data || []);
        setResources(resourcesRes.data?.data || []);
        setApiDisabled(false);
      })
      .catch((err) => {
        if (isSchedulingApiUnavailable(err)) {
          setApiDisabled(true);
        } else {
          toast.error('Failed to load bookings');
        }
      })
      .finally(() => setLoading(false));
  }, [fromDate, toDate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) setSelectedId(id);
  }, [searchParams]);

  const filtered = bookings.filter((b) => {
    if (!resourceFilter) return true;
    return String(b.resource_id) === resourceFilter;
  });

  const selected = filtered.find((b) => String(b.id) === String(selectedId)) || null;

  const openDetail = (booking) => {
    setSelectedId(String(booking.id));
    setSearchParams({ id: String(booking.id) });
  };

  const closeDetail = () => {
    setSelectedId(null);
    setSearchParams({});
  };

  const cancelBooking = async () => {
    if (!selected || selected.status === 'cancelled') return;
    if (!window.confirm('Cancel this booking? The time slot will become available again.')) return;
    setCancelling(true);
    try {
      await api.patch(`/availability/bookings/${selected.id}`, { status: 'cancelled' });
      toast.success('Booking cancelled');
      closeDetail();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (apiDisabled) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader eyebrow="Scheduling" title="Bookings" description="Appointment bookings from WhatsApp and manual tests." />
        <Card className="!p-6 text-sm text-slate-600">
          Scheduling API is not enabled on the server yet.
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Scheduling"
        title="Bookings"
        description="Appointments booked through WhatsApp workflows or API tests."
        action={
          <Link to="/scheduling/resources">
            <Button variant="secondary">Manage {labelPlural.toLowerCase()}</Button>
          </Link>
        }
      />

      <Card className="!p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="today">Today</option>
            <option value="week">Next 7 days</option>
          </select>
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All {labelPlural.toLowerCase()}</option>
            {resources.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="!p-0 overflow-hidden lg:col-span-3">
          {loading ? (
            <p className="p-6 text-sm text-slate-500">Loading…</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No bookings in this range"
              description="When customers book through WhatsApp, appointments appear here."
              hint="You can also create test bookings via the API during setup."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((booking) => (
                <button
                  key={booking.id}
                  type="button"
                  onClick={() => openDetail(booking)}
                  className={`w-full px-5 py-4 text-left transition hover:bg-slate-50 ${
                    String(booking.id) === String(selectedId) ? 'bg-emerald-50/60' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">
                      {booking.resource_name || `Resource #${booking.resource_id}`}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_STYLES[booking.status] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatSlotTime(booking.starts_at)}
                  </p>
                  {booking.service_label && (
                    <p className="mt-0.5 text-xs text-slate-500">{booking.service_label}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="!p-5 lg:col-span-2">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">Booking details</h2>
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
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">When</dt>
                  <dd className="mt-0.5 text-slate-800">{formatSlotTime(selected.starts_at)}</dd>
                  <dd className="text-xs text-slate-500">until {formatSlotTime(selected.ends_at)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {labelPlural.slice(0, -1)}
                  </dt>
                  <dd className="mt-0.5 text-slate-800">{selected.resource_name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</dt>
                  <dd className="mt-0.5 capitalize text-slate-800">{selected.status}</dd>
                </div>
                {selected.service_label && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Service</dt>
                    <dd className="mt-0.5 text-slate-800">{selected.service_label}</dd>
                  </div>
                )}
                {selected.notes && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Notes</dt>
                    <dd className="mt-0.5 text-slate-800">{selected.notes}</dd>
                  </div>
                )}
              </dl>
              {selected.status !== 'cancelled' && selected.status !== 'completed' && (
                <Button
                  variant="danger"
                  className="mt-6 w-full"
                  onClick={cancelBooking}
                  loading={cancelling}
                >
                  Cancel booking
                </Button>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">Select a booking to view details or cancel.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
