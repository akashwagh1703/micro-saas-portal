import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import api from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success(data.message || 'Check your email for a reset link.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your account email and we will send a reset link if it exists."
    >
      {sent ? (
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            If an account exists for <span className="font-medium text-slate-800">{email}</span>, a
            reset link is on its way. Check spam if you do not see it within a few minutes.
          </p>
          <p className="text-center text-xs text-slate-500">
            <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Back to sign in
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">Your email</label>
            <div className="relative">
              <Mail
                size={16}
                strokeWidth={1.5}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600/50"
              />
              <input
                type="email"
                required
                className="auth-input-focus w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none"
                placeholder="you@yourbusiness.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" loading={loading} className="w-full py-2.5">
            Send reset link
          </Button>
          <p className="text-center text-xs text-slate-500">
            <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
