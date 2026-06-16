import { useEffect, useState } from 'react';
import { KeyRound, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import api from '../../services/api';

const AUTH_TYPES = [
  { value: 'bearer', label: 'Bearer token' },
  { value: 'header', label: 'Custom header' },
  { value: 'api_key', label: 'X-Api-Key' },
  { value: 'basic', label: 'Basic (user:pass)' },
];

export default function IntegrationCredentialsPanel() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    label: '',
    auth_type: 'bearer',
    header_name: '',
    secret: '',
  });

  const load = () => {
    setLoading(true);
    api
      .get('/integrations/credentials')
      .then((r) => setCredentials(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Could not load credentials'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.secret.trim()) {
      toast.error('Name and secret are required');
      return;
    }
    setSaving(true);
    try {
      await api.post('/integrations/credentials', {
        name: form.name.trim(),
        label: form.label.trim() || undefined,
        auth_type: form.auth_type,
        header_name: form.header_name.trim() || undefined,
        secret: form.secret,
      });
      toast.success('Credential saved');
      setForm({ name: '', label: '', auth_type: 'bearer', header_name: '', secret: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (name) => {
    if (!window.confirm(`Delete credential "${name}"?`)) return;
    try {
      await api.delete(`/integrations/credentials/${encodeURIComponent(name)}`);
      toast.success('Credential deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start gap-3">
          <KeyRound className="mt-0.5 text-emerald-600" size={20} />
          <div>
            <h2 className="font-semibold text-slate-900">Integration credentials</h2>
            <p className="mt-1 text-sm text-slate-600">
              Store API keys encrypted on the server. Reference them in workflow API nodes as{' '}
              <code className="rounded bg-slate-100 px-1 text-xs">{`{{vault:my_key}}`}</code> or pick an{' '}
              <strong>Auth credential</strong> on the API step.
            </p>
          </div>
        </div>
      </Card>

      <Card title="Add or update credential">
        <form className="space-y-3" onSubmit={save}>
          <Input
            label="Name (slug)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="shopify_token"
          />
          <Input
            label="Label (optional)"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Shopify admin API"
          />
          <div>
            <label className="text-sm font-medium text-slate-700">Auth type</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.auth_type}
              onChange={(e) => setForm({ ...form, auth_type: e.target.value })}
            >
              {AUTH_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {form.auth_type === 'header' && (
            <Input
              label="Header name"
              value={form.header_name}
              onChange={(e) => setForm({ ...form, header_name: e.target.value })}
              placeholder="X-Shopify-Access-Token"
            />
          )}
          <Input
            label="Secret"
            type="password"
            value={form.secret}
            onChange={(e) => setForm({ ...form, secret: e.target.value })}
            placeholder="Paste token or user:password for basic auth"
          />
          <Button type="submit" loading={saving}>Save credential</Button>
        </form>
      </Card>

      <Card title="Saved credentials">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : credentials.length === 0 ? (
          <p className="text-sm text-slate-500">No credentials yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {credentials.map((cred) => (
              <li key={cred.name} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-slate-900">{cred.label || cred.name}</p>
                  <p className="text-xs text-slate-500">
                    <code>{cred.name}</code> · {cred.auth_type}
                  </p>
                </div>
                <Button variant="danger" className="!px-2" onClick={() => remove(cred.name)} title="Delete">
                  <Trash2 size={14} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
