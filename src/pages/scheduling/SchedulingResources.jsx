import { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { CalendarClock, Plus, Scissors, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import api from '../../services/api';
import {
  defaultResourceType,
  isSchedulingApiUnavailable,
  resourceLabel,
  resourceLabelPlural,
} from '../../utils/scheduling';

export default function SchedulingResources() {
  const { businessProfile } = useOutletContext() ?? {};
  const label = resourceLabel(businessProfile);
  const labelPlural = resourceLabelPlural(businessProfile);

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDisabled, setApiDisabled] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/availability/resources')
      .then((r) => {
        setResources(r.data?.data || []);
        setApiDisabled(false);
      })
      .catch((err) => {
        if (isSchedulingApiUnavailable(err)) {
          setApiDisabled(true);
          setResources([]);
        } else {
          toast.error('Failed to load resources');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createResource = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await api.post('/availability/resources', {
        name: name.trim(),
        type: defaultResourceType(businessProfile),
      });
      toast.success(`${label} added`);
      setName('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || `Could not add ${label.toLowerCase()}`);
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (resource) => {
    try {
      await api.patch(`/availability/resources/${resource.id}`, {
        is_active: !resource.is_active,
      });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  if (apiDisabled) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          eyebrow="Scheduling"
          title={labelPlural}
          description="Live slot booking will appear here after the availability API is enabled on your server."
        />
        <Card className="!p-6">
          <p className="text-sm text-slate-600">
            Ask your administrator to deploy the v4 API and set{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">V4_AVAILABILITY_ENABLED=true</code>.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Scheduling"
        title={labelPlural}
        description={`Add ${labelPlural.toLowerCase()} and set weekly hours so customers can book real time slots.`}
        action={
          <Link to="/scheduling/bookings">
            <Button variant="secondary">
              <CalendarClock size={16} className="mr-1 inline" />
              View bookings
            </Button>
          </Link>
        }
      />

      <Card className="!p-5">
        <h2 className="text-sm font-semibold text-slate-900">Add {label.toLowerCase()}</h2>
        <form onSubmit={createResource} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label={`${label} name`}
              placeholder={label === 'Barber' ? 'e.g. Rahul' : `e.g. ${label} 1`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
            />
          </div>
          <Button type="submit" loading={creating} disabled={!name.trim()}>
            <Plus size={16} />
            Add
          </Button>
        </form>
      </Card>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Your {labelPlural.toLowerCase()}
        </h2>
        <Card className="!p-0 overflow-hidden">
          {loading ? (
            <p className="p-6 text-sm text-slate-500">Loading…</p>
          ) : resources.length === 0 ? (
            <EmptyState
              icon={Scissors}
              title={`No ${labelPlural.toLowerCase()} yet`}
              description={`Add at least one ${label.toLowerCase()} and set working hours to enable live slot booking.`}
              hint="Salon owners typically add 2–3 barbers with Mon–Sat hours."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {resources.map((resource) => {
                const scheduleCount = (resource.schedules || []).filter((s) => s.is_active !== false).length;
                return (
                  <div
                    key={resource.id}
                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{resource.name}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            resource.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {resource.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {scheduleCount > 0 ? (
                          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700">
                            {scheduleCount} day{scheduleCount === 1 ? '' : 's'} scheduled
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                            No hours set
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-500 capitalize">{resource.type}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/scheduling/resources/${resource.id}`}>
                        <Button variant="secondary">
                          Edit hours
                          <ChevronRight size={14} />
                        </Button>
                      </Link>
                      <Button variant="ghost" onClick={() => toggleActive(resource)}>
                        {resource.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
