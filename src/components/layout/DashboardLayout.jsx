import { useEffect, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BillingBanner from '../billing/BillingBanner';
import api from '../../services/api';

export default function DashboardLayout() {
  const [billing, setBilling] = useState(null);

  const refreshBilling = useCallback(async () => {
    try {
      const { data } = await api.get('/billing/status');
      setBilling(data);
    } catch {
      setBilling(null);
    }
  }, []);

  useEffect(() => {
    refreshBilling();
  }, [refreshBilling]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar billing={billing} />
      <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <BillingBanner billing={billing} onRefresh={refreshBilling} />
        <Outlet context={{ billing, refreshBilling }} />
      </main>
    </div>
  );
}
