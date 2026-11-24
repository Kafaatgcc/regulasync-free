export const DEMO_RENEWAL_ERROR = "Your browser demo session has ended. Re-enter the same assessment access code to restart; the code has no scheduled expiry.";

export async function prepareDemoPresentation<T>(operations: {
  cancelAuth: () => Promise<unknown>;
  renew: () => Promise<unknown>;
  invalidateAuth: () => Promise<unknown>;
  readUser: () => Promise<T | null | undefined>;
}): Promise<T> {
  // A cached null, or an old in-flight null response, must not win over renewal.
  await operations.cancelAuth();
  await operations.renew();
  await operations.invalidateAuth();
  const user = await operations.readUser();
  if (!user) throw new Error(DEMO_RENEWAL_ERROR);
  return user;
}

export function shouldRedirectAuthError(pathname: string, procedure: string) {
  if (procedure.startsWith("passwordAuth.")) return false;
  const publicPaths = ["/", "/home", "/landing", "/login", "/forgot-password", "/accept-invite", "/about", "/pricing", "/security", "/integrations", "/case-studies", "/privacy", "/terms", "/cookies", "/careers", "/contact"];
  return !publicPaths.includes(pathname);
}
