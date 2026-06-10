import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Wand2, Building2, Trash2, Bot } from 'lucide-react';
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
import { describeTrigger, getChannelBadge } from '../utils/workflowKeywords';
import { actionErrorMessage } from '../utils/actionErrorMessage';

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
  const [workflows, setWorkflows] = useState([]);
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const navigate = useNavigate();

  const refresh = () => {
    fetchSetupProgress(api).then((p) => {
      setProgress(p);
      setProfile(p.profile);
      setWorkflows(p.workflows);
      setLoading(false);
    });
  };

  useEffect(() => {
    refresh();
    api
      .get('/settings/business-profile')
      .then((r) => {
        if (r.data?.business_category === 'career_ai' && r.data?.configured) {
          return;
        }
        if (!r.data?.configured) setWizardOpen(true);
      })
      .catch(() => {});
  }, []);

  const handleWizardCreated = () => {
    setWizardOpen(false);
    toast.success('Auto-replies created! Connect WhatsApp or Instagram, then go live.');
    refresh();
  };

  const createWorkflow = async () => {
    const { data } = await api.post('/workflows', { name: 'New Auto-reply' });
    toast.success('Auto-reply created');
    navigate(`/workflows/${data.workflow.id}/edit`);
  };

  const togglePublish = async (wf) => {
    setTogglingId(wf.id);
    try {
      if (wf.status === 'published') {
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
      refresh();
    } catch (err) {
      toast.error(actionErrorMessage(err, 'Could not update auto-reply'));
    } finally {
      setTogglingId(null);
    }
  };

  const deleteWorkflow = async (wf) => {
    const message =
      wf.status === 'published'
        ? `"${wf.name}" is live. Delete it permanently?`
        : `Delete "${wf.name}" permanently?`;
    if (!window.confirm(message)) return;

    setDeletingId(wf.id);
    try {
      await api.delete(`/workflows/${wf.id}`);
      toast.success('Auto-reply deleted');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

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
        </Card>
      )}

      {progress?.hasLive && (
        <TestBotCard
          whatsappDisplay={progress.whatsappDisplay}
          instagramUsername={progress.instagramUsername}
          workflows={workflows}
        />
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
                const isLive = wf.status === 'published';
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
