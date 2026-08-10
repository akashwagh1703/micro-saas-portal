import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Copy, ExternalLink, Globe2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SectionEditor from '../components/catalog/SectionEditor';
import ThemePanel from '../components/catalog/ThemePanel';
import PaymentSettingsPanel from '../components/catalog/PaymentSettingsPanel';
import WhatsAppShopSyncCard from '../components/catalog/WhatsAppShopSyncCard';
import { SECTION_META, SECTION_ORDER } from '../components/catalog/sectionConfig';
import {
  createCatalogSite,
  getCatalogSite,
  publishCatalog,
  slugifyBusinessName,
  unpublishCatalog,
  updateCatalogSite,
  updateCatalogSlug,
} from '../services/catalogApi';

function apiErrorMessage(err, fallback) {
  const raw = err?.response?.data?.message;
  if (typeof raw === 'string') return raw;
  if (raw && typeof raw === 'object' && typeof raw.message === 'string') return raw.message;
  return fallback;
}

export default function Website() {
  const navigate = useNavigate();
  const { billing, businessProfile } = useOutletContext() ?? {};
  const websiteBilling = billing?.website;
  const isCatalogBusiness = businessProfile?.business_category === 'catalog';
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('header');
  const [savingBasics, setSavingBasics] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Create form
  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);

  // Basics form (existing site)
  const [basics, setBasics] = useState({
    business_name: '',
    tagline: '',
    contact_phone: '',
    contact_whatsapp: '',
    contact_email: '',
    address: '',
    slug: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getCatalogSite();
      setSite(next);
      if (next) {
        setBasics({
          business_name: next.business_name || '',
          tagline: next.tagline || '',
          contact_phone: next.contact_phone || '',
          contact_whatsapp: next.contact_whatsapp || '',
          contact_email: next.contact_email || '',
          address: next.address || '',
          slug: next.slug || '',
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load website');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sectionsByType = useMemo(() => {
    const map = {};
    for (const s of site?.sections || []) {
      map[s.type] = s;
    }
    return map;
  }, [site]);

  const activeSection = sectionsByType[activeType] || null;

  const readiness = useMemo(() => {
    if (!site) return [];
    const about = (site.sections || []).find((s) => s.type === 'about');
    const aboutBody =
      about?.config && typeof about.config === 'object' ? String(about.config.body || '').trim() : '';
    const images = (site.media || []).filter((m) => m.kind === 'image');
    const products = site.products || [];
    return [
      { ok: !!(site.business_name || '').trim(), label: 'Business name' },
      { ok: !!(site.slug || '').trim(), label: 'Public URL slug' },
      { ok: !!aboutBody, label: 'About section text' },
      { ok: images.length > 0, label: 'At least one gallery photo' },
      { ok: products.length > 0, label: 'Products (optional)', optional: true },
      { ok: !!(site.contact_whatsapp || site.contact_phone), label: 'Phone or WhatsApp' },
    ];
  }, [site]);

  const onBusinessNameChange = (value) => {
    setBusinessName(value);
    if (!slugTouched) setSlug(slugifyBusinessName(value));
  };

  const createSite = async (e) => {
    e.preventDefault();
    if (!businessName.trim() || !slug.trim()) {
      toast.error('Business name and URL slug are required');
      return;
    }
    if (slug.trim().length < 3) {
      toast.error('Slug must be at least 3 characters');
      return;
    }
    setCreating(true);
    try {
      const created = await createCatalogSite({
        business_name: businessName.trim(),
        slug: slug.trim().toLowerCase(),
      });
      setSite(created);
      toast.success('Website created — configure sections below');
      setActiveType('header');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create website');
    } finally {
      setCreating(false);
    }
  };

  const saveBasics = async (e) => {
    e.preventDefault();
    const slugChanged =
      !!basics.slug.trim() && basics.slug.trim().toLowerCase() !== site.slug;
    if (slugChanged && site.status === 'published') {
      const ok = window.confirm(
        'Changing the slug breaks old WhatsApp / shared links. Customers with the previous URL will see “not found”. Continue?',
      );
      if (!ok) return;
    }
    setSavingBasics(true);
    try {
      let next = await updateCatalogSite({
        business_name: basics.business_name.trim(),
        tagline: basics.tagline.trim() || null,
        contact_phone: basics.contact_phone.trim() || null,
        contact_whatsapp: basics.contact_whatsapp.trim() || null,
        contact_email: basics.contact_email.trim() || null,
        address: basics.address.trim() || null,
      });
      if (slugChanged) {
        next = await updateCatalogSlug(basics.slug.trim().toLowerCase());
      }
      setSite(next);
      toast.success(slugChanged ? 'Saved — update any shared links to the new URL' : 'Site details saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save');
    } finally {
      setSavingBasics(false);
    }
  };

  const publishLocked =
    !!websiteBilling?.billing_enabled &&
    !websiteBilling?.has_access &&
    site?.status !== 'published';

  const togglePublish = async () => {
    if (site.status !== 'published' && publishLocked) {
      toast.error('Website publish needs the Website add-on. Open Plan & billing to subscribe.');
      return;
    }
    if (site.status !== 'published') {
      const about = (site.sections || []).find((s) => s.type === 'about');
      const aboutBody =
        about?.config && typeof about.config === 'object' ? String(about.config.body || '').trim() : '';
      const images = (site.media || []).filter((m) => m.kind === 'image');
      if (!aboutBody && images.length === 0) {
        const ok = window.confirm(
          'Your catalog has little content yet (no about text or photos). Publish anyway?',
        );
        if (!ok) return;
      }
    }
    setPublishing(true);
    try {
      const next =
        site.status === 'published' ? await unpublishCatalog() : await publishCatalog();
      setSite(next);
      toast.success(
        next.status === 'published'
          ? 'Published — WhatsApp will now share this link'
          : 'Unpublished — WhatsApp will stop sharing the public link',
      );
    } catch (err) {
      const body = err?.response?.data?.message;
      const code = typeof body === 'object' ? body?.code : err?.response?.data?.code;
      if (code === 'WEBSITE_REQUIRED' || code === 'website_payment_pending_verification') {
        toast.error(
          typeof body === 'object' && body?.message
            ? body.message
            : 'Website publish needs the Website add-on. Open Plan & billing to subscribe.',
        );
      } else {
        toast.error(apiErrorMessage(err, 'Publish failed'));
      }
    } finally {
      setPublishing(false);
    }
  };

  const copyUrl = async () => {
    if (!site?.public_url) return;
    try {
      await navigator.clipboard.writeText(site.public_url);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader eyebrow="Brochure" title="Website" description="Loading…" />
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <PageHeader
          eyebrow="Brochure"
          title="Website"
          description="Build a simple catalog page for WhatsApp customers — info, photos, and optional prices. No AutoWave branding on the public page."
        />
        <Card title="Create your catalog site" description="Pick a short URL slug customers can open from WhatsApp.">
          <form onSubmit={createSite} className="space-y-4">
            <Input
              label="Business name"
              value={businessName}
              onChange={(e) => onBusinessNameChange(e.target.value)}
              placeholder="Sunrise Salon"
              required
            />
            <Input
              label="Public URL slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugifyBusinessName(e.target.value));
              }}
              hint="Lowercase letters, numbers, hyphens. Example: sunrise-salon → /c/sunrise-salon"
              required
            />
            <Button type="submit" loading={creating}>
              <Globe2 size={16} />
              Create website
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Brochure"
        title="Website"
        description="Configure sections for your public catalog. Customers get a short link — no AutoWave branding."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                site.status === 'published'
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                  : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
              }`}
            >
              {site.status === 'published' ? 'Published' : 'Draft'}
            </span>
            {site.status === 'published' ? (
              <Button type="button" variant="secondary" loading={publishing} onClick={togglePublish}>
                Unpublish
              </Button>
            ) : publishLocked ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/settings?tab=billing')}
              >
                Unlock publish
              </Button>
            ) : (
              <Button type="button" variant="secondary" loading={publishing} onClick={togglePublish}>
                Publish
              </Button>
            )}
          </div>
        }
      />

      {publishLocked && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">
            {websiteBilling?.status === 'pending_verification'
              ? 'Website payment under review'
              : 'Website publish is locked'}
          </p>
          <p className="mt-1 text-amber-900/90">
            {websiteBilling?.status === 'pending_verification'
              ? 'You can keep editing your draft. Publish unlocks after we verify your UPI payment (usually within 24 hours).'
              : `You can keep editing your draft. To go live, subscribe to the Website add-on${
                  websiteBilling?.prices
                    ? ` (₹${websiteBilling.prices.monthly_inr}/mo or ₹${websiteBilling.prices.yearly_inr}/yr)`
                    : ''
                }.`}
          </p>
          <Link
            to="/settings?tab=billing"
            className="mt-2 inline-flex text-sm font-semibold text-emerald-800 underline-offset-2 hover:underline"
          >
            Open Plan &amp; billing →
          </Link>
        </div>
      )}

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 ring-1 ring-slate-200">
            {site.public_url}
          </code>
          <Button type="button" variant="secondary" className="!px-3" onClick={copyUrl}>
            <Copy size={14} />
            Copy
          </Button>
          {site.status === 'published' && (
            <a
              href={site.public_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <ExternalLink size={14} />
              Open
            </a>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {site.status === 'published'
            ? 'Live for customers and WhatsApp. No AutoWave branding on the public page.'
            : 'Draft — WhatsApp will not share this public link until you publish.'}
        </p>
      </Card>

      <Card
        title="WhatsApp readiness"
        description="When someone says Hi, the catalog bot pulls this content live from your website."
      >
        <ul className="space-y-2">
          {readiness.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                  item.ok
                    ? 'bg-emerald-50 text-emerald-700'
                    : item.optional
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-amber-50 text-amber-700'
                }`}
              >
                {item.ok ? '✓' : item.optional ? '–' : '!'}
              </span>
              <span className={item.ok ? 'text-slate-700' : 'text-slate-500'}>
                {item.label}
                {item.optional ? '' : item.ok ? '' : ' — recommended before publish'}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card
        title="Appearance"
        description="Light / dark mode and brand colors for the public catalog page."
      >
        <ThemePanel site={site} onChanged={load} />
      </Card>

      <Card
        title="Payment settings"
        description="Your business UPI QR for catalog WhatsApp orders — not AutoWave subscription billing."
      >
        <PaymentSettingsPanel site={site} onChanged={load} />
      </Card>

      <WhatsAppShopSyncCard visible={isCatalogBusiness} />

      <Card title="Site details" description="Shown across header, contact, and WhatsApp-facing copy.">
        <form onSubmit={saveBasics} className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Business name"
            value={basics.business_name}
            onChange={(e) => setBasics((b) => ({ ...b, business_name: e.target.value }))}
          />
          <Input
            label="URL slug"
            value={basics.slug}
            onChange={(e) => setBasics((b) => ({ ...b, slug: slugifyBusinessName(e.target.value) }))}
            hint={
              site.status === 'published'
                ? 'Changing this breaks old shared / WhatsApp links'
                : 'Becomes /c/your-slug on the public site'
            }
          />
          <div className="sm:col-span-2">
            <Input
              label="Tagline"
              value={basics.tagline}
              onChange={(e) => setBasics((b) => ({ ...b, tagline: e.target.value }))}
            />
          </div>
          <Input
            label="Phone"
            value={basics.contact_phone}
            onChange={(e) => setBasics((b) => ({ ...b, contact_phone: e.target.value }))}
          />
          <Input
            label="WhatsApp"
            value={basics.contact_whatsapp}
            onChange={(e) => setBasics((b) => ({ ...b, contact_whatsapp: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={basics.contact_email}
            onChange={(e) => setBasics((b) => ({ ...b, contact_email: e.target.value }))}
          />
          <Input
            label="Address"
            value={basics.address}
            onChange={(e) => setBasics((b) => ({ ...b, address: e.target.value }))}
          />
          <div className="sm:col-span-2">
            <Button type="submit" loading={savingBasics}>
              Save details
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <Card padding className="!p-3 h-fit">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Sections
          </p>
          <div className="flex flex-col gap-1">
            {SECTION_ORDER.map((type) => {
              const sec = sectionsByType[type];
              const meta = SECTION_META[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveType(type)}
                  className={`rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    activeType === type
                      ? 'bg-emerald-50 font-semibold text-emerald-800 ring-1 ring-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block">{meta.label}</span>
                  <span className="block text-[11px] font-normal text-slate-400">
                    {sec?.enabled === false ? 'Hidden' : 'Visible'}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          {activeSection ? (
            <SectionEditor site={site} section={activeSection} onChanged={load} />
          ) : (
            <p className="text-sm text-slate-500">Section not found.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
