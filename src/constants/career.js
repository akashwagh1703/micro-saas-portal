/** Minimum job match score shown to seekers and used in operator analytics (matches API). */
export const CAREER_MATCH_THRESHOLD = 65;

export const CAREER_STRONG_MATCH_THRESHOLD = 80;

export function formatMatchThreshold(label = 'matches') {
  return `${CAREER_MATCH_THRESHOLD}%+ ${label}`;
}
