import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const publicContactSurfaces = [
  "client/src/pages/About.tsx",
  "client/src/pages/Contact.tsx",
  "client/src/pages/ComingSoon.tsx",
  "client/src/pages/PrivacyPolicy.tsx",
  "client/src/pages/Cookies.tsx",
  "client/src/pages/Terms.tsx",
  "client/src/pages/Security.tsx",
  "client/src/pages/DocumentationHub.tsx",
  "client/src/components/PublicFooter.tsx",
  "client/src/components/PresentationMode.tsx",
  "client/src/components/GuidedTour.tsx",
  "client/src/components/LiveChat.tsx",
  "server/platformSettingsService.ts",
  "server/routers.ts",
];

describe("authorized six public-copy amendments", () => {
  it.each(publicContactSurfaces)("uses the approved public contact on %s", (path) => {
    const text = source(path);
    expect(text).toContain("bhousen@regulasync.co.uk");
    expect(text).not.toMatch(/(?:hello|support|security)@regulasync\.(?:com|co\.uk)/i);
  });

  it("removes unapproved first-year discounts, numeric pilot scarcity and response promises", () => {
    const landing = source("client/src/pages/Landing.tsx");
    expect(landing).not.toMatch(/50%|[234] spots|limited to 10|within 24 hours|24-hour/i);
    const contact = source("client/src/pages/Contact.tsx");
    expect(contact).not.toMatch(/within 24 hours|24-hour|7123 4567/i);
    const pricing = source("client/src/pages/Pricing.tsx");
    expect(pricing).not.toContain("Response within 48 hours");
  });

  it("marks the marketing dashboard as illustrative rather than live customer evidence", () => {
    const landing = source("client/src/pages/Landing.tsx");
    expect(landing).toContain("Illustrative Mock Dashboard");
    expect(landing).toContain("Illustrative");
    expect(landing).not.toContain("Ensure compliance");
  });

  it("qualifies audit and regulator assurance while retaining real verification controls", () => {
    const audit = source("client/src/pages/AuditTrail.tsx");
    expect(audit).toContain("tamper-evident design");
    expect(audit).toContain("require validation");
    expect(audit).not.toContain("Cryptographically verified, immutable audit trail");
    expect(audit).not.toContain("Any tampering is immediately detectable");
    expect(audit).toContain("chainVerification");
    expect(audit).toContain("copyHash");
    expect(source("client/src/pages/ApiDocumentation.tsx")).toContain("not a confirmed production API contract");
  });

  it("labels unvalidated heuristic scenarios without fabricating or changing policy-derived values", () => {
    const risk = source("client/src/pages/PredictiveRisk.tsx");
    expect(risk).toContain("Illustrative 90-day heuristic scenarios calculated from policy data");
    expect(risk).toContain("not validated breach probabilities");
    expect(risk).toContain("human review");
    expect(risk).toContain("Illustrative Risk Score");
    expect(risk).toContain("{forecast.breachProbability}/100");
    expect(risk).toContain("{data.avgBreachProbability}/100");
    expect(source("server/routers.ts")).toContain("not independently verified");
    expect(source("client/src/components/LiveChat.tsx")).toMatch(/illustrative/i);
  });

  it("uses relative indicative staffing years and the Q2 2027 launch", () => {
    const about = source("client/src/pages/About.tsx");
    expect(about).toContain("not current headcount");
    for (const year of [1, 2, 3]) expect(about).toContain(`Indicative team size — Year ${year}`);
    expect(about).not.toMatch(/team size.*202[678]/i);
    expect(source("client/src/components/PresentationMode.tsx")).toContain("Q2 2027");
    expect(source("client/src/pages/Pricing.tsx")).toContain("Q2 2027");
  });

  it("states proposed commercial terms and sends early-access interest to contact, not Stripe", () => {
    const pricing = source("client/src/pages/Pricing.tsx");
    expect(pricing).toContain("Payment acceptance is not confirmed");
    expect(pricing).toContain("immediate changes are not currently promised");
    expect(pricing).toContain("Request Early Access opens the inquiry form, not payment checkout");
    expect(pricing).toContain("/contact?plan=");
    expect(pricing).not.toContain("billing.createCheckout");
    expect(pricing).not.toContain("trialDays: 14");
    const terms = source("client/src/pages/Terms.tsx");
    expect(terms).toContain("without limiting statutory rights");
    expect(terms).not.toContain("We accept major credit cards");
    expect(terms).not.toContain("within 14 days for a full refund");
    const chat = source("client/src/components/LiveChat.tsx");
    for (const price of ["£90", "£175", "£350"]) expect(chat).toContain(price);
    expect(chat).not.toMatch(/£49|£109|£179/);
  });
});
