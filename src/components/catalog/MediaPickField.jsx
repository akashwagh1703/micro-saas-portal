import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import AuthMediaImg from './AuthMediaImg';
import { uploadCatalogMedia } from '../../services/catalogApi';

/**
 * Pick / upload a single image (or multi for slider).
 * value: media id | null  OR  number[] when multiple
 */
export default function MediaPickField({
  site,
  sectionId,
  label,
  hint,
  value,
  onChange,
  multiple = false,
  max = 1,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [extraMedia, setExtraMedia] = useState([]);

  useEffect(() => {
    setExtraMedia([]);
  }, [site?.id, site?.media?.length]);

  const images = useMemo(() => {
    const base = (site?.media || []).filter((m) => m.kind === 'image');
    const seen = new Set(base.map((m) => m.id));
    const extras = extraMedia.filter((m) => m?.id && !seen.has(m.id));
    return [...extras, ...base];
  }, [site?.media, extraMedia]);

  const selectedIds = multiple
    ? (Array.isArray(value) ? value : []).map(Number).filter((n) => n > 0)
    : value
      ? [Number(value)]
      : [];

  const byId = (id) => images.find((m) => m.id === id);

  const setIds = (ids) => {
    const next = [...new Set(ids.map(Number).filter((n) => n > 0))].slice(0, max);
    if (multiple) onChange(next);
    else onChange(next[0] ?? null);
  };

  const toggle = (id) => {
    if (multiple) {
      if (selectedIds.includes(id)) setIds(selectedIds.filter((x) => x !== id));
      else if (selectedIds.length >= max) toast.error(`You can select up to ${max} images`);
      else setIds([...selectedIds, id]);
    } else {
      setIds(selectedIds[0] === id ? [] : [id]);
    }
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type)) {
      toast.error('Use JPEG, PNG, WebP, or GIF');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5 MB or smaller');
      return;
    }
    setUploading(true);
    try {
      const media = await uploadCatalogMedia(file, {
        kind: 'image',
        section_id: sectionId ?? undefined,
      });
      setExtraMedia((prev) => [media, ...prev.filter((m) => m.id !== media.id)]);
      if (multiple) {
        const next = [...selectedIds, media.id].slice(0, max);
        setIds(next);
      } else {
        setIds([media.id]);
      }
      toast.success('Image uploaded — click Save to apply');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id) => {
            const m = byId(id);
            if (!m) {
              return (
                <div
                  key={id}
                  className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 text-[10px] text-slate-400"
                >
                  #{id}
                </div>
              );
            }
            return (
              <div key={id} className="relative h-20 w-20 overflow-hidden rounded-xl ring-2 ring-emerald-400">
                <AuthMediaImg
                  media={m}
                  siteStatus={site.status}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-slate-600 shadow"
                  aria-label="Remove"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={onUpload}
        />
        <Button
          type="button"
          variant="secondary"
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus size={14} />
          Upload
        </Button>
        {!multiple && selectedIds.length > 0 && (
          <Button type="button" variant="secondary" onClick={() => setIds([])}>
            Clear
          </Button>
        )}
      </div>

      {images.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-500">
            {multiple ? `Pick up to ${max} from your library` : 'Or pick from your library'}
          </p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {images.map((m) => {
              const active = selectedIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggle(m.id)}
                  className={`aspect-square overflow-hidden rounded-lg ring-2 transition ${
                    active ? 'ring-emerald-500' : 'ring-transparent hover:ring-slate-200'
                  }`}
                >
                  <AuthMediaImg
                    media={m}
                    siteStatus={site.status}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
