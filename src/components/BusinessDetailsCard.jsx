import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import api from '../services/api';

export default function BusinessDetailsCard() {
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/settings/business-profile');
      setBusinessName(data?.business_name ?? data?.business_description ?? '');
    } catch {
      toast.error('Could not load business details');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    const trimmed = businessName.trim();
    if (!trimmed) {
      toast.error('Enter your business name');
      return;
    }
    setSaving(true);
    try {
      await api.put('/settings/business-details', { business_name: trimmed });
      try {
        await api.post('/workflows/sync-appointment-booking');
      } catch {
        /* non-fatal */
      }
      toast.success('Business name saved — it will appear in WhatsApp booking messages');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save business details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="!p-6">
      <h2 className="text-lg font-semibold text-slate-900">Business details</h2>
      <p className="mt-1 text-sm text-slate-500">
        This name appears in WhatsApp interactive messages when customers book appointments.
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="mt-4 space-y-4">
          <Input
            label="Business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Glow Salon & Spa"
            maxLength={120}
          />
          <Button onClick={save} loading={saving}>
            Save business name
          </Button>
        </div>
      )}
    </Card>
  );
}
