import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import api from '../../services/api';
import {
  WEEKDAYS,
  defaultSalonWeekSchedule,
  isSchedulingApiUnavailable,
  resourceLabel,
} from '../../utils/scheduling';

function emptyWeekForm() {
  return WEEKDAYS.map((day) => ({
    day_of_week: day.value,
    enabled: false,
    start_time: '09:00',
    end_time: '19:00',
    slot_minutes: 30,
  }));
}

function schedulesToForm(schedules) {
  const base = emptyWeekForm();
  for (const row of base) {
    const match = (schedules || []).find((s) => s.day_of_week === row.day_of_week && s.is_active !== false);
    if (match) {
      row.enabled = true;
      row.start_time = match.start_time;
      row.end_time = match.end_time;
      row.slot_minutes = match.slot_minutes ?? 30;
    }
  }
  return base;
}

export default function SchedulingResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { businessProfile } = useOutletContext() ?? {};
  const label = resourceLabel(businessProfile);

  const [resource, setResource] = useState(null);
  const [weekForm, setWeekForm] = useState(emptyWeekForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/availability/resources')
      .then((r) => {
        const found = (r.data?.data || []).find((item) => String(item.id) === String(id));
        if (!found) {
          toast.error('Resource not found');
          navigate('/scheduling/resources');
          return;
        }
        setResource(found);
        setWeekForm(schedulesToForm(found.schedules));
      })
      .catch((err) => {
        if (isSchedulingApiUnavailable(err)) {
          toast.error('Scheduling API is not enabled yet');
        } else {
          toast.error('Failed to load resource');
        }
        navigate('/scheduling/resources');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const updateDay = (dayOfWeek, patch) => {
    setWeekForm((prev) =>
      prev.map((row) => (row.day_of_week === dayOfWeek ? { ...row, ...patch } : row)),
    );
  };

  const applySalonDefaults = () => {
    const defaults = defaultSalonWeekSchedule();
    setWeekForm((prev) =>
      prev.map((row) => {
        const match = defaults.find((d) => d.day_of_week === row.day_of_week);
        if (!match) return { ...row, enabled: false };
        return {
          ...row,
          enabled: true,
          start_time: match.start_time,
          end_time: match.end_time,
          slot_minutes: match.slot_minutes,
        };
      }),
    );
    toast.success('Mon–Sat 9:00–19:00 applied — save to confirm');
  };

  const save = async () => {
    if (!resource) return;
    const weekly_slots = weekForm
      .filter((row) => row.enabled)
      .map((row) => ({
        day_of_week: row.day_of_week,
        start_time: row.start_time,
        end_time: row.end_time,
        slot_minutes: Number(row.slot_minutes) || 30,
        is_active: true,
      }));

    if (weekly_slots.length === 0) {
      toast.error('Enable at least one working day');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.put(`/availability/resources/${resource.id}/schedule`, {
        weekly_slots,
      });
      setResource(data.resource);
      setWeekForm(schedulesToForm(data.resource.schedules));
      toast.success('Working hours saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save schedule');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/scheduling/resources"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-emerald-700"
      >
        <ArrowLeft size={16} />
        Back to {label.toLowerCase()}s
      </Link>

      <PageHeader
        eyebrow="Schedule"
        title={resource?.name}
        description={`Set which days and times this ${label.toLowerCase()} accepts bookings.`}
        action={
          <div className="flex flex-wrap gap-2">
            {businessProfile?.business_category === 'salon' && (
              <Button variant="secondary" onClick={applySalonDefaults}>
                Apply salon defaults
              </Button>
            )}
            <Button onClick={save} loading={saving}>
              <Save size={16} />
              Save hours
            </Button>
          </div>
        }
      />

      <Card className="!p-0 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {weekForm.map((row) => {
            const dayMeta = WEEKDAYS.find((d) => d.value === row.day_of_week);
            return (
              <div key={row.day_of_week} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <label className="flex w-36 shrink-0 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    onChange={(e) => updateDay(row.day_of_week, { enabled: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-slate-800">{dayMeta?.label}</span>
                </label>
                {row.enabled ? (
                  <div className="flex flex-1 flex-wrap items-center gap-3">
                    <label className="text-xs text-slate-500">
                      From
                      <input
                        type="time"
                        value={row.start_time}
                        onChange={(e) => updateDay(row.day_of_week, { start_time: e.target.value })}
                        className="ml-2 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      />
                    </label>
                    <label className="text-xs text-slate-500">
                      To
                      <input
                        type="time"
                        value={row.end_time}
                        onChange={(e) => updateDay(row.day_of_week, { end_time: e.target.value })}
                        className="ml-2 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      />
                    </label>
                    <label className="text-xs text-slate-500">
                      Slot
                      <select
                        value={row.slot_minutes}
                        onChange={(e) =>
                          updateDay(row.day_of_week, { slot_minutes: Number(e.target.value) })
                        }
                        className="ml-2 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      >
                        {[15, 30, 45, 60].map((m) => (
                          <option key={m} value={m}>
                            {m} min
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Closed</p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
