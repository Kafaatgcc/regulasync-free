/**
 * Self-contained JWT session management.
 * No external platform dependencies — uses jose for HS256 JWT signing/verification.
 */
import { SignJWT, jwtVerify } from "jose";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";
import type { Request } from "express";
import * as db from "../db";

export interface SessionPayload {
  userId: string; // openId / uuid stored in users table
  email: string;
  name: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is required");
  return new TextEncoder().encode(secret);
}

function parseCookies(cookieHeader: string | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!cookieHeader) return map;
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k) map.set(k.trim(), decodeURIComponent(v.join("=")));
  }
  return map;
}

export async function signSession(
  payload: SessionPayload,
  expiresInMs = ONE_YEAR_MS
): Promise<string> {
  const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1000);
  return new SignJWT({ userId: payload.userId, email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(getSecret());
}

export async function verifySession(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    const { userId, email, name } = payload as Record<string, unknown>;
    if (typeof userId !== "string" || typeof email !== "string" || typeof name !== "string") {
      return null;
    }
    return { userId, email, name };
  } catch {
    return null;
  }
}

export async function authenticateRequest(req: Request) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.get(COOKIE_NAME);
  const session = await verifySession(token);
  if (!session) throw new Error("Invalid or missing session");

  const user = await db.getUserByOpenId(session.userId);
  if (!user) throw new Error("User not found");
  return user;
}
