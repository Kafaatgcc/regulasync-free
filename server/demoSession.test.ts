import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { users, type User } from "../drizzle/schema";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import { authRouter } from "./authRouter";
import {
  authenticateRequest,
  DEMO_SESSION_DURATION_MS,
  getRequestSession,
  signSession,
  verifySession,
  type SessionPayload,
} from "./_core/auth";
import { createContext, type TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  getUserByOpenId: vi.fn(),
  select: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
}));

vi.mock("./db", () => ({
  getDb: dbMocks.getDb,
  getUserByOpenId: dbMocks.getUserByOpenId,
}));

const defaultAccess = {
  email: "demo@regulasync.co.uk",
  password: "RS@Demo#2026!Uk",
};

let demoUser: User;

function sessionFor(user: User, kind?: "demo"): SessionPayload {
  return {
    userId: user.openId,
    email: user.email || "",
    name: user.name || "",
    ...(kind ? { kind } : {}),
  };
}

async function requestContext(token?: string) {
  const cookie = vi.fn();
  const req = {
    protocol: "https",
    headers: token ? { cookie: `${COOKIE_NAME}=${encodeURIComponent(token)}` } : {},
  } as TrpcContext["req"];
  const res = { cookie } as unknown as TrpcContext["res"];
  const ctx = await createContext({ req, res });
  return { ctx, cookie, caller: authRouter.createCaller(ctx) };
}

async function expectDemoCookie(
  cookie: ReturnType<typeof vi.fn>,
  result: { expiresAt: number },
  secure: boolean
) {
  expect(cookie).toHaveBeenCalledTimes(1);
  const [name, token, options] = cookie.mock.calls[0]!;
  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(process.env.JWT_SECRET!),
    { algorithms: ["HS256"] }
  );
  expect(name).toBe(COOKIE_NAME);
  expect(payload.kind).toBe("demo");
  expect(payload.userId).toBe(demoUser.openId);
  expect(payload.email).toBe(demoUser.email);
  expect(result.expiresAt).toBe(payload.exp! * 1000);
  expect(result.expiresAt).toBe(Math.floor((Date.now() + DEMO_SESSION_DURATION_MS) / 1000) * 1000);
  expect(options).toEqual({
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: result.expiresAt - Date.now(),
  });
  expect(options.maxAge).toBeGreaterThan(0);
  expect(options.maxAge).toBeLessThanOrEqual(15 * 60 * 1000);
  expect(await verifySession(token)).toEqual(sessionFor(demoUser, "demo"));
  return token as string;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  // A fractional second also verifies cookie/JWT rounding cannot extend expiry.
  vi.setSystemTime(new Date("2026-11-16T09:00:00.321Z"));
  vi.stubEnv("JWT_SECRET", "demo-session-tests-only-signing-key-not-a-deployment-secret");
  vi.stubEnv("DEMO_ACCESS_EMAIL", undefined);
  vi.stubEnv("DEMO_ACCESS_PASSWORD", undefined);
  vi.stubEnv("DEMO_USER_EMAIL", undefined);
  vi.stubEnv("NODE_ENV", "test");
  demoUser = {
    id: 1,
    openId: "seeded-demo-user",
    email: "superadmin@regulasync.co.uk",
    name: "Demo User",
    passwordHash: null,
    authMethod: "password",
    role: "super_admin",
    department: null,
    jobTitle: null,
    organizationId: null,
    isActive: true,
    invitedBy: null,
    inviteToken: null,
    inviteTokenExpiry: null,
    passwordResetToken: null,
    passwordResetExpiry: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const query = {
    select: dbMocks.select,
    from: dbMocks.from,
    where: dbMocks.where,
    limit: dbMocks.limit,
  };
  dbMocks.getDb.mockResolvedValue(query);
  dbMocks.select.mockReturnValue(query);
  dbMocks.from.mockReturnValue(query);
  dbMocks.where.mockReturnValue(query);
  dbMocks.limit.mockResolvedValue([demoUser]);
  dbMocks.getUserByOpenId.mockImplementation(async (openId: string) =>
    openId === demoUser.openId ? demoUser : undefined
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("server demo entry gate", () => {
  it.each(["production", "development"])(
    "accepts correct default credentials and aligns cookie/JWT expiry in %s",
    async nodeEnv => {
      vi.stubEnv("NODE_ENV", nodeEnv);
      const { caller, cookie } = await requestContext();
      const result = await caller.startDemoSession(defaultAccess);
      expect(result).toMatchObject({
        success: true,
        user: { id: demoUser.id, email: demoUser.email, role: demoUser.role },
      });
      expect(dbMocks.where).toHaveBeenCalledWith(eq(users.email, demoUser.email!));
      const token = await expectDemoCookie(cookie, result, nodeEnv === "production");
      const nextRequest = await requestContext(token);
      expect(nextRequest.ctx.user).toBe(demoUser);
    }
  );

  it.each([
    { email: "wrong@example.com", password: defaultAccess.password },
    { email: defaultAccess.email, password: "wrong-password" },
    { email: "", password: "" },
  ])("rejects incorrect credentials without DB access or a cookie (%#)", async input => {
    const { caller, cookie } = await requestContext();
    await expect(caller.startDemoSession(input)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(cookie).not.toHaveBeenCalled();
    expect(dbMocks.getDb).not.toHaveBeenCalled();
  });

  it("requires credential input rather than permitting the previous input-free entry", async () => {
    const { caller, cookie } = await requestContext();
    // Exercise an old/untyped client that still calls this mutation with no input.
    await expect(caller.startDemoSession(undefined as never)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(cookie).not.toHaveBeenCalled();
    expect(dbMocks.getDb).not.toHaveBeenCalled();
  });

  it("uses configured gate credentials and seeded account instead of the defaults", async () => {
    const configuredAccess = { email: "gate@example.com", password: "test-configured-gate" };
    vi.stubEnv("DEMO_ACCESS_EMAIL", configuredAccess.email);
    vi.stubEnv("DEMO_ACCESS_PASSWORD", configuredAccess.password);
    vi.stubEnv("DEMO_USER_EMAIL", "configured-demo@example.com");
    demoUser.email = "configured-demo@example.com";
    const { caller, cookie } = await requestContext();
    await expect(caller.startDemoSession(defaultAccess)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(cookie).not.toHaveBeenCalled();
    const result = await caller.startDemoSession(configuredAccess);
    expect(dbMocks.where).toHaveBeenCalledWith(eq(users.email, demoUser.email));
    await expectDemoCookie(cookie, result, false);
  });

  it.each(["missing", "inactive"])("rejects an unavailable %s demo account", async state => {
    if (state === "missing") dbMocks.limit.mockResolvedValue([]);
    else demoUser.isActive = false;
    const { caller, cookie } = await requestContext();
    await expect(caller.startDemoSession(defaultAccess)).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    expect(cookie).not.toHaveBeenCalled();
  });

  it("does not issue a cookie if the database is unavailable", async () => {
    dbMocks.getDb.mockResolvedValue(null);
    const { caller, cookie } = await requestContext();
    await expect(caller.startDemoSession(defaultAccess)).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
    expect(cookie).not.toHaveBeenCalled();
  });
});

describe("verified demo renewal", () => {
  it("renews an active verified demo session with a fresh bounded expiry", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const entry = await requestContext();
    const initial = await entry.caller.startDemoSession(defaultAccess);
    const token = await expectDemoCookie(entry.cookie, initial, true);
    vi.setSystemTime(Date.now() + 5 * 60 * 1000);
    const { caller, cookie } = await requestContext(token);
    const renewed = await caller.renewDemoSession();
    expect(renewed.expiresAt).toBeGreaterThan(initial.expiresAt);
    const renewedToken = await expectDemoCookie(cookie, renewed, true);
    expect(renewedToken).not.toBe(token);
  });

  it("renews the configured demo account, not just the default account", async () => {
    vi.stubEnv("DEMO_USER_EMAIL", "custom-demo@example.com");
    demoUser.email = "custom-demo@example.com";
    const token = await signSession(sessionFor(demoUser, "demo"));
    const { caller, cookie } = await requestContext(token);
    await expectDemoCookie(cookie, await caller.renewDemoSession(), false);
  });

  it.each(["demo-account", "ordinary-user"])(
    "denies normal auth sessions even with client demo flags (%s)",
    async account => {
      if (account === "ordinary-user") demoUser.email = "ordinary@example.com";
      const token = await signSession(sessionFor(demoUser));
      const { caller, cookie, ctx } = await requestContext(token);
      expect(ctx.user).toBe(demoUser);
      ctx.req.headers.cookie += "; isDemo=true; demoAccess=true";
      // Neither untrusted mutation input nor arbitrary client cookies grant demo renewal.
      await expect(caller.renewDemoSession({ kind: "demo", isDemo: true } as never))
        .rejects.toMatchObject({ code: "UNAUTHORIZED" });
      expect(cookie).not.toHaveBeenCalled();
    }
  );

  it("denies a signed demo marker on a different account", async () => {
    demoUser.email = "ordinary@example.com";
    const token = await signSession(sessionFor(demoUser, "demo"));
    const { caller, cookie } = await requestContext(token);
    await expect(caller.renewDemoSession()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(cookie).not.toHaveBeenCalled();
  });

  it("requires the verified token identity to match the authenticated context user", async () => {
    const token = await signSession({ ...sessionFor(demoUser, "demo"), userId: "another-user" });
    const { ctx, cookie } = await requestContext(token);
    ctx.user = demoUser;
    await expect(authRouter.createCaller(ctx).renewDemoSession()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(cookie).not.toHaveBeenCalled();
  });

  it("denies renewal when the demo account email is reconfigured", async () => {
    const token = await signSession(sessionFor(demoUser, "demo"));
    vi.stubEnv("DEMO_USER_EMAIL", "replacement@example.com");
    const { caller, cookie } = await requestContext(token);
    await expect(caller.renewDemoSession()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(cookie).not.toHaveBeenCalled();
  });

  it("rejects expired demo tokens in verification, authentication, and protected renewal", async () => {
    const token = await signSession(sessionFor(demoUser, "demo"));
    const initial = await requestContext(token);
    vi.setSystemTime(Math.floor((Date.now() + DEMO_SESSION_DURATION_MS) / 1000) * 1000);
    expect(await verifySession(token)).toBeNull();
    expect(await getRequestSession(initial.ctx.req)).toBeNull();
    await expect(authenticateRequest(initial.ctx.req)).rejects.toThrow("Invalid or missing session");
    const expired = await requestContext(token);
    expect(expired.ctx.user).toBeNull();
    await expect(expired.caller.renewDemoSession()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(expired.cookie).not.toHaveBeenCalled();
    // A stale context cannot bypass the renewal mutation's own JWT verification.
    await expect(initial.caller.renewDemoSession()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(initial.cookie).not.toHaveBeenCalled();
  });

  it("rejects inactive users in authentication and renewal", async () => {
    const token = await signSession(sessionFor(demoUser, "demo"));
    const initial = await requestContext(token);
    demoUser.isActive = false;
    await expect(authenticateRequest(initial.ctx.req)).rejects.toThrow("User is inactive");
    const inactive = await requestContext(token);
    expect(inactive.ctx.user).toBeNull();
    await expect(inactive.caller.renewDemoSession()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(initial.caller.renewDemoSession()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(inactive.cookie).not.toHaveBeenCalled();
    expect(initial.cookie).not.toHaveBeenCalled();
  });

  it("rejects a tampered JWT without granting renewal from a stale authenticated context", async () => {
    const token = await signSession(sessionFor(demoUser, "demo"));
    const [header, payload] = token.split(".");
    const tampered = `${header}.${payload}.invalid-signature`;
    const { ctx, cookie } = await requestContext(tampered);
    expect(ctx.user).toBeNull();
    ctx.user = demoUser;
    expect(await getRequestSession(ctx.req)).toBeNull();
    await expect(authRouter.createCaller(ctx).renewDemoSession()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(cookie).not.toHaveBeenCalled();
  });

  it("denies renewal without a session", async () => {
    const { caller, cookie } = await requestContext();
    await expect(caller.renewDemoSession()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(cookie).not.toHaveBeenCalled();
  });
});

describe("JWT session compatibility", () => {
  it("preserves the demo marker and caps its lifetime even with the normal default duration", async () => {
    const token = await signSession(sessionFor(demoUser, "demo"), ONE_YEAR_MS);
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    expect(payload.exp! * 1000 - Date.now()).toBeLessThanOrEqual(DEMO_SESSION_DURATION_MS);
    expect(await verifySession(token)).toEqual(sessionFor(demoUser, "demo"));
  });

  it("leaves normal sessions unmarked with the existing one-year default duration", async () => {
    const normal = sessionFor(demoUser);
    const token = await signSession(normal);
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    expect(payload).not.toHaveProperty("kind");
    expect(payload.exp).toBe(Math.floor((Date.now() + ONE_YEAR_MS) / 1000));
    expect(await verifySession(token)).toEqual(normal);
    const { ctx } = await requestContext(token);
    expect(await authenticateRequest(ctx.req)).toBe(demoUser);
  });

  it("rejects unknown signed session kinds", async () => {
    const token = await new SignJWT({ ...sessionFor(demoUser), kind: "not-demo" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(Math.floor(Date.now() / 1000) + 60)
      .sign(new TextEncoder().encode(process.env.JWT_SECRET!));
    expect(await verifySession(token)).toBeNull();
  });

  it("treats malformed cookies as an invalid session", async () => {
    const { ctx } = await requestContext();
    ctx.req.headers.cookie = `${COOKIE_NAME}=%invalid`;
    expect(await getRequestSession(ctx.req)).toBeNull();
  });
});
