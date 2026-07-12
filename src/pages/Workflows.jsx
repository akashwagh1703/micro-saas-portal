import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, Wand2, Building2, Trash2, Bot, History, CalendarClock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import BusinessWizard from '../components/BusinessWizard';
import SetupChecklist from '../components/onboarding/SetupChecklist';
import TestBotCard from '../components/onboarding/TestBotCard';
import api from '../services/api';
import { fetchSetupProgress, buildSetupSteps } from '../utils/setupProgress';
import { applyBusinessChange } from '../utils/businessChange';
import {
  patchProfilePublishedCount,
  patchWorkflowLive,
  syncSetupBusinessResult,
} from '../utils/workspaceSync';
import { describeTrigger, getChannelBadge } from '../utils/workflowKeywords';
import { actionErrorMessage } from '../utils/actionErrorMessage';
import {
  isSchedulingApiUnavailable,
  resourceLabelPlural,
  supportsScheduling,
} from '../utils/scheduling';

const USE_CASE_LABELS = {
  customer_support: 'Customer support',
  lead_generation: 'Lead capture',
  appointment_booking: 'Appointments',
  sales_assistant: 'Sales helper',
  faq_bot: 'FAQ answers',
  ai_chat: 'Smart chat',
};

const FIRST_LIVE_KEY = 'autowave_first_go_live';

export default function Workflows() {
  const { applyBusinessProfile, refreshBusinessProfile, businessProfile: layoutProfile } =
    useOutletContext() ?? {};
  const [workflows, setWorkflows] = useState([]);
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [schedulingResourceCount, setSchedulingResourceCount] = useState(null);
  const navigate = useNavigate();

  const refresh = (options = {}) => {
    const { silent = false } = options;
    if (!silent) setLoading(true);
    return fetchSetupProgress(api).then((p) => {
      setProgress(p);
      setProfile(p.profile);
      if (p.profile) applyBusinessProfile?.(p.profile);
      setWorkflows(p.workflows);
      setLoading(false);
      return p;
    });
  };

  useEffect(() => {
    if (layoutProfile?.configured) {
      setProfile(layoutProfile);
    }
  }, [layoutProfile]);

  useEffect(() => {
    refresh({ silent: !!layoutProfile?.configured });
    if (!layoutProfile?.configured) {
      api
        .get('/settings/business-profile')
        .then((r) => {
          if (r.data?.business_category === 'career_ai' && r.data?.configured) {
            return;
          }
          if (!r.data?.configured) setWizardOpen(true);
        })
        .catch(() => {});
    }
  }, []);

  const handleWizardCreated = async (data) => {
    setWizardOpen(false);
    syncSetupBusinessResult(data, { setProfile, setWorkflows, applyBusinessProfile });
    setLoading(false);
    applyBusinessChange(navigate, data);
    refresh({ silent: true });
    refreshBusinessProfile?.();
  };

  const createWorkflow = async () => {
    const { data } = await api.post('/workflows', { name: 'New Auto-reply' });
    toast.success('Auto-reply created');
    navigate(`/workflows/${data.workflow.id}/edit`);
  };

  const togglePublish = async (wf) => {
    const isLive = wf.status === 'published' && wf.is_active;
    const nextLive = !isLive;

    setTogglingId(wf.id);
    setWorkflows((prev) => patchWorkflowLive(prev, wf.id, nextLive));
    setProfile((prev) => {
      const next = patchProfilePublishedCount(prev, nextLive ? 1 : -1);
      applyBusinessProfile?.(next);
      return next;
    });

    try {
      if (isLive) {
        await api.post(`/workflows/${wf.id}/unpublish`);
        toast.success('Turned off — customers will not get this auto-reply');
      } else {
        await api.post(`/workflows/${wf.id}/publish`);
        const firstLive = !localStorage.getItem(FIRST_LIVE_KEY);
        if (firstLive) {
          localStorage.setItem(FIRST_LIVE_KEY, '1');
          toast.success('You\'re live! Send a test message on WhatsApp or Instagram to see it work.', { duration: 5000 });
        } else {
          toast.success('Auto-reply is now live!');
        }
      }
      refresh({ silent: true });
    } catch (err) {
      setWorkflows((prev) => patchWorkflowLive(prev, wf.id, isLive));
      setProfile((prev) => {
        const next = patchProfilePublishedCount(prev, nextLive ? -1 : 1);
        applyBusinessProfile?.(next);
        return next;
      });
      toast.error(actionErrorMessage(err, 'Could not update auto-reply'));
    } finally {
      setTogglingId(null);
    }
  };

  const deleteWorkflow = async (wf) => {
    const isLive = wf.status === 'published' && wf.is_active;
    const message =
      isLive
        ? `"${wf.name}" is live. Delete it permanently?`
        : `Delete "${wf.name}" permanently?`;
    if (!window.confirm(message)) return;

    setDeletingId(wf.id);
    const snapshot = workflows;
    setWorkflows((prev) => prev.filter((w) => w.id !== wf.id));
    if (isLive) {
      setProfile((prev) => {
        const next = patchProfilePublishedCount(prev, -1);
        applyBusinessProfile?.(next);
        return next;
      });
    }

    try {
      await api.delete(`/workflows/${wf.id}`);
      toast.success('Auto-reply deleted');
      refresh({ silent: true });
    } catch (err) {
      setWorkflows(snapshot);
      if (isLive) {
        setProfile((prev) => {
          const next = patchProfilePublishedCount(prev, 1);
          applyBusinessProfile?.(next);
          return next;
        });
      }
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (!supportsScheduling(profile)) {
      setSchedulingResourceCount(null);
      return;
    }
    api
      .get('/availability/resources')
      .then((r) => setSchedulingResourceCount((r.data?.data || []).length))
      .catch((err) => {
        if (isSchedulingApiUnavailable(err)) setSchedulingResourceCount(-1);
        else setSchedulingResourceCount(0);
      });
  }, [profile]);

  useEffect(() => {
    if (profile?.business_category === 'career_ai' && profile?.configured) {
      navigate('/career-ai', { replace: true });
    }
  }, [profile, navigate]);

  const steps = progress ? buildSetupSteps(progress) : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Automation"
        title="Auto-replies"
        description="Bots that answer customers on WhatsApp and Instagram — turn on when you're ready"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setWizardOpen(true)}>
              <Wand2 size={16} className="mr-1 inline" />
              {profile?.configured ? 'Change business' : 'Set up my business'}
            </Button>
            <Button variant="secondary" onClick={createWorkflow}>
              <Plus size={16} className="mr-1 inline" /> Add custom
            </Button>
          </div>
        }
      />

      {progress && !progress.complete && (
        <SetupChecklist steps={steps} compact />
      )}

      {profile?.configured && (
        <Card className="!p-4 border-emerald-100 bg-emerald-50/40">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Building2 size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{profile.business_label}</p>
                <p className="mt-0.5 text-xs text-slate-600">
                  {profile.use_case_labels?.join(' · ')}
                </p>
                {profile.published_count > 0 && (
                  <p className="mt-1 text-xs font-medium text-emerald-700">
                    {profile.published_count} auto-repl{profile.published_count === 1 ? 'y' : 'ies'} live
                  </p>
                )}
              </div>
            </div>
            {!profile.can_change_business && (
              <p className="max-w-xs text-xs text-amber-700">
                Turn off all live auto-replies before changing your business.
              </p>
            )}
          </div>
          {profile.vertical_deprecated && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Legacy business type — you can keep using it; new signups use the updated catalog.
            </p>
          )}
        </Card>
      )}

      {progress?.hasLive && (
        <TestBotCard
          whatsappDisplay={progress.whatsappDisplay}
          instagramUsername={progress.instagramUsername}
          workflows={workflows}
        />
      )}

      {supportsScheduling(profile) && schedulingResourceCount !== null && schedulingResourceCount >= 0 && schedulingResourceCount === 0 && (
        <Card className="!p-4 border-amber-200 bg-amber-50/60">
          <div className="flex flex-wrap items-start gap-3">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-amber-900">Scheduling not ready yet</p>
              <p className="mt-1 text-sm text-amber-800">
                Add your {resourceLabelPlural(profile).toLowerCase()} and working hours before appointment
                auto-replies can offer real slots.
              </p>
              <Link to="/scheduling/resources" className="mt-2 inline-block">
                <Button variant="secondary" className="!text-sm">
                  <CalendarClock size={14} className="mr-1 inline" />
                  Set up scheduling
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Your auto-replies</h2>
        <Card className="!p-0 overflow-hidden">
          {loading ? (
            <p className="p-6 text-sm text-slate-500">Loading...</p>
          ) : workflows.length === 0 ? (
            <EmptyState
              icon={Bot}
              title="No auto-replies yet"
              description="Tell us your business and we'll create ready-made bots for appointments, FAQs, leads, and more."
              hint="Takes about 2 minutes. You can edit everything later."
              actionLabel="Set up my business"
              onAction={() => setWizardOpen(true)}
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {workflows.map((wf) => {
                const isLive = wf.status === 'published' && wf.is_active;
                const channelBadge = getChannelBadge(wf.definition);
                return (
                  <div key={wf.id} className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/workflows/${wf.id}/edit`}
                            className="font-semibold text-slate-900 hover:text-emerald-600"
                          >
                            {wf.name}
                          </Link>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isLive ? 'Live' : 'Off'}
                          </span>
                          {wf.use_case && (
                            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700">
                              {USE_CASE_LABELS[wf.use_case] || wf.use_case}
                            </span>
                          )}
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${channelBadge.className}`}>
                            {channelBadge.label}
                          </span>
                          {wf.use_case === 'appointment_booking' && supportsScheduling(profile) && schedulingResourceCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                              <CalendarClock size={12} />
                              Scheduling connected
                            </span>
                          )}
                          {wf.use_case === 'appointment_booking' && supportsScheduling(profile) && schedulingResourceCount === 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                              <AlertTriangle size={12} />
                              No {resourceLabelPlural(profile).toLowerCase()} yet
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{describeTrigger(wf.definition)}</p>
                        {!isLive && (
                          <p className="mt-1 text-xs text-slate-400">Nothing sends until you go live</p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          onClick={() => togglePublish(wf)}
                          loading={togglingId === wf.id}
                          variant={isLive ? 'secondary' : 'primary'}
                          className="min-w-[7rem]"
                        >
                          {isLive ? 'Turn off' : 'Go live'}
                        </Button>
                        <Link to={`/workflows/${wf.id}/edit`}>
                          <Button variant="secondary">Edit</Button>
                        </Link>
                        <Link to={`/workflows/${wf.id}/executions`}>
                          <Button variant="secondary" title="Execution logs">
                            <History size={14} />
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          onClick={() => deleteWorkflow(wf)}
                          loading={deletingId === wf.id}
                          className="!px-3"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </section>

      {wizardOpen && (
        <BusinessWizard
          profile={profile}
          onClose={() => setWizardOpen(false)}
          onCreated={handleWizardCreated}
        />
      )}
    </div>
  );
}
