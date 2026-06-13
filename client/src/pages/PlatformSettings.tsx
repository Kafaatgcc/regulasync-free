import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Mic, Radio, Settings, Shield, Zap } from "lucide-react";

const SETTING_GROUPS = [
  {
    group: "AI & Automation",
    icon: Zap,
    color: "text-blue-600",
    settings: [
      { key: "horizon_scanning_enabled", label: "Predictive Horizon Scanning", description: "AI monitors upcoming regulatory changes 6-18 months ahead and alerts you proactively" },
      { key: "agentic_ai_enabled", label: "Agentic AI Tasks", description: "Allow AI to autonomously draft policies and remediation plans (requires human approval)" },
      { key: "xai_logging_enabled", label: "Explainable AI Logging", description: "Log full reasoning chains for every AI decision for FCA Consumer Duty compliance" },
      { key: "auto_evidence_collection", label: "Automated Evidence Collection", description: "Automatically gather compliance evidence from connected systems (M365, Google, AWS)" },
    ],
  },
  {
    group: "Reporting & Briefings",
    icon: Mic,
    color: "text-purple-600",
    settings: [
      { key: "voice_briefings_enabled", label: "Voice Briefings", description: "Generate AI-powered audio compliance briefings for board and executive meetings" },
      { key: "executive_briefings_enabled", label: "Executive Summary Reports", description: "Automatically generate weekly executive compliance summaries" },
    ],
  },
  {
    group: "Compliance & Governance",
    icon: Shield,
    color: "text-green-600",
    settings: [
      { key: "compliance_passport_enabled", label: "Compliance Passports", description: "Issue cryptographically-signed, verifiable compliance certificates" },
      { key: "regulator_portal_enabled", label: "Regulator Portal Access", description: "Allow regulators direct read-only access to your compliance data" },
      { key: "peer_benchmarking_enabled", label: "Peer Benchmarking", description: "Submit anonymised data to compare compliance posture with industry peers" },
      { key: "esg_tracking_enabled", label: "ESG & Sustainability Tracking", description: "Track Environmental, Social, and Governance metrics aligned with UK frameworks" },
    ],
  },
  {
    group: "Security",
    icon: Shield,
    color: "text-red-600",
    settings: [
      { key: "zero_trust_enabled", label: "Zero-Trust Security Mode", description: "Enforce zero-trust architecture — every access request is verified regardless of network location" },
      { key: "mfa_required", label: "Require MFA for All Users", description: "Enforce multi-factor authentication for all platform users" },
    ],
  },
  {
    group: "Internationalisation",
    icon: Globe,
    color: "text-indigo-600",
    settings: [
      { key: "multilingual_enabled", label: "Multilingual Support", description: "Enable multi-language interface and regulatory framework mapping (UK → EU → US)" },
    ],
  },
];

export default function PlatformSettings() {
  
  

  const { data: settings = [], isLoading, refetch } = trpc.settings.getAll.useQuery();

  const updateSetting = trpc.settings.update.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Setting updated", { description: "Platform configuration has been saved." });
    },
    onError: (e) => toast.error(e.message),
  });

  const getSettingValue = (key: string): string => {
    const setting = settings.find((s: any) => s.settingKey === key);
    return setting?.settingValue ?? "false";
  };

  const isEnabled = (key: string): boolean => getSettingValue(key) === "true";

  const toggle = (key: string) => {
    const current = isEnabled(key);
    updateSetting.mutate({ key, value: (!current).toString() });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-7 w-7 text-gray-600" /> Platform Settings
        </h1>
        <p className="text-gray-500 mt-1">Configure all platform features, AI capabilities, and integrations</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading settings...</div>
      ) : (
        <div className="space-y-6">
          {SETTING_GROUPS.map(group => (
            <Card key={group.group}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <group.icon className={`h-5 w-5 ${group.color}`} />
                  {group.group}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {group.settings.map(setting => (
                    <div key={setting.key} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium cursor-pointer" htmlFor={setting.key}>
                            {setting.label}
                          </Label>
                          {isEnabled(setting.key) && (
                            <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{setting.description}</p>
                      </div>
                      <Switch
                        id={setting.key}
                        checked={isEnabled(setting.key)}
                        onCheckedChange={() => toggle(setting.key)}
                        disabled={updateSetting.isPending}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Multilingual Language Selection */}
          {isEnabled("multilingual_enabled") && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-indigo-600" /> Language & Framework Mapping
                </CardTitle>
                <CardDescription>Configure active regulatory frameworks and interface language</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Primary Regulatory Framework</Label>
                  <Select
                    value={getSettingValue("primary_framework")}
                    onValueChange={v => updateSetting.mutate({ key: "primary_framework", value: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uk">UK (FCA, PRA, ICO)</SelectItem>
                      <SelectItem value="eu">EU (DORA, MiFID II, GDPR)</SelectItem>
                      <SelectItem value="us">US (SEC, FINRA, CCPA)</SelectItem>
                      <SelectItem value="global">Global (Multi-framework)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Interface Language</Label>
                  <Select
                    value={getSettingValue("interface_language")}
                    onValueChange={v => updateSetting.mutate({ key: "interface_language", value: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="English (UK)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
