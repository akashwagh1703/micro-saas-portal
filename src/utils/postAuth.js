/** After login/register, send super admins to platform admin; others to home. */
export async function resolvePostAuthPath(api, user) {
  if (user?.is_super_admin) {
    return '/admin';
  }
  return '/dashboard';
}
