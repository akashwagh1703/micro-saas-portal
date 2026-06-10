import AuthShowcase from '../auth/AuthShowcase';
import { AutoWaveMark } from '../brand/AutoWaveBrand';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-slate-950">
      <div className="hidden h-full w-[52%] shrink-0 lg:block xl:w-[55%]">
        <AuthShowcase />
      </div>

      <div className="relative flex h-full flex-1 flex-col items-center justify-center overflow-y-auto p-4 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgb(16_185_129_/_0.12),_transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgb(99_102_241_/_0.08),_transparent_45%)]" />

        <div className="relative w-full max-w-[420px]">
          <div className="mb-8 lg:hidden">
            <AutoWaveMark variant="dark" />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/95 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
              {subtitle && (
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p>
              )}
            </div>
            {children}
          </div>

          <p className="mt-6 text-center text-xs text-slate-500 lg:text-slate-400">
            Secure operator access · AutoWave platform
          </p>
        </div>
      </div>
    </div>
  );
}
