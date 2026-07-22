import { Link } from 'wouter';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function TermsOfService() {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <Header />
      <main className="container px-4 md:px-6 mx-auto py-24 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: July 22, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the DG Technologies website ("Site") and booking a discovery call,
              you agree to be bound by these Terms of Service. If you do not agree, please do not use
              this Site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Services Described</h2>
            <p>
              The Site provides information about D2G Technology's managed IT and technology services
              for small businesses, and allows prospective clients to schedule a no-obligation
              discovery call. Booking a call does not create a client relationship or any contractual
              obligation on either party.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Use of the Site</h2>
            <p>You agree to use the Site only for lawful purposes and in a way that does not:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Infringe the rights of any third party.</li>
              <li>Transmit unsolicited commercial communications (spam).</li>
              <li>Attempt to gain unauthorised access to any part of the Site or its underlying systems.</li>
              <li>Introduce viruses, malware, or other harmful code.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Intellectual Property</h2>
            <p>
              All content on this Site — including text, graphics, logos, and code — is the property
              of D2G Technology or its licensors and is protected by applicable copyright and
              intellectual property laws. You may not reproduce, distribute, or create derivative works
              without our prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Accuracy of Information</h2>
            <p>
              We strive to keep the information on this Site accurate and up to date, but we make no
              warranties — express or implied — about its completeness, accuracy, or fitness for a
              particular purpose. Pricing and service details described on the Site are indicative and
              subject to change.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, D2G Technology shall not be liable for any
              indirect, incidental, special, or consequential damages arising out of your use of — or
              inability to use — this Site or the information it contains. Our total liability to you
              for any direct damages shall not exceed £100.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Third-Party Links</h2>
            <p>
              The Site may contain links to third-party websites. We are not responsible for the
              content, privacy practices, or availability of those sites and do not endorse them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Privacy</h2>
            <p>
              Your use of the Site is also governed by our{' '}
              <Link href="/privacy" className="text-foreground underline underline-offset-4">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Changes to These Terms</h2>
            <p>
              We reserve the right to update these Terms at any time. Changes take effect as soon as
              they are posted on this page, with the "Last updated" date revised accordingly.
              Continued use of the Site after changes are posted constitutes acceptance of the
              revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of England and
              Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of
              England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Contact</h2>
            <p>
              For any questions about these Terms, contact us at{' '}
              <a href="mailto:hello@d2gtechnology.com" className="text-foreground underline underline-offset-4">
                hello@d2gtechnology.com
              </a>.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-foreground/5">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
