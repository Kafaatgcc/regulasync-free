import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
vi.mock("./db", () => ({ getContactSubmissions: vi.fn().mockResolvedValue([{ id: 99, name: "Internal QA Test" }]),
  getContactSubmissionById: vi.fn().mockResolvedValue({ id: 99 }), updateContactSubmission: vi.fn().mockResolvedValue({ success: true }),
  getContactSubmissionStats: vi.fn().mockResolvedValue({ total: 1 }), createContactSubmission: vi.fn().mockResolvedValue({ id: 99 }) }));
vi.mock("./_core/notification", () => ({ notifyOwner: vi.fn().mockResolvedValue(true) }));
import * as db from "./db";
const ctx = (role: string | null) => ({ user: role ? { id: 1, role, isActive: true } : null, req: { headers: {} }, res: {} }) as TrpcContext;
beforeEach(() => vi.clearAllMocks());
describe("Real saved inquiry inbox", () => {
  it.each([null, "user", "company_admin", "auditor"])("rejects global inquiry records for %s", async role => {
    const caller = appRouter.createCaller(ctx(role));
    const code = role ? "FORBIDDEN" : "UNAUTHORIZED";
    await expect(caller.contact.list({ limit: 100 })).rejects.toMatchObject({ code });
    await expect(caller.contact.get({ id: 99 })).rejects.toMatchObject({ code });
    await expect(caller.contact.update({ id: 99, notes: "private" })).rejects.toMatchObject({ code });
    await expect(caller.contact.stats()).rejects.toMatchObject({ code });
    expect(db.getContactSubmissions).not.toHaveBeenCalled();
  });
  it.each(["super_admin", "admin"])("loads real records and persists updates for %s", async role => {
    const caller = appRouter.createCaller(ctx(role));
    expect(await caller.contact.list({ limit: 100 })).toEqual([{ id: 99, name: "Internal QA Test" }]);
    await caller.contact.update({ id: 99, status: "archived", notes: "Internal test only" });
    expect(db.updateContactSubmission).toHaveBeenCalledWith(99, { status: "archived", notes: "Internal test only" });
  });
  it("still accepts public demo feedback submissions", async () => {
    const input = { name: "QA", email: "qa@example.com", inquiryType: "general" as const, subject: "Guided demo feedback", message: "Internal test" };
    expect(await appRouter.createCaller(ctx(null)).contact.submit(input)).toMatchObject({ success: true, id: 99 });
    expect(db.createContactSubmission).toHaveBeenCalledWith(input);
  });
});
