/** v4 catalog helpers — portal/mobile should stay in sync. */

export function filterSignupVerticals(verticals, currentCategory) {
  return (verticals ?? []).filter((v) => {
    if (v.visible_in_signup !== false) return true;
    return !!currentCategory && v.key === currentCategory;
  });
}

export function filterUseCasesForVertical(allUseCases, vertical) {
  if (!vertical) return [];
  const allowed = new Set(vertical.allowed_use_cases ?? []);
  return (allUseCases ?? []).filter((uc) => {
    if (uc.visible_in_signup === false) return false;
    if (allowed.size > 0 && !allowed.has(uc.key)) return false;
    return true;
  });
}

export function clampRecommendedUseCases(vertical, visibleUseCases) {
  const allowedKeys = new Set(visibleUseCases.map((u) => u.key));
  const max = vertical?.max_use_cases ?? 2;
  const rec = (vertical?.recommended_use_cases ?? []).filter((k) => allowedKeys.has(k));
  return rec.slice(0, max);
}
