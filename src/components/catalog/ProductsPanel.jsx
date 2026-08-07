import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import AuthMediaImg from './AuthMediaImg';
import {
  catalogUploadErrorMessage,
  createCatalogProduct,
  deleteCatalogProduct,
  updateCatalogProduct,
  uploadCatalogMedia,
} from '../../services/catalogApi';

export default function ProductsPanel({ site, onChanged }) {
  const products = site?.products || [];
  const images = (site?.media || []).filter((m) => m.kind === 'image');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageMediaId, setImageMediaId] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }
    setSaving(true);
    try {
      await createCatalogProduct({
        name: name.trim(),
        description: description.trim() || undefined,
        price_amount: price !== '' ? Number(price) : undefined,
        price_currency: 'INR',
        image_media_id: imageMediaId ? Number(imageMediaId) : undefined,
        is_active: true,
      });
      setName('');
      setPrice('');
      setDescription('');
      setImageMediaId('');
      toast.success('Product added');
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add product');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (product) => {
    setBusyId(product.id);
    try {
      await updateCatalogProduct(product.id, { is_active: !product.is_active });
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    setBusyId(productId);
    try {
      await deleteCatalogProduct(productId);
      toast.success('Product deleted');
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete');
    } finally {
      setBusyId(null);
    }
  };

  const uploadForProduct = async (file) => {
    if (!file) return;
    try {
      const media = await uploadCatalogMedia(file, { kind: 'image' });
      setImageMediaId(String(media.id));
      toast.success('Image ready — save the product to attach it');
      onChanged?.();
    } catch (err) {
      toast.error(catalogUploadErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={add} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-sm font-medium text-slate-800">Add product</p>
        <p className="text-xs text-slate-500">
          Prices are display-only — no cart or checkout on the brochure.
        </p>
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gold package" />
        <Input
          label="Price (INR, optional)"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="999"
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short details customers should know"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Image (optional)</label>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm"
            value={imageMediaId}
            onChange={(e) => setImageMediaId(e.target.value)}
          >
            <option value="">No image</option>
            {images.map((m) => (
              <option key={m.id} value={m.id}>
                #{m.id} {m.file_name || m.alt || 'image'}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="mt-1 block w-full text-xs text-slate-500"
            onChange={(e) => uploadForProduct(e.target.files?.[0])}
          />
        </div>
        <Button type="submit" loading={saving}>
          <Plus size={16} />
          Add product
        </Button>
      </form>

      {products.length === 0 ? (
        <p className="text-sm text-slate-500">No products yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {products.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-3 py-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {p.image ? (
                  <AuthMediaImg
                    media={p.image}
                    siteStatus={site.status}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-500">
                  {p.price_amount != null
                    ? `₹${Number(p.price_amount).toLocaleString('en-IN')}`
                    : 'No price'}
                  {!p.is_active ? ' · Hidden' : ''}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="!px-2 !py-1 text-xs"
                disabled={busyId === p.id}
                onClick={() => toggleActive(p)}
              >
                {p.is_active ? 'Hide' : 'Show'}
              </Button>
              <button
                type="button"
                disabled={busyId === p.id}
                onClick={() => remove(p.id)}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
