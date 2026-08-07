import { useRef, useState } from 'react';
import { ImagePlus, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import AuthMediaImg from './AuthMediaImg';
import {
  catalogUploadErrorMessage,
  deleteCatalogMedia,
  uploadCatalogMedia,
  updateCatalogMedia,
} from '../../services/catalogApi';

export default function GalleryMediaPanel({
  site,
  sectionId,
  onChanged,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const sectionMedia = (site?.media || []).filter((m) => m.section_id === sectionId);
  const unassigned = (site?.media || []).filter(
    (m) => m.kind === 'image' && !m.section_id,
  );

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
      await uploadCatalogMedia(file, { kind: 'image', section_id: sectionId });
      toast.success('Image uploaded');
      onChanged?.();
    } catch (err) {
      toast.error(catalogUploadErrorMessage(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onUploadDoc = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Documents must be PDF');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('PDF must be 10 MB or smaller');
      return;
    }
    setUploading(true);
    try {
      await uploadCatalogMedia(file, { kind: 'document', section_id: sectionId });
      toast.success('Document uploaded');
      onChanged?.();
    } catch (err) {
      toast.error(catalogUploadErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const assign = async (mediaId) => {
    setBusyId(mediaId);
    try {
      await updateCatalogMedia(mediaId, { section_id: sectionId });
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not assign image');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (mediaId) => {
    if (!window.confirm('Remove this file from your catalog?')) return;
    setBusyId(mediaId);
    try {
      await deleteCatalogMedia(mediaId);
      toast.success('Removed');
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
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
          <ImagePlus size={16} />
          Upload image
        </Button>
        <label className="inline-flex cursor-pointer">
          <input type="file" accept="application/pdf" className="hidden" onChange={onUploadDoc} />
          <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            <FileText size={16} />
            Upload PDF
          </span>
        </label>
      </div>

      {sectionMedia.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          No gallery media yet — upload photos your customers will see on the brochure.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sectionMedia.map((m) => (
            <div
              key={m.id}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            >
              {m.kind === 'document' ? (
                <div className="flex h-28 flex-col items-center justify-center gap-1 p-2 text-center">
                  <FileText className="text-slate-400" size={28} />
                  <p className="truncate text-xs text-slate-600">{m.file_name || 'PDF'}</p>
                </div>
              ) : (
                <AuthMediaImg
                  media={m}
                  siteStatus={site.status}
                  className="h-28 w-full object-cover"
                />
              )}
              <button
                type="button"
                disabled={busyId === m.id}
                onClick={() => remove(m.id)}
                className="absolute right-1.5 top-1.5 rounded-lg bg-white/90 p-1.5 text-red-600 shadow opacity-0 transition group-hover:opacity-100"
                title="Remove"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {unassigned.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">Unassigned images — click to add to gallery</p>
          <div className="flex flex-wrap gap-2">
            {unassigned.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={busyId === m.id}
                onClick={() => assign(m.id)}
                className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200"
              >
                <AuthMediaImg media={m} siteStatus={site.status} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
