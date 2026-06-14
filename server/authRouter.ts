import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { signSession } from "./_core/auth";
import { z } from "zod";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";


import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";

// Role hierarchy for permission checks
export const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 6,
  company_admin: 5,
  compliance_manager: 4,
  department_user: 3,
  auditor: 2,
  admin: 5,
  user: 1,
};

export function hasPermission(userRole: string, requiredRole: string): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

export const authRouter = router({
  // Email/password login
  loginWithPassword: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (!user || !user.passwordHash) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      if (!user.isActive) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Your account has been deactivated. Contact your administrator." });
      }

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

      const sessionToken = await signSession(
        { userId: user.openId, email: user.email || "", name: user.name || user.email || "" },
        ONE_YEAR_MS
      );
      ctx.res.cookie(COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: ONE_YEAR_MS,
        path: "/",
      });

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          jobTitle: user.jobTitle,
          organizationId: user.organizationId,
        },
      };
    }),

  // Accept invite and set password
  acceptInvite: publicProcedure
    .input(z.object({
      token: z.string(),
      name: z.string().min(2),
      password: z.string().min(8),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.inviteToken, input.token))
        .limit(1);

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or expired invite link" });
      }

      if (user.inviteTokenExpiry && user.inviteTokenExpiry < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invite link has expired. Please request a new one." });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      await db.update(users)
        .set({ name: input.name, passwordHash, inviteToken: null, inviteTokenExpiry: null, isActive: true, lastSignedIn: new Date() })
        .where(eq(users.id, user.id));

      const sessionToken = await signSession(
        { userId: user.openId, email: user.email || "", name: input.name },
        ONE_YEAR_MS
      );
      ctx.res.cookie(COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: ONE_YEAR_MS,
        path: "/",
      });

      return { success: true, user: { id: user.id, name: input.name, email: user.email, role: user.role } };
    }),

  // Request password reset
  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: true };
      const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

      if (!user) return { success: true }; // Prevent email enumeration

      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000);

      await db.update(users)
        .set({ passwordResetToken: resetToken, passwordResetExpiry: expiry })
        .where(eq(users.id, user.id));

      return { success: true, resetToken };
    }),

  // Reset password with token
  resetPassword: publicProcedure
    .input(z.object({
      token: z.string(),
      password: z.string().min(8),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [user] = await db.select().from(users).where(eq(users.passwordResetToken, input.token)).limit(1);

      if (!user || !user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired reset link" });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      await db.update(users)
        .set({ passwordHash, passwordResetToken: null, passwordResetExpiry: null })
        .where(eq(users.id, user.id));

      return { success: true };
    }),

  // Get invite info (for accept-invite page)
  getInviteInfo: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [user] = await db
        .select({ email: users.email, role: users.role, department: users.department, inviteTokenExpiry: users.inviteTokenExpiry })
        .from(users)
        .where(eq(users.inviteToken, input.token))
        .limit(1);

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid invite link" });
      }

      if (user.inviteTokenExpiry && user.inviteTokenExpiry < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invite link has expired" });
      }

      return { email: user.email, role: user.role, department: user.department };
    }),
});
