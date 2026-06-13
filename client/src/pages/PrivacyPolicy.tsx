import { Link } from "wouter";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Shield, Lock, Eye, Database, UserCheck, Globe, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-slate-50 to-background dark:from-slate-900 dark:to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: January 2026</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground">
            RegulaSync ("we", "our", or "us") is committed to protecting your privacy and ensuring 
            the security of your personal data. This policy explains how we collect, use, and protect 
            your information in accordance with applicable data protection principles.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-4xl space-y-12">
          
          {/* Data Controller */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">1. Data Controller</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>
                RegulaSync is the data controller responsible for your personal data collected through this platform. 
                We are committed to handling your data responsibly and transparently.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium text-foreground">Contact Details:</p>
                <p>RegulaSync</p>
                <p>Email: hello@regulasync.co.uk</p>
              </div>
            </div>
          </div>

          {/* Information We Collect */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
            </div>
            <div className="pl-8 space-y-4 text-muted-foreground">
              <p>We collect and process the following categories of personal data:</p>
              
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Account Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Name and contact details (email, phone number)</li>
                  <li>Company name and job title</li>
                  <li>Account credentials and authentication data</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Usage Data</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Platform activity and feature usage</li>
                  <li>Policy documents and governance data you upload</li>
                  <li>Audit trail and compliance records</li>
                  <li>Communication preferences</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Technical Data</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP address and device information</li>
                  <li>Browser type and operating system</li>
                  <li>Access times and referring URLs</li>
                  <li>Cookies and similar technologies (see our Cookie Policy)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Your Data */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">3. How We Use Your Data</h2>
            </div>
            <div className="pl-8 space-y-4 text-muted-foreground">
              <p>We process your personal data for the following purposes:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">Service Delivery</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Providing governance automation services</li>
                    <li>• Processing compliance workflows</li>
                    <li>• Generating reports and analytics</li>
                    <li>• Customer support and communication</li>
                  </ul>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">Platform Improvement</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Analyzing usage patterns</li>
                    <li>• Developing new features</li>
                    <li>• Performance optimization</li>
                    <li>• Security monitoring</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">4. Data Security</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>
                We implement appropriate technical and organisational measures to protect your personal data, including:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular security reviews</li>
                <li>Incident response procedures</li>
              </ul>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">5. Data Sharing</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>We may share your personal data with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> Cloud hosting, payment processing, and analytics providers who process data on our behalf under strict data processing agreements</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights</li>
              </ul>
            </div>
          </div>

          {/* Data Retention */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">6. Data Retention</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>
                We retain your personal data only for as long as necessary to fulfill the purposes 
                for which it was collected, including any applicable legal or reporting requirements.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">7. Contact Us</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us:
              </p>
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
