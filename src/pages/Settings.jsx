import { useEffect, useState } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { Copy, ExternalLink, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import PlanBillingTab from '../components/billing/PlanBillingTab';
import api from '../services/api';
import { useSelector } from 'react-redux';

const VALID_TABS = ['profile', 'password', 'billing', 'whatsapp', 'ai'];

const META_CONSOLE = 'https://developers.facebook.com/apps';

function StepBadge({ n, done }) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        done ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {done ? <CheckCircle2 size={16} /> : n}
    </span>
  );
}

export default function Settings() {
  const user = useSelector((state) => state.auth.user);
  const { billing, refreshBilling } = useOutletContext() ?? {};
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = VALID_TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'profile';
  const [tab, setTab] = useState(initialTab);
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [password, setPassword] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [whatsapp, setWhatsapp] = useState({});
  const [integrations, setIntegrations] = useState({});
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && VALID_TABS.includes(urlTab)) setTab(urlTab);
  }, [searchParams]);

  const selectTab = (id) => {
    setTab(id);
    setSearchParams(id === 'profile' ? {} : { tab: id }, { replace: true });
  };

  useEffect(() => {
    setProfile({ name: user?.name || '', email: user?.email || '' });
    api.get('/whatsapp').then((r) => {
      setWhatsapp(r.data.account || {});
      setWebhookUrl(r.data.webhook_url || '');
    });
    api.get('/settings/integrations').then((r) => setIntegrations(r.data));
  }, [user]);

  const copyWebhook = () => {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    toast.success('Link copied — paste in Meta Developer Console');
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      await api.put('/settings/profile', profile);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async () => {
    setLoading(true);
    try {
      await api.put('/settings/password', password);
      toast.success('Password updated');
      setPassword({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const saveWhatsapp = async () => {
    setLoading(true);
    try {
      await api.put('/whatsapp', whatsapp);
      toast.success('Saved! Now click Test connection below.');
    } catch {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const testWhatsapp = async () => {
    try {
      const { data } = await api.post('/whatsapp/test');
      if (data.success) toast.success('Connected! You can go live on your auto-replies.');
      else toast.error(data.message || 'Connection failed — check your credentials');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Test failed');
    }
  };

  const disconnectWhatsapp = async () => {
    await api.post('/whatsapp/disconnect');
    toast.success('Disconnected');
    setWhatsapp({ ...whatsapp, is_connected: false });
  };

  const saveIntegrations = async () => {
    setLoading(true);
    try {
      await api.put('/settings/integrations', integrations);
      toast.success('Smart reply settings saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'billing', label: 'Plan & billing' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'ai', label: 'Smart replies (AI)' },
  ];

  const hasToken = whatsapp.has_access_token || whatsapp.access_token;
  const hasPhoneId = !!whatsapp.phone_number_id;
  const hasWebhook = !!webhookUrl;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Connect WhatsApp and customize smart replies</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === t.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <Card>
          <div className="space-y-4">
            <Input label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <Input label="Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            <Button onClick={saveProfile} loading={loading}>Save profile</Button>
          </div>
        </Card>
      )}

      {tab === 'password' && (
        <Card>
          <div className="space-y-4">
            <Input label="Current password" type="password" value={password.current_password} onChange={(e) => setPassword({ ...password, current_password: e.target.value })} />
            <Input label="New password" type="password" value={password.password} onChange={(e) => setPassword({ ...password, password: e.target.value })} />
            <Input label="Confirm password" type="password" value={password.password_confirmation} onChange={(e) => setPassword({ ...password, password_confirmation: e.target.value })} />
            <Button onClick={savePassword} loading={loading}>Update password</Button>
          </div>
        </Card>
      )}

      {tab === 'billing' && (
        <PlanBillingTab billing={billing} onStatusChange={() => refreshBilling?.()} />
      )}

      {tab === 'whatsapp' && (
        <div className="space-y-4">
          <div
            className={`rounded-xl border p-4 ${
              whatsapp.is_connected ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
            }`}
          >
            <p className={`text-sm font-medium ${whatsapp.is_connected ? 'text-emerald-800' : 'text-amber-900'}`}>
              {whatsapp.is_connected ? 'WhatsApp connected' : 'WhatsApp not connected yet'}
            </p>
            {whatsapp.display_phone_number && (
              <p className="mt-1 text-sm text-emerald-700">{whatsapp.display_phone_number}</p>
            )}
            <p className="mt-2 text-xs text-slate-600">
              Your phone number stays the same. We only read and reply to messages — nothing sends until you go live.
            </p>
          </div>

          <Card>
            <div className="space-y-6">
              <div className="flex gap-3">
                <StepBadge n={1} done />
                <div>
                  <p className="text-sm font-medium text-slate-900">Open Meta Developer Console</p>
                  <p className="mt-1 text-xs text-slate-500">Create or open your WhatsApp Business app.</p>
                  <a
                    href={META_CONSOLE}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
                  >
                    Open Meta Console <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <StepBadge n={2} done={!!hasToken} />
                <div className="flex-1 space-y-3">
                  <p className="text-sm font-medium text-slate-900">Paste your credentials</p>
                  <p className="text-xs text-slate-500">From Meta → WhatsApp → API Setup</p>
                  <Input label="Access Token" type="password" placeholder={whatsapp.has_access_token ? '••••••••' : 'Permanent token from Meta'} onChange={(e) => setWhatsapp({ ...whatsapp, access_token: e.target.value })} />
                  <Input label="Phone Number ID" value={whatsapp.phone_number_id || ''} onChange={(e) => setWhatsapp({ ...whatsapp, phone_number_id: e.target.value })} />
                  <Input label="Business Account ID" value={whatsapp.business_account_id || ''} onChange={(e) => setWhatsapp({ ...whatsapp, business_account_id: e.target.value })} />
                  <Input label="Verify Token" type="password" placeholder={whatsapp.has_verify_token ? '••••••••' : 'Any secret word you choose'} onChange={(e) => setWhatsapp({ ...whatsapp, verify_token: e.target.value })} />
                  <Input label="App Secret" type="password" placeholder={whatsapp.has_app_secret ? '••••••••' : 'From Meta app settings'} onChange={(e) => setWhatsapp({ ...whatsapp, app_secret: e.target.value })} />
                  <Button onClick={saveWhatsapp} loading={loading}>Save credentials</Button>
                </div>
              </div>

              <div className="flex gap-3">
                <StepBadge n={3} done={hasWebhook && hasPhoneId} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Add webhook in Meta</p>
                  <p className="mt-1 text-xs text-slate-500">
                    In Meta → WhatsApp → Configuration, paste this URL as Callback URL. Use the same Verify Token you entered above.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <p className="flex-1 rounded-lg bg-slate-50 p-3 text-xs font-mono break-all">{webhookUrl || '—'}</p>
                    {webhookUrl && (
                      <button type="button" onClick={copyWebhook} className="rounded-lg border border-slate-200 px-3 text-slate-600 hover:bg-slate-50" title="Copy">
                        <Copy size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <StepBadge n={4} done={whatsapp.is_connected} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Test connection</p>
                  <p className="mt-1 text-xs text-slate-500">Confirms Meta can reach your account.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={testWhatsapp}>Test connection</Button>
                    {whatsapp.is_connected && (
                      <Button variant="danger" onClick={disconnectWhatsapp}>Disconnect</Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <p className="text-center text-xs text-slate-400">
            Stuck? Search YouTube for &quot;Meta WhatsApp Cloud API setup&quot; — takes about 10 minutes.
          </p>
        </div>
      )}

      {tab === 'ai' && (
        <Card>
          <p className="mb-4 text-sm text-slate-600">
            Optional — only needed if your auto-replies use smart AI replies. You can skip this and still use template bots.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Provider</label>
              <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={integrations.ai_provider || 'openrouter'} onChange={(e) => setIntegrations({ ...integrations, ai_provider: e.target.value })}>
                <option value="openrouter">OpenRouter (recommended)</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>
            <Input label="Model" value={integrations.ai_model || 'openai/gpt-4o-mini'} onChange={(e) => setIntegrations({ ...integrations, ai_model: e.target.value })} />
            <Input label="OpenRouter API Key" type="password" placeholder={integrations.has_openrouter_key ? '••••••••' : 'sk-or-...'} onChange={(e) => setIntegrations({ ...integrations, openrouter_api_key: e.target.value })} />
            <Input label="OpenAI API Key" type="password" placeholder={integrations.has_openai_key ? '••••••••' : 'sk-...'} onChange={(e) => setIntegrations({ ...integrations, openai_api_key: e.target.value })} />
            <Button onClick={saveIntegrations} loading={loading}>Save smart reply settings</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
