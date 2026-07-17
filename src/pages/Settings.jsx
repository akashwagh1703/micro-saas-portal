import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useOutletContext, Link } from 'react-router-dom';
import { Copy, ExternalLink, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import PlanBillingTab from '../components/billing/PlanBillingTab';
import IntegrationCredentialsPanel from '../components/integrations/IntegrationCredentialsPanel';
import BusinessTypeCard from '../components/BusinessTypeCard';
import SalonServicesCard from '../components/SalonServicesCard';
import BusinessDetailsCard from '../components/BusinessDetailsCard';
import WelcomeImageCard from '../components/WelcomeImageCard';
import api from '../services/api';
import { useSelector } from 'react-redux';

const VALID_TABS = ['profile', 'password', 'billing', 'credentials', 'whatsapp', 'instagram', 'ai', 'career', 'appointment'];

const CAREER_FIELD_RULES = {
  jsearch_max_pages: { pattern: /^[1-3]$/, message: 'Enter 1, 2, or 3' },
  seeker_trial_days: { pattern: /^([1-9]|[1-8][0-9]|90)$/, message: 'Enter a whole number from 1 to 90' },
  seeker_price_monthly_inr: { pattern: /^[1-9]\d{0,7}$/, message: 'Enter a valid whole number (INR)' },
  seeker_price_yearly_inr: { pattern: /^[1-9]\d{0,7}$/, message: 'Enter a valid whole number (INR)' },
  razorpay_key_id: { pattern: /^rzp_(live|test)_[A-Za-z0-9]+$/, message: 'Format: rzp_test_... or rzp_live_...' },
  razorpay_plan_seeker_monthly: { pattern: /^plan_[A-Za-z0-9]+$/, message: 'Format: plan_...' },
  razorpay_plan_seeker_yearly: { pattern: /^plan_[A-Za-z0-9]+$/, message: 'Format: plan_...' },
};

function validateCareerFields(form) {
  const errors = {};
  for (const [field, rule] of Object.entries(CAREER_FIELD_RULES)) {
    if (!(field in form)) continue;
    const val = String(form[field] ?? '').trim();
    if (!val) continue;
    if (!rule.pattern.test(val)) {
      errors[field] = rule.message;
    }
  }
  if ('jsearch_default_country' in form) {
    const cc = String(form.jsearch_default_country ?? '').trim();
    if (cc && !/^[a-z]{2}$/i.test(cc)) {
      errors.jsearch_default_country = 'Use a 2-letter country code (e.g. in)';
    }
  }
  return errors;
}

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
  const { billing, refreshBilling, refreshBusinessProfile, isCareerAi } = useOutletContext() ?? {};
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = VALID_TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'profile';
  const [tab, setTab] = useState(initialTab);
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [password, setPassword] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [whatsapp, setWhatsapp] = useState({});
  const [instagram, setInstagram] = useState({});
  const [igSetup, setIgSetup] = useState(null);
  const [integrations, setIntegrations] = useState({});
  const [careerSettings, setCareerSettings] = useState({
    job_sources: {},
    seeker_billing: {},
  });
  const [careerForm, setCareerForm] = useState({});
  const [careerErrors, setCareerErrors] = useState({});
  const [webhookUrl, setWebhookUrl] = useState('');
  const [igWebhookUrl, setIgWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [businessCategory, setBusinessCategory] = useState(null);

  const loadBusinessProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/settings/business-profile');
      setBusinessCategory(data?.business_category ?? null);
    } catch {
      setBusinessCategory(null);
    }
  }, []);

  const showCareerTab = businessCategory === 'career_ai' || isCareerAi === true;
  const showAppointmentTab =
    businessCategory === 'salon' ||
    businessCategory === 'sports_turf' ||
    businessCategory === 'clinic' ||
    businessCategory === 'coaching' ||
    businessCategory === 'real_estate' ||
    businessCategory === 'ca_accountant' ||
    businessCategory === 'travel';

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
    loadBusinessProfile();
    api.get('/whatsapp').then((r) => {
      setWhatsapp(r.data.account || {});
      setWebhookUrl(r.data.webhook_url || '');
    });
    api.get('/instagram').then((r) => {
      setInstagram(r.data.account || {});
      setIgWebhookUrl(r.data.webhook_url || '');
      setIgSetup(r.data.setup || null);
    }).catch(() => {});
    api.get('/settings/integrations').then((r) => setIntegrations(r.data));
    if (showCareerTab) {
      api.get('/career/settings').then((r) => {
        setCareerSettings(r.data);
        setCareerForm({});
      }).catch(() => {});
    }
  }, [user, showCareerTab, loadBusinessProfile]);

  const copyWebhook = () => {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    toast.success('Link copied — paste in Meta Developer Console');
  };

  const copyIgWebhook = () => {
    if (!igWebhookUrl) return;
    navigator.clipboard.writeText(igWebhookUrl);
    toast.success('Instagram webhook copied');
  };

  const copyCareerRazorpayWebhook = () => {
    const url = careerSettings.seeker_billing?.razorpay_webhook_url;
    if (!url) return;
    navigator.clipboard.writeText(url);
    toast.success('Razorpay webhook URL copied');
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
    try {
      await api.post('/whatsapp/disconnect');
      toast.success('Disconnected');
      setWhatsapp({ ...whatsapp, is_connected: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Disconnect failed');
    }
  };

  const saveInstagram = async () => {
    setLoading(true);
    try {
      await api.put('/instagram', instagram);
      toast.success('Saved! Now click Test connection below.');
      const { data } = await api.get('/instagram');
      setInstagram((prev) => ({ ...prev, ...data.account, webhook_url: data.webhook_url }));
    } catch {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const testInstagram = async () => {
    try {
      if (instagram.access_token || instagram.page_id || instagram.verify_token || instagram.app_secret) {
        await api.put('/instagram', instagram);
      }
      const { data } = await api.post('/instagram/test');
      if (data.success) {
        toast.success(`Connected${data.data?.username ? ` as @${data.data.username}` : ''}!`);
        setInstagram((prev) => ({
          ...prev,
          is_connected: true,
          username: data.data?.username ?? prev.username,
          instagram_user_id: data.data?.instagram_user_id ?? prev.instagram_user_id,
          display_name: data.data?.display_name ?? prev.display_name,
        }));
      } else {
        toast.error(data.message || 'Connection failed — check your credentials');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Test failed');
    }
  };

  const disconnectInstagram = async () => {
    try {
      await api.post('/instagram/disconnect');
      toast.success('Instagram disconnected');
      setInstagram({ ...instagram, is_connected: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Disconnect failed');
    }
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

  const patchCareerField = (field, value) => {
    setCareerForm((prev) => ({ ...prev, [field]: value }));
    setCareerErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const saveCareerSettings = async () => {
    if (Object.keys(careerForm).length === 0) {
      toast.success('Nothing to save');
      return;
    }
    const errors = validateCareerFields(careerForm);
    if (Object.keys(errors).length > 0) {
      setCareerErrors(errors);
      toast.error('Fix the highlighted fields before saving');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.patch('/career/settings', careerForm);
      setCareerSettings(data);
      setCareerForm({});
      setCareerErrors({});
      toast.success('CareerAI settings saved');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors && typeof apiErrors === 'object') {
        const mapped = {};
        for (const [key, msgs] of Object.entries(apiErrors)) {
          mapped[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
        }
        setCareerErrors(mapped);
      }
      toast.error(err.response?.data?.message || 'Failed to save CareerAI settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'billing', label: 'Plan & billing' },
    { id: 'credentials', label: 'Integrations' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'ai', label: 'Smart replies (AI)' },
    ...(showAppointmentTab ? [{ id: 'appointment', label: 'Booking & business' }] : []),
    ...(showCareerTab ? [{ id: 'career', label: 'CareerAI' }] : []),
  ];

  const hasToken = whatsapp.has_access_token || whatsapp.access_token;
  const hasPhoneId = !!whatsapp.phone_number_id;
  const hasWebhook = !!webhookUrl;

  const hasIgToken = instagram.has_access_token || instagram.access_token;
  const hasIgPageId = !!instagram.page_id;
  const hasIgWebhook = !!igWebhookUrl;
  const igHandle = instagram.username ? `@${instagram.username.replace(/^@/, '')}` : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description={
          showCareerTab
            ? 'Connect WhatsApp, job sources, seeker billing, and smart replies'
            : 'Connect WhatsApp, Instagram, and customize smart replies'
        }
      />

      <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className={`tab-pill ${tab === t.id ? 'tab-pill-active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="space-y-4">
          <Card>
            <div className="space-y-4">
              <Input label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              <Input label="Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              <Button onClick={saveProfile} loading={loading}>Save profile</Button>
            </div>
          </Card>
          <BusinessTypeCard
            onChanged={() => {
              refreshBusinessProfile?.();
              loadBusinessProfile();
            }}
          />
        </div>
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

      {tab === 'credentials' && !isCareerAi && (
        <IntegrationCredentialsPanel />
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

      {tab === 'instagram' && (
        <div className="space-y-4">
          <div
            className={`rounded-xl border p-4 ${
              instagram.is_connected ? 'border-pink-200 bg-pink-50' : 'border-amber-200 bg-amber-50'
            }`}
          >
            <p className={`text-sm font-medium ${instagram.is_connected ? 'text-pink-900' : 'text-amber-900'}`}>
              {instagram.is_connected ? 'Instagram connected' : 'Instagram not connected yet'}
            </p>
            {igHandle && <p className="mt-1 text-sm text-pink-800">{igHandle}</p>}
            <p className="mt-2 text-xs text-slate-600">
              Auto-reply to Instagram DMs from the same dashboard. Replies must be sent within
              {' '}<strong>24 hours</strong> of the customer&apos;s last message (Meta policy).
            </p>
          </div>

          {igSetup && (
            <Card title="Before you start (Meta setup)">
              <p className="mb-3 text-sm text-slate-600">{igSetup.summary}</p>
              <ul className="mb-4 space-y-2">
                {igSetup.steps?.slice(0, 3).map((step) => (
                  <li key={step.id} className="flex gap-2 text-xs text-slate-600">
                    <span className="font-medium text-slate-800">{step.title}:</span>
                    {step.description}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <a
                  href={igSetup.meta_console_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-pink-700 hover:underline"
                >
                  Meta Developer Console <ExternalLink size={14} />
                </a>
                <a
                  href={igSetup.meta_business_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-pink-700 hover:underline"
                >
                  Business Suite <ExternalLink size={14} />
                </a>
              </div>
              {igSetup.required_permissions?.length > 0 && (
                <p className="mt-3 text-[11px] text-slate-500">
                  Permissions: {igSetup.required_permissions.join(', ')}
                </p>
              )}
            </Card>
          )}

          <Card>
            <div className="space-y-6">
              <div className="flex gap-3">
                <StepBadge n={1} done />
                <div>
                  <p className="text-sm font-medium text-slate-900">Link Instagram to your Facebook Page</p>
                  <p className="mt-1 text-xs text-slate-500">Business or Creator account required.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <StepBadge n={2} done={!!hasIgToken && hasIgPageId} />
                <div className="flex-1 space-y-3">
                  <p className="text-sm font-medium text-slate-900">Paste Page credentials</p>
                  <p className="text-xs text-slate-500">Page access token + Page ID from Meta Graph API / Business Suite</p>
                  <p className="text-[11px] text-amber-700">
                    Use a long-lived <strong>Page</strong> access token (not User or App token). Paste only the token — no &quot;Bearer&quot; prefix.
                  </p>
                  <Input
                    label="Page Access Token"
                    type="password"
                    placeholder={instagram.has_access_token ? '••••••••' : 'Long-lived Page token'}
                    onChange={(e) => setInstagram({ ...instagram, access_token: e.target.value })}
                  />
                  <Input
                    label="Facebook Page ID"
                    value={instagram.page_id || ''}
                    onChange={(e) => setInstagram({ ...instagram, page_id: e.target.value })}
                    placeholder="Numeric Facebook Page ID (not Instagram ID)"
                  />
                  <p className="text-[11px] text-slate-500">
                    Find in Page Settings → About, or Graph API Explorer when you select your Page. Optional if your Page token is correct — Test can auto-detect the Page.
                  </p>
                  <Input
                    label="Verify Token"
                    type="password"
                    placeholder={instagram.has_verify_token ? '••••••••' : 'Any secret word you choose'}
                    onChange={(e) => setInstagram({ ...instagram, verify_token: e.target.value })}
                  />
                  <Input
                    label="App Secret"
                    type="password"
                    placeholder={instagram.has_app_secret ? '••••••••' : 'From Meta app settings'}
                    onChange={(e) => setInstagram({ ...instagram, app_secret: e.target.value })}
                  />
                  <Button onClick={saveInstagram} loading={loading}>Save credentials</Button>
                </div>
              </div>

              <div className="flex gap-3">
                <StepBadge n={3} done={hasIgWebhook && hasIgPageId} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Add webhook in Meta</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Instagram / Messenger webhooks for your Page. Same verify token as above. Subscribe to messages.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <p className="flex-1 rounded-lg bg-slate-50 p-3 text-xs font-mono break-all">{igWebhookUrl || '—'}</p>
                    {igWebhookUrl && (
                      <button type="button" onClick={copyIgWebhook} className="rounded-lg border border-slate-200 px-3 text-slate-600 hover:bg-slate-50" title="Copy">
                        <Copy size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <StepBadge n={4} done={instagram.is_connected} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Test connection</p>
                  <p className="mt-1 text-xs text-slate-500">Loads your @username and Instagram business account ID.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={testInstagram}>Test connection</Button>
                    {instagram.is_connected && (
                      <Button variant="danger" onClick={disconnectInstagram}>Disconnect</Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {igSetup?.app_review_note && (
            <p className="text-center text-xs text-slate-400">{igSetup.app_review_note}</p>
          )}
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

      {tab === 'appointment' && showAppointmentTab && (
        <div className="space-y-6">
          <BusinessDetailsCard />
          <WelcomeImageCard />
          <SalonServicesCard />
        </div>
      )}

      {tab === 'career' && showCareerTab && (
        <div className="space-y-4">
          <Card title="Job sources">
            <p className="mb-4 text-sm text-slate-600">
              Connect Adzuna and/or JSearch for your candidates. Keys are stored per account — same as WhatsApp credentials.
            </p>
            <div className="space-y-4">
              <Input
                label="Adzuna App ID"
                value={careerForm.adzuna_app_id ?? careerSettings.job_sources?.adzuna_app_id ?? ''}
                onChange={(e) => patchCareerField('adzuna_app_id', e.target.value)}
              />
              <Input
                label="Adzuna App Key"
                type="password"
                placeholder={careerSettings.job_sources?.has_adzuna_app_key ? '••••••••' : 'From developer.adzuna.com'}
                onChange={(e) => patchCareerField('adzuna_app_key', e.target.value)}
              />
              <Input
                label="JSearch RapidAPI Key"
                type="password"
                placeholder={careerSettings.job_sources?.has_jsearch_rapidapi_key ? '••••••••' : 'From RapidAPI JSearch'}
                onChange={(e) => patchCareerField('jsearch_rapidapi_key', e.target.value)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="JSearch country code"
                  value={careerForm.jsearch_default_country ?? careerSettings.job_sources?.jsearch_default_country ?? 'in'}
                  onChange={(e) => patchCareerField('jsearch_default_country', e.target.value)}
                  error={careerErrors.jsearch_default_country}
                  placeholder="in"
                  autoComplete="off"
                />
                <Input
                  label="JSearch max pages (1–3)"
                  type="text"
                  inputMode="numeric"
                  value={
                    careerForm.jsearch_max_pages !== undefined
                      ? careerForm.jsearch_max_pages
                      : String(careerSettings.job_sources?.jsearch_max_pages ?? 1)
                  }
                  onChange={(e) => patchCareerField('jsearch_max_pages', e.target.value)}
                  error={careerErrors.jsearch_max_pages}
                  placeholder="1"
                  autoComplete="off"
                />
              </div>
              <Input
                label="LinkedIn jobs API URL (optional)"
                value={careerForm.linkedin_jobs_api_url ?? careerSettings.job_sources?.linkedin_jobs_api_url ?? ''}
                onChange={(e) => patchCareerField('linkedin_jobs_api_url', e.target.value)}
              />
              <Input
                label="LinkedIn jobs API key (optional)"
                type="password"
                placeholder={careerSettings.job_sources?.has_linkedin_jobs_api_key ? '••••••••' : 'Custom feed key'}
                onChange={(e) => patchCareerField('linkedin_jobs_api_key', e.target.value)}
              />
              <Input
                label="Naukri jobs API URL (optional)"
                value={careerForm.naukri_jobs_api_url ?? careerSettings.job_sources?.naukri_jobs_api_url ?? ''}
                onChange={(e) => patchCareerField('naukri_jobs_api_url', e.target.value)}
              />
              <Input
                label="Naukri jobs API key (optional)"
                type="password"
                placeholder={careerSettings.job_sources?.has_naukri_jobs_api_key ? '••••••••' : 'Custom feed key'}
                onChange={(e) => patchCareerField('naukri_jobs_api_key', e.target.value)}
              />
            </div>
          </Card>

          <Card title="Job seeker subscription">
            <p className="mb-4 text-sm text-slate-600">
              Charge candidates with your own Razorpay account. Create two seeker plans in Razorpay, then paste credentials and plan IDs below.
            </p>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={
                    careerForm.seeker_billing_enabled !== undefined
                      ? careerForm.seeker_billing_enabled
                      : !!careerSettings.seeker_billing?.enabled
                  }
                  onChange={(e) => patchCareerField('seeker_billing_enabled', e.target.checked)}
                />
                Enable job seeker billing (trial then paid)
              </label>

              <Input
                label="Razorpay Key ID"
                type="text"
                value={careerForm.razorpay_key_id ?? careerSettings.seeker_billing?.razorpay_key_id ?? ''}
                onChange={(e) => patchCareerField('razorpay_key_id', e.target.value.trim())}
                error={careerErrors.razorpay_key_id}
                placeholder="rzp_test_..."
                autoComplete="off"
              />
              <Input
                label="Razorpay Key Secret"
                type="password"
                placeholder={careerSettings.seeker_billing?.has_razorpay_key_secret ? '••••••••' : 'From Razorpay Dashboard → API Keys'}
                onChange={(e) => patchCareerField('razorpay_key_secret', e.target.value)}
                autoComplete="off"
              />
              <Input
                label="Razorpay Webhook Secret"
                type="password"
                placeholder={careerSettings.seeker_billing?.has_razorpay_webhook_secret ? '••••••••' : 'From Razorpay → Webhooks'}
                onChange={(e) => patchCareerField('razorpay_webhook_secret', e.target.value)}
                autoComplete="off"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">Razorpay webhook URL</p>
                <p className="mt-1 text-xs text-slate-500">
                  In Razorpay Dashboard → Webhooks, paste this URL. Use the same Webhook Secret you entered above.
                  Subscribe to subscription events (activated, charged, cancelled).
                </p>
                <div className="mt-3 flex gap-2">
                  <p className="flex-1 rounded-lg bg-slate-50 p-3 text-xs font-mono break-all">
                    {careerSettings.seeker_billing?.razorpay_webhook_url || '—'}
                  </p>
                  {careerSettings.seeker_billing?.razorpay_webhook_url && (
                    <button
                      type="button"
                      onClick={copyCareerRazorpayWebhook}
                      className="rounded-lg border border-slate-200 px-3 text-slate-600 hover:bg-slate-50"
                      title="Copy webhook URL"
                    >
                      <Copy size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Trial days"
                  type="text"
                  inputMode="numeric"
                  value={
                    careerForm.seeker_trial_days !== undefined
                      ? careerForm.seeker_trial_days
                      : String(careerSettings.seeker_billing?.trial_days ?? 14)
                  }
                  onChange={(e) => patchCareerField('seeker_trial_days', e.target.value)}
                  error={careerErrors.seeker_trial_days}
                  placeholder="14"
                  autoComplete="off"
                />
                <Input
                  label="Monthly price (₹)"
                  type="text"
                  inputMode="numeric"
                  value={
                    careerForm.seeker_price_monthly_inr !== undefined
                      ? careerForm.seeker_price_monthly_inr
                      : String(careerSettings.seeker_billing?.price_monthly_inr ?? 199)
                  }
                  onChange={(e) => patchCareerField('seeker_price_monthly_inr', e.target.value)}
                  error={careerErrors.seeker_price_monthly_inr}
                  placeholder="199"
                  autoComplete="off"
                />
                <Input
                  label="Yearly price (₹)"
                  type="text"
                  inputMode="numeric"
                  value={
                    careerForm.seeker_price_yearly_inr !== undefined
                      ? careerForm.seeker_price_yearly_inr
                      : String(careerSettings.seeker_billing?.price_yearly_inr ?? 1999)
                  }
                  onChange={(e) => patchCareerField('seeker_price_yearly_inr', e.target.value)}
                  error={careerErrors.seeker_price_yearly_inr}
                  placeholder="1999"
                  autoComplete="off"
                />
              </div>
              <Input
                label="Razorpay plan ID — monthly"
                type="text"
                value={careerForm.razorpay_plan_seeker_monthly ?? careerSettings.seeker_billing?.razorpay_plan_seeker_monthly ?? ''}
                onChange={(e) => patchCareerField('razorpay_plan_seeker_monthly', e.target.value.trim())}
                error={careerErrors.razorpay_plan_seeker_monthly}
                placeholder="plan_..."
                autoComplete="off"
              />
              <Input
                label="Razorpay plan ID — yearly"
                type="text"
                value={careerForm.razorpay_plan_seeker_yearly ?? careerSettings.seeker_billing?.razorpay_plan_seeker_yearly ?? ''}
                onChange={(e) => patchCareerField('razorpay_plan_seeker_yearly', e.target.value.trim())}
                error={careerErrors.razorpay_plan_seeker_yearly}
                placeholder="plan_..."
                autoComplete="off"
              />
              {!careerSettings.seeker_billing?.razorpay_configured && careerSettings.seeker_billing?.enabled && (
                <p className="text-xs text-amber-700">
                  Billing is enabled but Razorpay is incomplete — add Key ID, Secret, Webhook secret, and both plan IDs.
                </p>
              )}
            </div>
          </Card>

          <Button onClick={saveCareerSettings} loading={loading}>Save CareerAI settings</Button>
        </div>
      )}
    </div>
  );
}
