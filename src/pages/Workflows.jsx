import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Play, Pause, Wand2, Building2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import BusinessWizard from '../components/BusinessWizard';
import api from '../services/api';

const USE_CASE_LABELS = {
  customer_support: 'Customer Support',
  lead_generation: 'Lead Generation',
  appointment_booking: 'Appointment Booking',
  sales_assistant: 'Sales Assistant',
  faq_bot: 'FAQ Bot',
  ai_chat: 'AI Chat Assistant',
};

export default function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const fetchWorkflows = () => {
    api.get('/workflows').then((r) => {
      setWorkflows(r.data.data || []);
      setLoading(false);
    });
  };

  const fetchProfile = () => {
    api
      .get('/settings/business-profile')
      .then((r) => setProfile(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchWorkflows();
    fetchProfile();
    api
      .get('/settings/business-profile')
      .then((r) => {
        if (!r.data?.configured) {
          setWizardOpen(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleWizardCreated = () => {
    setWizardOpen(false);
    fetchWorkflows();
    fetchProfile();
  };

  const createWorkflow = async () => {
    const { data } = await api.post('/workflows', { name: 'New Workflow' });
    toast.success('Workflow created');
    navigate(`/workflows/${data.workflow.id}/edit`);
  };

  const togglePublish = async (wf) => {
    try {
      if (wf.status === 'published') {
        await api.post(`/workflows/${wf.id}/unpublish`);
        toast.success('Workflow paused');
      } else {
        await api.post(`/workflows/${wf.id}/publish`);
        toast.success('Workflow published');
      }
      fetchWorkflows();
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0] || 'Failed to update workflow');
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
      toast.success('Workflow deleted');
      fetchWorkflows();
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete workflow');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Workflows</h1>
          <p className="text-sm text-slate-500">Automate WhatsApp with visual workflows</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setWizardOpen(true)}>
            <Wand2 size={16} className="mr-1 inline" />
            {profile?.configured ? 'Manage business' : 'Guided Setup'}
          </Button>
          <Button onClick={createWorkflow}>
            <Plus size={16} className="mr-1 inline" /> New Workflow
          </Button>
        </div>
      </div>

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
                  <p className="mt-1 text-xs text-emerald-700">
                    {profile.published_count} workflow(s) live
                  </p>
                )}
              </div>
            </div>
            {!profile.can_change_business && (
              <p className="max-w-xs text-xs text-amber-700">
                Pause all workflows before changing your business in Guided Setup.
              </p>
            )}
          </div>
        </Card>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Your Workflows</h2>
        <Card>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : workflows.length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-4 text-slate-500">
                No workflows yet. Use Guided Setup to create workflows for your business.
              </p>
              <Button variant="secondary" onClick={() => setWizardOpen(true)}>
                <Wand2 size={14} className="mr-1 inline" /> Guided Setup
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {workflows.map((wf) => (
                <div key={wf.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-4 hover:bg-slate-50">
                  <div>
                    <Link to={`/workflows/${wf.id}/edit`} className="font-semibold text-slate-900 hover:text-emerald-600">
                      {wf.name}
                    </Link>
                    <p className="text-sm text-slate-500">{wf.description || 'No description'}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                        wf.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {wf.status === 'published' ? 'live' : 'paused'}
                      </span>
                      {wf.use_case && (
                        <span className="inline-block rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700">
                          {USE_CASE_LABELS[wf.use_case] || wf.use_case}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/workflows/${wf.id}/executions`}>
                      <Button variant="secondary">Logs</Button>
                    </Link>
                    <Button variant="secondary" onClick={() => togglePublish(wf)}>
                      {wf.status === 'published' ? <Pause size={14} /> : <Play size={14} />}
                    </Button>
                    <Link to={`/workflows/${wf.id}/edit`}>
                      <Button>Edit</Button>
                    </Link>
                    <Button
                      variant="danger"
                      onClick={() => deleteWorkflow(wf)}
                      loading={deletingId === wf.id}
                      className="!px-3"
                      title="Delete workflow"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
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
