import { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';
import { actionErrorMessage } from '../utils/actionErrorMessage';

const nodeTypesList = [
  { type: 'trigger', label: 'When message arrives', color: 'bg-blue-500' },
  { type: 'condition', label: 'If message contains…', color: 'bg-amber-500' },
  { type: 'collect_input', label: 'Ask a question', color: 'bg-cyan-500' },
  { type: 'save_lead', label: 'Save lead', color: 'bg-rose-500' },
  { type: 'api', label: 'Call external API', color: 'bg-purple-500' },
  { type: 'ai', label: 'Smart reply', color: 'bg-violet-500' },
  { type: 'send_message', label: 'Send message', color: 'bg-emerald-500' },
];

function CustomNode({ data, selected }) {
  const color = nodeTypesList.find((n) => n.type === data.nodeType)?.color || 'bg-slate-500';
  const isCondition = data.nodeType === 'condition';
  return (
    <div className={`min-w-[160px] rounded-lg border-2 bg-white shadow ${selected ? 'border-emerald-500' : 'border-slate-200'}`}>
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      <div className={`rounded-t-md px-3 py-1.5 text-xs font-semibold text-white ${color}`}>
        {data.label || data.nodeType}
      </div>
      <div className="px-3 py-2 text-xs text-slate-500 truncate">{data.summary || 'Configure node'}</div>
      {isCondition ? (
        <>
          <span className="pointer-events-none absolute -bottom-4 left-[25%] -translate-x-1/2 text-[9px] font-semibold text-emerald-600">Yes</span>
          <Handle id="true" type="source" position={Position.Bottom} style={{ left: '25%' }} className="!bg-emerald-500" />
          <span className="pointer-events-none absolute -bottom-4 left-[75%] -translate-x-1/2 text-[9px] font-semibold text-red-500">No</span>
          <Handle id="false" type="source" position={Position.Bottom} style={{ left: '75%' }} className="!bg-red-500" />
        </>
      ) : (
        <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
      )}
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

function copyText(text, label = 'Copied') {
  navigator.clipboard.writeText(text).then(() => toast.success(label)).catch(() => toast.error('Copy failed'));
}

function SaveLeadApiPanel({ apiConfig, curl, onRefresh, loading }) {
  if (!apiConfig) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
        {loading ? 'Loading lead API credentials…' : 'No API config yet.'}
        {!loading && (
          <button type="button" className="ml-1 font-medium text-emerald-700" onClick={onRefresh}>
            Load credentials
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lead API (same as Save Lead)</p>
        <button type="button" className="text-xs font-medium text-emerald-700" onClick={onRefresh} disabled={loading}>
          Refresh
        </button>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">
        Pre-filled for Zapier, Postman, or an external CRM. The step still saves internally — no extra HTTP call during chat.
      </p>
      <div>
        <p className="text-[11px] font-medium text-slate-600">URL</p>
        <div className="mt-1 flex gap-2">
          <code className="flex-1 overflow-x-auto rounded bg-white px-2 py-1 text-[10px] text-slate-700">{apiConfig.url}</code>
          <Button variant="secondary" onClick={() => copyText(apiConfig.url, 'URL copied')}>Copy</Button>
        </div>
      </div>
      <div>
        <p className="text-[11px] font-medium text-slate-600">Authorization</p>
        <div className="mt-1 flex gap-2">
          <code className="flex-1 overflow-x-auto rounded bg-white px-2 py-1 text-[10px] text-slate-700">{apiConfig.headers?.Authorization}</code>
          <Button variant="secondary" onClick={() => copyText(apiConfig.headers?.Authorization || '', 'Token copied')}>Copy</Button>
        </div>
      </div>
      <div>
        <p className="text-[11px] font-medium text-slate-600">Request body</p>
        <pre className="mt-1 max-h-40 overflow-auto rounded bg-white p-2 text-[10px] text-slate-700">{JSON.stringify(apiConfig.body, null, 2)}</pre>
        <Button variant="secondary" className="mt-2" onClick={() => copyText(JSON.stringify(apiConfig.body, null, 2), 'Body copied')}>
          Copy body
        </Button>
      </div>
      {curl && (
        <div>
          <p className="text-[11px] font-medium text-slate-600">cURL</p>
          <pre className="mt-1 max-h-32 overflow-auto rounded bg-white p-2 text-[10px] text-slate-700">{curl}</pre>
          <Button variant="secondary" className="mt-2" onClick={() => copyText(curl, 'cURL copied')}>
            Copy cURL
          </Button>
        </div>
      )}
    </div>
  );
}

function buildCurlFromApi(apiConfig) {
  if (!apiConfig?.url) return '';
  const headers = Object.entries(apiConfig.headers || {})
    .map(([k, v]) => `-H "${k}: ${v}"`)
    .join(' \\\n  ');
  return [
    `curl -X ${apiConfig.method || 'POST'} "${apiConfig.url}" \\`,
    `  ${headers} \\`,
    `  -d '${JSON.stringify(apiConfig.body || {}, null, 2)}'`,
  ].join('\n');
}

export default function WorkflowBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [leadApiLoading, setLeadApiLoading] = useState(false);

  const loadWorkflow = useCallback(async () => {
    const { data } = await api.get(`/workflows/${id}`);
    setWorkflow(data.workflow);
    const def = data.workflow.definition || { nodes: [], edges: [] };
    setNodes(
      (def.nodes || []).map((n) => ({
        id: n.id,
        type: 'custom',
        position: n.position || { x: 100, y: 100 },
        data: {
          nodeType: n.type,
          label: n.data?.label || n.type,
          summary: n.data?.summary,
          ...n.data,
        },
      }))
    );
    setEdges(
      (def.edges || []).map((e) => ({
        id: e.id || `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? null,
        label: e.sourceHandle === 'true' ? 'Yes' : e.sourceHandle === 'false' ? 'No' : undefined,
      }))
    );
  }, [id, setNodes, setEdges]);

  useEffect(() => { loadWorkflow(); }, [loadWorkflow]);

  const onConnect = useCallback(
    (params) => {
      const label = params.sourceHandle === 'true' ? 'Yes' : params.sourceHandle === 'false' ? 'No' : undefined;
      setEdges((eds) => addEdge({ ...params, label }, eds));
    },
    [setEdges]
  );

  const addNode = (type) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type: 'custom',
      position: { x: 150 + Math.random() * 200, y: 150 + Math.random() * 100 },
      data: {
        nodeType: type,
        label: nodeTypesList.find((n) => n.type === type)?.label,
        ...(type === 'send_message' ? { message: 'Hello {{contact_name}}!' } : {}),
        ...(type === 'condition' ? { field: 'message', operator: 'contains', value: '' } : {}),
        ...(type === 'ai' ? { prompt: 'Reply to: {{message}}', model: 'openai/gpt-4o-mini', provider: 'openrouter' } : {}),
        ...(type === 'api' ? { url: '', method: 'GET', headers: {}, body: {} } : {}),
        ...(type === 'collect_input'
          ? { field: 'answer', question: 'Please share your answer.' }
          : {}),
        ...(type === 'save_lead'
          ? { label: 'Save Lead', notes: '', collected_fields: [], summary: 'Saves lead to WhatsFlow Leads' }
          : {}),
        ...(type === 'trigger'
          ? { channel: 'both', summary: 'WhatsApp or Instagram DMs' }
          : {}),
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const updateSelectedNodeData = (updates) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...n.data, ...updates, summary: updates.question || updates.message || updates.prompt || updates.url || n.data.summary } }
          : n
      )
    );
    setSelectedNode((prev) => ({ ...prev, data: { ...prev.data, ...updates } }));
  };

  const collectInputFields = nodes
    .filter((n) => n.data?.nodeType === 'collect_input' && n.data?.field)
    .map((n) => n.data.field);

  const triggerChannel =
    nodes.find((n) => n.data?.nodeType === 'trigger')?.data?.channel || 'both';

  const refreshLeadApiConfig = async () => {
    if (!selectedNode?.data) return;
    setLeadApiLoading(true);
    try {
      const fields = selectedNode.data.collected_fields?.length
        ? selectedNode.data.collected_fields
        : collectInputFields;
      const { data } = await api.get('/leads/integration', {
        params: {
          notes: selectedNode.data.notes || undefined,
          collected_fields: fields.join(','),
          channel: triggerChannel,
        },
      });
      updateSelectedNodeData({
        api: data.api,
        collected_fields: fields,
      });
      toast.success('Lead API credentials updated');
    } catch {
      toast.error('Could not load lead API credentials');
    } finally {
      setLeadApiLoading(false);
    }
  };

  const buildDefinition = () => ({
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.data.nodeType,
      position: n.position,
      data: { ...n.data, nodeType: undefined, label: n.data.label, summary: undefined },
    })),
    edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle ?? null })),
  });

  const saveWorkflow = async () => {
    setSaving(true);
    const definition = buildDefinition();
    try {
      const { data: validation } = await api.post('/workflows/validate', { definition });
      if (!validation.valid) {
        toast.error(validation.errors?.join(', ') || 'Invalid workflow');
        setSaving(false);
        return;
      }
      await api.put(`/workflows/${id}`, { definition, name: workflow?.name });
      toast.success('Auto-reply saved');
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0] || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    await saveWorkflow();
    try {
      await api.post(`/workflows/${id}/publish`);
      toast.success('Auto-reply is live!');
      loadWorkflow();
    } catch (err) {
      toast.error(actionErrorMessage(err, 'Publish failed'));
    }
  };

  const deleteWorkflow = async () => {
    const name = workflow?.name || 'this workflow';
    const message =
      workflow?.status === 'published'
        ? `"${name}" is live. Delete it permanently?`
        : `Delete "${name}" permanently?`;
    if (!window.confirm(message)) return;

    setDeleting(true);
    try {
      await api.delete(`/workflows/${id}`);
      toast.success('Workflow deleted');
      navigate('/workflows');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete workflow');
      setDeleting(false);
    }
  };

  const selectedData = selectedNode?.data;

  const renderNodeSettings = () => {
    if (!selectedData) return <p className="text-sm text-slate-500">Select a node to configure</p>;
    const type = selectedData.nodeType;

    if (type === 'condition') {
      return (
        <div className="space-y-3">
          <Input label="Field" value={selectedData.field || 'message'} onChange={(e) => updateSelectedNodeData({ field: e.target.value })} />
          <div>
            <label className="text-sm font-medium">Operator</label>
            <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={selectedData.operator || 'contains'} onChange={(e) => updateSelectedNodeData({ operator: e.target.value })}>
              <option value="contains">Contains</option>
              <option value="equals">Equals</option>
              <option value="starts_with">Starts with</option>
            </select>
          </div>
          <Input label="Value" value={selectedData.value || ''} onChange={(e) => updateSelectedNodeData({ value: e.target.value })} />
        </div>
      );
    }

    if (type === 'collect_input') {
      return (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Sends a question and waits for the customer&apos;s reply before continuing. Use unique field names to chain multiple asks.
          </p>
          <Input
            label="Field name (for {{variables}})"
            value={selectedData.field || ''}
            onChange={(e) => updateSelectedNodeData({ field: e.target.value })}
            placeholder="budget"
          />
          <div>
            <label className="text-sm font-medium">Question</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
              rows={3}
              value={selectedData.question || ''}
              onChange={(e) => updateSelectedNodeData({ question: e.target.value })}
              placeholder="What is your budget range?"
            />
          </div>
        </div>
      );
    }

    if (type === 'save_lead') {
      const apiConfig = selectedData.api;
      const curl = buildCurlFromApi(apiConfig);
      return (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Saves contact info and collected answers to your Leads page. Place after Ask a question steps.
          </p>
          <div>
            <label className="text-sm font-medium">Internal notes (optional)</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
              rows={2}
              value={selectedData.notes || ''}
              onChange={(e) => updateSelectedNodeData({ notes: e.target.value })}
              placeholder="e.g. Real estate enquiry from WhatsApp"
            />
          </div>
          <SaveLeadApiPanel
            apiConfig={apiConfig}
            curl={curl}
            loading={leadApiLoading}
            onRefresh={refreshLeadApiConfig}
          />
        </div>
      );
    }

    if (type === 'send_message') {
      return (
        <div>
          <label className="text-sm font-medium">Message</label>
          <textarea
            className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
            rows={4}
            value={selectedData.message || ''}
            onChange={(e) => updateSelectedNodeData({ message: e.target.value })}
            placeholder="Use {{message}}, {{contact_name}}, {{ai_response}}"
          />
        </div>
      );
    }

    if (type === 'ai') {
      return (
        <div className="space-y-3">
          <Input label="Model" value={selectedData.model || ''} onChange={(e) => updateSelectedNodeData({ model: e.target.value })} />
          <div>
            <label className="text-sm font-medium">Prompt</label>
            <textarea className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" rows={4} value={selectedData.prompt || ''} onChange={(e) => updateSelectedNodeData({ prompt: e.target.value })} />
          </div>
          <Input label="Fallback message" value={selectedData.fallback_message || ''} onChange={(e) => updateSelectedNodeData({ fallback_message: e.target.value })} />
        </div>
      );
    }

    if (type === 'api') {
      return (
        <div className="space-y-3">
          <Input label="URL" value={selectedData.url || ''} onChange={(e) => updateSelectedNodeData({ url: e.target.value })} />
          <div>
            <label className="text-sm font-medium">Method</label>
            <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={selectedData.method || 'GET'} onChange={(e) => updateSelectedNodeData({ method: e.target.value })}>
              {['GET', 'POST', 'PUT', 'DELETE'].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={selectedData.use_fallback || false} onChange={(e) => updateSelectedNodeData({ use_fallback: e.target.checked })} />
            Use fallback on failure
          </label>
        </div>
      );
    }

    if (type === 'trigger') {
      const channelLabels = {
        both: 'WhatsApp or Instagram DMs',
        whatsapp: 'WhatsApp messages only',
        instagram: 'Instagram DMs only',
      };
      return (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Fires on incoming messages. Leave keywords empty to run on every message.</p>
          <div>
            <label className="text-sm font-medium">Channel</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={selectedData.channel || 'both'}
              onChange={(e) => updateSelectedNodeData({
                channel: e.target.value,
                summary: channelLabels[e.target.value] || channelLabels.both,
              })}
            >
              <option value="both">WhatsApp + Instagram</option>
              <option value="whatsapp">WhatsApp only</option>
              <option value="instagram">Instagram only</option>
            </select>
          </div>
          <Input
            label="Keywords (comma separated)"
            value={selectedData.keywords || ''}
            onChange={(e) => updateSelectedNodeData({ keywords: e.target.value })}
            placeholder="hi, hello, support"
          />
          <div>
            <label className="text-sm font-medium">Match</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={selectedData.match || 'any'}
              onChange={(e) => updateSelectedNodeData({ match: e.target.value })}
            >
              <option value="any">Any keyword (contains)</option>
              <option value="all">All keywords</option>
              <option value="exact">Exact message</option>
            </select>
          </div>
        </div>
      );
    }

    return <p className="text-sm text-slate-500">Select a node to configure</p>;
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/workflows"><Button variant="secondary">← Back</Button></Link>
          <div>
            <h1 className="text-xl font-bold">{workflow?.name || 'Edit auto-reply'}</h1>
            <p className="text-xs text-slate-500">Advanced editor — drag steps to customize</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="danger" onClick={deleteWorkflow} loading={deleting}>
            Delete
          </Button>
          <Button variant="secondary" onClick={saveWorkflow} loading={saving}>Save</Button>
          <Button onClick={publish}>{workflow?.status === 'published' ? 'Update live' : 'Go live'}</Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="w-48 flex-shrink-0 rounded-xl border border-slate-200 bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Add step</p>
          {nodeTypesList.map((n) => (
            <button
              key={n.type}
              onClick={() => addNode(n.type)}
              className="mb-2 flex w-full items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
            >
              <span className={`h-2 w-2 rounded-full ${n.color}`} />
              {n.label}
            </button>
          ))}
        </div>

        <div className="flex-1 rounded-xl border border-slate-200 bg-white">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        <div className="w-72 flex-shrink-0 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 font-semibold">Step settings</h3>
          {renderNodeSettings()}
        </div>
      </div>
    </div>
  );
}
