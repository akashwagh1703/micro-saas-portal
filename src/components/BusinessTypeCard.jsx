import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Building2, RefreshCw } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import BusinessWizard from './BusinessWizard';
import api from '../services/api';
import { applyBusinessChange } from '../utils/businessChange';

/**
 * Shows current business type and opens the setup wizard to change it.
 */
export default function BusinessTypeCard({ compact = false, onChanged }) {
  const navigate = useNavigate();
  const {
    businessProfile: contextProfile,
    applyBusinessProfile,
    refreshBusinessProfile,
  } = useOutletContext() ?? {};
  const [localProfile, setLocalProfile] = useState(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [loading, setLoading] = useState(!contextProfile);

  const profile = contextProfile ?? localProfile;

  const loadProfile = useCallback(async () => {
    if (contextProfile) return contextProfile;
    setLoading(true);
    try {
      const { data } = await api.get('/settings/business-profile');
      setLocalProfile(data);
      return data;
    } catch {
      setLocalProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [contextProfile]);

  useEffect(() => {
    if (!contextProfile) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [contextProfile, loadProfile]);

  const handleWizardCreated = async (data) => {
    const previousCategory = profile?.business_category ?? null;
    setWizardOpen(false);

    if (data?.business_profile) {
      applyBusinessProfile?.(data.business_profile);
      if (!applyBusinessProfile) setLocalProfile(data.business_profile);
    } else {
      await (refreshBusinessProfile?.() ?? loadProfile());
    }

    onChanged?.(data);

    const nextCategory =
      data?.business_profile?.business_category ?? data?.business_category ?? null;
    if (nextCategory && nextCategory !== previousCategory) {
      applyBusinessChange(navigate, data);
    }
  };

  if (loading) {
    return (
      <Card className={compact ? '!p-4' : ''}>
        <p className="text-sm text-slate-500">Loading business profile…</p>
      </Card>
    );
  }

  const configured = profile?.configured;
  const isCareerAi = profile?.business_category === 'career_ai';

  return (
    <>
      <Card
        className={`${compact ? '!p-4' : ''} ${isCareerAi ? '!border-emerald-100 !bg-emerald-50/30' : ''}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${
                isCareerAi ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Business type</p>
              {configured ? (
                <>
                  <p className="mt-0.5 text-sm text-slate-800">{profile.business_label}</p>
                  {profile.use_case_labels?.length > 0 && !isCareerAi && (
                    <p className="mt-1 text-xs text-slate-500">
                      {profile.use_case_labels.join(' · ')}
                    </p>
                  )}
                  {isCareerAi && (
                    <p className="mt-1 text-xs text-emerald-800">
                      WhatsApp job seeker bot — resumes, matching, cover letters
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-0.5 text-sm text-slate-500">Not set up yet</p>
              )}
            </div>
          </div>
          <Button
            variant={configured ? 'secondary' : 'primary'}
            onClick={() => setWizardOpen(true)}
          >
            <RefreshCw size={14} className="mr-1 inline" />
            {configured ? 'Change business type' : 'Set up business'}
          </Button>
        </div>

        {configured && profile.vertical_deprecated && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <strong>{profile.business_label}</strong> is a legacy business type. You can keep using it;
            switching to a new type uses our updated signup list.
          </p>
        )}

        {configured && !profile.can_change_business && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Turn off all live auto-replies in <strong>Auto-replies</strong> before switching to a
            different business type.
          </p>
        )}

        {configured && profile.can_change_business && !compact && (
          <p className="mt-3 text-xs text-slate-500">
            Switching business type updates your portal menu and WhatsApp bot behaviour. CareerAI
            data stays in the database until you remove it manually.
          </p>
        )}
      </Card>

      {wizardOpen && (
        <BusinessWizard
          profile={profile}
          onClose={() => setWizardOpen(false)}
          onCreated={handleWizardCreated}
        />
      )}
    </>
  );
}
