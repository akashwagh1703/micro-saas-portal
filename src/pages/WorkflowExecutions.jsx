import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import api from '../services/api';

export default function WorkflowExecutions() {
  const { id } = useParams();
  const [executions, setExecutions] = useState([]);

  useEffect(() => {
    api.get(`/workflows/${id}/executions`).then((r) => setExecutions(r.data.data || []));
  }, [id]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Automation"
        title="Execution logs"
        action={<Link to="/workflows"><Button variant="secondary">← Back</Button></Link>}
      />
      <Card>
        {executions.length === 0 ? (
          <p className="text-sm text-slate-500">No executions yet.</p>
        ) : (
          <div className="space-y-4">
            {executions.map((ex) => (
              <div key={ex.id} className="rounded-lg border border-slate-100 p-4">
                <div className="flex justify-between mb-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    ex.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                    ex.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                  }`}>{ex.status}</span>
                  <span className="text-xs text-slate-400">{new Date(ex.created_at).toLocaleString()}</span>
                </div>
                {ex.error_message && <p className="text-sm text-red-600 mb-2">{ex.error_message}</p>}
                <div className="space-y-1">
                  {(ex.logs || []).map((log) => (
                    <div key={log.id} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="font-mono">{log.node_type}</span>
                      <span className={`rounded px-1 ${log.status === 'completed' ? 'bg-emerald-50' : 'bg-red-50'}`}>{log.status}</span>
                      {log.duration_ms && <span>{log.duration_ms}ms</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
