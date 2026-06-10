const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');

export const AUTO_WAVE_ICON = `${base}autowave-icon.png`;
export const AUTO_WAVE_LOGO = `${base}autowave-logo.png`;
export const AUTO_WAVE_NAME = 'AutoWave';
export const AUTO_WAVE_TAGLINE = 'WhatsApp & Instagram auto-replies';

export function AutoWaveIcon({ className = 'h-9 w-9 object-contain', alt = '' }) {
  return <img src={AUTO_WAVE_ICON} alt={alt} className={className} draggable={false} />;
}

export function AutoWaveLogo({ className = 'h-10 object-contain', alt = 'AutoWave' }) {
  return <img src={AUTO_WAVE_LOGO} alt={alt} className={className} draggable={false} />;
}

/** Icon + wordmark for light or dark backgrounds (sidebar, auth forms). */
export function AutoWaveMark({ className = '', showTagline = false, variant = 'light' }) {
  const titleClass = variant === 'dark' ? 'text-white' : 'text-slate-900';
  const taglineClass = variant === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${variant === 'dark' ? 'bg-white/10 ring-1 ring-white/10' : 'bg-emerald-50 ring-1 ring-emerald-100'}`}>
        <AutoWaveIcon className="h-7 w-7 shrink-0" />
      </div>
      <div className="min-w-0">
        <p className={`truncate text-sm font-bold tracking-tight ${titleClass}`}>{AUTO_WAVE_NAME}</p>
        {showTagline && (
          <p className={`truncate text-xs ${taglineClass}`}>{AUTO_WAVE_TAGLINE}</p>
        )}
      </div>
    </div>
  );
}

/** Full logo for dark backgrounds (auth showcase). */
export function AutoWaveLogoDark({ className = 'h-12 object-contain sm:h-14' }) {
  return <AutoWaveLogo className={className} alt={AUTO_WAVE_NAME} />;
}
