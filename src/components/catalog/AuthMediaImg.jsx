import { useEffect, useState } from 'react';
import { fetchCatalogMediaBlob } from '../../services/catalogApi';

/**
 * Renders catalog media with Bearer auth (works for draft sites).
 * Falls back to public url when status is published.
 */
export default function AuthMediaImg({
  media,
  siteStatus,
  alt = '',
  className = '',
}) {
  const [src, setSrc] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl = '';
    let cancelled = false;

    async function load() {
      setFailed(false);
      if (!media?.id) {
        setSrc('');
        return;
      }

      if (siteStatus === 'published' && media.url) {
        setSrc(media.url);
        return;
      }

      try {
        const blob = await fetchCatalogMediaBlob(media.id);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch {
        if (!cancelled) {
          setFailed(true);
          setSrc(media.url || '');
        }
      }
    }

    load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [media?.id, media?.url, siteStatus]);

  if (failed && !src) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-xs text-slate-400 ${className}`}>
        Unavailable
      </div>
    );
  }

  if (!src) {
    return <div className={`animate-pulse bg-slate-100 ${className}`} />;
  }

  return <img src={src} alt={alt || media?.alt || ''} className={className} />;
}
