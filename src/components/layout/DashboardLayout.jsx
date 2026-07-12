import { useEffect, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import BillingBanner from '../billing/BillingBanner';
import { AutoWaveMark } from '../brand/AutoWaveBrand';
import api from '../../services/api';

export default function DashboardLayout() {
  const user = useSelector((state) => state.auth.user);
  const isSuperAdmin = !!user?.is_super_admin;
  const [billing, setBilling] = useState(null);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
      setBusinessProfile(data);
      return data;
    } catch {
      setBusinessProfile(null);
      return null;
    }
  }, []);

  /** Instant UI sync after setup-business or other mutations — no wait for refetch. */
  const applyBusinessProfile = useCallback((profile) => {
    if (profile) setBusinessProfile(profile);
  }, []);

  useEffect(() => {
    refreshBilling();
    refreshBusinessProfile();
  }, [refreshBilling, refreshBusinessProfile]);

  const businessCategory = businessProfile?.business_category ?? null;

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileNavOpen]);

  const isCareerAi = businessCategory === 'career_ai';

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-slate-100">
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-label="Close navigation menu"
        />
      )}

      <Sidebar
        billing={billing}
        businessCategory={businessCategory}
        businessProfile={businessProfile}
        mobileOpen={mobileNavOpen}
        onNavClick={() => setMobileNavOpen(false)}
      />

      <main
        className={`main-scroll min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-7 lg:px-8 ${
          isCareerAi ? 'app-main-bg-career' : 'app-main-bg'
        }`}
      >
        <div className="mx-auto w-full">
          <div className="mb-4 flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm hover:bg-slate-50"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <AutoWaveMark variant="light" showTagline={false} />
          </div>

          <BillingBanner billing={isSuperAdmin ? null : billing} onRefresh={refreshBilling} />
          <Outlet
            context={{
              billing,
              refreshBilling,
              businessCategory,
              businessProfile,
              refreshBusinessProfile,
              applyBusinessProfile,
              isCareerAi,
            }}
          />
        </div>
      </main>
    </div>
  );
}
