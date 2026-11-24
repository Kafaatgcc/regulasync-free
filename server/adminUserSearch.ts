import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull, like, or, sql } from "drizzle-orm";
import { protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { organizations, users } from "../drizzle/schema";

export const userSearchInput = z.object({
  search: z.string().trim().max(120).default(""),
  role: z.enum(["all", "super_admin", "company_admin", "compliance_manager", "department_user", "auditor", "user", "admin"]).default("all"),
  status: z.enum(["all", "active", "inactive"]).default("all"),
  organization: z.union([z.literal("all"), z.literal("unassigned"), z.number().int().positive()]).default("all"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
});
export function escapeUserSearch(value: string) { return value.replace(/[\\%_]/g, "\\$&"); }

export const searchUsersProcedure = protectedProcedure.input(userSearchInput).query(async ({ ctx, input }) => {
  if (ctx.user.role !== "super_admin") throw new TRPCError({ code: "FORBIDDEN" });
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "User records are temporarily unavailable" });
  const filters = [];
  if (input.search) {
    const pattern = `%${escapeUserSearch(input.search.toLowerCase())}%`;
    filters.push(or(like(sql`LOWER(${users.name})`, pattern), like(sql`LOWER(${users.email})`, pattern),
      like(sql`LOWER(${organizations.name})`, pattern), like(sql`CAST(${users.id} AS CHAR)`, pattern)));
  }
  if (input.role !== "all") filters.push(eq(users.role, input.role));
  if (input.status !== "all") filters.push(eq(users.isActive, input.status === "active"));
  if (input.organization === "unassigned") filters.push(isNull(users.organizationId));
  else if (typeof input.organization === "number") filters.push(eq(users.organizationId, input.organization));
  const where = and(...filters);
  const [count] = await db.select({ total: sql<number>`COUNT(*)` }).from(users)
    .leftJoin(organizations, eq(users.organizationId, organizations.id)).where(where);
  const total = Number(count?.total || 0);
  const page = Math.min(input.page, Math.max(1, Math.ceil(total / input.pageSize)));
  const records = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role,
    isActive: users.isActive, organizationId: users.organizationId, organizationName: organizations.name,
    createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users)
    .leftJoin(organizations, eq(users.organizationId, organizations.id)).where(where)
    .orderBy(desc(users.createdAt), desc(users.id)).limit(input.pageSize).offset((page - 1) * input.pageSize);
  return { records, total, page, pageSize: input.pageSize };
});
