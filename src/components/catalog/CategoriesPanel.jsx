import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import {
  createCatalogCategory,
  deleteCatalogCategory,
  updateCatalogCategory,
} from '../../services/catalogApi';

export default function CategoriesPanel({ site, onChanged }) {
  const categories = site?.categories || [];
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }
    setSaving(true);
    try {
      await createCatalogCategory({
        name: name.trim(),
        description: description.trim() || undefined,
        is_active: true,
      });
      setName('');
      setDescription('');
      toast.success('Category added');
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add category');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (category) => {
    setBusyId(category.id);
    try {
      await updateCatalogCategory(category.id, { is_active: !category.is_active });
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (categoryId) => {
    if (!window.confirm('Delete this category? Products in it will become uncategorized.')) return;
    setBusyId(categoryId);
    try {
      await deleteCatalogCategory(categoryId);
      toast.success('Category deleted');
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={add} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-sm font-medium text-slate-800">Add category</p>
        <p className="text-xs text-slate-500">
          WhatsApp shop shows categories first. Customers pick a category, then see its products.
          More than 8 categories are paginated automatically.
        </p>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Electronics"
        />
        <Input
          label="Short description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Shown under the category name"
        />
        <Button type="submit" loading={saving}>
          <Plus size={16} />
          Add category
        </Button>
      </form>

      {categories.length === 0 ? (
        <p className="text-sm text-slate-500">No categories yet. Add one before assigning products.</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {categories.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 px-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{c.name}</p>
                <p className="text-xs text-slate-500">
                  {c.description || 'No description'}
                  {!c.is_active ? ' · Hidden' : ''}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="!px-2 !py-1 text-xs"
                disabled={busyId === c.id}
                onClick={() => toggleActive(c)}
              >
                {c.is_active ? 'Hide' : 'Show'}
              </Button>
              <button
                type="button"
                disabled={busyId === c.id}
                onClick={() => remove(c.id)}
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
