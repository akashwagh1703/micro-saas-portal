import { MessageCircle } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-emerald-700 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <MessageCircle size={22} />
          </div>
          <span className="text-xl font-bold">WhatsFlow</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Automate WhatsApp workflows with ease
          </h1>
          <p className="mt-4 max-w-md text-emerald-100">
            Build visual workflows, connect APIs, use AI, and manage your inbox — all in one SaaS platform.
          </p>
        </div>
        <p className="text-sm text-emerald-200">© 2026 WhatsFlow</p>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 text-emerald-700">
              <MessageCircle size={24} />
              <span className="text-xl font-bold">WhatsFlow</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
