import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { FileText, Scale, AlertTriangle, CreditCard, Shield, Gavel } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-slate-50 to-background dark:from-slate-900 dark:to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: January 2026</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground">
            These Terms of Service ("Terms") govern your access to and use of RegulaSync's 
            governance automation platform and related services. By using our services, you agree 
            to be bound by these Terms.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-4xl space-y-12">
          
          {/* Definitions */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">1. Definitions</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <ul className="space-y-2">
                <li><strong>"Service"</strong> means the RegulaSync governance automation platform, including all features, tools, and APIs.</li>
                <li><strong>"User"</strong> means any individual who accesses or uses the Service on behalf of a Customer.</li>
                <li><strong>"Customer"</strong> means the organization that has entered into a subscription agreement with RegulaSync.</li>
                <li><strong>"Customer Data"</strong> means all data, content, and information uploaded or entered into the Service by Users.</li>
                <li><strong>"Subscription"</strong> means the paid plan that grants access to the Service.</li>
              </ul>
            </div>
          </div>

          {/* Service Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Scale className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">2. Service Description</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>RegulaSync provides a cloud-based governance automation platform that includes:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Policy management and workflow automation</li>
                <li>Delegation of authority matrix management</li>
                <li>Compliance monitoring and reporting</li>
                <li>AI-powered recommendations and insights</li>
                <li>Audit trail and regulatory reporting tools</li>
                <li>Integration with third-party systems</li>
              </ul>
              <p className="mt-3">
                The Service is designed to assist with governance processes but does not constitute 
                legal, regulatory, or compliance advice. Customers remain responsible for their own 
                compliance obligations.
              </p>
            </div>
          </div>

          {/* Account Registration */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">3. Account Registration and Security</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>To use the Service, you must:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Promptly notify us of any unauthorized access</li>
                <li>Be at least 18 years old or have legal authority to bind your organization</li>
              </ul>
              <p className="mt-3">
                You are responsible for all activities that occur under your account. We reserve 
                the right to suspend or terminate accounts that violate these Terms.
              </p>
            </div>
          </div>

          {/* Subscription and Payment */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">4. Subscription and Payment</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h3 className="font-medium text-foreground">Pricing Tiers</h3>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Core:</strong> £90 per month (up to 5 users) or £900 per year</li>
                  <li>• <strong>Professional:</strong> £175 per month (up to 25 users) or £1,750 per year</li>
                  <li>• <strong>Enterprise:</strong> £350 per month (unlimited users) or £3,500 per year</li>
                </ul>
              </div>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Billing:</strong> Subscriptions are billed in advance on a monthly or annual basis.</li>
                <li><strong>Payment:</strong> Payment is due upon invoice. We accept major credit cards and bank transfers.</li>
                <li><strong>Taxes:</strong> Applicable taxes will be added where required by law.</li>
                <li><strong>Refunds:</strong> Annual subscriptions may be cancelled within 14 days for a full refund. Monthly subscriptions are non-refundable.</li>
                <li><strong>Price Changes:</strong> We may change prices with 30 days' notice. Changes apply at the next renewal.</li>
              </ul>
            </div>
          </div>

          {/* Acceptable Use */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">5. Acceptable Use</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use the Service for any unlawful purpose or in violation of any regulations</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Reverse engineer, decompile, or disassemble the Service</li>
                <li>Use the Service to store or transmit malicious code</li>
                <li>Resell or sublicense access to the Service without authorization</li>
                <li>Use automated means to access the Service except through our APIs</li>
                <li>Upload content that infringes intellectual property rights</li>
              </ul>
            </div>
          </div>

          {/* Customer Data */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">6. Customer Data</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>
                <strong>Ownership:</strong> You retain all rights to your Customer Data. We do not 
                claim ownership of any content you upload to the Service.
              </p>
              <p>
                <strong>License:</strong> You grant us a limited license to use, process, and store 
                your Customer Data solely to provide the Service and as described in our Privacy Policy.
              </p>
              <p>
                <strong>Security:</strong> We implement appropriate technical and organizational measures 
                to protect your Customer Data. See our Security page for details.
              </p>
              <p>
                <strong>Data Export:</strong> You may export your Customer Data at any time through 
                the Service's export functionality.
              </p>
              <p>
                <strong>Data Deletion:</strong> Upon termination, we will delete your Customer Data 
                within 90 days, unless retention is required by law.
              </p>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">7. Intellectual Property</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>
                The Service, including all software, algorithms, designs, and documentation, is owned 
                by RegulaSync and protected by intellectual property laws. Your subscription grants 
                you a limited, non-exclusive, non-transferable license to use the Service.
              </p>
              <p>
                You may not copy, modify, distribute, or create derivative works based on the Service 
                without our prior written consent.
              </p>
            </div>
          </div>

          {/* Warranties and Disclaimers */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">8. Warranties and Disclaimers</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
                <p className="text-amber-800 dark:text-amber-200">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, 
                  FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                </p>
              </div>
              <p className="mt-3">
                We do not warrant that the Service will be uninterrupted, error-free, or completely secure. 
                We are not responsible for any regulatory decisions made based on information provided by the Service.
              </p>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Scale className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">9. Limitation of Liability</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>
                To the maximum extent permitted by applicable law, RegulaSync's total liability for any claims 
                arising from these Terms or your use of the Service shall not exceed the fees paid 
                by you in the twelve (12) months preceding the claim.
              </p>
              <p>
                We shall not be liable for any indirect, incidental, special, consequential, or 
                punitive damages, including loss of profits, data, or business opportunities.
              </p>
            </div>
          </div>

          {/* Indemnification */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">10. Indemnification</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>
                You agree to indemnify and hold harmless RegulaSync and its team members 
                and agents from any claims, damages, losses, or expenses arising from:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Your Customer Data</li>
              </ul>
            </div>
          </div>

          {/* Termination */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Gavel className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">11. Termination</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>
                <strong>By You:</strong> You may terminate your subscription at any time through 
                your account settings. Termination takes effect at the end of your current billing period.
              </p>
              <p>
                <strong>By Us:</strong> We may suspend or terminate your access if you violate these 
                Terms, fail to pay fees, or if we discontinue the Service with 90 days' notice.
              </p>
              <p>
                <strong>Effect of Termination:</strong> Upon termination, your access to the Service 
                will cease, and we will delete your Customer Data in accordance with our data retention policy.
              </p>
            </div>
          </div>

          {/* Governing Law */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Gavel className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">12. Governing Law and Disputes</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>
                These Terms are governed by the laws of England and Wales. Any disputes shall be 
                resolved exclusively in the courts of England and Wales.
              </p>
              <p>
                Before initiating legal proceedings, you agree to attempt to resolve disputes through 
                good faith negotiation for at least 30 days.
              </p>
            </div>
          </div>

          {/* Changes to Terms */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">13. Changes to Terms</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>
                We may update these Terms from time to time. We will notify you of material changes 
                by email or through the Service at least 30 days before they take effect.
              </p>
              <p>
                Your continued use of the Service after changes take effect constitutes acceptance 
                of the updated Terms.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">14. Contact Us</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>If you have any questions about these Terms, please contact us:</p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p><strong>Email:</strong> hello@regulasync.co.uk</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
