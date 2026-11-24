// @vitest-environment jsdom
import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const mocks = vi.hoisted(() => {
  const user = { id: 1, email: "superadmin@regulasync.co.uk", role: "super_admin" };
  const cancel = vi.fn().mockResolvedValue(undefined);
  const fetch = vi.fn().mockResolvedValue(user);
  const invalidate = vi.fn().mockResolvedValue(undefined);
  const renew = vi.fn().mockResolvedValue({ success: true });
  const utils = { auth: { me: { cancel, fetch, invalidate } } };
  return { user, utils, cancel, fetch, invalidate, renew, error: vi.fn(), submit: vi.fn().mockResolvedValue({ success: true }) };
});
vi.mock("../client/src/lib/trpc", () => ({ trpc: {
  useUtils: () => mocks.utils,
  contact: { submit: { useMutation: () => ({ mutateAsync: mocks.submit, isPending: false }) } },
  auth: { me: { useQuery: () => ({ data: mocks.user }) } },
  passwordAuth: { renewDemoSession: { useMutation: () => ({ mutateAsync: mocks.renew }) } },
} }));
vi.mock("sonner", () => ({ toast: { error: mocks.error } }));
import PresentationMode from "../client/src/components/PresentationMode";
import { PRESENTATION_START_EVENT } from "../client/src/lib/presentation";

async function setup(path = "/super-admin", event = false) {
  const location = memoryLocation({ path, record: true });
  render(React.createElement(Router, { hook: location.hook }, React.createElement(PresentationMode)));
  await act(async () => {
    if (event) window.dispatchEvent(new Event(PRESENTATION_START_EVENT));
    else fireEvent.click(screen.getByRole("button", { name: /8-Min Demo/ }));
  });
  return location;
}
const tick = async (seconds: number) => {
  for (let i = 0; i < seconds; i++) await act(async () => { vi.advanceTimersByTime(1000); });
};
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1280 });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
  mocks.fetch.mockResolvedValue(mocks.user);
  localStorage.clear();
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("Eight-minute Railway demo merged into Manus", () => {
  it("keeps the panel across every public/private step and returns to the signed-in starting page", async () => {
    const location = await setup();
    expect(location.history.at(-1)).toBe("/landing");
    expect(screen.getByText("8-Minute Guided Demo")).toBeTruthy();
    const routes = ["/audit-trail", "/gap-analysis", "/regulatory-updates", "/dashboard", "/about", "/pricing", "/contact"];
    for (const route of routes) {
      await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Next demo step" })); });
      expect(location.history.at(-1)).toBe(route);
      expect(screen.getByText("8-Minute Guided Demo")).toBeTruthy();
    }
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Previous demo step" })); });
    expect(location.history.at(-1)).toBe("/pricing");
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Close demo" })); });
    expect(location.history.at(-1)).toBe("/super-admin");
    expect(screen.queryByText("8-Minute Guided Demo")).toBeNull();
  });
  it("runs exactly eight minutes, pauses/resumes and auto-advances to completion", async () => {
    vi.useFakeTimers();
    const location = await setup("/dashboard");
    fireEvent.click(screen.getByRole("button", { name: "Pause demo" }));
    await tick(50);
    expect(location.history.at(-1)).toBe("/landing");
    expect(screen.getByText("0:45")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Resume demo" }));
    await tick(45);
    expect(location.history.at(-1)).toBe("/audit-trail");
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "8", exact: true })); });
    fireEvent.click(screen.getByRole("button", { name: "Resume demo" }));
    await tick(60);
    expect(location.history.at(-1)).toBe("/contact");
    expect(screen.getByText("Demo complete")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Send inquiry" })).toBeTruthy();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Close demo" })); });
    expect(location.history.at(-1)).toBe("/dashboard");
    const source = readFileSync(resolve(process.cwd(), "client/src/components/PresentationMode.tsx"), "utf8");
    const durations = [...source.matchAll(/duration: (\d+),/g)].map(m => Number(m[1]));
    expect(durations.reduce((a,b) => a+b,0)).toBe(480);
  });
  it("supports the homepage's direct prepared-demo event and renews before navigation", async () => {
    localStorage.setItem("demoMode", "true");
    const location = await setup("/landing", true);
    expect(location.history.at(-1)).toBe("/landing");
    expect(screen.getByText("8-Minute Guided Demo")).toBeTruthy();
    expect(mocks.renew).toHaveBeenCalled();
    expect(mocks.cancel.mock.invocationCallOrder[0]).toBeLessThan(mocks.renew.mock.invocationCallOrder[0]);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Next demo step" })); });
    expect(location.history.at(-1)).toBe("/audit-trail");
    expect(mocks.renew.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
  it("does not navigate or silently restart when the session has expired", async () => {
    mocks.fetch.mockResolvedValue(null);
    const location = await setup("/landing", true);
    expect(location.history.at(-1)).toBe("/landing");
    expect(screen.queryByText("8-Minute Guided Demo")).toBeNull();
    expect(mocks.error).toHaveBeenCalled();
  });
  it("fits a narrow screen and supports minimize, expand and close", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 320 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 480 });
    const location = await setup("/dashboard");
    const panel = screen.getByText("8-Minute Guided Demo").closest(".fixed") as HTMLElement;
    expect(parseFloat(panel.style.width) + parseFloat(panel.style.left)).toBeLessThanOrEqual(308);
    expect(parseFloat(panel.style.height) + parseFloat(panel.style.top)).toBeLessThanOrEqual(468);
    fireEvent.click(screen.getByRole("button", { name: "Minimize demo" }));
    fireEvent.click(screen.getByRole("button", { name: "Expand demo" }));
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Close demo" })); });
    expect(location.history.at(-1)).toBe("/dashboard");
  });
  it("keeps tools outside the page route branch and credential screens free of floating controls", () => {
    const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    const router = app.slice(app.indexOf("function Router()"), app.indexOf("function PageRouter()"));
    expect(router).toContain("!hideTools && <PresentationMode />");
    expect(router).toContain('"/login"');
    expect(app.slice(app.indexOf("function PageRouter()"))).not.toContain("<PresentationMode />");
    expect(app).toContain("<ProtectedRoute>");
    const main = readFileSync(resolve(process.cwd(), "client/src/main.tsx"), "utf8");
    expect(main).not.toContain("window.location.href = '/'");
  });
  it("supports keyboard timeline seeking and pauses at the selected step", async () => {
    const location = await setup();
    const slider = screen.getByRole("slider", { name: "Demo timeline" });
    await act(async () => { fireEvent.keyDown(slider, { key: "End" }); fireEvent.keyUp(slider, { key: "End" }); });
    expect(location.history.at(-1)).toBe("/contact");
    expect(screen.getByRole("button", { name: "Resume demo" })).toBeTruthy();
    expect(screen.getByText("Interested in RegulaSync?")).toBeTruthy();
  });
  it("detaches/resizes notes, adjusts their background without fading text, and docks them again", async () => {
    await setup();
    fireEvent.click(screen.getByRole("button", { name: "Detach speaker notes" }));
    const notes = screen.getByRole("region", { name: "Floating speaker notes" });
    const before = parseFloat(notes.style.width);
    fireEvent.keyDown(screen.getByRole("button", { name: "Resize speaker notes" }), { key: "ArrowRight" });
    expect(parseFloat(notes.style.width)).toBe(before + 20);
    fireEvent.change(screen.getByRole("slider", { name: "Speaker notes background opacity" }), { target: { value: "60" } });
    expect(screen.getByText("60%")).toBeTruthy();
    expect(notes.style.opacity).toBe("");
    fireEvent.click(screen.getByRole("button", { name: "Dock speaker notes" }));
    expect(screen.queryByRole("region", { name: "Floating speaker notes" })).toBeNull();
  });
  it("stores the explicit final-step inquiry with contact consent and pauses during form entry", async () => {
    await setup();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "8", exact: true })); });
    fireEvent.change(screen.getByLabelText("Name *"), { target: { value: "Test Visitor" } });
    fireEvent.change(screen.getByLabelText("Email *"), { target: { value: "visitor@example.com" } });
    fireEvent.change(screen.getByLabelText("Question or feedback *"), { target: { value: "Please explain onboarding." } });
    fireEvent.click(screen.getByRole("checkbox"));
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Send inquiry" })); });
    expect(mocks.submit).toHaveBeenCalledWith(expect.objectContaining({ name: "Test Visitor", email: "visitor@example.com", message: "Please explain onboarding.", subject: "Guided demo — follow-up request" }));
    expect(screen.getByText("Thank you — your inquiry is saved.")).toBeTruthy();
  });
  it("uses Q2 2027 launch wording and preserves the 480-second timeline", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/PresentationMode.tsx"), "utf8");
    expect(source).toContain("Q2 2027"); expect(source).not.toContain("Q2 2026");
    const landing = readFileSync(resolve(process.cwd(), "client/src/pages/Landing.tsx"), "utf8");
    expect(landing).toContain('hidden md:flex items-center justify-center');
    expect(landing).toContain('href="/integrations"');
  });
});
