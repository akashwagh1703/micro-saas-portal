import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { setCredentials } from '../../store/authSlice';
import { resolvePostAuthPath } from '../../utils/postAuth';

function AuthField({ label, icon: Icon, ...props }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-700">{label}</label>
      <div className="relative">
        <Icon
          size={16}
          strokeWidth={1.5}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600/50"
        />
        <input
          className="auth-input-focus w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none"
          {...props}
        />
      </div>
    </div>
  );
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      dispatch(setCredentials(data));
      toast.success('Welcome back!');
      navigate(await resolvePostAuthPath(api, data.user));
    } catch (err) {
      if (!err.response) {
        toast.error(
          'API server unreachable — the backend is down (nginx 502). Rebuild and restart PM2 on the server.',
          { duration: 7000 },
        );
      } else {
        toast.error(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Manage chats, auto-replies & contacts in one place.">
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="auth-animate-fade-up auth-stagger-1">
          <AuthField
            label="Your email"
            icon={Mail}
            type="email"
            placeholder="you@yourbusiness.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="auth-animate-fade-up auth-stagger-2">
          <AuthField
            label="Password"
            icon={Lock}
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <div className="auth-animate-fade-up auth-stagger-3">
          <Button type="submit" loading={loading} className="w-full py-2.5">
            Sign in
          </Button>
        </div>

        <p className="auth-animate-fade-up auth-stagger-4 text-center text-xs text-slate-500">
          New here?{' '}
          <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Create account
          </Link>
          {' · '}
          <Link to="/privacy" className="text-slate-400 hover:text-emerald-700">
            Privacy
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
