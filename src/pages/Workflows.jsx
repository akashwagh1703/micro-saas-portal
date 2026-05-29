import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Play, Pause, BookOpen, Sparkles, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';

const NODE_LABELS = {
  trigger: 'Trigger',
  condition: 'Condition',
  api: 'API',
  ai: 'AI',
  send_message: 'Send',
};

export default function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const navigate = useNavigate();

  const fetchWorkflows = () => {
    api.get('/workflows').then((r) => {
      setWorkflows(r.data.data || []);
      setLoading(false);
    });
  };

  const fetchTemplates = () => {
    api.get('/workflows/templates/list').then((r) => {
      setTemplates(r.data.templates || []);
    });
  };

  useEffect(() => {
    fetchWorkflows();
    fetchTemplates();
  }, []);

  const createWorkflow = async () => {
    const { data } = await api.post('/workflows', { name: 'New Workflow' });
    toast.success('Workflow created');
    navigate(`/workflows/${data.workflow.id}/edit`);
  };

  const cloneTemplate = async (slug) => {
    try {
      const { data } = await api.post(`/workflows/templates/${slug}/clone`);
      toast.success(data.message);
      fetchWorkflows();
      fetchTemplates();
      navigate(`/workflows/${data.workflow.id}/edit`);
    } catch {
      toast.error('Failed to add template');
    }
  };

  const seedAllTemplates = async () => {
    setSeeding(true);
    try {
      const { data } = await api.post('/workflows/templates/seed-all');
      toast.success(data.message);
      fetchWorkflows();
      fetchTemplates();
    } catch {
      toast.error('Failed to import templates');
    } finally {
      setSeeding(false);
    }
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

  const tutorial = templates.find((t) => t.slug === 'all-nodes-demo');
  const commonTemplates = templates.filter((t) => t.slug !== 'all-nodes-demo');

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Workflows</h1>
          <p className="text-sm text-slate-500">Automate WhatsApp with visual workflows</p>
        </div>
        <Button onClick={createWorkflow}>
          <Plus size={16} className="mr-1 inline" /> New Workflow
        </Button>
      </div>

      {/* Pre-built templates */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-emerald-600" size={20} />
            <h2 className="text-lg font-semibold">Starter Templates</h2>
          </div>
          <Button variant="secondary" onClick={seedAllTemplates} loading={seeding}>
            <Layers size={14} className="mr-1 inline" />
            Import All Templates
          </Button>
        </div>

        {tutorial && (
          <Card className="mb-4 border-emerald-200 bg-gradient-to-r from-emerald-50 to-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{tutorial.name}</h3>
                  <p className="mt-1 max-w-xl text-sm text-slate-600">{tutorial.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tutorial.node_types?.map((type) => (
                      <span key={type} className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                        {NODE_LABELS[type] || type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => cloneTemplate(tutorial.slug)}
                variant={tutorial.imported ? 'secondary' : 'primary'}
              >
                {tutorial.imported ? 'Open in Editor' : 'Use Demo Workflow'}
              </Button>
            </div>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {commonTemplates.map((t) => (
            <Card key={t.slug} className="!p-4 flex flex-col">
              <h3 className="font-semibold text-slate-900 text-sm">{t.name}</h3>
              <p className="mt-1 flex-1 text-xs text-slate-500 leading-relaxed">{t.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {t.node_types?.map((type) => (
                  <span key={type} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                    {NODE_LABELS[type]}
                  </span>
                ))}
              </div>
              <Button
                className="mt-4 w-full"
                variant={t.imported ? 'secondary' : 'primary'}
                onClick={() => cloneTemplate(t.slug)}
              >
                {t.imported ? 'Open' : 'Use Template'}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* User workflows */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Your Workflows</h2>
        <Card>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : workflows.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-500 mb-4">No workflows yet. Pick a template above or create from scratch.</p>
              <Button onClick={seedAllTemplates} loading={seeding}>Import All Templates</Button>
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
    </div>
  );
}
