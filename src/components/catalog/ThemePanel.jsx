import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import MediaPickField from './MediaPickField';
import { DEFAULT_THEME, mergeTheme, THEME_MODES } from './sectionConfig';
import { updateCatalogSite } from '../../services/catalogApi';

export default function ThemePanel({ site, onChanged }) {
  const [theme, setTheme] = useState(() => mergeTheme(site?.theme));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTheme(mergeTheme(site?.theme));
  }, [site?.theme, site?.id]);

  const setField = (key, value) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateCatalogSite({
        theme: {
          mode: theme.mode || 'light',
          accent: theme.accent || DEFAULT_THEME.accent,
          accent_ink: theme.accent_ink || DEFAULT_THEME.accent_ink,
          hero_from: theme.hero_from || DEFAULT_THEME.hero_from,
          hero_to: theme.hero_to || DEFAULT_THEME.hero_to,
          whatsapp_logo_media_id: theme.whatsapp_logo_media_id
            ? Number(theme.whatsapp_logo_media_id)
            : null,
        },
      });
      toast.success('Appearance saved');
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save theme');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-700">Color mode</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Dark mode uses deep backgrounds; Auto follows the visitor’s phone setting.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {THEME_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setField('mode', m.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                theme.mode === m.id
                  ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                  : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ColorField
          label="Accent"
          value={theme.accent}
          onChange={(v) => setField('accent', v)}
        />
        <ColorField
          label="Accent text"
          value={theme.accent_ink}
          onChange={(v) => setField('accent_ink', v)}
        />
        <ColorField
          label="Hero start"
          value={theme.hero_from}
          onChange={(v) => setField('hero_from', v)}
        />
        <ColorField
          label="Hero end"
          value={theme.hero_to}
          onChange={(v) => setField('hero_to', v)}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <MediaPickField
          site={site}
          label="WhatsApp message logo"
          hint="Shown with Welcome, Website, and Order replies on WhatsApp. Square logo works best. Falls back to your Header logo if empty. Click Save appearance after choosing."
          value={theme.whatsapp_logo_media_id}
          onChange={(id) => setField('whatsapp_logo_media_id', id)}
        />
      </div>

      <div
        className="overflow-hidden rounded-xl ring-1 ring-slate-200"
        style={{
          background: `linear-gradient(135deg, ${theme.hero_from}, ${theme.hero_to})`,
        }}
      >
        <div className="px-4 py-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Preview</p>
          <p className="mt-1 font-semibold">{site?.business_name || 'Your business'}</p>
          <button
            type="button"
            className="mt-3 rounded-full px-3 py-1.5 text-xs font-bold"
            style={{ background: theme.accent, color: '#fff' }}
          >
            WhatsApp
          </button>
        </div>
      </div>

      <Button type="button" onClick={save} loading={saving}>
        Save appearance
      </Button>
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Input
          label={label}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#0c8a76"
        />
      </div>
      <input
        type="color"
        value={/^#[0-9a-fA-F]{6}$/.test(value || '') ? value : '#0c8a76'}
        onChange={(e) => onChange(e.target.value)}
        className="mb-0.5 h-10 w-10 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5"
        aria-label={label}
      />
    </div>
  );
}
