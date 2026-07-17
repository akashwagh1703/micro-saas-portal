import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Card from './ui/Card';
import Button from './ui/Button';
import api from '../services/api';

export default function WelcomeImageCard() {
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const inputRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/settings/business-profile');
      setPreviewUrl(data?.welcome_image_url ?? '');
    } catch {
      toast.error('Could not load welcome image');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
      toast.error('Use a JPEG, PNG, or WebP image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5 MB or smaller');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/settings/welcome-image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreviewUrl(data?.welcome_image_url ?? '');
      toast.success('Welcome image saved — customers will see it when booking starts');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async () => {
    setRemoving(true);
    try {
      await api.delete('/settings/welcome-image');
      setPreviewUrl('');
      toast.success('Welcome image removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove image');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Card className="!p-6">
      <h2 className="text-lg font-semibold text-slate-900">Welcome image</h2>
      <p className="mt-1 text-sm text-slate-500">
        Shown at the start of your appointment booking flow on WhatsApp (with your welcome message).
        Use your logo, salon photo, or turf banner. Requires a public HTTPS API URL (
        <code className="text-xs">APP_URL</code> on the server).
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="mt-4 space-y-4">
          {previewUrl ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img
                src={`${previewUrl}${previewUrl.includes('?') ? '&' : '?'}v=${Date.now()}`}
                alt="Welcome preview"
                className="max-h-48 w-full object-contain"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No welcome image yet
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onFileChange}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="button" loading={uploading} onClick={() => inputRef.current?.click()}>
              {previewUrl ? 'Replace image' : 'Upload image'}
            </Button>
            {previewUrl ? (
              <Button type="button" variant="secondary" loading={removing} onClick={remove}>
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </Card>
  );
}
