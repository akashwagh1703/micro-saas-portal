import { useNavigate } from 'react-router-dom';

/** After setup-business succeeds, refresh UI and route to the right product surface. */
export function applyBusinessChange(navigate, data) {
  const category =
    data?.business_profile?.business_category ?? data?.business_category ?? null;

  if (category === 'career_ai') {
    navigate('/career-ai', { replace: true });
    return;
  }

  if (category && category !== 'career_ai') {
    navigate('/workflows', { replace: true });
  }
}
