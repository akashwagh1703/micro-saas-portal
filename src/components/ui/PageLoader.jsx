export default function PageLoader({ message = 'Loading AutoWave…' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-emerald-200 border-t-emerald-600" />
        <p className="text-sm font-medium text-slate-500">{message}</p>
      </div>
    </div>
  );
}
