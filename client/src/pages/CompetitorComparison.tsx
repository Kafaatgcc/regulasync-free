import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  Minus,
  Trophy,
  Zap,
  Shield,
  Brain,
  Building2,
  Globe,
  Sparkles
} from "lucide-react";

interface CompetitorFeature {
  feature: string;
  regulasync: 'full' | 'partial' | 'none' | 'unique';
  diligent: 'full' | 'partial' | 'none';
  workiva: 'full' | 'partial' | 'none';
  clausematch: 'full' | 'partial' | 'none';
  logicgate: 'full' | 'partial' | 'none';
  onetrust: 'full' | 'partial' | 'none';
  category: string;
}

const competitorData: CompetitorFeature[] = [
  // Core Innovation
  { feature: 'Self-Validating Audit Cache (SVAC)', regulasync: 'unique', diligent: 'none', workiva: 'none', clausematch: 'none', logicgate: 'none', onetrust: 'none', category: 'Core Innovation' },
  { feature: 'AI-Powered Regulatory Gap Analysis', regulasync: 'unique', diligent: 'none', workiva: 'none', clausematch: 'partial', logicgate: 'none', onetrust: 'partial', category: 'Core Innovation' },
  { feature: 'Blockchain-Inspired Tamper Detection', regulasync: 'unique', diligent: 'none', workiva: 'none', clausematch: 'none', logicgate: 'none', onetrust: 'none', category: 'Core Innovation' },
  { feature: 'Real-Time Policy Enforcement', regulasync: 'full', diligent: 'partial', workiva: 'none', clausematch: 'partial', logicgate: 'partial', onetrust: 'none', category: 'Core Innovation' },
  
  // UK Regulatory Focus
  { feature: 'FCA Compliance Templates', regulasync: 'full', diligent: 'partial', workiva: 'partial', clausematch: 'full', logicgate: 'partial', onetrust: 'partial', category: 'UK Focus' },
  { feature: 'PRA Regulatory Monitoring', regulasync: 'full', diligent: 'partial', workiva: 'none', clausematch: 'full', logicgate: 'none', onetrust: 'partial', category: 'UK Focus' },
  { feature: 'SM&CR Support', regulasync: 'full', diligent: 'partial', workiva: 'none', clausematch: 'full', logicgate: 'none', onetrust: 'none', category: 'UK Focus' },
  { feature: 'UK GDPR / ICO Compliance', regulasync: 'full', diligent: 'partial', workiva: 'partial', clausematch: 'partial', logicgate: 'partial', onetrust: 'full', category: 'UK Focus' },
  
  // Governance Features
  { feature: 'Policy Management', regulasync: 'full', diligent: 'full', workiva: 'partial', clausematch: 'full', logicgate: 'full', onetrust: 'partial', category: 'Governance' },
  { feature: 'Delegation of Authority', regulasync: 'full', diligent: 'full', workiva: 'none', clausematch: 'partial', logicgate: 'partial', onetrust: 'none', category: 'Governance' },
  { feature: 'Workflow Automation', regulasync: 'full', diligent: 'full', workiva: 'partial', clausematch: 'partial', logicgate: 'full', onetrust: 'partial', category: 'Governance' },
  { feature: 'Audit Trail', regulasync: 'full', diligent: 'full', workiva: 'full', clausematch: 'full', logicgate: 'full', onetrust: 'full', category: 'Governance' },
  
  // Pricing & Accessibility
  { feature: 'SME-Friendly Pricing', regulasync: 'full', diligent: 'none', workiva: 'none', clausematch: 'partial', logicgate: 'partial', onetrust: 'none', category: 'Accessibility' },
  { feature: 'Quick Implementation (<30 days)', regulasync: 'full', diligent: 'none', workiva: 'none', clausematch: 'partial', logicgate: 'partial', onetrust: 'none', category: 'Accessibility' },
  { feature: 'No IT Team Required', regulasync: 'full', diligent: 'none', workiva: 'none', clausematch: 'partial', logicgate: 'partial', onetrust: 'none', category: 'Accessibility' },
];

const competitors = [
  { name: 'RegulaSync', logo: '🚀', description: 'AI-Powered Governance Automation', highlight: true },
  { name: 'Diligent', logo: '📊', description: 'Board Management & GRC' },
  { name: 'Workiva', logo: '📈', description: 'Financial Reporting' },
  { name: 'ClauseMatch', logo: '📝', description: 'Policy Management' },
  { name: 'LogicGate', logo: '⚙️', description: 'Risk Management' },
  { name: 'OneTrust', logo: '🔒', description: 'Privacy & Compliance' },
];

const uniqueAdvantages = [
  {
    title: 'Self-Validating Audit Cache (SVAC)',
    description: 'Blockchain-inspired cryptographic hash chain creates tamper-evident audit trails that regulators can verify instantly. No competitor offers this level of audit integrity.',
    icon: Shield,
    color: 'text-purple-500'
  },
  {
    title: 'AI Regulatory Sync',
    description: 'LLM-powered analysis automatically identifies gaps between company policies and new regulatory requirements. Reduces compliance review time by 85%.',
    icon: Brain,
    color: 'text-blue-500'
  },
  {
    title: 'UK Regulatory Focus',
    description: 'Purpose-built for UK financial services with deep FCA, PRA, and ICO integration. Not a US product retrofitted for UK market.',
    icon: Globe,
    color: 'text-green-500'
  },
  {
    title: 'SME Accessibility',
    description: 'Enterprise-grade governance at SME-friendly pricing. Implementation in weeks, not months. No dedicated IT team required.',
    icon: Building2,
    color: 'text-amber-500'
  }
];

export default function CompetitorComparison() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'full': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'partial': return <Minus className="h-5 w-5 text-amber-500" />;
      case 'none': return <XCircle className="h-5 w-5 text-red-400" />;
      case 'unique': return <Sparkles className="h-5 w-5 text-purple-500" />;
      default: return <Minus className="h-5 w-5 text-gray-400" />;
    }
  };

  const categories = Array.from(new Set(competitorData.map(d => d.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Competitive Analysis</h1>
        <p className="text-muted-foreground mt-1">
          How RegulaSync compares to established GRC platforms in the market
        </p>
      </div>

      {/* Unique Advantages */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            RegulaSync Unique Advantages
          </CardTitle>
          <CardDescription>
            Features that no competitor currently offers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uniqueAdvantages.map((advantage) => {
              const Icon = advantage.icon;
              return (
                <div key={advantage.title} className="p-4 bg-background rounded-lg border">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${advantage.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{advantage.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{advantage.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison Matrix</CardTitle>
          <CardDescription>
            Detailed comparison across key governance and compliance capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Feature</th>
                  {competitors.map((comp) => (
                    <th key={comp.name} className={`text-center p-3 ${comp.highlight ? 'bg-primary/10' : ''}`}>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl">{comp.logo}</span>
                        <span className={`font-semibold ${comp.highlight ? 'text-primary' : ''}`}>
                          {comp.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{comp.description}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <>
                    <tr key={category} className="bg-muted/50">
                      <td colSpan={7} className="p-2 font-semibold text-sm">{category}</td>
                    </tr>
                    {competitorData
                      .filter(d => d.category === category)
                      .map((row) => (
                        <tr key={row.feature} className="border-b hover:bg-muted/30">
                          <td className="p-3 text-sm">{row.feature}</td>
                          <td className="p-3 text-center bg-primary/5">{getStatusIcon(row.regulasync)}</td>
                          <td className="p-3 text-center">{getStatusIcon(row.diligent)}</td>
                          <td className="p-3 text-center">{getStatusIcon(row.workiva)}</td>
                          <td className="p-3 text-center">{getStatusIcon(row.clausematch)}</td>
                          <td className="p-3 text-center">{getStatusIcon(row.logicgate)}</td>
                          <td className="p-3 text-center">{getStatusIcon(row.onetrust)}</td>
                        </tr>
                      ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>Unique to RegulaSync</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Full Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-amber-500" />
              <span>Partial Support</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span>Not Available</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Positioning */}
      <Card>
        <CardHeader>
          <CardTitle>Market Positioning</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-lg">
              <div className="text-4xl font-bold text-primary">£33.9B</div>
              <div className="text-sm text-muted-foreground mt-1">UK Compliance Market Size</div>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="text-4xl font-bold text-primary">85%</div>
              <div className="text-sm text-muted-foreground mt-1">Time Reduction vs Manual</div>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="text-4xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground mt-1">Audit Accuracy with SVAC</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
