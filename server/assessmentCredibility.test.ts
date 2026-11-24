import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
describe("Full-platform expert credibility alignment", () => {
  it("labels pre-launch careers rather than asserting funding stage or stale vacancies", () => {
    const s=source("client/src/pages/Careers.tsx"); expect(s).toContain("Pre-launch Stage"); expect(s).toContain("not current vacancies"); expect(s).not.toMatch(/Series A Stage|Hiring Now|Q[1-4] 202[456]/);
  });
  it("removes obsolete integration quarters and unsupported live regulator connections", () => {
    const s=source("client/src/pages/Integrations.tsx"); expect(s).not.toMatch(/Q[1-4] 2025|FCA Gabriel|Available Now/); expect(s).toContain("timing to be confirmed"); expect(s).toContain("No live direct reporting");
  });
  it("uses honest intended-customer language rather than customer endorsement", () => {
    const s=source("client/src/pages/Landing.tsx"); expect(s).toContain("Built for organisations"); expect(s).not.toMatch(/Trusted by organizations|99\.9%|85%</);
  });
  it("narrates the same three per-user prices and 2027 launch in the guided demo", () => {
    const s=source("client/src/components/PresentationMode.tsx"); for(const price of ["£90", "£175", "£350"]) expect(s).toContain(price); expect(s).toContain("per user per month"); expect(s).toContain("Q2 2027"); expect(s).not.toMatch(/4-tier|£19 to £199|Q2 2026/); expect(s).toContain("forecasts, not current employees");
  });
  it("does not fabricate obtained certificates when generating a passport", () => {
    const s=source("server/compliancePassportService.ts"); expect(s).not.toContain('{ name: "Cyber Essentials", status: "active"'); expect(s).toContain('status: "planned"'); expect(s).toContain("not GDPR certification");
    const ui=source("client/src/pages/CompliancePassport.tsx"); expect(ui).toContain("Compliance Not Independently Verified"); expect(ui).not.toContain("Passport Valid — Compliance Verified");
  });
  it("labels generated reports and notification dates as illustrative, not fake statutory guidance", () => {
    expect(source("client/src/lib/pdfGenerator.ts")).not.toMatch(/Q4 2024|requires policy update by Q1 2025/);
    const db=source("server/db.ts"); expect(db).not.toMatch(/due on January 6, 2026|by January 15, 2026/); expect(db).toContain("not an official FCA filing deadline");
  });
  it("keeps access credentials server-side and labels session expiry separately", () => {
    expect(source("client/src/pages/ComingSoon.tsx")).not.toContain("RS@Demo#2026!Uk"); expect(source("client/src/lib/demoSession.ts")).toContain("code has no scheduled expiry"); expect(source("server/demoSessions.ts")).toContain("no scheduled/calendar expiry");
  });
});
