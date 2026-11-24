import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { prepareDemoPresentation, shouldRedirectAuthError } from '../client/src/lib/demoSession';

describe('prepared presentation session', () => {
  it('cancels old auth, renews, invalidates cached null, then waits for a verified user', async () => {
    const calls: string[] = [];
    const user = { id: 1 };
    const result = await prepareDemoPresentation({
      cancelAuth: async () => { calls.push('cancel'); },
      renew: async () => { calls.push('renew'); },
      invalidateAuth: async () => { calls.push('invalidate'); },
      readUser: async () => { calls.push('verify'); return user; },
    });
    expect(calls).toEqual(['cancel', 'renew', 'invalidate', 'verify']);
    expect(result).toEqual(user);
  });
  it('does not authorize a missing cookie or fabricated local demo flag', async () => {
    await expect(prepareDemoPresentation({ cancelAuth: async () => {}, renew: async () => {}, invalidateAuth: async () => {}, readUser: async () => null })).rejects.toThrow('browser demo session has ended');
  });
  it('does not continue after rejected renewal', async () => {
    const readUser = vi.fn();
    await expect(prepareDemoPresentation({ cancelAuth: async () => {}, renew: async () => { throw new Error('Denied'); }, invalidateAuth: async () => {}, readUser })).rejects.toThrow('Denied');
    expect(readUser).not.toHaveBeenCalled();
  });
  it('exposes why cached null must wait for isFetching, not only isLoading', async () => {
    const client = new QueryClient();
    const key = ['auth', 'me'];
    client.setQueryData(key, null);
    let resolve!: (value: { id: number }) => void;
    const pending = new Promise<{ id: number }>(r => { resolve = r; });
    const observer = new QueryObserver(client, { queryKey: key, queryFn: () => pending, staleTime: 0, refetchOnMount: 'always' });
    const unsubscribe = observer.subscribe(() => {});
    expect(observer.getCurrentResult()).toMatchObject({ data: null, isLoading: false, isFetching: true });
    resolve({ id: 1 });
    await observer.refetch();
    expect(observer.getCurrentResult().data).toEqual({ id: 1 });
    unsubscribe(); client.clear();
  });
});

describe('auth-error redirect scope', () => {
  it('does not eject a visitor for public chat or demo renewal failures', () => {
    expect(shouldRedirectAuthError('/landing', 'aiChat.chat')).toBe(false);
    expect(shouldRedirectAuthError('/dashboard', 'passwordAuth.renewDemoSession')).toBe(false);
    expect(shouldRedirectAuthError('/login', 'passwordAuth.loginWithPassword')).toBe(false);
  });
  it('still enforces authentication for protected APIs', () => {
    expect(shouldRedirectAuthError('/audit-trail', 'auditTrail.list')).toBe(true);
    expect(shouldRedirectAuthError('/dashboard', 'dashboard.stats')).toBe(true);
  });
});
