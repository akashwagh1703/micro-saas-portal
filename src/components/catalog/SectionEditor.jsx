import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import GalleryMediaPanel from './GalleryMediaPanel';
import ProductsPanel from './ProductsPanel';
import { mergeSectionConfig, SECTION_META } from './sectionConfig';
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
      await updateCatalogSection(section.id, {
        enabled,
        title: title.trim() || meta.label,
        config,
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

      <Input
        label="Section title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        hint="Optional heading shown above this block"
      />

      {section.type === 'header' && (
        <div className="space-y-3">
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
        <div className="space-y-3">
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
