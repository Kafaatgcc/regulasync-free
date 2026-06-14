/**
 * Enterprise Router — Commercial SaaS features
 *
 * 1. Feature Flags — Per-org feature toggles by subscription tier
 * 2. Super Admin Global Dashboard — Manage all organisations
 * 3. White Label Configuration — Per-org branding
 * 4. Webhooks — Outbound event delivery to enterprise systems
 * 5. Org API Keys — Machine-to-machine authentication
 * 6. Session Management — View and revoke active sessions
 * 7. Notification Integrations — Slack / Teams / Email
 * 8. Onboarding Progress — Guided setup wizard tracking
 */
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { sql, eq, desc } from "drizzle-orm";
import {
  featureFlags,
  orgFeatureFlags,
  webhooks,
  webhookDeliveries,
  userSessions,
  whiteLabelConfigs,
  onboardingProgress,
  notificationIntegrations,
  orgApiKeys,
  organizations,
  users,
} from "../drizzle/schema";

// ─── Feature Flags ────────────────────────────────────────────────────────────

export const featureFlagsRouter = router({
  // Get all feature flags with their tier defaults
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(featureFlags).orderBy(featureFlags.category, featureFlags.label);
  }),

  // Get effective feature flags for a specific org (tier defaults + overrides)
  getForOrg: protectedProcedure
    .input(z.object({ organizationId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const orgId = input.organizationId ?? ctx.user.organizationId;
      if (!orgId) return [];

      // Get org tier
      const [org] = await db.select({ plan: organizations.plan }).from(organizations).where(eq(organizations.id, orgId)).limit(1);
      const tier = org?.plan ?? "core";

      // Get all flags
      const flags = await db.select().from(featureFlags);

      // Get org overrides
      const overrides = await db.select().from(orgFeatureFlags).where(eq(orgFeatureFlags.organizationId, orgId));
      const overrideMap: Record<string, boolean> = {};
      overrides.forEach((o) => { overrideMap[o.flagKey] = o.enabled; });

      // Merge: override wins, then tier default
      return flags.map((f) => {
        const tierEnabled =
          tier === "enterprise" ? f.enterpriseEnabled :
          tier === "professional" ? f.professionalEnabled :
          f.starterEnabled;
        const enabled = overrideMap[f.key] !== undefined ? overrideMap[f.key] : tierEnabled;
        return { ...f, enabled, tier };
      });
    }),

  // Super admin: override a flag for a specific org
  setOrgOverride: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      flagKey: z.string(),
      enabled: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "super_admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Check if override exists
      const existing = await db.select().from(orgFeatureFlags)
        .where(sql`${orgFeatureFlags.organizationId} = ${input.organizationId} AND ${orgFeatureFlags.flagKey} = ${input.flagKey}`)
        .limit(1);

      if (existing.length > 0) {
        await db.update(orgFeatureFlags)
          .set({ enabled: input.enabled, overriddenBy: ctx.user.id, overriddenAt: new Date() })
          .where(sql`${orgFeatureFlags.organizationId} = ${input.organizationId} AND ${orgFeatureFlags.flagKey} = ${input.flagKey}`);
      } else {
        await db.insert(orgFeatureFlags).values({
          organizationId: input.organizationId,
          flagKey: input.flagKey,
          enabled: input.enabled,
          overriddenBy: ctx.user.id,
          overriddenAt: new Date(),
        });
      }
      return { success: true };
    }),
});

// ─── Super Admin Global Dashboard ────────────────────────────────────────────

export const superAdminRouter = router({
  // Global stats across all orgs
  globalStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "super_admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const [userCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    const [orgCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(organizations);
    const [activeUsers] = await db.select({ count: sql<number>`COUNT(*)` }).from(users).where(eq(users.isActive, true));

    return {
      totalUsers: Number(userCount?.count ?? 0),
      totalOrgs: Number(orgCount?.count ?? 0),
      activeUsers: Number(activeUsers?.count ?? 0),
    };
  }),

  // List all organisations with usage data
  listOrgs: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "super_admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) return [];
    const orgs = await db.select().from(organizations).orderBy(desc(organizations.createdAt));
    return orgs;
  }),

  // Update org subscription tier
  updateOrgTier: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      plan: z.enum(["core", "professional", "enterprise"]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "super_admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(organizations).set({ plan: input.plan }).where(eq(organizations.id, input.organizationId));
      return { success: true };
    }),

  // Suspend or activate all users in an org
  toggleOrgStatus: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      active: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "super_admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(users).set({ isActive: input.active }).where(eq(users.organizationId, input.organizationId));
      return { success: true };
    }),

  // Get all users across all orgs
  listAllUsers: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "super_admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) return [];
    return await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
      organizationId: users.organizationId,
    }).from(users).orderBy(desc(users.createdAt)).limit(500);
  }),
});

// ─── White Label Configuration ───────────────────────────────────────────────

export const whiteLabelRouter = router({
  get: protectedProcedure
    .input(z.object({ organizationId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const orgId = input.organizationId ?? ctx.user.organizationId;
      if (!orgId) return null;
      const [config] = await db.select().from(whiteLabelConfigs).where(eq(whiteLabelConfigs.organizationId, orgId)).limit(1);
      return config ?? null;
    }),

  save: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      brandName: z.string().optional(),
      logoUrl: z.string().optional(),
      faviconUrl: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      accentColor: z.string().optional(),
      customDomain: z.string().optional(),
      supportEmail: z.string().optional(),
      privacyPolicyUrl: z.string().optional(),
      termsUrl: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!["super_admin", "company_admin"].includes(ctx.user.role)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { organizationId, ...fields } = input;

      const existing = await db.select({ id: whiteLabelConfigs.id }).from(whiteLabelConfigs)
        .where(eq(whiteLabelConfigs.organizationId, organizationId)).limit(1);

      if (existing.length > 0) {
        await db.update(whiteLabelConfigs).set(fields as any).where(eq(whiteLabelConfigs.organizationId, organizationId));
      } else {
        await db.insert(whiteLabelConfigs).values({ organizationId, ...fields } as any);
      }
      return { success: true };
    }),
});

// ─── Webhooks ────────────────────────────────────────────────────────────────

export const webhooksRouter = router({
  list: protectedProcedure
    .input(z.object({ organizationId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const orgId = input.organizationId ?? ctx.user.organizationId;
      if (!orgId) return [];
      return await db.select().from(webhooks).where(eq(webhooks.organizationId, orgId)).orderBy(desc(webhooks.createdAt));
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number().optional(),
      label: z.string(),
      url: z.string().url(),
      events: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const orgId = input.organizationId ?? ctx.user.organizationId;
      if (!orgId) throw new TRPCError({ code: "BAD_REQUEST", message: "No organisation" });
      const secret = "whsec_" + crypto.randomBytes(32).toString("hex");
      await db.insert(webhooks).values({
        organizationId: orgId,
        label: input.label,
        url: input.url,
        secret,
        events: input.events,
        createdBy: ctx.user.id,
      });
      return { success: true, secret };
    }),

  toggle: protectedProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(webhooks).set({ isActive: input.isActive }).where(eq(webhooks.id, input.id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(webhooks).where(eq(webhooks.id, input.id));
      return { success: true };
    }),

  test: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [webhook] = await db.select().from(webhooks).where(eq(webhooks.id, input.id)).limit(1);
      if (!webhook) throw new TRPCError({ code: "NOT_FOUND" });

      const payload = {
        event: "test.ping",
        timestamp: new Date().toISOString(),
        data: { message: "RegulaSync webhook test — connection verified" },
      };
      const signature = crypto.createHmac("sha256", webhook.secret).update(JSON.stringify(payload)).digest("hex");
      const start = Date.now();
      try {
        const res = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-RegulaSync-Signature": `sha256=${signature}`,
            "X-RegulaSync-Event": "test.ping",
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        });
        const duration = Date.now() - start;
        await db.insert(webhookDeliveries).values({
          webhookId: input.id, eventType: "test.ping",
          payload, statusCode: res.status, success: res.ok, durationMs: duration,
        });
        await db.update(webhooks).set({ lastTriggeredAt: new Date(), lastStatusCode: res.status }).where(eq(webhooks.id, input.id));
        return { success: res.ok, statusCode: res.status, durationMs: duration };
      } catch (err: any) {
        const duration = Date.now() - start;
        await db.insert(webhookDeliveries).values({
          webhookId: input.id, eventType: "test.ping",
          payload, success: false, durationMs: duration,
        });
        return { success: false, error: err.message, durationMs: duration };
      }
    }),

  deliveries: protectedProcedure
    .input(z.object({ webhookId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(webhookDeliveries)
        .where(eq(webhookDeliveries.webhookId, input.webhookId))
        .orderBy(desc(webhookDeliveries.attemptedAt))
        .limit(50);
    }),
});

// ─── Org API Keys ─────────────────────────────────────────────────────────────

export const orgApiKeysRouter = router({
  list: protectedProcedure
    .input(z.object({ organizationId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const orgId = input.organizationId ?? ctx.user.organizationId;
      if (!orgId) return [];
      return await db.select({
        id: orgApiKeys.id,
        label: orgApiKeys.label,
        keyPrefix: orgApiKeys.keyPrefix,
        permissions: orgApiKeys.permissions,
        lastUsedAt: orgApiKeys.lastUsedAt,
        expiresAt: orgApiKeys.expiresAt,
        isActive: orgApiKeys.isActive,
        createdAt: orgApiKeys.createdAt,
      }).from(orgApiKeys).where(eq(orgApiKeys.organizationId, orgId)).orderBy(desc(orgApiKeys.createdAt));
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number().optional(),
      label: z.string(),
      permissions: z.array(z.string()).optional(),
      expiresInDays: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const orgId = input.organizationId ?? ctx.user.organizationId;
      if (!orgId) throw new TRPCError({ code: "BAD_REQUEST", message: "No organisation" });

      const rawKey = "rsk_live_" + crypto.randomBytes(32).toString("hex");
      const keyPrefix = rawKey.substring(0, 16) + "...";
      const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
      const expiresAt = input.expiresInDays
        ? new Date(Date.now() + input.expiresInDays * 86400000)
        : undefined;

      await db.insert(orgApiKeys).values({
        organizationId: orgId,
        label: input.label,
        keyPrefix,
        keyHash,
        permissions: input.permissions ?? ["read"],
        expiresAt,
        createdBy: ctx.user.id,
      });
      return { success: true, apiKey: rawKey, keyPrefix };
    }),

  revoke: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(orgApiKeys).set({ isActive: false }).where(eq(orgApiKeys.id, input.id));
      return { success: true };
    }),
});

// ─── Session Management ───────────────────────────────────────────────────────

export const sessionManagementRouter = router({
  listMySessions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select({
      id: userSessions.id,
      ipAddress: userSessions.ipAddress,
      userAgent: userSessions.userAgent,
      deviceType: userSessions.deviceType,
      location: userSessions.location,
      isActive: userSessions.isActive,
      lastActivityAt: userSessions.lastActivityAt,
      expiresAt: userSessions.expiresAt,
      createdAt: userSessions.createdAt,
    }).from(userSessions)
      .where(eq(userSessions.userId, ctx.user.id))
      .orderBy(desc(userSessions.lastActivityAt));
  }),

  revokeSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(userSessions)
        .set({ isActive: false })
        .where(sql`${userSessions.id} = ${input.sessionId} AND ${userSessions.userId} = ${ctx.user.id}`);
      return { success: true };
    }),

  revokeAllOtherSessions: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.userId, ctx.user.id));
    return { success: true };
  }),
});

// ─── Notification Integrations ────────────────────────────────────────────────

export const notificationIntegrationsRouter = router({
  list: protectedProcedure
    .input(z.object({ organizationId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const orgId = input.organizationId ?? ctx.user.organizationId;
      if (!orgId) return [];
      return await db.select({
        id: notificationIntegrations.id,
        type: notificationIntegrations.type,
        label: notificationIntegrations.label,
        webhookUrl: notificationIntegrations.webhookUrl,
        events: notificationIntegrations.events,
        isActive: notificationIntegrations.isActive,
        lastTestedAt: notificationIntegrations.lastTestedAt,
        createdAt: notificationIntegrations.createdAt,
      }).from(notificationIntegrations)
        .where(eq(notificationIntegrations.organizationId, orgId))
        .orderBy(desc(notificationIntegrations.createdAt));
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number().optional(),
      type: z.enum(["slack", "teams", "email", "pagerduty"]),
      label: z.string(),
      webhookUrl: z.string().url(),
      events: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const orgId = input.organizationId ?? ctx.user.organizationId;
      if (!orgId) throw new TRPCError({ code: "BAD_REQUEST" });
      await db.insert(notificationIntegrations).values({
        organizationId: orgId,
        type: input.type,
        label: input.label,
        webhookUrl: input.webhookUrl,
        events: input.events,
        createdBy: ctx.user.id,
      });
      return { success: true };
    }),

  test: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [integration] = await db.select().from(notificationIntegrations)
        .where(eq(notificationIntegrations.id, input.id)).limit(1);
      if (!integration) throw new TRPCError({ code: "NOT_FOUND" });

      const payload = integration.type === "slack"
        ? { text: "✅ RegulaSync test notification — your Slack integration is working!" }
        : integration.type === "teams"
        ? {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            summary: "RegulaSync Test",
            themeColor: "b87333",
            title: "RegulaSync — Test Notification",
            text: "✅ Your Microsoft Teams integration is working correctly.",
          }
        : { message: "RegulaSync test notification" };

      try {
        const res = await fetch(integration.webhookUrl!, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        });
        await db.update(notificationIntegrations)
          .set({ lastTestedAt: new Date() })
          .where(eq(notificationIntegrations.id, input.id));
        return { success: res.ok, statusCode: res.status };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(notificationIntegrations).where(eq(notificationIntegrations.id, input.id));
      return { success: true };
    }),
});

// ─── Onboarding Progress ──────────────────────────────────────────────────────

export const onboardingRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const orgId = ctx.user.organizationId;
    if (!orgId) return null;
    const [progress] = await db.select().from(onboardingProgress)
      .where(eq(onboardingProgress.organizationId, orgId)).limit(1);
    return progress ?? null;
  }),

  updateStep: protectedProcedure
    .input(z.object({
      step: z.enum(["step1OrgProfile", "step2InviteTeam", "step3ConfigureFrameworks", "step4UploadPolicies", "step5ConnectIntegrations"]),
      completed: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const orgId = ctx.user.organizationId;
      if (!orgId) throw new TRPCError({ code: "BAD_REQUEST" });

      const existing = await db.select().from(onboardingProgress)
        .where(eq(onboardingProgress.organizationId, orgId)).limit(1);

      if (existing.length > 0) {
        await db.update(onboardingProgress)
          .set({ [input.step]: input.completed, updatedAt: new Date() })
          .where(eq(onboardingProgress.organizationId, orgId));
      } else {
        await db.insert(onboardingProgress).values({
          organizationId: orgId,
          userId: ctx.user.id,
          [input.step]: input.completed,
        });
      }
      return { success: true };
    }),
});
