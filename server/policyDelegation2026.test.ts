import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import type { Policy, DelegationAuthority } from "../drizzle/schema";
import {
  SAMPLE_AS_OF, SAMPLE_DATE_LABEL, samplePolicyUpdatedDates,
  samplePolicyLifecycleDates, sampleDelegationPeriods, sampleApprovalDueDates,
} from "../shared/sampleDates";
import { planDemoPolicyDelegationDateRefresh, type DemoDateRefreshScope } from "./seedPolicyDelegationDates";

const mocks = vi.hoisted(() => ({
  existing: [] as unknown[],
  inserted: [] as Record<string, unknown>[],
  audit: vi.fn(),
}));
vi.mock("./db", () => ({
  getDb: vi.fn(async () => ({
    select: () => ({ from: async () => mocks.existing }),
    insert: () => ({ values: (value: Record<string, unknown>) => {
      mocks.inserted.push(value);
      return { $returningId: async () => [{ id: mocks.inserted.length }] };
    } }),
  })),
}));
vi.mock("./auditCache", () => ({ createAuditEntryWithHash: mocks.audit }));
import { seedPolicies, seedDelegations } from "./seedDatabase";

const scope: DemoDateRefreshScope = {
  organizationId: 12, organizationSlug: "operator-verified-demo",
  organizationName: "Operator-verified demo organization", demoUserId: 7,
  demoUserEmail: "admin@acmecorp.co.uk", confirmedDemoOnly: true,
};

const legacyPolicyDates = [
  ["2024-01-01", "2025-01-01"], ["2024-03-15", "2025-03-15"],
  ["2024-02-01", "2025-02-01"], ["2024-01-15", "2025-01-15"],
  ["2024-06-01", "2025-06-01"], ["2025-01-01", "2026-01-01"],
];

async function legacySnapshot() {
  await seedPolicies(scope.demoUserId, "Demo operator");
  const policies = mocks.inserted.map((record, index) => ({
    ...record, id: index + 1,
    description: String(record.description).replace(/^Illustrative 2026 example; internal planning dates, not statutory deadlines\. /, ""),
    effectiveDate: new Date(legacyPolicyDates[index][0]),
    reviewDate: new Date(legacyPolicyDates[index][1]),
    createdAt: new Date("2025-01-01"), updatedAt: new Date("2025-01-01"),
  })) as Policy[];
  mocks.inserted = [];
  await seedDelegations(scope.demoUserId);
  const delegations = mocks.inserted.map((record, index) => ({
    ...record, id: index + 101,
    description: String(record.description).replace(/^Illustrative 2026 example; not live authority or a statutory deadline\. /, ""),
    effectiveFrom: new Date("2024-01-01"), effectiveTo: new Date("2025-12-31"),
    createdAt: new Date("2025-01-01"), updatedAt: new Date("2025-01-01"),
  })) as DelegationAuthority[];
  return { scope, policies, delegations };
}

beforeEach(() => {
  mocks.existing = [];
  mocks.inserted = [];
  mocks.audit.mockClear();
});

describe("Illustrative 2026 policy/delegation chronology", () => {
  it("uses current-year policy updates no later than the assessment date", () => {
    expect(samplePolicyUpdatedDates).toHaveLength(8);
    for (const date of samplePolicyUpdatedDates) {
      expect(date.startsWith("2026-")).toBe(true);
      expect(date <= SAMPLE_AS_OF).toBe(true);
    }
  });

  it("keeps review dates after effectiveness and upcoming at assessment", () => {
    expect(samplePolicyLifecycleDates).toHaveLength(6);
    for (const dates of samplePolicyLifecycleDates) {
      expect(dates.effectiveDate.startsWith("2026-")).toBe(true);
      expect(dates.reviewDate.startsWith("2026-")).toBe(true);
      expect(dates.effectiveDate < dates.reviewDate).toBe(true);
      expect(dates.reviewDate > SAMPLE_AS_OF).toBe(true);
    }
    expect(samplePolicyLifecycleDates[5].effectiveDate > SAMPLE_AS_OF).toBe(true);
  });

  it("keeps active example delegations in date and pending authority proposed", () => {
    sampleDelegationPeriods.forEach((dates, index) => {
      expect(dates.effectiveFrom < dates.effectiveTo).toBe(true);
      expect(dates.effectiveTo.startsWith("2026-")).toBe(true);
      expect(dates.effectiveTo > SAMPLE_AS_OF).toBe(true);
      expect(index === 3 ? dates.effectiveFrom > SAMPLE_AS_OF : dates.effectiveFrom <= SAMPLE_AS_OF).toBe(true);
    });
    expect(sampleApprovalDueDates[0] > SAMPLE_AS_OF).toBe(true);
    expect(sampleApprovalDueDates[1] > SAMPLE_AS_OF).toBe(true);
    expect(sampleApprovalDueDates[2] < SAMPLE_AS_OF).toBe(true);
  });

  it("labels static page examples and separates stored expiry alerts", () => {
    expect(SAMPLE_DATE_LABEL).toBe("Illustrative 2026 examples");
    const policyPage = readFileSync(new URL("../client/src/pages/Policies.tsx", import.meta.url), "utf8");
    const delegationPage = readFileSync(new URL("../client/src/pages/Delegation.tsx", import.meta.url), "utf8");
    expect(policyPage).toContain("SAMPLE_DATE_LABEL");
    expect(policyPage).toContain("not verified compliance evidence");
    expect(delegationPage).toContain("not live authority records");
    expect(delegationPage).toContain("Stored records, separate from the illustrative examples below.");
    expect(policyPage).not.toMatch(/lastUpdated:\s*"202[45]-/);
    expect(delegationPage).not.toMatch(/(?:effectiveFrom|effectiveTo|dueDate):\s*"202[45]-/);
    // Newly entered/uploaded session data keeps the actual timestamp.
    expect(policyPage).toContain("lastUpdated: new Date().toISOString()");
    expect(delegationPage).toContain("effectiveFrom: formData.effectiveFrom || new Date().toISOString()");
  });

  it("seeds six labelled policies using the shared dates without backdating audits", async () => {
    expect(await seedPolicies(7, "Demo operator")).toBe(6);
    mocks.inserted.forEach((record, index) => {
      expect(record.description).toMatch(/^Illustrative 2026 example; internal planning dates/);
      expect(record.effectiveDate).toEqual(new Date(samplePolicyLifecycleDates[index].effectiveDate));
      expect(record.reviewDate).toEqual(new Date(samplePolicyLifecycleDates[index].reviewDate));
      expect(record).not.toHaveProperty("createdAt");
      expect(record).not.toHaveProperty("updatedAt");
    });
    expect(mocks.audit).toHaveBeenCalledTimes(6);
    for (const [, entry] of mocks.audit.mock.calls) expect(entry).not.toHaveProperty("createdAt");
  });

  it("seeds three labelled active delegations valid at the assessment date", async () => {
    expect(await seedDelegations(7)).toBe(3);
    for (const record of mocks.inserted) {
      expect(record.description).toMatch(/^Illustrative 2026 example; not live authority/);
      expect((record.effectiveFrom as Date).getTime()).toBeLessThanOrEqual(new Date(SAMPLE_AS_OF).getTime());
      expect((record.effectiveTo as Date).getTime()).toBeGreaterThan(new Date(SAMPLE_AS_OF).getTime());
    }
  });

  it("leaves existing records alone rather than automatically refreshing them", async () => {
    mocks.existing = [{ id: 88, title: "Real user policy" }];
    expect(await seedPolicies(7, "Demo operator")).toBe(1);
    expect(await seedDelegations(7)).toBe(1);
    expect(mocks.inserted).toHaveLength(0);
    expect(mocks.audit).not.toHaveBeenCalled();
  });

  it("leaves historical regulator publication dates unchanged", () => {
    const seedSource = readFileSync(new URL("./seedDatabase.ts", import.meta.url), "utf8");
    const regulatorySection = seedSource.split("export async function seedRegulatoryUpdates()")[1].split("export async function seedDepartments")[0];
    expect(regulatorySection).toContain('effectiveDate: new Date("2024-11-01")');
    expect(regulatorySection).toContain('effectiveDate: new Date("2025-03-31")');
    expect(regulatorySection).not.toContain("samplePolicyLifecycleDates");
  });
});

describe("Bounded, dry-run-only legacy demo date patch plan", () => {
  it("produces nine parameterized, organization-scoped statements and does not mutate snapshots", async () => {
    const snapshot = await legacySnapshot();
    const before = JSON.stringify(snapshot);
    const plan = planDemoPolicyDelegationDateRefresh(snapshot);
    expect(plan.dryRun).toBe(true);
    expect(plan.patches).toHaveLength(9);
    expect(plan.skipped).toBe(0);
    expect(JSON.stringify(snapshot)).toBe(before);
    for (const patch of plan.patches) {
      expect(patch.sql).toContain("JOIN organizations o ON o.id = u.organizationId");
      expect(patch.sql).toContain("u.id = ? AND u.email = ? AND o.id = ? AND o.slug = ? AND o.name = ?");
      expect(patch.sql).toMatch(/WHERE [pd]\.id = \?/);
      expect(patch.sql).toMatch(/[pd]\.updatedAt = [pd]\.updatedAt/);
      expect(patch.sql).toMatch(/AND [pd]\.updatedAt = \?/);
      expect(patch.sql).not.toMatch(/UPDATE (users|audit_trail|regulatory_updates)|DELETE|TRUNCATE/);
      expect(patch.sql.match(/\?/g)).toHaveLength(patch.parameters.length);
      expect(patch.parameters).toContain(scope.demoUserEmail);
      expect(patch.parameters).toContain(scope.organizationId);
      expect(patch.after.from.startsWith("2026-")).toBe(true);
      expect(patch.after.to.startsWith("2026-")).toBe(true);
    }
  });

  it("rejects unverified organizations, unknown identities and invalid IDs", async () => {
    const snapshot = await legacySnapshot();
    for (const overrides of [
      { confirmedDemoOnly: false }, { demoUserEmail: "real.customer@example.com" },
      { organizationId: 0 }, { demoUserId: -1 }, { organizationSlug: "" }, { organizationName: "" },
    ]) {
      expect(() => planDemoPolicyDelegationDateRefresh({ ...snapshot,
        scope: { ...scope, ...overrides } as DemoDateRefreshScope,
      })).toThrow(/Verified demo-only organization/);
    }
  });

  it("refuses snapshots larger than the known six-policy/three-delegation boundary", async () => {
    const snapshot = await legacySnapshot();
    expect(() => planDemoPolicyDelegationDateRefresh({ ...snapshot,
      policies: [...snapshot.policies, snapshot.policies[0]],
    })).toThrow(/demo boundary/);
    expect(() => planDemoPolicyDelegationDateRefresh({ ...snapshot,
      delegations: [...snapshot.delegations, snapshot.delegations[0]],
    })).toThrow(/demo boundary/);
  });

  it("skips records owned by actual/other users and delegates", async () => {
    const snapshot = await legacySnapshot();
    const plan = planDemoPolicyDelegationDateRefresh({ ...snapshot,
      policies: snapshot.policies.map(record => ({ ...record, ownerId: 99 })),
      delegations: snapshot.delegations.map(record => ({ ...record, delegateeId: 99 })),
    });
    expect(plan.patches).toHaveLength(0);
    expect(plan.skipped).toBe(9);
  });

  it("skips edited descriptions, versions, statuses and already-renewed records", async () => {
    const snapshot = await legacySnapshot();
    snapshot.policies[0].description = "User-edited policy";
    snapshot.policies[1].version = 4;
    snapshot.policies[2].status = "archived";
    snapshot.policies[3].effectiveDate = new Date("2026-01-15");
    snapshot.delegations[0].conditions = "User-edited conditions";
    snapshot.delegations[1].status = "revoked";
    snapshot.delegations[2].effectiveTo = new Date("2026-12-31");
    const plan = planDemoPolicyDelegationDateRefresh(snapshot);
    expect(plan.patches).toHaveLength(2);
    expect(plan.skipped).toBe(7);
  });

  it("fails closed for ambiguous duplicate fixture titles", async () => {
    const snapshot = await legacySnapshot();
    const plan = planDemoPolicyDelegationDateRefresh({ ...snapshot,
      policies: [snapshot.policies[0], { ...snapshot.policies[0], id: 55 }], delegations: [],
    });
    expect(plan.patches).toHaveLength(0);
    expect(plan.skipped).toBe(2);
  });

  it("skips any seed whose modification timestamp indicates a previous edit", async () => {
    const snapshot = await legacySnapshot();
    snapshot.policies[0].updatedAt = new Date("2025-06-01");
    snapshot.delegations[0].updatedAt = new Date("2025-06-01");
    const plan = planDemoPolicyDelegationDateRefresh(snapshot);
    expect(plan.patches).toHaveLength(7);
    expect(plan.skipped).toBe(2);
    for (const patch of plan.patches) expect(patch.sql).toMatch(/AND [pd]\.createdAt = [pd]\.updatedAt/);
  });

  it("has no patch to apply after a refreshed date pair is supplied", async () => {
    const snapshot = await legacySnapshot();
    const plan = planDemoPolicyDelegationDateRefresh(snapshot);
    for (const patch of plan.patches) {
      if (patch.table === "policies") {
        const record = snapshot.policies.find(record => record.id === patch.recordId)!;
        record.effectiveDate = new Date(patch.after.from);
        record.reviewDate = new Date(patch.after.to);
      } else {
        const record = snapshot.delegations.find(record => record.id === patch.recordId)!;
        record.effectiveFrom = new Date(patch.after.from);
        record.effectiveTo = new Date(patch.after.to);
      }
    }
    expect(planDemoPolicyDelegationDateRefresh(snapshot).patches).toHaveLength(0);
  });
});
