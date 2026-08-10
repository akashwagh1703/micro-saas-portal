import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import Button from '../ui/Button';
import api from '../../services/api';

/**
 * Upgrades legacy catalog brochure/lead WhatsApp graphs to the commerce shop flow.
 */
export default function WhatsAppShopSyncCard({ visible }) {
  const [syncing, setSyncing] = useState(false);

  if (!visible) return null;

  const sync = async () => {
    setSyncing(true);
    try {
      const { data } = await api.post('/workflows/sync-catalog-commerce');
      toast.success(data?.message || 'Catalog WhatsApp shop is up to date');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update catalog WhatsApp flow');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card
      title="WhatsApp shop"
      description="Browse products → Order → business QR → screenshot. Publish your Catalog auto-reply after updating."
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" loading={syncing} onClick={sync}>
          <RefreshCw size={16} />
          Update WhatsApp shop flow
        </Button>
        <Link to="/workflows" className="text-sm font-medium text-sky-700 hover:text-sky-900">
          Open Auto-replies
        </Link>
      </div>
    </Card>
  );
}
