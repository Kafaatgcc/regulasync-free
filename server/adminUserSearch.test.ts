import { beforeEach, describe, expect, it, vi } from "vitest";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import { appRouter } from "./routers";
import { escapeUserSearch, userSearchInput } from "./adminUserSearch";
import type { TrpcContext } from "./_core/context";
vi.mock("./db", () => ({ getDb: vi.fn() }));
import { getDb } from "./db";
const whereClauses: unknown[] = [];
const selections: object[] = [];
const offsets: number[] = [];
const fixture = { id: 17, name: "Demo Admin", email: "demo@example.com", role: "super_admin", isActive: true, organizationName: "Demo Workspace", organizationId: 1 };
const context = (role: string | null) => ({ user: role ? { id: 1, role, isActive: true } : null, req: { headers: {} }, res: {} }) as TrpcContext;
beforeEach(() => {
  vi.clearAllMocks(); whereClauses.length = 0; selections.length = 0; offsets.length = 0;
  vi.mocked(getDb).mockResolvedValue({ select: (fields: object) => {
    selections.push(fields); const values = "total" in fields ? [{ total: 57 }] : [fixture];
    const chain: any = { from: () => chain, leftJoin: () => chain, where: (condition: unknown) => { whereClauses.push(condition); return chain; },
      orderBy: () => chain, limit: () => chain, offset: (offset: number) => { offsets.push(offset); return chain; },
      then: (resolve: (value: unknown) => unknown) => Promise.resolve(values).then(resolve) };
    return chain;
  } } as never);
});
describe("Super Admin user search", () => {
  it("rejects anonymous and non-Super-Admin requests before touching the database", async () => {
    await expect(appRouter.createCaller(context(null)).superAdmin.searchUsers({})).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(appRouter.createCaller(context("company_admin")).superAdmin.searchUsers({})).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(getDb).not.toHaveBeenCalled();
  });
  it("combines search, role, status and organisation at the database and paginates", async () => {
    const result = await appRouter.createCaller(context("super_admin")).superAdmin.searchUsers({ search: "DEMO", role: "super_admin", status: "active", organization: 1, page: 2, pageSize: 25 });
    expect(result).toMatchObject({ total: 57, page: 2, pageSize: 25 }); expect(offsets).toEqual([25]);
    const serialized = new MySqlDialect().sqlToQuery(whereClauses[0] as never);
    expect(serialized.params).toContain("%demo%"); expect(serialized.params).toContain("super_admin");
    expect(serialized.sql).toContain(" and ");
    expect(Object.keys(selections[1])).not.toContain("passwordHash");
    expect(Object.keys(selections[1])).not.toContain("inviteToken");
    expect(Object.keys(selections[1])).toContain("organizationName");
  });
  it("clamps stale pages to the last available page", async () => {
    const result = await appRouter.createCaller(context("super_admin")).superAdmin.searchUsers({ page: 100 });
    expect(result.page).toBe(3); expect(offsets).toEqual([50]);
  });
  it("treats wildcard characters literally and validates query bounds", () => {
    expect(escapeUserSearch("a%b_c\\d")).toBe("a\\%b\\_c\\\\d");
    expect(userSearchInput.safeParse({ search: "x".repeat(121) }).success).toBe(false);
    expect(userSearchInput.safeParse({ pageSize: 1000 }).success).toBe(false);
    expect(userSearchInput.safeParse({ role: "owner" }).success).toBe(false);
  });
});
