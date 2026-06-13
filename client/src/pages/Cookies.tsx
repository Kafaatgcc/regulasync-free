import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Cookie, Settings, BarChart3, Shield, Info } from "lucide-react";

export default function Cookies() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-slate-50 to-background dark:from-slate-900 dark:to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Cookie Policy</h1>
              <p className="text-muted-foreground">Last updated: January 2026</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground">
            This Cookie Policy explains how RegulaSync uses cookies and similar technologies 
            on our website and platform. This policy should be read alongside our Privacy Policy.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-4xl space-y-12">
          
          {/* What Are Cookies */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">1. What Are Cookies?</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>
                Cookies are small text files that are stored on your device when you visit a website. 
                They help websites remember your preferences, understand how you use the site, and 
                improve your experience.
              </p>
              <p>
                We also use similar technologies such as local storage, session storage, and pixels 
                to collect and store information.
              </p>
            </div>
          </div>

          {/* Types of Cookies */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Cookie className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">2. Types of Cookies We Use</h2>
            </div>
            <div className="pl-8 space-y-6 text-muted-foreground">
              
              {/* Essential Cookies */}
              <div className="bg-green-50 dark:bg-green-950/30 p-5 rounded-lg border border-green-200 dark:border-green-900">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-green-800 dark:text-green-200">Essential Cookies (Required)</h3>
                </div>
                <p className="text-green-700 dark:text-green-300 mb-3">
                  These cookies are necessary for the website to function and cannot be switched off.
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-green-200 dark:border-green-800">
                      <th className="text-left py-2 text-green-800 dark:text-green-200">Cookie</th>
                      <th className="text-left py-2 text-green-800 dark:text-green-200">Purpose</th>
                      <th className="text-left py-2 text-green-800 dark:text-green-200">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-green-700 dark:text-green-300">
                    <tr className="border-b border-green-100 dark:border-green-900">
                      <td className="py-2">session_id</td>
                      <td className="py-2">User authentication</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr className="border-b border-green-100 dark:border-green-900">
                      <td className="py-2">csrf_token</td>
                      <td className="py-2">Security protection</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr>
                      <td className="py-2">cookie_consent</td>
                      <td className="py-2">Remember your cookie preferences</td>
                      <td className="py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Functional Cookies */}
              <div className="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg border border-blue-200 dark:border-blue-900">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">Functional Cookies (Optional)</h3>
                </div>
                <p className="text-blue-700 dark:text-blue-300 mb-3">
                  These cookies enable enhanced functionality and personalization.
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-200 dark:border-blue-800">
                      <th className="text-left py-2 text-blue-800 dark:text-blue-200">Cookie</th>
                      <th className="text-left py-2 text-blue-800 dark:text-blue-200">Purpose</th>
                      <th className="text-left py-2 text-blue-800 dark:text-blue-200">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-blue-700 dark:text-blue-300">
                    <tr className="border-b border-blue-100 dark:border-blue-900">
                      <td className="py-2">theme</td>
                      <td className="py-2">Remember dark/light mode preference</td>
                      <td className="py-2">1 year</td>
                    </tr>
                    <tr className="border-b border-blue-100 dark:border-blue-900">
                      <td className="py-2">language</td>
                      <td className="py-2">Remember language preference</td>
                      <td className="py-2">1 year</td>
                    </tr>
                    <tr>
                      <td className="py-2">sidebar_state</td>
                      <td className="py-2">Remember sidebar collapsed/expanded</td>
                      <td className="py-2">30 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-lg border border-purple-200 dark:border-purple-900">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200">Analytics Cookies (Optional)</h3>
                </div>
                <p className="text-purple-700 dark:text-purple-300 mb-3">
                  These cookies help us understand how visitors interact with our website.
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-purple-200 dark:border-purple-800">
                      <th className="text-left py-2 text-purple-800 dark:text-purple-200">Cookie</th>
                      <th className="text-left py-2 text-purple-800 dark:text-purple-200">Purpose</th>
                      <th className="text-left py-2 text-purple-800 dark:text-purple-200">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-purple-700 dark:text-purple-300">
                    <tr className="border-b border-purple-100 dark:border-purple-900">
                      <td className="py-2">_ga</td>
                      <td className="py-2">Google Analytics - distinguish users</td>
                      <td className="py-2">2 years</td>
                    </tr>
                    <tr className="border-b border-purple-100 dark:border-purple-900">
                      <td className="py-2">_gid</td>
                      <td className="py-2">Google Analytics - distinguish users</td>
                      <td className="py-2">24 hours</td>
                    </tr>
                    <tr>
                      <td className="py-2">_gat</td>
                      <td className="py-2">Google Analytics - throttle requests</td>
                      <td className="py-2">1 minute</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>

          {/* Managing Cookies */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">3. Managing Your Cookie Preferences</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>
                You can control and manage cookies in several ways:
              </p>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">Browser Settings</h3>
                  <p className="text-sm">
                    Most browsers allow you to refuse or accept cookies, delete existing cookies, 
                    and set preferences for certain websites. Check your browser's help section for instructions.
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">Cookie Consent Banner</h3>
                  <p className="text-sm">
                    When you first visit our website, you'll see a cookie consent banner where you can 
                    accept or reject non-essential cookies. You can change your preferences at any time 
                    by clicking the "Cookie Settings" link in our footer.
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium text-foreground mb-2">Opt-Out Links</h3>
                  <p className="text-sm">
                    For analytics cookies, you can opt out using these tools:
                  </p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out Browser Add-on</a></li>
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-sm">
                <strong>Note:</strong> Blocking essential cookies may affect the functionality of our 
                website and prevent you from using certain features.
              </p>
            </div>
          </div>

          {/* Third-Party Cookies */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">4. Third-Party Cookies</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>
                Some cookies on our website are set by third-party services. These include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                <li><strong>Stripe:</strong> For secure payment processing (on payment pages only)</li>
                <li><strong>Intercom:</strong> For customer support chat functionality</li>
              </ul>
              <p className="mt-3">
                These third parties have their own privacy policies governing their use of cookies. 
                We encourage you to review their policies for more information.
              </p>
            </div>
          </div>

          {/* Updates */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">5. Updates to This Policy</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices 
                or for legal, operational, or regulatory reasons. We will notify you of any material 
                changes by updating the "Last updated" date at the top of this policy.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">6. Contact Us</h2>
            </div>
            <div className="pl-8 space-y-3 text-muted-foreground">
              <p>
                If you have any questions about our use of cookies, please contact us:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p><strong>Email:</strong> hello@regulasync.co.uk</p>
              </div>
              <p className="mt-3">
                For more information about how we handle your personal data, please see our{" "}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </div>

          {/* ICO Information */}
          <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl">
            <h3 className="font-semibold text-foreground mb-3">Information Commissioner's Office (ICO)</h3>
            <p className="text-muted-foreground text-sm">
              For more information about cookies and your rights, visit the ICO website at{" "}
              <a href="https://ico.org.uk/for-the-public/online/cookies/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                ico.org.uk/for-the-public/online/cookies
              </a>
            </p>
          </div>

        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
