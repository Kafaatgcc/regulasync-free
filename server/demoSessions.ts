import { publicProcedure } from "./_core/trpc";
import { SignJWT, jwtVerify, decodeJwt } from "jose";
import { parse } from "cookie";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { users, type User } from "../drizzle/schema";
import { getDb } from "./db";
import { DEMO_SESSION_DURATION_MS, signSession, verifySession } from "./_core/auth";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import { createHmac } from "node:crypto";

export { DEMO_SESSION_DURATION_MS };
export const DEMO_ACCESS_DURATION_MS = 2 * 60 * 60 * 1000;
export const DEMO_ACCESS_COOKIE = "regulasync_demo_grant";
export const demoUserEmail = () => process.env.DEMO_USER_EMAIL || "superadmin@regulasync.co.uk";
const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" });
function grantKey() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
  return createHmac("sha256", process.env.JWT_SECRET).update("regulasync-demo-grant-v1").digest();
}
function requestCookies(ctx: TrpcContext) {
  try { return parse(ctx.req.headers.cookie || ""); } catch { return {}; }
}
export async function verifyDemoSession(token?: string) {
  const session = await verifySession(token);
  return session?.kind === "demo" ? session : null;
}
export async function verifyDemoGrant(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, grantKey(), { algorithms: ["HS256"] });
    if (payload.kind !== "demo_access" || typeof payload.userId !== "string" || typeof payload.email !== "string" || typeof payload.exp !== "number") return null;
    return { userId: payload.userId, email: payload.email, expiresAt: payload.exp * 1000 };
  } catch { return null; }
}
export function clearDemoGrant(ctx: TrpcContext) {
  ctx.res.clearCookie(DEMO_ACCESS_COOKIE, { ...cookieOptions(), maxAge: -1 });
}
const normalResult = (user: User) => ({ success: true as const, expiresAt: null, isDemo: false, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
export async function issueDemoSession(ctx: TrpcContext, user: User, createGrant = false, accessExpiresAt?: number) {
  const duration = Math.min(DEMO_SESSION_DURATION_MS, (accessExpiresAt ?? Infinity) - Date.now());
  if (duration <= 0) throw new TRPCError({ code: "UNAUTHORIZED", message: "Browser demo session has expired; the assessment access code is unchanged" });
  const claims = { userId: user.openId, email: user.email || "", name: user.name || "RegulaSync Demo" };
  const token = await signSession({ ...claims, kind: "demo" }, duration);
  const expiresAt = decodeJwt(token).exp! * 1000;
  ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: Math.max(0, expiresAt - Date.now()) });
  if (createGrant) {
    // Only credential verification creates this fixed two-hour recovery window.
    // Renewals never extend it, and grants cannot authenticate as primary sessions.
    const grant = await new SignJWT({ ...claims, kind: "demo_access" }).setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt().setExpirationTime(Math.floor((Date.now() + DEMO_ACCESS_DURATION_MS) / 1000)).sign(grantKey());
    ctx.res.cookie(DEMO_ACCESS_COOKIE, grant, { ...cookieOptions(), maxAge: DEMO_ACCESS_DURATION_MS });
  }
  return { success: true as const, expiresAt, isDemo: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}
async function getDemoUser() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Demo is temporarily unavailable" });
  const [user] = await db.select().from(users).where(eq(users.email, demoUserEmail())).limit(1);
  if (!user || !user.isActive) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Demo account is unavailable" });
  return user;
}
export const preparedDemoProcedures = {
  // The assessment credential has no scheduled/calendar expiry. Browser bearer
  // sessions and password-reset/invitation tokens intentionally remain bounded.
  startDemoSession: publicProcedure.input(z.object({ email: z.string(), password: z.string() })).mutation(async ({ input, ctx }) => {
    if (input.email !== (process.env.DEMO_ACCESS_EMAIL || "demo@regulasync.co.uk") || input.password !== (process.env.DEMO_ACCESS_PASSWORD || "RS@Demo#2026!Uk")) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid demo credentials" });
    }
    const existing = await verifySession(requestCookies(ctx)[COOKIE_NAME]);
    if (ctx.user?.isActive && existing && !existing.kind && existing.userId === ctx.user.openId && existing.email === ctx.user.email) return normalResult(ctx.user);
    return issueDemoSession(ctx, await getDemoUser(), true);
  }),
  renewDemoSession: publicProcedure.mutation(async ({ ctx }) => {
    const cookies = requestCookies(ctx);
    const session = await verifyDemoSession(cookies[COOKIE_NAME]);
    const existing = await verifySession(cookies[COOKIE_NAME]);
    // Keep a normally authenticated account intact, even with old demo flags.
    if (ctx.user && existing && !existing.kind && existing.userId === ctx.user.openId && existing.email === ctx.user.email) {
      if (!ctx.user.isActive) throw new TRPCError({ code: "UNAUTHORIZED" });
      return normalResult(ctx.user);
    }
    const grant = await verifyDemoGrant(cookies[DEMO_ACCESS_COOKIE]);
    if (!grant || grant.email !== demoUserEmail() || (session && (session.userId !== grant.userId || session.email !== grant.email))) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Please re-enter the unchanged assessment access code to start a new browser session" });
    }
    const user = await getDemoUser();
    if (user.openId !== grant.userId || (ctx.user && (ctx.user.openId !== grant.userId || !ctx.user.isActive))) throw new TRPCError({ code: "UNAUTHORIZED" });
    return issueDemoSession(ctx, user, false, grant.expiresAt);
  }),
};
