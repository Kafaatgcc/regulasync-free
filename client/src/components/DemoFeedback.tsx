import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Send } from "lucide-react";
import { Link } from "wouter";

export default function DemoFeedback({ onEditing }: { onEditing: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [interest, setInterest] = useState<"demo" | "general">("demo");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const submit = trpc.contact.submit.useMutation();
  const update = (field: keyof typeof form, value: string) => { setForm(current => ({ ...current, [field]: value })); setError(""); };
  if (submitted) return <section aria-live="polite" className="p-4 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-950">
    <CheckCircle2 className="w-6 h-6 mb-2" /><h4 className="font-semibold">Thank you — your inquiry is saved.</h4>
    <p className="text-sm mt-1">We will use the details you provided to follow up. You can now close the demo or keep exploring.</p>
  </section>;
  return <section className="rounded-lg border border-copper/40 bg-background/80 p-3 space-y-3" aria-labelledby="demo-feedback-heading">
    <div><h4 id="demo-feedback-heading" className="font-semibold">Interested in RegulaSync?</h4>
      <p className="text-xs text-muted-foreground mt-1">Request a follow-up or share feedback. The demo pauses while you complete this form.</p></div>
    <form className="space-y-3" onFocus={onEditing} onSubmit={async event => {
      event.preventDefault(); setError(""); onEditing();
      if (!consent) { setError("Please agree to be contacted about this inquiry."); return; }
      try {
        await submit.mutateAsync({ name: form.name.trim(), email: form.email.trim(), company: form.company.trim() || undefined,
          inquiryType: interest, subject: interest === "demo" ? "Guided demo — follow-up request" : "Guided demo — feedback and inquiry", message: form.message.trim() });
        setSubmitted(true);
      } catch (error) { setError(error instanceof Error ? error.message : "Unable to send your inquiry. Please try again."); }
    }}>
      <div><Label htmlFor="demo-interest">I would like to</Label>
        <select id="demo-interest" value={interest} onChange={e => setInterest(e.target.value as "demo" | "general")}
          className="mt-1 h-9 w-full rounded-md border bg-background text-foreground px-2 text-sm">
          <option value="demo">Request a follow-up demo</option><option value="general">Share feedback / ask a question</option>
        </select></div>
      <div><Label htmlFor="demo-feedback-name">Name *</Label><Input id="demo-feedback-name" required maxLength={150} value={form.name} onChange={e => update("name", e.target.value)} autoComplete="name" /></div>
      <div><Label htmlFor="demo-feedback-email">Email *</Label><Input id="demo-feedback-email" type="email" required maxLength={320} value={form.email} onChange={e => update("email", e.target.value)} autoComplete="email" /></div>
      <div><Label htmlFor="demo-feedback-company">Organisation (optional)</Label><Input id="demo-feedback-company" maxLength={200} value={form.company} onChange={e => update("company", e.target.value)} autoComplete="organization" /></div>
      <div><Label htmlFor="demo-feedback-message">Question or feedback *</Label><Textarea id="demo-feedback-message" required maxLength={4000} rows={3} value={form.message} onChange={e => update("message", e.target.value)} /></div>
      <label className="flex items-start gap-2 text-xs"><input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5" />
        <span>I agree to be contacted about this inquiry and have read the <Link href="/privacy" className="underline">Privacy Policy</Link>.</span></label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={submit.isPending} className="w-full gap-2"><Send className="w-4 h-4" />{submit.isPending ? "Sending…" : "Send inquiry"}</Button>
    </form>
  </section>;
}
