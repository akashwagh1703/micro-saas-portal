import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { setCredentials } from '../../store/authSlice';
import { resolvePostAuthPath } from '../../utils/postAuth';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      dispatch(setCredentials(data));
      toast.success('Welcome! Check your email to confirm your address.');
      navigate(await resolvePostAuthPath(api, data.user));
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors ? Object.values(errors).flat()[0] : 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Set up auto-replies in minutes — no tech skills needed.">
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <Input label="Confirm Password" type="password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} required />
        <Button type="submit" loading={loading} className="w-full py-2.5">Create account</Button>
        <p className="text-center text-xs text-slate-500">
          Have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
