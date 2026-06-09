import { useEffect, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BillingBanner from '../billing/BillingBanner';
import api from '../../services/api';

export default function DashboardLayout() {
  const [billing, setBilling] = useState(null);
  const [businessCategory, setBusinessCategory] = useState(null);

  const refreshBilling = useCallback(async () => {
    try {
      const { data } = await api.get('/billing/status');
      setBilling(data);
    } catch {
      setBilling(null);
    }
  }, []);

  const refreshBusinessProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/settings/business-profile');
      setBusinessCategory(data?.business_category ?? null);
    } catch {
      setBusinessCategory(null);
    }
  }, []);

  useEffect(() => {
    refreshBilling();
    refreshBusinessProfile();
  }, [refreshBilling, refreshBusinessProfile]);

  const isCareerAi = businessCategory === 'career_ai';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar billing={billing} businessCategory={businessCategory} />
      <main
        className={`flex-1 overflow-y-auto p-4 sm:p-6 ${
          isCareerAi
            ? 'bg-gradient-to-br from-slate-50 via-white to-emerald-50/40'
            : 'bg-slate-50'
        }`}
      >
        <BillingBanner billing={billing} onRefresh={refreshBilling} />
        <Outlet
          context={{
            billing,
            refreshBilling,
            businessCategory,
            refreshBusinessProfile,
            isCareerAi,
          }}
        />
      </main>
    </div>
  );
}
