import { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import AuthMediaImg from './AuthMediaImg';
import {
  catalogUploadErrorMessage,
  updateCatalogPaymentSettings,
  uploadCatalogMedia,
} from '../../services/catalogApi';

/**
 * Per-business merchant UPI QR for catalog order checkout.
 * Not the AutoWave platform billing QR.
 */
export default function PaymentSettingsPanel({ site, onChanged }) {
  const payment = site?.payment || {};
  const [enabled, setEnabled] = useState(!!payment.payments_enabled);
  const [vpa, setVpa] = useState(payment.upi_vpa || '');
  const [payee, setPayee] = useState(payment.upi_payee_name || '');
  const [qrMediaId, setQrMediaId] = useState(payment.qr_media_id || null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setEnabled(!!payment.payments_enabled);
    setVpa(payment.upi_vpa || '');
    setPayee(payment.upi_payee_name || '');
    setQrMediaId(payment.qr_media_id || null);
  }, [
    payment.payments_enabled,
    payment.upi_vpa,
    payment.upi_payee_name,
    payment.qr_media_id,
  ]);

  const qrMedia =
    (site?.media || []).find((m) => m.id === qrMediaId) || payment.qr || null;

  const uploadQr = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const media = await uploadCatalogMedia(file, { kind: 'image', alt: 'Payment QR' });
      setQrMediaId(media.id);
      await updateCatalogPaymentSettings({ qr_media_id: media.id });
      toast.success('Payment QR uploaded');
      onChanged?.();
    } catch (err) {
      toast.error(catalogUploadErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (enabled && !qrMediaId) {
      toast.error('Upload a payment QR before enabling customer payments');
      return;
    }
    setSaving(true);
    try {
      await updateCatalogPaymentSettings({
        payments_enabled: enabled,
        upi_vpa: vpa.trim() || null,
        upi_payee_name: payee.trim() || null,
        qr_media_id: qrMediaId,
      });
      toast.success('Payment settings saved');
      onChanged?.();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : msg?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const clearQr = async () => {
    if (!window.confirm('Remove the payment QR? Customer payments will be disabled.')) return;
    setSaving(true);
    try {
      await updateCatalogPaymentSettings({
        qr_media_id: null,
        payments_enabled: false,
      });
      setQrMediaId(null);
      setEnabled(false);
      toast.success('Payment QR removed');
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove QR');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-4">
      <p className="text-sm text-slate-600">
        Upload <strong>your business</strong> UPI QR for WhatsApp catalog orders. This is separate
        from AutoWave subscription billing.
      </p>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        Enable customer payments (WhatsApp checkout)
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="UPI ID (optional)"
          value={vpa}
          onChange={(e) => setVpa(e.target.value)}
          placeholder="yourname@upi"
        />
        <Input
          label="Payee name (optional)"
          value={payee}
          onChange={(e) => setPayee(e.target.value)}
          placeholder="Business name on UPI"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <QrCode size={18} className="text-emerald-600" />
          Payment QR code
        </div>
        {qrMedia ? (
          <div className="mt-3 max-w-xs overflow-hidden rounded-lg border border-slate-200 bg-white p-2">
            <AuthMediaImg
              media={qrMedia}
              siteStatus={site?.status}
              className="mx-auto max-h-48 w-full object-contain"
            />
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-500">No QR uploaded yet.</p>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-3 block w-full text-xs text-slate-500"
          disabled={uploading || saving}
          onChange={(e) => uploadQr(e.target.files?.[0])}
        />
        {qrMediaId ? (
          <button
            type="button"
            onClick={clearQr}
            disabled={saving}
            className="mt-2 text-xs font-medium text-red-600 hover:underline"
          >
            Remove QR
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={saving || uploading}>
          Save payment settings
        </Button>
        {payment.configured ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
            Ready for checkout
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
            Not configured
          </span>
        )}
      </div>
    </form>
  );
}
