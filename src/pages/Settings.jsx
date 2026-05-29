import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../services/api';
import { useSelector } from 'react-redux';

export default function Settings() {
  const user = useSelector((state) => state.auth.user);
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [password, setPassword] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [whatsapp, setWhatsapp] = useState({});
  const [integrations, setIntegrations] = useState({});
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProfile({ name: user?.name || '', email: user?.email || '' });
    api.get('/whatsapp').then((r) => {
      setWhatsapp(r.data.account || {});
      setWebhookUrl(r.data.webhook_url || '');
    });
    api.get('/settings/integrations').then((r) => setIntegrations(r.data));
  }, [user]);

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
      toast.success('WhatsApp credentials saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const testWhatsapp = async () => {
    try {
      const { data } = await api.post('/whatsapp/test');
      if (data.success) toast.success('Connection successful!');
      else toast.error(data.message || 'Connection failed');
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
      toast.success('AI settings saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'ai', label: 'AI Settings' },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
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
            <Button onClick={saveProfile} loading={loading}>Save Profile</Button>
          </div>
        </Card>
      )}

      {tab === 'password' && (
        <Card>
          <div className="space-y-4">
            <Input label="Current Password" type="password" value={password.current_password} onChange={(e) => setPassword({ ...password, current_password: e.target.value })} />
            <Input label="New Password" type="password" value={password.password} onChange={(e) => setPassword({ ...password, password: e.target.value })} />
            <Input label="Confirm Password" type="password" value={password.password_confirmation} onChange={(e) => setPassword({ ...password, password_confirmation: e.target.value })} />
            <Button onClick={savePassword} loading={loading}>Update Password</Button>
          </div>
        </Card>
      )}

      {tab === 'whatsapp' && (
        <Card>
          <div className="space-y-4">
            <div className={`rounded-lg p-3 text-sm ${whatsapp.is_connected ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
              Status: {whatsapp.is_connected ? 'Connected' : 'Not connected'}
              {whatsapp.display_phone_number && ` — ${whatsapp.display_phone_number}`}
            </div>
            <Input label="Access Token" type="password" placeholder={whatsapp.has_access_token ? '••••••••' : ''} onChange={(e) => setWhatsapp({ ...whatsapp, access_token: e.target.value })} />
            <Input label="Phone Number ID" value={whatsapp.phone_number_id || ''} onChange={(e) => setWhatsapp({ ...whatsapp, phone_number_id: e.target.value })} />
            <Input label="Business Account ID" value={whatsapp.business_account_id || ''} onChange={(e) => setWhatsapp({ ...whatsapp, business_account_id: e.target.value })} />
            <Input label="Verify Token" type="password" placeholder={whatsapp.has_verify_token ? '••••••••' : ''} onChange={(e) => setWhatsapp({ ...whatsapp, verify_token: e.target.value })} />
            <Input label="App Secret" type="password" placeholder={whatsapp.has_app_secret ? '••••••••' : 'For webhook signature verification'} onChange={(e) => setWhatsapp({ ...whatsapp, app_secret: e.target.value })} />
            <div>
              <label className="text-sm font-medium text-slate-700">Webhook URL</label>
              <p className="mt-1 rounded-lg bg-slate-50 p-2 text-xs font-mono break-all">{webhookUrl}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveWhatsapp} loading={loading}>Save</Button>
              <Button variant="secondary" onClick={testWhatsapp}>Test Connection</Button>
              {whatsapp.is_connected && <Button variant="danger" onClick={disconnectWhatsapp}>Disconnect</Button>}
            </div>
          </div>
        </Card>
      )}

      {tab === 'ai' && (
        <Card>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Provider</label>
              <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={integrations.ai_provider || 'openrouter'} onChange={(e) => setIntegrations({ ...integrations, ai_provider: e.target.value })}>
                <option value="openrouter">OpenRouter</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>
            <Input label="Model" value={integrations.ai_model || 'openai/gpt-4o-mini'} onChange={(e) => setIntegrations({ ...integrations, ai_model: e.target.value })} />
            <Input label="OpenRouter API Key" type="password" placeholder={integrations.has_openrouter_key ? '••••••••' : ''} onChange={(e) => setIntegrations({ ...integrations, openrouter_api_key: e.target.value })} />
            <Input label="OpenAI API Key" type="password" placeholder={integrations.has_openai_key ? '••••••••' : ''} onChange={(e) => setIntegrations({ ...integrations, openai_api_key: e.target.value })} />
            <Button onClick={saveIntegrations} loading={loading}>Save AI Settings</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
