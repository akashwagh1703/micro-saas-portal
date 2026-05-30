import { MessageSquare } from 'lucide-react';
import AuthShowcase from '../auth/AuthShowcase';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex h-screen max-h-screen overflow-hidden">
      <div className="hidden h-full w-[52%] shrink-0 lg:block xl:w-[55%]">
        <AuthShowcase />
      </div>

      <div className="relative flex h-full flex-1 flex-col items-center justify-center bg-slate-50 p-4 sm:p-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white">
              <MessageSquare size={18} strokeWidth={1.5} />
            </div>
            <span className="text-lg font-semibold text-slate-900">WhatsFlow</span>
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
