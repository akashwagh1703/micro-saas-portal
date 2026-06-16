import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Lightweight client-side pagination control.
 *
 * Props:
 *  - page: current 1-based page
 *  - pageSize: items per page
 *  - totalItems: total number of items across all pages
 *  - onPageChange: (nextPage:number) => void
 *  - itemLabel: singular noun shown in the summary (default "item")
 *  - itemLabelPlural: plural noun (defaults to itemLabel + "s")
 */
export default function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  itemLabel = 'item',
  itemLabelPlural,
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  if (totalItems <= pageSize) {
    return null;
  }

  const from = (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, totalItems);

  return (
    <div
      className={`mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 ${className}`}
    >
      <p className="text-xs text-slate-500">
        Showing <span className="font-medium text-slate-700">{from}</span>–
        <span className="font-medium text-slate-700">{to}</span> of{' '}
        <span className="font-medium text-slate-700">{totalItems}</span>{' '}
        {totalItems === 1 ? itemLabel : itemLabelPlural || `${itemLabel}s`}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft size={14} />
          Prev
        </button>
        <span className="px-2 text-xs font-medium text-slate-600">
          Page {safePage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
