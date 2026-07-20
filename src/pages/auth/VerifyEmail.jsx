import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import api from '../../services/api';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token')?.trim() || '', [params]);
  const [status, setStatus] = useState(token ? 'pending' : 'missing'); // pending | ok | error | missing
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.post('/auth/verify-email', { token });
        if (cancelled) return;
        setStatus('ok');
        setMessage(data.message || 'Email verified successfully.');
        toast.success('Email verified');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(err.response?.data?.message || 'This verification link is invalid or expired.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthLayout
      title="Verify email"
      subtitle={
        status === 'pending'
          ? 'Confirming your email address…'
          : status === 'ok'
            ? 'Your email is confirmed.'
            : 'We could not verify this link.'
      }
    >
      <div className="space-y-3 text-sm text-slate-600">
        {status === 'pending' && <p>Please wait a moment…</p>}
        {status !== 'pending' && message && <p>{message}</p>}
        {status === 'ok' && (
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Continue to sign in
          </Link>
        )}
        {(status === 'error' || status === 'missing') && (
          <p className="text-center text-xs text-slate-500">
            <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Back to sign in
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
