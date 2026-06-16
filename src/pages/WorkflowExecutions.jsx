import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { History } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import Pagination from '../components/ui/Pagination';
import api from '../services/api';

const PAGE_SIZE = 10;

export default function WorkflowExecutions() {
  const { id } = useParams();
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPage(1);
    api
      .get(`/workflows/${id}/executions`)
      .then((r) => setExecutions(r.data.data || []))
      .catch((err) => {
        const message = err.response?.data?.message || 'Could not load execution logs';
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const pagedExecutions = executions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Automation"
        title="Execution logs"
        description="Step-by-step trace when this auto-reply runs"
        action={
          <div className="flex flex-wrap gap-2">
            <Link to={`/workflows/${id}/edit`}>
              <Button variant="secondary">Edit auto-reply</Button>
            </Link>
            <Link to="/workflows">
              <Button variant="secondary">← All auto-replies</Button>
            </Link>
          </div>
        }
      />
      <Card>
        {loading ? (
          <p className="text-sm text-slate-500">Loading execution logs…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : executions.length === 0 ? (
          <div className="text-center py-6">
            <History className="mx-auto mb-2 text-slate-300" size={32} />
            <p className="text-sm text-slate-500">No executions yet.</p>
            <p className="mt-1 text-xs text-slate-400">Logs appear when customers trigger this auto-reply.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {pagedExecutions.map((ex) => (
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
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              totalItems={executions.length}
              onPageChange={setPage}
              itemLabel="execution"
            />
          </>
        )}
      </Card>
    </div>
  );
}
