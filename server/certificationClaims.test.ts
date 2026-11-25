import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const readPage = (name: string) => readFileSync(
  fileURLToPath(new URL(`../client/src/pages/${name}.tsx`, import.meta.url)),
  "utf8",
);
const readinessSource = readPage("CertificationReadiness");
const securitySource = readPage("Security");

// Inspect the actual page data without rendering providers or reaching any API.
function readLiteral(node: ts.Expression): unknown {
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(element => readLiteral(element as ts.Expression));
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(node.properties.map(property => {
      if (!ts.isPropertyAssignment(property)) throw new Error("Expected a literal property");
      return [property.name.getText(), readLiteral(property.initializer)];
    }));
  }
  // Icon references have no bearing on claims; do not execute them.
  if (ts.isIdentifier(node)) return node.text;
  throw new Error(`Unexpected non-literal plan data: ${node.getText()}`);
}
function readPlanData(source: string, variableName: string): Record<string, unknown>[] {
  const parsed = ts.createSourceFile("page.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const statement of parsed.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (declaration.name.getText() === variableName && declaration.initializer) {
        return readLiteral(declaration.initializer) as Record<string, unknown>[];
      }
    }
  }
  throw new Error(`Missing page plan data: ${variableName}`);
}

const readinessPlans = readPlanData(readinessSource, "readinessPlans");
const roadmap = readPlanData(readinessSource, "roadmapMilestones");
const publicPlans = readPlanData(securitySource, "assurancePlans");

describe("assessment certification and security claims", () => {
  it("keeps Cyber Essentials and every assurance achievement planned without completed certification states", () => {
    expect(readinessPlans).toHaveLength(5);
    expect(readinessPlans.find(plan => plan.id === "cyber-essentials")?.status).toBe("planned");
    for (const plan of readinessPlans) expect(plan.status).toBe("planned");
    expect(readinessSource).not.toMatch(/status\s*:\s*['"]completed['"]|case\s*['"]completed['"]/);
    expect(readinessSource).not.toContain("completedCount");
  });

  it("retains sample checklist progress only with explicit illustrative and non-assurance labels", () => {
    expect(readinessPlans.find(plan => plan.id === "cyber-essentials")?.progress).toBe(100);
    expect(readinessSource).toContain("Illustrative Checklist Progress");
    expect(readinessSource).toContain("Illustrative checklist progress");
    expect(readinessSource).toContain("Illustrative checklist tasks");
    expect(readinessSource).toContain("Sample task statuses only; not verified controls or audit evidence.");
    expect(readinessSource).toContain("completed sample tasks do not establish actual certification readiness or legal compliance.");
    expect(readinessSource).toContain("not certification or compliance");
    expect(securitySource).toContain("Prototype checklist progress is illustrative only");
  });

  it("separates UK GDPR legal duties from certification and makes clear duties cannot be deferred", () => {
    expect(readinessPlans.filter(plan => plan.category === "legal-obligation")).toHaveLength(1);
    expect(readinessPlans.find(plan => plan.id === "uk-gdpr-obligations")?.description).toContain("not a certification");
    const gdpr = publicPlans.find(plan => plan.name === "UK GDPR Obligations");
    expect(gdpr?.status).toBe("Ongoing obligation");
    expect(gdpr?.description).toContain("legal obligation, not a certification");
    expect(readinessSource).toContain("regardless of these planned workstreams");
    expect(securitySource).toContain("must be met for relevant processing now, not deferred");
    for (const source of [readinessSource, securitySource]) {
      expect(source).not.toMatch(/UK GDPR Certification|GDPR Compliant Design|ICO-approved certification|100% compliance/i);
    }
  });

  it("describes SOC 2 as a planned attestation report, not a certification", () => {
    const soc = readinessPlans.find(plan => plan.id === "soc2-type1");
    expect(soc?.category).toBe("attestation");
    expect(soc?.description).toContain("not a certification");
    expect(publicPlans.find(plan => plan.name === "SOC 2 Type II")?.description).toContain("not a certification");
    expect(readinessSource).toContain("No certification or SOC 2 report is evidenced here.");
    expect(securitySource).toContain("No certification or SOC 2 report is evidenced here.");
  });

  it("replaces calendar targets with non-dated planned phases on both pages", () => {
    for (const plan of [...readinessPlans, ...publicPlans]) {
      expect(plan.plannedPhase).toEqual(expect.any(String));
      expect(plan).not.toHaveProperty("targetDate");
      expect(plan).not.toHaveProperty("timeline");
    }
    for (const source of [readinessSource, securitySource]) {
      expect(source).not.toMatch(/Q[1-4]\s+20\d{2}|Target:|From Launch/);
      expect(source).toContain("Planned phase:");
    }
  });

  it("shows every roadmap milestone as proposed preparation, not an achieved certificate or report", () => {
    expect(roadmap).toHaveLength(6);
    for (const milestone of roadmap) {
      expect(milestone.status).toBe("planned");
      expect(milestone.phase).toEqual(expect.any(String));
      expect(milestone).not.toHaveProperty("quarter");
      expect(milestone.milestone).not.toMatch(/Certified|Achieved|Completed/);
    }
    expect(readinessSource).toContain("not completed achievements or committed dates");
    expect(publicPlans.filter(plan => plan.name !== "UK GDPR Obligations").every(plan => plan.status === "Planned")).toBe(true);
  });

  it("does not promise unsupported production security controls, residency or fixed legal deadlines", () => {
    for (const claim of [
      "All data encrypted at rest (AES-256)", "256-bit Encryption", "UK Data Centres", "24/7 Monitoring",
      "All customer data stored within UK/EU", "customer-managed keys available", "tamper-evident logging",
      "72-hour breach notification commitment", "Regular privacy impact assessments conducted",
      "Data Processing Agreements (DPAs) available for all customers",
    ]) expect(securitySource).not.toContain(claim);
    expect(securitySource).toContain("not independently verified production controls");
    expect(securitySource).toContain("No UK-only or UK/EU-only data residency guarantee");
    expect(securitySource).toContain("not regulator approval, a legal assessment or a guarantee of compliance");
  });

  it("preserves security navigation and contact actions", () => {
    expect(securitySource).toContain("<PublicHeader />");
    expect(securitySource).toContain("<PublicFooter />");
    expect(securitySource).toContain('href="/#request-demo"');
    expect(securitySource).toContain('href="mailto:bhousen@regulasync.co.uk"');
  });

  it.each([
    ["CertificationReadiness", readinessSource],
    ["Security", securitySource],
  ])("keeps %s valid TSX syntax", (name, source) => {
    const result = ts.transpileModule(source, {
      fileName: `${name}.tsx`,
      reportDiagnostics: true,
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    });
    expect(result.diagnostics?.filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error)).toEqual([]);
  });
});
