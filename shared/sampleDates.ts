/**
 * Fixed illustrative examples for the 24 November 2026 assessment.
 * These are internal example dates, not statutory deadlines. Never apply them
 * to user records, regulatory publications or historical audit timestamps.
 */
export const SAMPLE_AS_OF = "2026-11-24";
export const SAMPLE_DATE_LABEL = "Illustrative 2026 examples";

export const samplePolicyUpdatedDates = [
  "2026-11-15", "2026-11-10", "2026-10-28", "2026-11-18",
  "2026-10-05", "2026-11-20", "2026-11-15", "2026-11-01",
] as const;

// Reviews are internal example planning dates, after each effective date.
export const samplePolicyLifecycleDates = [
  { effectiveDate: "2026-01-01", reviewDate: "2026-12-15" },
  { effectiveDate: "2026-03-15", reviewDate: "2026-12-10" },
  { effectiveDate: "2026-02-01", reviewDate: "2026-12-01" },
  { effectiveDate: "2026-01-15", reviewDate: "2026-12-15" },
  { effectiveDate: "2026-06-01", reviewDate: "2026-11-30" },
  // Draft policy: proposed effective date, not evidence of an approval.
  { effectiveDate: "2026-12-01", reviewDate: "2026-12-18" },
] as const;

export const sampleDelegationPeriods = [
  { effectiveFrom: "2026-01-01", effectiveTo: "2026-12-31" },
  { effectiveFrom: "2026-03-15", effectiveTo: "2026-12-31" },
  { effectiveFrom: "2026-06-01", effectiveTo: "2026-12-31" },
  // Pending example: proposed authority starts after the assessment date.
  { effectiveFrom: "2026-12-01", effectiveTo: "2026-12-31" },
  { effectiveFrom: "2026-01-01", effectiveTo: "2026-12-31" },
] as const;

// The escalated example is already overdue; pending examples are upcoming.
export const sampleApprovalDueDates = ["2026-11-28", "2026-11-30", "2026-11-23"] as const;
