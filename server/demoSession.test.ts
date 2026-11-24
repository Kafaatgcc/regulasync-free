import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT, decodeJwt } from "jose";
import { users, type User } from "../drizzle/schema";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import { authRouter } from "./authRouter";
import { authenticateRequest, DEMO_SESSION_DURATION_MS, getRequestSession, signSession, verifySession, type SessionPayload } from "./_core/auth";
import { DEMO_ACCESS_COOKIE, DEMO_ACCESS_DURATION_MS, verifyDemoGrant, clearDemoGrant } from "./demoSessions";
import { createContext, type TrpcContext } from "./_core/context";
const mocks = vi.hoisted(() => ({ getDb: vi.fn(), getUserByOpenId: vi.fn(), select: vi.fn(), from: vi.fn(), where: vi.fn(), limit: vi.fn() }));
vi.mock("./db", () => ({ getDb: mocks.getDb, getUserByOpenId: mocks.getUserByOpenId }));
const access = { email: "demo@regulasync.co.uk", password: "RS@Demo#2026!Uk" };
let user: User;
const claims = (kind?: "demo"): SessionPayload => ({ userId: user.openId, email: user.email || "", name: user.name || "", ...(kind ? { kind } : {}) });
async function context(token?: string, grant?: string) {
  const cookie = vi.fn(), clearCookie = vi.fn();
  const req = { protocol: "https", headers: { cookie: [token ? `${COOKIE_NAME}=${token}` : "", grant ? `${DEMO_ACCESS_COOKIE}=${grant}` : ""].filter(Boolean).join("; ") } } as TrpcContext["req"];
  const ctx = await createContext({ req, res: { cookie, clearCookie } as unknown as TrpcContext["res"] });
  return { ctx, cookie, clearCookie, caller: authRouter.createCaller(ctx) };
}
const getCookie = (cookie: ReturnType<typeof vi.fn>, name: string) => cookie.mock.calls.find(call => call[0] === name)?.[1] as string;
async function entry() {
  const request = await context(); const result = await request.caller.startDemoSession(access);
  return { ...request, result, token: getCookie(request.cookie, COOKIE_NAME), grant: getCookie(request.cookie, DEMO_ACCESS_COOKIE) };
}
beforeEach(() => {
  vi.clearAllMocks(); vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-24T18:00:00.321Z"));
  vi.stubEnv("JWT_SECRET", "tests-only-not-a-deployment-secret"); vi.stubEnv("NODE_ENV", "test");
  for (const key of ["DEMO_ACCESS_EMAIL", "DEMO_ACCESS_PASSWORD", "DEMO_USER_EMAIL"]) vi.stubEnv(key, undefined);
  user = { id: 1, openId: "seeded-demo", email: "superadmin@regulasync.co.uk", name: "Demo User", passwordHash: null, authMethod: "password", role: "super_admin", department: null, jobTitle: null, organizationId: null, isActive: true, invitedBy: null, inviteToken: null, inviteTokenExpiry: null, passwordResetToken: null, passwordResetExpiry: null, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
  const chain = { select: mocks.select, from: mocks.from, where: mocks.where, limit: mocks.limit };
  mocks.getDb.mockResolvedValue(chain); mocks.select.mockReturnValue(chain); mocks.from.mockReturnValue(chain); mocks.where.mockReturnValue(chain); mocks.limit.mockResolvedValue([user]);
  mocks.getUserByOpenId.mockImplementation(async id => id === user.openId ? user : undefined);
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });
describe("Assessment credentials and bounded Railway demo sessions", () => {
  it.each(["production", "development"])("issues secure appropriate cookies in %s", async env => {
    vi.stubEnv("NODE_ENV", env); const started = await entry();
    expect(started.cookie).toHaveBeenCalledTimes(2); expect(started.result.expiresAt).toBe(decodeJwt(started.token).exp! * 1000);
    const options = started.cookie.mock.calls[0][2]; expect(options).toMatchObject({ httpOnly: true, secure: env === "production", sameSite: "lax", path: "/" });
    expect(options.maxAge).toBeLessThanOrEqual(DEMO_SESSION_DURATION_MS); expect(await verifySession(started.token)).toEqual(claims("demo"));
    expect(await verifySession(started.grant)).toBeNull(); expect(await verifyDemoGrant(started.token)).toBeNull();
  });
  it.each(["2027-06-01T12:00:00Z", "2030-01-01T00:00:00Z", "2040-01-01T00:00:00Z"])("does not calendar-expire the unchanged assessment code on %s", async date => {
    vi.setSystemTime(new Date(date)); expect((await entry()).result.success).toBe(true);
  });
  it.each([{ email: "wrong@example.com", password: access.password }, { email: access.email, password: "wrong" }, { email: "", password: "" }])("rejects wrong credentials before DB access (%#)", async input => {
    const request = await context(); await expect(request.caller.startDemoSession(input)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(mocks.getDb).not.toHaveBeenCalled(); expect(request.cookie).not.toHaveBeenCalled();
  });
  it("requires credential input", async () => { const r=await context(); await expect(r.caller.startDemoSession(undefined as never)).rejects.toMatchObject({ code: "BAD_REQUEST" }); });
  it("respects configured access credentials and demo account", async () => {
    vi.stubEnv("DEMO_ACCESS_EMAIL", "gate@example.com"); vi.stubEnv("DEMO_ACCESS_PASSWORD", "configured-test-password"); vi.stubEnv("DEMO_USER_EMAIL", "configured@example.com"); user.email="configured@example.com";
    const r=await context(); await expect(r.caller.startDemoSession(access)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect((await r.caller.startDemoSession({email:"gate@example.com",password:"configured-test-password"})).success).toBe(true);
  });
  it.each(["missing", "inactive", "database"])("fails closed for %s demo account", async state => {
    if(state==="missing") mocks.limit.mockResolvedValue([]); else if(state==="inactive") user.isActive=false; else mocks.getDb.mockResolvedValue(null);
    const r=await context(); await expect(r.caller.startDemoSession(access)).rejects.toBeTruthy(); expect(r.cookie).not.toHaveBeenCalled();
  });
  it("recovers an expired short session using the fixed separately signed grant", async () => {
    const started=await entry(); const originalGrant=decodeJwt(started.grant).exp!;
    vi.setSystemTime(Date.now()+DEMO_SESSION_DURATION_MS+1000); expect(await verifySession(started.token)).toBeNull();
    const r=await context(started.token,started.grant); expect(r.ctx.user).toBeNull(); const result=await r.caller.renewDemoSession();
    expect(result.success).toBe(true); expect(r.cookie).toHaveBeenCalledTimes(1); expect(getCookie(r.cookie,DEMO_ACCESS_COOKIE)).toBeUndefined();
    expect(decodeJwt(started.grant).exp).toBe(originalGrant); expect(await verifySession(getCookie(r.cookie,COOKIE_NAME))).toEqual(claims("demo"));
  });
  it("caps renewal at the original grant deadline", async () => {
    const started=await entry(); const expiry=decodeJwt(started.grant).exp! * 1000;
    vi.setSystemTime(expiry-20000); const r=await context(undefined,started.grant); const result=await r.caller.renewDemoSession(); expect(result.expiresAt).toBe(expiry);
  });
  it("cannot renew beyond two hours, but the same access code opens a new session", async () => {
    const started=await entry(); vi.setSystemTime(Date.now()+DEMO_ACCESS_DURATION_MS+1000);
    const r=await context(started.token,started.grant); await expect(r.caller.renewDemoSession()).rejects.toMatchObject({code:"UNAUTHORIZED"});
    expect((await r.caller.startDemoSession(access)).success).toBe(true);
  });
  it.each(["demo-admin", "ordinary-user"])("preserves a real normal account through gate and demo renewal (%s)", async type => {
    if(type==="ordinary-user") user.email="ordinary@example.com";
    const token=await signSession(claims()); const r=await context(token); r.ctx.req.headers.cookie+="; demoMode=true";
    expect((await r.caller.renewDemoSession()).isDemo).toBe(false); expect((await r.caller.startDemoSession(access)).isDemo).toBe(false);
    expect(r.cookie).not.toHaveBeenCalled(); expect(await verifySession(token)).toEqual(claims());
  });
  it.each(["missing", "tampered", "wrong-account", "inactive", "reconfigured"])("rejects invalid recovery proof (%s)", async state => {
    const started=await entry(); let grant=started.grant;
    if(state==="missing") grant=""; if(state==="tampered") grant+="bad"; if(state==="wrong-account") user.openId="replacement"; if(state==="inactive") user.isActive=false; if(state==="reconfigured") vi.stubEnv("DEMO_USER_EMAIL","new@example.com");
    const r=await context(undefined,grant); await expect(r.caller.renewDemoSession()).rejects.toBeTruthy(); expect(r.cookie).not.toHaveBeenCalled();
  });
  it("rejects forged client flags and a stale authenticated context without valid proof", async () => {
    const r=await context("tampered"); r.ctx.user=user; r.ctx.req.headers.cookie+="; kind=demo; isDemo=true";
    await expect(r.caller.renewDemoSession()).rejects.toMatchObject({code:"UNAUTHORIZED"}); expect(r.cookie).not.toHaveBeenCalled();
  });
  it("clears the bounded grant on intentional logout", async () => {
    const r=await context(); clearDemoGrant(r.ctx); expect(r.clearCookie).toHaveBeenCalledWith(DEMO_ACCESS_COOKIE,expect.objectContaining({httpOnly:true,path:"/",maxAge:-1}));
  });
});
describe("JWT compatibility and authentication", () => {
  it("caps marked demo tokens even if a year is requested", async () => { const token=await signSession(claims("demo"),ONE_YEAR_MS); expect(decodeJwt(token).exp!*1000-Date.now()).toBeLessThanOrEqual(DEMO_SESSION_DURATION_MS); });
  it("retains normal-account session format and lifetime", async () => { const token=await signSession(claims()); expect(decodeJwt(token)).not.toHaveProperty("kind"); expect(decodeJwt(token).exp).toBe(Math.floor((Date.now()+ONE_YEAR_MS)/1000)); const r=await context(token); expect(await authenticateRequest(r.ctx.req)).toBe(user); });
  it("rejects expired primary tokens without grant authentication", async () => { const started=await entry(); vi.setSystemTime(Date.now()+DEMO_SESSION_DURATION_MS+1000); const r=await context(started.token); expect(await getRequestSession(r.ctx.req)).toBeNull(); await expect(authenticateRequest(r.ctx.req)).rejects.toThrow(); await expect(r.caller.renewDemoSession()).rejects.toMatchObject({code:"UNAUTHORIZED"}); });
  it("rejects inactive authenticated users", async () => { const token=await signSession(claims()); user.isActive=false; const r=await context(token); expect(r.ctx.user).toBeNull(); await expect(authenticateRequest(r.ctx.req)).rejects.toThrow("inactive"); });
  it("rejects unknown signed kinds", async () => { const token=await new SignJWT({...claims(),kind:"not-demo"}).setProtectedHeader({alg:"HS256"}).setExpirationTime(Math.floor(Date.now()/1000)+60).sign(new TextEncoder().encode(process.env.JWT_SECRET!)); expect(await verifySession(token)).toBeNull(); });
  it("treats malformed cookies as invalid", async () => { const r=await context(); r.ctx.req.headers.cookie=`${COOKIE_NAME}=%invalid`; expect(await getRequestSession(r.ctx.req)).toBeNull(); });
});
