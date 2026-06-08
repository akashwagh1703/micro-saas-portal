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

/** Icon + wordmark for light backgrounds (sidebar, auth forms). */
export function AutoWaveMark({ className = '', showTagline = false }) {
  return (
    <div className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      <AutoWaveIcon className="h-9 w-9 shrink-0" />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-900">{AUTO_WAVE_NAME}</p>
        {showTagline && (
          <p className="truncate text-xs text-slate-500">{AUTO_WAVE_TAGLINE}</p>
        )}
      </div>
    </div>
  );
}

/** Full logo for dark backgrounds (auth showcase). */
export function AutoWaveLogoDark({ className = 'h-12 object-contain sm:h-14' }) {
  return <AutoWaveLogo className={className} alt={AUTO_WAVE_NAME} />;
}
