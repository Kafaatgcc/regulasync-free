import { describe, expect, it } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

describe('auth.me public response', () => {
  it('never returns password hashes or authentication tokens', async () => {
    const user = { id: 1, openId: 'demo', email: 'demo@example.com', name: 'Demo', role: 'compliance_manager', isActive: true, passwordHash: 'secret-hash', inviteToken: 'secret-invite', passwordResetToken: 'secret-reset' } as TrpcContext['user'];
    const result = await appRouter.createCaller({ user, req: {} as TrpcContext['req'], res: {} as TrpcContext['res'] }).auth.me();
    expect(result).toMatchObject({ id: 1, role: 'compliance_manager' });
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('inviteToken');
    expect(result).not.toHaveProperty('passwordResetToken');
  });
  it('does not authenticate a visitor without a valid server session', async () => {
    expect(await appRouter.createCaller({ user: null, req: {} as TrpcContext['req'], res: {} as TrpcContext['res'] }).auth.me()).toBeNull();
  });
});
