import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import api from '../../services/api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token')?.trim() || '', [params]);
  const [form, setForm] = useState({ password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Reset link is missing or invalid.');
      return;
    }
    if (form.password !== form.password_confirmation) {
      toast.error('Password confirmation does not match.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        token,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      toast.success(data.message || 'Password updated.');
      navigate('/login', { replace: true });
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg =
        errors?.password?.[0] ||
        err.response?.data?.message ||
        'Could not reset password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Reset password" subtitle="This reset link is missing or incomplete.">
        <p className="text-center text-xs text-slate-500">
          <Link to="/forgot-password" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Request a new link
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Enter a new password for your AutoWave account.">
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">New password</label>
          <div className="relative">
            <Lock
              size={16}
              strokeWidth={1.5}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600/50"
            />
            <input
              type="password"
              required
              minLength={8}
              className="auth-input-focus w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">Confirm password</label>
          <div className="relative">
            <Lock
              size={16}
              strokeWidth={1.5}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600/50"
            />
            <input
              type="password"
              required
              minLength={8}
              className="auth-input-focus w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none"
              placeholder="Repeat password"
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            />
          </div>
        </div>
        <Button type="submit" loading={loading} className="w-full py-2.5">
          Update password
        </Button>
        <p className="text-center text-xs text-slate-500">
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
