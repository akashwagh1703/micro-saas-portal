import { Link } from 'react-router-dom';
import { Check, Circle, ChevronRight, Sparkles, PartyPopper } from 'lucide-react';

export default function SetupChecklist({ steps, userName, compact = false }) {
  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const allDone = completed === total;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (allDone && compact) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50 shadow-sm">
      <div className="border-b border-emerald-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            {allDone ? <PartyPopper size={20} /> : <Sparkles size={20} />}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {allDone
                ? "You're all set!"
                : userName
                  ? `Welcome, ${userName.split(' ')[0]}!`
                  : 'Welcome!'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">
              {allDone
                ? 'Your WhatsApp auto-replies are ready. Send a test message to see them in action.'
                : 'Complete these steps to start answering customers on WhatsApp automatically.'}
            </p>
          </div>
        </div>
        {!allDone && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs font-medium text-slate-500">
              <span>{completed} of {total} done</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {!allDone && (
        <ol className="divide-y divide-emerald-50">
          {steps.map((step, index) => (
            <li key={step.id}>
              <Link
                to={step.href}
                className={`group flex items-center gap-4 px-5 py-4 transition hover:bg-white/80 ${
                  step.done ? 'bg-emerald-50/40' : ''
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    step.done ? 'bg-emerald-600 text-white' : 'border-2 border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  {step.done ? <Check size={16} strokeWidth={2.5} /> : <span className="text-xs font-bold">{index + 1}</span>}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${step.done ? 'text-emerald-800 line-through decoration-emerald-300' : 'text-slate-900'}`}>
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{step.description}</p>
                </div>
                {!step.done && (
                  <span className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white opacity-90 transition group-hover:opacity-100">
                    {step.action}
                    <ChevronRight size={14} />
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ol>
      )}

      {allDone && (
        <div className="flex flex-wrap gap-3 px-5 py-4">
          <Link
            to="/inbox"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Open customer messages
          </Link>
          <Link
            to="/workflows"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Manage auto-replies
          </Link>
        </div>
      )}
    </div>
  );
}
