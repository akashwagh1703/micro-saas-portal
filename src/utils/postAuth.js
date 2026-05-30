/** Send new users to Workflows for business guided setup when not configured. */
export async function resolvePostAuthPath(api) {
  try {
    const { data } = await api.get('/settings/business-profile');
    return data?.configured ? '/dashboard' : '/workflows';
  } catch {
    return '/workflows';
  }
}
