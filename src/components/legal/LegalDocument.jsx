export default function LegalDocument({ doc }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-white sm:px-8">
        <h1 className="text-2xl font-bold">{doc.title}</h1>
        <p className="mt-2 text-sm text-emerald-50">Last updated: {doc.updated}</p>
      </div>

      <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 sm:px-8">
        <p className="text-sm leading-relaxed text-slate-600">{doc.intro}</p>
      </div>

      <nav className="border-b border-slate-100 px-6 py-4 sm:px-8" aria-label="Table of contents">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contents</p>
        <ol className="mt-2 columns-1 gap-x-6 sm:columns-2">
          {doc.sections.map((s) => (
            <li key={s.id} className="mb-1 text-sm break-inside-avoid">
              <a href={`#${s.id}`} className="font-medium text-emerald-700 hover:underline">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-8 px-6 py-8 sm:px-8">
        {doc.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-6">
            <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
            {section.paragraphs?.map((p, i) => (
              <p key={i} className="mt-3 text-sm leading-relaxed text-slate-600">
                {p}
              </p>
            ))}
            {section.list && (
              <ul className="mt-3 space-y-2">
                {section.list.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-relaxed text-slate-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 sm:px-8">
        <p className="text-sm text-slate-600">
          Questions?{' '}
          <a href={`mailto:${doc.contactEmail}`} className="font-semibold text-emerald-700 hover:underline">
            {doc.contactEmail}
          </a>
        </p>
      </div>
    </article>
  );
}
