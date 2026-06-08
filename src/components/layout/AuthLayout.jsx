import AuthShowcase from '../auth/AuthShowcase';
import { AutoWaveMark } from '../brand/AutoWaveBrand';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex h-screen max-h-screen overflow-hidden">
      <div className="hidden h-full w-[52%] shrink-0 lg:block xl:w-[55%]">
        <AuthShowcase />
      </div>

      <div className="relative flex h-full flex-1 flex-col items-center justify-center bg-slate-50 p-4 sm:p-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-6 lg:hidden">
            <AutoWaveMark />
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
              {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
