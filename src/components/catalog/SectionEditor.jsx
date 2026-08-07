import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import GalleryMediaPanel from './GalleryMediaPanel';
import MediaPickField from './MediaPickField';
import ProductsPanel from './ProductsPanel';
import {
  FAQ_MAX,
  HERO_SLIDER_MAX,
  HIGHLIGHTS_MAX,
  SOCIAL_NETWORKS,
  SOCIALS_MAX,
  TESTIMONIALS_MAX,
  mergeSectionConfig,
  SECTION_META,
} from './sectionConfig';
import { updateCatalogSection } from '../../services/catalogApi';

export default function SectionEditor({ site, section, onChanged }) {
  const meta = SECTION_META[section.type] || { label: section.type, hint: '' };
  const [enabled, setEnabled] = useState(section.enabled);
  const [title, setTitle] = useState(section.title || meta.label);
  const [config, setConfig] = useState(() => mergeSectionConfig(section.type, section.config));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEnabled(section.enabled);
    setTitle(section.title || meta.label);
    setConfig(mergeSectionConfig(section.type, section.config));
  }, [section.id, section.enabled, section.title, section.config, section.type, meta.label]);

  const setField = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payloadConfig = { ...config };
      if (section.type === 'hero') {
        const ids = Array.isArray(payloadConfig.slider_media_ids)
          ? payloadConfig.slider_media_ids
          : [];
        payloadConfig.slider_media_ids = ids.slice(0, HERO_SLIDER_MAX);
        payloadConfig.image_media_id = ids[0] ?? null;
        payloadConfig.slider_interval_sec = Math.min(
          20,
          Math.max(3, Number(payloadConfig.slider_interval_sec) || 5),
        );
      }
      if (section.type === 'highlights') {
        payloadConfig.items = (Array.isArray(payloadConfig.items) ? payloadConfig.items : [])
          .map((it) => ({
            label: String(it?.label || '').trim().slice(0, 32),
            text: String(it?.text || '').trim().slice(0, 80),
          }))
          .filter((it) => it.label || it.text)
          .slice(0, HIGHLIGHTS_MAX);
      }
      if (section.type === 'testimonials') {
        payloadConfig.items = (Array.isArray(payloadConfig.items) ? payloadConfig.items : [])
          .map((it) => {
            const rating = Number(it?.rating);
            return {
              name: String(it?.name || '').trim().slice(0, 80),
              role: String(it?.role || '').trim().slice(0, 80),
              quote: String(it?.quote || '').trim().slice(0, 400),
              rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, Math.round(rating))) : 5,
              photo_media_id: it?.photo_media_id ? Number(it.photo_media_id) : null,
            };
          })
          .filter((it) => it.name || it.quote)
          .slice(0, TESTIMONIALS_MAX);
      }
      if (section.type === 'faq') {
        payloadConfig.items = (Array.isArray(payloadConfig.items) ? payloadConfig.items : [])
          .map((it) => ({
            question: String(it?.question || '').trim().slice(0, 160),
            answer: String(it?.answer || '').trim().slice(0, 800),
          }))
          .filter((it) => it.question && it.answer)
          .slice(0, FAQ_MAX);
      }
      if (section.type === 'contact') {
        payloadConfig.map_query = String(payloadConfig.map_query || '').trim().slice(0, 300);
        payloadConfig.map_embed_url = String(payloadConfig.map_embed_url || '').trim().slice(0, 800);
        payloadConfig.show_map = !!payloadConfig.show_map;
      }
      if (section.type === 'footer') {
        const allowed = new Set(SOCIAL_NETWORKS.map((n) => n.id));
        payloadConfig.socials = (Array.isArray(payloadConfig.socials) ? payloadConfig.socials : [])
          .map((it) => ({
            network: allowed.has(it?.network) ? it.network : 'website',
            url: String(it?.url || '').trim().slice(0, 300),
          }))
          .filter((it) => it.url)
          .slice(0, SOCIALS_MAX);
      }
      if (section.type === 'hero') {
        payloadConfig.video_url = String(payloadConfig.video_url || '').trim().slice(0, 500);
        payloadConfig.prefer_video = !!payloadConfig.prefer_video;
      }
      await updateCatalogSection(section.id, {
        enabled,
        title: title.trim() || meta.label,
        config: payloadConfig,
      });
      toast.success(`${meta.label} saved`);
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save section');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{meta.label}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{meta.hint}</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          Show on site
        </label>
      </div>

      {section.type !== 'header' && section.type !== 'footer' && (
        <Input
          label="Section title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          hint="Optional heading shown above this block"
        />
      )}

      {section.type === 'header' && (
        <div className="space-y-4">
          <MediaPickField
            site={site}
            sectionId={section.id}
            label="Logo"
            hint="Square or wide logo works best. Shown in the sticky header. Click Save after choosing."
            value={config.logo_media_id}
            onChange={(id) => setField('logo_media_id', id)}
          />
          <Toggle
            label="Show business name"
            checked={!!config.show_name}
            onChange={(v) => setField('show_name', v)}
          />
          <Toggle
            label="Show tagline"
            checked={!!config.show_tagline}
            onChange={(v) => setField('show_tagline', v)}
          />
        </div>
      )}

      {section.type === 'hero' && (
        <div className="space-y-4">
          <Input
            label="Headline"
            value={config.headline || ''}
            onChange={(e) => setField('headline', e.target.value)}
            placeholder="Welcome to our shop"
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Subheadline</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              rows={3}
              value={config.subheadline || ''}
              onChange={(e) => setField('subheadline', e.target.value)}
              placeholder="A short line about what you do"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="CTA label (optional)"
              value={config.cta_label || ''}
              onChange={(e) => setField('cta_label', e.target.value)}
              placeholder="WhatsApp us"
            />
            <Input
              label="CTA link (optional)"
              value={config.cta_url || ''}
              onChange={(e) => setField('cta_url', e.target.value)}
              placeholder="https://wa.me/91..."
            />
          </div>

          <MediaPickField
            site={site}
            sectionId={section.id}
            label="Hero background slider"
            hint={`Pick up to ${HERO_SLIDER_MAX} images. They rotate behind the headline. Click Save after choosing.`}
            value={config.slider_media_ids || []}
            onChange={(ids) => setField('slider_media_ids', ids)}
            multiple
            max={HERO_SLIDER_MAX}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Slide interval (seconds)"
              type="number"
              min={3}
              max={20}
              value={config.slider_interval_sec ?? 5}
              onChange={(e) => setField('slider_interval_sec', e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Text overlay</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                value={config.overlay || 'dark'}
                onChange={(e) => setField('overlay', e.target.value)}
              >
                <option value="dark">Dark (best for photos)</option>
                <option value="light">Light</option>
                <option value="none">None (solid theme color)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <Toggle
              label="Prefer video over image slider"
              checked={!!config.prefer_video}
              onChange={(v) => setField('prefer_video', v)}
            />
            <Input
              label="Hero video URL (optional)"
              value={config.video_url || ''}
              onChange={(e) => setField('video_url', e.target.value)}
              placeholder="YouTube / Vimeo link or .mp4 URL"
              hint="Muted autoplay on the public page. Image slider is used when video is off or empty."
            />
          </div>
        </div>
      )}

      {section.type === 'highlights' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Up to {HIGHLIGHTS_MAX} tiles under the hero. Example: “10+” / “Years in business”.
          </p>
          {(config.items || []).map((item, idx) => (
            <div
              key={idx}
              className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-[120px_1fr_auto]"
            >
              <Input
                label={idx === 0 ? 'Stat' : undefined}
                value={item.label || ''}
                onChange={(e) => {
                  const next = [...(config.items || [])];
                  next[idx] = { ...next[idx], label: e.target.value };
                  setField('items', next);
                }}
                placeholder="10+"
              />
              <Input
                label={idx === 0 ? 'Label' : undefined}
                value={item.text || ''}
                onChange={(e) => {
                  const next = [...(config.items || [])];
                  next[idx] = { ...next[idx], text: e.target.value };
                  setField('items', next);
                }}
                placeholder="Happy customers"
              />
              <div className={idx === 0 ? 'flex items-end' : 'flex items-center'}>
                <Button
                  type="button"
                  variant="secondary"
                  className="!px-3"
                  onClick={() => {
                    const next = (config.items || []).filter((_, i) => i !== idx);
                    setField('items', next.length ? next : [{ label: '', text: '' }]);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {(config.items || []).length < HIGHLIGHTS_MAX && (
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setField('items', [...(config.items || []), { label: '', text: '' }])
              }
            >
              Add highlight
            </Button>
          )}
        </div>
      )}

      {section.type === 'about' && (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">About text</label>
          <textarea
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            rows={6}
            value={config.body || ''}
            onChange={(e) => setField('body', e.target.value)}
            placeholder="Tell customers who you are and what makes you different…"
          />
        </div>
      )}

      {section.type === 'gallery' && (
        <div className="space-y-4">
          <Input
            label="Gallery caption (optional)"
            value={config.caption || ''}
            onChange={(e) => setField('caption', e.target.value)}
          />
          <GalleryMediaPanel site={site} sectionId={section.id} onChanged={onChanged} />
        </div>
      )}

      {section.type === 'products' && (
        <div className="space-y-4">
          <Input
            label="Intro (optional)"
            value={config.intro || ''}
            onChange={(e) => setField('intro', e.target.value)}
            placeholder="Browse our offerings"
          />
          <ProductsPanel site={site} onChanged={onChanged} />
        </div>
      )}

      {section.type === 'testimonials' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Up to {TESTIMONIALS_MAX} customer quotes. Empty rows are skipped on save.
          </p>
          {(config.items || []).map((item, idx) => (
            <div
              key={idx}
              className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-700">Quote {idx + 1}</p>
                <Button
                  type="button"
                  variant="secondary"
                  className="!px-3"
                  onClick={() => {
                    const next = (config.items || []).filter((_, i) => i !== idx);
                    setField(
                      'items',
                      next.length
                        ? next
                        : [{ name: '', role: '', quote: '', rating: 5, photo_media_id: null }],
                    );
                  }}
                >
                  Remove
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  label="Name"
                  value={item.name || ''}
                  onChange={(e) => {
                    const next = [...(config.items || [])];
                    next[idx] = { ...next[idx], name: e.target.value };
                    setField('items', next);
                  }}
                  placeholder="Riya S."
                />
                <Input
                  label="Role / city (optional)"
                  value={item.role || ''}
                  onChange={(e) => {
                    const next = [...(config.items || [])];
                    next[idx] = { ...next[idx], role: e.target.value };
                    setField('items', next);
                  }}
                  placeholder="Nashik"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Quote</label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  rows={3}
                  value={item.quote || ''}
                  onChange={(e) => {
                    const next = [...(config.items || [])];
                    next[idx] = { ...next[idx], quote: e.target.value };
                    setField('items', next);
                  }}
                  placeholder="Great quality bats and quick delivery…"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Rating</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 sm:max-w-[10rem]"
                  value={item.rating ?? 5}
                  onChange={(e) => {
                    const next = [...(config.items || [])];
                    next[idx] = { ...next[idx], rating: Number(e.target.value) };
                    setField('items', next);
                  }}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n === 1 ? '' : 's'}
                    </option>
                  ))}
                </select>
              </div>
              <MediaPickField
                site={site}
                sectionId={section.id}
                label="Photo (optional)"
                hint="Small square photo works best"
                value={item.photo_media_id}
                onChange={(id) => {
                  const next = [...(config.items || [])];
                  next[idx] = { ...next[idx], photo_media_id: id };
                  setField('items', next);
                }}
              />
            </div>
          ))}
          {(config.items || []).length < TESTIMONIALS_MAX && (
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setField('items', [
                  ...(config.items || []),
                  { name: '', role: '', quote: '', rating: 5, photo_media_id: null },
                ])
              }
            >
              Add testimonial
            </Button>
          )}
        </div>
      )}

      {section.type === 'faq' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Up to {FAQ_MAX} questions. Both question and answer are required to publish a row.
          </p>
          {(config.items || []).map((item, idx) => (
            <div key={idx} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-700">Q{idx + 1}</p>
                <Button
                  type="button"
                  variant="secondary"
                  className="!px-3"
                  onClick={() => {
                    const next = (config.items || []).filter((_, i) => i !== idx);
                    setField('items', next.length ? next : [{ question: '', answer: '' }]);
                  }}
                >
                  Remove
                </Button>
              </div>
              <Input
                label="Question"
                value={item.question || ''}
                onChange={(e) => {
                  const next = [...(config.items || [])];
                  next[idx] = { ...next[idx], question: e.target.value };
                  setField('items', next);
                }}
                placeholder="Do you deliver in Nashik?"
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Answer</label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  rows={3}
                  value={item.answer || ''}
                  onChange={(e) => {
                    const next = [...(config.items || [])];
                    next[idx] = { ...next[idx], answer: e.target.value };
                    setField('items', next);
                  }}
                  placeholder="Yes — same-day delivery in most areas."
                />
              </div>
            </div>
          ))}
          {(config.items || []).length < FAQ_MAX && (
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setField('items', [...(config.items || []), { question: '', answer: '' }])
              }
            >
              Add question
            </Button>
          )}
        </div>
      )}

      {section.type === 'contact' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Contact details come from your site settings (phone, WhatsApp, email, address). Choose what to show here.
          </p>
          <Toggle label="Show phone" checked={!!config.show_phone} onChange={(v) => setField('show_phone', v)} />
          <Toggle
            label="Show WhatsApp"
            checked={!!config.show_whatsapp}
            onChange={(v) => setField('show_whatsapp', v)}
          />
          <Toggle label="Show email" checked={!!config.show_email} onChange={(v) => setField('show_email', v)} />
          <Toggle
            label="Show address"
            checked={!!config.show_address}
            onChange={(v) => setField('show_address', v)}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Note (optional)</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              rows={2}
              value={config.note || ''}
              onChange={(e) => setField('note', e.target.value)}
              placeholder="Open Mon–Sat 10am–7pm"
            />
          </div>
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <Toggle
              label="Show map"
              checked={!!config.show_map}
              onChange={(v) => setField('show_map', v)}
            />
            <Input
              label="Map search query"
              value={config.map_query || ''}
              onChange={(e) => setField('map_query', e.target.value)}
              placeholder="07 Sport Hub, Nashik"
              hint="Used when embed URL is empty — opens a Google Maps embed for this place."
            />
            <Input
              label="Map embed URL (optional)"
              value={config.map_embed_url || ''}
              onChange={(e) => setField('map_embed_url', e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=..."
              hint="Paste from Google Maps → Share → Embed a map."
            />
          </div>
        </div>
      )}

      {section.type === 'footer' && (
        <div className="space-y-3">
          <Toggle
            label="Show business name"
            checked={!!config.show_name}
            onChange={(v) => setField('show_name', v)}
          />
          <Toggle
            label="Show contact shortcuts"
            checked={!!config.show_contact}
            onChange={(v) => setField('show_contact', v)}
          />
          <Toggle
            label="Show WhatsApp button"
            checked={!!config.show_whatsapp_cta}
            onChange={(v) => setField('show_whatsapp_cta', v)}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Footer note</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              rows={2}
              value={config.note || ''}
              onChange={(e) => setField('note', e.target.value)}
              placeholder="Thanks for visiting — message us anytime"
            />
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <p className="text-sm font-medium text-slate-700">Social links</p>
            <p className="text-xs text-slate-500">Up to {SOCIALS_MAX} links shown in the footer.</p>
            {(config.socials || []).map((item, idx) => (
              <div key={idx} className="grid gap-2 sm:grid-cols-[140px_1fr_auto]">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm"
                  value={item.network || 'instagram'}
                  onChange={(e) => {
                    const next = [...(config.socials || [])];
                    next[idx] = { ...next[idx], network: e.target.value };
                    setField('socials', next);
                  }}
                >
                  {SOCIAL_NETWORKS.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
                <Input
                  value={item.url || ''}
                  onChange={(e) => {
                    const next = [...(config.socials || [])];
                    next[idx] = { ...next[idx], url: e.target.value };
                    setField('socials', next);
                  }}
                  placeholder="https://..."
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="!px-3"
                  onClick={() =>
                    setField(
                      'socials',
                      (config.socials || []).filter((_, i) => i !== idx),
                    )
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
            {(config.socials || []).length < SOCIALS_MAX && (
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setField('socials', [
                    ...(config.socials || []),
                    { network: 'instagram', url: '' },
                  ])
                }
              >
                Add social link
              </Button>
            )}
          </div>
        </div>
      )}

      <Button type="button" onClick={save} loading={saving}>
        Save {meta.label.toLowerCase()}
      </Button>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
      />
      {label}
    </label>
  );
}
