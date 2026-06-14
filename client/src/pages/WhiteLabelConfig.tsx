import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Palette, Globe, Mail, FileText, Eye, Save, CheckCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function WhiteLabelConfig() {
  const { user } = useAuth();
  const orgId = user?.organizationId as number | undefined;

  const { data: config, refetch } = trpc.whiteLabel.get.useQuery({ organizationId: orgId });

  const [form, setForm] = useState({
    brandName: "",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#b87333",
    secondaryColor: "#1e293b",
    accentColor: "#f59e0b",
    customDomain: "",
    supportEmail: "",
    privacyPolicyUrl: "",
    termsUrl: "",
    isActive: false,
  });

  useEffect(() => {
    if (config) {
      setForm({
        brandName: config.brandName ?? "",
        logoUrl: config.logoUrl ?? "",
        faviconUrl: config.faviconUrl ?? "",
        primaryColor: config.primaryColor ?? "#b87333",
        secondaryColor: config.secondaryColor ?? "#1e293b",
        accentColor: config.accentColor ?? "#f59e0b",
        customDomain: config.customDomain ?? "",
        supportEmail: config.supportEmail ?? "",
        privacyPolicyUrl: config.privacyPolicyUrl ?? "",
        termsUrl: config.termsUrl ?? "",
        isActive: config.isActive ?? false,
      });
    }
  }, [config]);

  const save = trpc.whiteLabel.save.useMutation({
    onSuccess: () => { toast.success("White label configuration saved"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSave = () => {
    if (!orgId) return toast.error("No organisation found");
    save.mutate({ organizationId: orgId, ...form });
  };

  const field = (key: keyof typeof form, label: string, placeholder?: string, type = "text") => (
    <div className="space-y-1.5">
      <Label className="text-sm text-foreground">{label}</Label>
      <Input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="bg-muted/30 border-border"
      />
    </div>
  );

  return (
    <div className="space-y-8 p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Palette className="w-8 h-8 text-amber-500" />
            White Label Configuration
          </h1>
          <p className="text-muted-foreground mt-1">
            Customise the platform branding for your organisation or reseller clients.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            />
            <span className="text-sm text-muted-foreground">
              {form.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <Button onClick={handleSave} disabled={save.isPending} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            {save.isPending ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>

      {form.isActive && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-400">White label branding is active for this organisation.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Identity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-500" />
              Brand Identity
            </CardTitle>
            <CardDescription>Platform name and visual assets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {field("brandName", "Brand Name", "e.g. AcmeCorp Compliance")}
            {field("logoUrl", "Logo URL", "https://cdn.example.com/logo.png")}
            {field("faviconUrl", "Favicon URL", "https://cdn.example.com/favicon.ico")}
          </CardContent>
        </Card>

        {/* Colour Scheme */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-500" />
              Colour Scheme
            </CardTitle>
            <CardDescription>Brand colours applied across the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Primary Colour</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer border border-border"
                />
                <Input
                  value={form.primaryColor}
                  onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                  className="bg-muted/30 border-border font-mono text-sm"
                  placeholder="#b87333"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Secondary Colour</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) => setForm((f) => ({ ...f, secondaryColor: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer border border-border"
                />
                <Input
                  value={form.secondaryColor}
                  onChange={(e) => setForm((f) => ({ ...f, secondaryColor: e.target.value }))}
                  className="bg-muted/30 border-border font-mono text-sm"
                  placeholder="#1e293b"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Accent Colour</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.accentColor}
                  onChange={(e) => setForm((f) => ({ ...f, accentColor: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer border border-border"
                />
                <Input
                  value={form.accentColor}
                  onChange={(e) => setForm((f) => ({ ...f, accentColor: e.target.value }))}
                  className="bg-muted/30 border-border font-mono text-sm"
                  placeholder="#f59e0b"
                />
              </div>
            </div>
            {/* Colour Preview */}
            <div className="mt-2 p-3 rounded-lg border border-border/50 bg-muted/20">
              <p className="text-xs text-muted-foreground mb-2">Preview</p>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: form.primaryColor }} title="Primary" />
                <div className="w-8 h-8 rounded" style={{ backgroundColor: form.secondaryColor }} title="Secondary" />
                <div className="w-8 h-8 rounded" style={{ backgroundColor: form.accentColor }} title="Accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Domain & Contact */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-500" />
              Domain & Contact
            </CardTitle>
            <CardDescription>Custom domain and support contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {field("customDomain", "Custom Domain", "compliance.yourdomain.com")}
            {field("supportEmail", "Support Email", "support@yourdomain.com", "email")}
          </CardContent>
        </Card>

        {/* Legal Links */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              Legal Links
            </CardTitle>
            <CardDescription>Privacy policy and terms of service URLs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {field("privacyPolicyUrl", "Privacy Policy URL", "https://yourdomain.com/privacy")}
            {field("termsUrl", "Terms of Service URL", "https://yourdomain.com/terms")}
          </CardContent>
        </Card>
      </div>

      {/* Reseller Information */}
      <Card className="bg-card border-border border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-500" />
            White Label Reseller Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {[
              {
                title: "Step 1 — Configure Branding",
                desc: "Set your brand name, logo, and colour scheme above. These will replace RegulaSync branding throughout the platform.",
              },
              {
                title: "Step 2 — Set Custom Domain",
                desc: "Point your subdomain (e.g. compliance.yourdomain.com) to our servers using a CNAME record. Contact support for DNS details.",
              },
              {
                title: "Step 3 — Activate",
                desc: "Toggle 'Active' and save. Your clients will see your brand, not RegulaSync. All functionality remains identical.",
              },
            ].map((step) => (
              <div key={step.title} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="font-semibold text-amber-500 mb-1">{step.title}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
