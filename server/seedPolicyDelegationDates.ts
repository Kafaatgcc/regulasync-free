/**
 * Offline, dry-run-only plan for refreshing the nine legacy seed examples.
 * No connection, mutation, reset or automatic migration occurs here. An operator
 * must verify that the supplied organization contains demo data only, review the
 * returned parameterized statements, and separately approve their execution.
 * Unknown owners, changed records and incomplete organization scope fail closed.
 */
import type { Policy, DelegationAuthority } from "../drizzle/schema";
import { samplePolicyLifecycleDates, sampleDelegationPeriods } from "../shared/sampleDates";

const knownDemoEmails = new Set([
  "superadmin@regulasync.co.uk", "admin@acmecorp.co.uk",
  "compliance@acmecorp.co.uk", "finance@acmecorp.co.uk", "auditor@acmecorp.co.uk",
]);

const legacyPolicies = [
  { title: "Anti-Money Laundering (AML) Policy", description: "Comprehensive policy for detecting and preventing money laundering activities in accordance with UK regulations.", category: "compliance", status: "active", version: 3, effectiveDate: "2024-01-01", reviewDate: "2025-01-01" },
  { title: "Data Protection & GDPR Compliance", description: "Policy ensuring compliance with UK GDPR and Data Protection Act 2018 requirements.", category: "data_protection", status: "active", version: 2, effectiveDate: "2024-03-15", reviewDate: "2025-03-15" },
  { title: "Financial Crime Prevention Policy", description: "Policy for preventing, detecting, and reporting financial crimes including fraud and bribery.", category: "financial", status: "active", version: 2, effectiveDate: "2024-02-01", reviewDate: "2025-02-01" },
  { title: "Operational Risk Management Policy", description: "Framework for identifying, assessing, and mitigating operational risks across the organization.", category: "risk_management", status: "active", version: 1, effectiveDate: "2024-01-15", reviewDate: "2025-01-15" },
  { title: "IT Security & Cyber Resilience Policy", description: "Policy for maintaining IT security standards and cyber resilience in line with FCA requirements.", category: "it_security", status: "pending_review", version: 1, effectiveDate: "2024-06-01", reviewDate: "2025-06-01" },
  { title: "Consumer Duty Compliance Policy", description: "Policy ensuring compliance with FCA Consumer Duty requirements for fair customer outcomes.", category: "compliance", status: "draft", version: 1, effectiveDate: "2025-01-01", reviewDate: "2026-01-01" },
] as const;

const legacyDelegations = [
  { title: "Financial Approval Authority - Level 1", description: "Authority to approve financial transactions up to £10,000", authorityType: "financial", thresholdAmount: "10000.00", conditions: "Standard approval process applies", period: 0 },
  { title: "Compliance Exception Authority", description: "Authority to approve compliance exceptions with documented justification", authorityType: "compliance", thresholdAmount: null, conditions: "Requires documented risk assessment and time-limited approval", period: 4 },
  { title: "Contract Signing Authority", description: "Authority to sign contracts up to £50,000", authorityType: "contractual", thresholdAmount: "50000.00", conditions: "Legal review required for contracts over £25,000", period: 1 },
] as const;

export interface DemoDateRefreshScope {
  organizationId: number;
  organizationSlug: string;
  organizationName: string;
  demoUserId: number;
  demoUserEmail: string;
  /** Operator attestation after checking the actual organization and user. */
  confirmedDemoOnly: true;
}

export interface DemoDatePatch {
  table: "policies" | "delegation_authority";
  recordId: number;
  title: string;
  before: { from: string; to: string };
  after: { from: string; to: string };
  sql: string;
  parameters: Array<string | number | Date | null>;
}

function validId(value: number) {
  return Number.isSafeInteger(value) && value > 0;
}

function isExactDate(value: Date | null, expected: string) {
  return value instanceof Date && value.getTime() === new Date(expected).getTime();
}

function untouchedTimestamps(record: { createdAt: Date; updatedAt: Date }) {
  return record.createdAt instanceof Date && record.updatedAt instanceof Date &&
    Number.isFinite(record.createdAt.getTime()) &&
    record.createdAt.getTime() === record.updatedAt.getTime();
}

/** Return at most one statement per known fixture, never execute it. */
export function planDemoPolicyDelegationDateRefresh(input: {
  scope: DemoDateRefreshScope;
  policies: Policy[];
  delegations: DelegationAuthority[];
}): { dryRun: true; patches: DemoDatePatch[]; skipped: number } {
  const { scope } = input;
  if (scope.confirmedDemoOnly !== true || !validId(scope.organizationId) ||
      !validId(scope.demoUserId) || !scope.organizationSlug.trim() ||
      !scope.organizationName.trim() || !knownDemoEmails.has(scope.demoUserEmail)) {
    throw new Error("Verified demo-only organization scope and a known demo user are required; no patch generated.");
  }
  if (input.policies.length > 6 || input.delegations.length > 3) {
    throw new Error("Snapshot exceeds the six-policy/three-delegation demo boundary.");
  }
  const patches: DemoDatePatch[] = [];
  const seen = new Set<string>();
  const scopeParameters = [scope.demoUserId, scope.demoUserEmail,
    scope.organizationId, scope.organizationSlug, scope.organizationName];
  // Organization scope is enforced through owner/delegator membership: these
  // legacy tables have no organizationId column. updatedAt guards concurrent edits.
  const membershipGuard = "u.id = ? AND u.email = ? AND o.id = ? AND o.slug = ? AND o.name = ?";

  for (const record of input.policies) {
    const index = legacyPolicies.findIndex(fixture => fixture.title === record.title);
    const fixture = legacyPolicies[index];
    // Duplicate titles are ambiguous: do not choose one as an assumed seed.
    if (input.policies.filter(candidate => candidate.title === record.title).length !== 1) continue;
    if (!fixture || seen.has(`policy:${index}`) || !validId(record.id) ||
        record.ownerId !== scope.demoUserId || record.description !== fixture.description ||
        record.category !== fixture.category || record.status !== fixture.status ||
        record.version !== fixture.version || !isExactDate(record.effectiveDate, fixture.effectiveDate) ||
        !isExactDate(record.reviewDate, fixture.reviewDate) || !untouchedTimestamps(record)) continue;
    seen.add(`policy:${index}`);
    const dates = samplePolicyLifecycleDates[index];
    patches.push({
      table: "policies", recordId: record.id, title: record.title,
      before: { from: fixture.effectiveDate, to: fixture.reviewDate },
      after: { from: dates.effectiveDate, to: dates.reviewDate },
      // Preserve original timestamps; never rewrite audit entries or user rows.
      sql: "UPDATE policies p JOIN users u ON u.id = p.ownerId JOIN organizations o ON o.id = u.organizationId " +
        "SET p.effectiveDate = ?, p.reviewDate = ?, p.updatedAt = p.updatedAt " +
        "WHERE p.id = ? AND " + membershipGuard +
        " AND p.title = ? AND p.description = ? AND p.category = ? AND p.status = ? AND p.version = ? " +
        "AND p.effectiveDate = ? AND p.reviewDate = ? AND p.updatedAt = ? AND p.createdAt = p.updatedAt",
      parameters: [new Date(dates.effectiveDate), new Date(dates.reviewDate), record.id,
        ...scopeParameters, fixture.title, fixture.description, fixture.category, fixture.status,
        fixture.version, record.effectiveDate, record.reviewDate, record.updatedAt],
    });
  }

  for (const record of input.delegations) {
    const index = legacyDelegations.findIndex(fixture => fixture.title === record.title);
    const fixture = legacyDelegations[index];
    if (input.delegations.filter(candidate => candidate.title === record.title).length !== 1) continue;
    if (!fixture || seen.has(`delegation:${index}`) || !validId(record.id) ||
        record.delegatorId !== scope.demoUserId || record.delegateeId !== scope.demoUserId ||
        record.description !== fixture.description || record.authorityType !== fixture.authorityType ||
        record.thresholdAmount !== fixture.thresholdAmount || record.thresholdCurrency !== "GBP" ||
        record.conditions !== fixture.conditions || record.status !== "active" ||
        !isExactDate(record.effectiveFrom, "2024-01-01") || !isExactDate(record.effectiveTo, "2025-12-31") ||
        !untouchedTimestamps(record)) continue;
    seen.add(`delegation:${index}`);
    const dates = sampleDelegationPeriods[fixture.period];
    patches.push({
      table: "delegation_authority", recordId: record.id, title: record.title,
      before: { from: "2024-01-01", to: "2025-12-31" },
      after: { from: dates.effectiveFrom, to: dates.effectiveTo },
      sql: "UPDATE delegation_authority d JOIN users u ON u.id = d.delegatorId JOIN organizations o ON o.id = u.organizationId " +
        "SET d.effectiveFrom = ?, d.effectiveTo = ?, d.updatedAt = d.updatedAt " +
        "WHERE d.id = ? AND " + membershipGuard +
        " AND d.delegateeId = ? AND d.title = ? AND d.description = ? AND d.authorityType = ? " +
        "AND d.thresholdAmount <=> ? AND d.thresholdCurrency = 'GBP' AND d.conditions = ? AND d.status = 'active' " +
        "AND d.effectiveFrom = ? AND d.effectiveTo = ? AND d.updatedAt = ? AND d.createdAt = d.updatedAt",
      parameters: [new Date(dates.effectiveFrom), new Date(dates.effectiveTo), record.id,
        ...scopeParameters, scope.demoUserId, fixture.title, fixture.description, fixture.authorityType,
        fixture.thresholdAmount, fixture.conditions, record.effectiveFrom, record.effectiveTo, record.updatedAt],
    });
  }
  return { dryRun: true, patches, skipped: input.policies.length + input.delegations.length - patches.length };
}
