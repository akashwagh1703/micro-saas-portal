import { Link } from 'react-router-dom';
import Button from './Button';

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction, actionHref, hint }) {
  return (
    <div className="py-12 text-center">
      {Icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Icon size={28} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
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
