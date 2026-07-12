import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import api from '../services/api';

const EMPTY_ROW = { text: '', description: '', value: '' };

export default function SalonServicesCard() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/settings/salon-services');
      setServices(
        Array.isArray(data?.services) && data.services.length > 0
          ? data.services.map((s) => ({
              text: s.text ?? '',
              description: s.description ?? '',
              value: s.value ?? s.text ?? '',
            }))
          : [{ ...EMPTY_ROW }],
      );
    } catch {
      toast.error('Could not load salon services');
      setServices([{ ...EMPTY_ROW }]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateRow = (index, field, value) => {
    setServices((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const next = { ...row, [field]: value };
        if (field === 'text' && !row.value) {
          next.value = value;
        }
        return next;
      }),
    );
  };

  const addRow = () => {
    if (services.length >= 10) {
      toast.error('Maximum 10 services');
      return;
    }
    setServices((prev) => [...prev, { ...EMPTY_ROW }]);
  };

  const removeRow = (index) => {
    if (services.length <= 1) {
      toast.error('Keep at least one service');
      return;
    }
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    const payload = services
      .map((row) => ({
        text: row.text.trim(),
        description: row.description.trim() || undefined,
        value: (row.value || row.text).trim(),
      }))
      .filter((row) => row.text && row.value);

    if (payload.length === 0) {
      toast.error('Add at least one service with a name');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.put('/settings/salon-services', { services: payload });
      setServices(
        (data?.services ?? payload).map((s) => ({
          text: s.text ?? '',
          description: s.description ?? '',
          value: s.value ?? s.text ?? '',
        })),
      );
      toast.success('Salon services saved — WhatsApp booking picks update live');
    } catch (err) {
      const apiErrors = err.response?.data?.errors?.salon_services;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        toast.error(apiErrors[0]);
      } else {
        toast.error(err.response?.data?.message || 'Failed to save services');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Loading salon services…</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Booking services</h3>
          <p className="mt-1 text-sm text-slate-500">
            Customers see these as tap-to-pick options in your WhatsApp appointment flow. Up to 10
            services — first 3 show as buttons, more appear as a list.
          </p>
        </div>

        <div className="space-y-3">
          {services.map((row, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 space-y-2"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 grid gap-2 sm:grid-cols-2">
                  <Input
                    label="Service name"
                    value={row.text}
                    onChange={(e) => updateRow(index, 'text', e.target.value)}
                    placeholder="e.g. Haircut"
                    maxLength={20}
                  />
                  <Input
                    label="Short description (optional)"
                    value={row.description}
                    onChange={(e) => updateRow(index, 'description', e.target.value)}
                    placeholder="e.g. Classic cut & finish"
                    maxLength={72}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="mt-7 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove service"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Shown on WhatsApp as: <span className="font-medium text-slate-600">{row.text || '—'}</span>
                {row.description ? ` — ${row.description}` : ''}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={addRow} disabled={services.length >= 10}>
            <Plus size={16} className="mr-1 inline" />
            Add service
          </Button>
          <Button onClick={save} loading={saving}>
            Save services
          </Button>
        </div>
      </div>
    </Card>
  );
}
