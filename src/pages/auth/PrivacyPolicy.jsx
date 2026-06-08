import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LegalDocument from '../../components/legal/LegalDocument';
import { privacyPolicy } from '../../data/privacyPolicy';
import { AutoWaveMark } from '../../components/brand/AutoWaveBrand';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline">
            <ArrowLeft size={16} />
            Back to sign in
          </Link>
          <AutoWaveMark />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <LegalDocument doc={privacyPolicy} />
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/login" className="font-medium text-emerald-700 hover:underline">Sign in</Link>
          {' · '}
          <Link to="/register" className="font-medium text-emerald-700 hover:underline">Create account</Link>
        </p>
      </main>
    </div>
  );
}
