import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq, and, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { hasPermission } from "./authRouter";

// Helper to ensure only admins can manage users
function requireAdmin(userRole: string) {
  if (!hasPermission(userRole, "company_admin")) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission to manage users." });
  }
}

export const userManagementRouter = router({
  // List all users in the organisation
  listUsers: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx.user.role);
    const db = await getDb();
    if (!db) return [];

    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        department: users.department,
        jobTitle: users.jobTitle,
        isActive: users.isActive,
        lastSignedIn: users.lastSignedIn,
        createdAt: users.createdAt,
        organizationId: users.organizationId,
        inviteToken: users.inviteToken,
      })
      .from(users)
      .orderBy(users.createdAt);

    return allUsers;
  }),

  // Invite a new user by email
  inviteUser: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      role: z.enum(["company_admin", "compliance_manager", "department_user", "auditor"]),
      department: z.string().optional(),
      jobTitle: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Check if user already exists
      const [existing] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "A user with this email already exists." });
      }

      const inviteToken = crypto.randomBytes(32).toString("hex");
      const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const openId = `local_${crypto.randomBytes(16).toString("hex")}`;

      await db.insert(users).values({
        openId,
        email: input.email,
        name: null,
        role: input.role,
        department: input.department || null,
        jobTitle: input.jobTitle || null,
        isActive: false,
        inviteToken,
        inviteTokenExpiry,
        invitedBy: ctx.user.id,
        loginMethod: "password",
        lastSignedIn: new Date(),
      });

      const inviteUrl = `${ctx.req.headers.origin || ""}/accept-invite?token=${inviteToken}`;

      return { success: true, inviteUrl, inviteToken };
    }),

  // Update user role or department
  updateUser: protectedProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["company_admin", "compliance_manager", "department_user", "auditor"]).optional(),
      department: z.string().optional(),
      jobTitle: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const updates: Record<string, unknown> = {};
      if (input.role) updates.role = input.role;
      if (input.department !== undefined) updates.department = input.department;
      if (input.jobTitle !== undefined) updates.jobTitle = input.jobTitle;

      await db.update(users).set(updates).where(eq(users.id, input.userId));

      return { success: true };
    }),

  // Activate or deactivate a user
  setUserActive: protectedProcedure
    .input(z.object({
      userId: z.number(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      requireAdmin(ctx.user.role);
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot deactivate your own account." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.update(users).set({ isActive: input.isActive }).where(eq(users.id, input.userId));

      return { success: true };
    }),

  // Resend invite (regenerate token)
  resendInvite: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const newToken = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await db.update(users)
        .set({ inviteToken: newToken, inviteTokenExpiry: expiry })
        .where(eq(users.id, input.userId));

      const inviteUrl = `${ctx.req.headers.origin || ""}/accept-invite?token=${newToken}`;

      return { success: true, inviteUrl };
    }),

  // Delete a user (soft delete via deactivation, or hard delete)
  deleteUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!hasPermission(ctx.user.role, "super_admin") && !hasPermission(ctx.user.role, "company_admin")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions." });
      }
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot delete your own account." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Soft delete: deactivate instead of hard delete to preserve audit trail
      await db.update(users).set({ isActive: false }).where(eq(users.id, input.userId));

      return { success: true };
    }),

  // Get current user's full profile
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        department: users.department,
        jobTitle: users.jobTitle,
        isActive: users.isActive,
        lastSignedIn: users.lastSignedIn,
        createdAt: users.createdAt,
        organizationId: users.organizationId,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    return user || null;
  }),

  // Update own profile
  updateMyProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(2).optional(),
      jobTitle: z.string().optional(),
      department: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const updates: Record<string, unknown> = {};
      if (input.name) updates.name = input.name;
      if (input.jobTitle !== undefined) updates.jobTitle = input.jobTitle;
      if (input.department !== undefined) updates.department = input.department;

      await db.update(users).set(updates).where(eq(users.id, ctx.user.id));

      return { success: true };
    }),

  // Change own password
  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);

      if (!user || !user.passwordHash) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Password change is not available for OAuth accounts." });
      }

      const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect." });
      }

      const newHash = await bcrypt.hash(input.newPassword, 12);
      await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, ctx.user.id));

      return { success: true };
    }),
});
