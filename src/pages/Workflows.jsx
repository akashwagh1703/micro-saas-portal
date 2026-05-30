import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Play, Pause, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import BusinessWizard from '../components/BusinessWizard';
import api from '../services/api';

export default function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const navigate = useNavigate();

  const fetchWorkflows = () => {
    api.get('/workflows').then((r) => {
      setWorkflows(r.data.data || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchWorkflows();
    // First-run onboarding: open the guided wizard if no business profile yet.
    api
      .get('/settings/business-profile')
      .then((r) => {
        if (!r.data?.configured) {
          setWizardOpen(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleWizardCreated = (workflow) => {
    setWizardOpen(false);
    fetchWorkflows();
    if (workflow?.id) {
      navigate(`/workflows/${workflow.id}/edit`);
    }
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
        toast.success('Workflow unpublished');
      } else {
        await api.post(`/workflows/${wf.id}/publish`);
        toast.success('Workflow published');
      }
      fetchWorkflows();
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0] || 'Failed to update workflow');
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
            <Wand2 size={16} className="mr-1 inline" /> Guided Setup
          </Button>
          <Button onClick={createWorkflow}>
            <Plus size={16} className="mr-1 inline" /> New Workflow
          </Button>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Your Workflows</h2>
        <Card>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : workflows.length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-4 text-slate-500">
                No workflows yet. Use Guided Setup to create one tailored to your business, or start from scratch.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="secondary" onClick={() => setWizardOpen(true)}>
                  <Wand2 size={14} className="mr-1 inline" /> Guided Setup
                </Button>
                <Button onClick={createWorkflow}>
                  <Plus size={14} className="mr-1 inline" /> New Workflow
                </Button>
              </div>
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
                    <div className="mt-1 flex gap-2">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                        wf.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {wf.status}
                      </span>
                      {wf.source_template && (
                        <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                          template
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      {wizardOpen && (
        <BusinessWizard onClose={() => setWizardOpen(false)} onCreated={handleWizardCreated} />
      )}
    </div>
  );
}
