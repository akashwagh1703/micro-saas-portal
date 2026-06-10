import { Link } from 'react-router-dom';
import Button from './Button';

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction, actionHref, hint }) {
  return (
    <div className="surface-card px-6 py-14 text-center">
      {Icon && (
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 ring-1 ring-emerald-100">
          <Icon size={30} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">{description}</p>
      {hint && <p className="mx-auto mt-3 max-w-sm text-xs text-slate-400">{hint}</p>}
      {(actionLabel && (actionHref || onAction)) && (
        <div className="mt-6">
          {actionHref ? (
            <Link to={actionHref}>
              <Button>{actionLabel}</Button>
            </Link>
          ) : (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
        </div>
      )}
    </div>
  );
}
