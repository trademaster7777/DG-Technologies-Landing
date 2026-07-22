import { Link } from 'wouter';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <Header />
      <main className="container px-4 md:px-6 mx-auto py-24 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: July 22, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Who We Are</h2>
            <p>
              D2G Technology ("we", "us", or "our") operates the DG Technologies website and booking
              service. This Privacy Policy explains how we collect, use, and protect information you
              provide when you visit our site or schedule a discovery call.
            </p>
            <p className="mt-2">
              If you have questions, contact us at{' '}
              <a href="mailto:hello@d2gtechnology.com" className="text-foreground underline underline-offset-4">
                hello@d2gtechnology.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <p>We collect information you give us directly when you:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Fill in and submit the discovery call booking form (name, email, phone, business name, and details about your needs).</li>
              <li>Send us an email or otherwise contact us.</li>
            </ul>
            <p className="mt-3">
              We also collect limited technical data automatically — your IP address, browser type,
              referring URL, and pages visited — through standard web server logs and cookies. We use
              this data only to keep the site running and to understand general traffic patterns.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Schedule and confirm your discovery call.</li>
              <li>Send you the confirmation email and any follow-up communication related to your call.</li>
              <li>Respond to your enquiries.</li>
              <li>Improve and maintain this website.</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> sell, rent, or trade your personal information to any third party.
              We do not use your information for automated profiling or decision-making.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Email Communications</h2>
            <p>
              By submitting the booking form you consent to receive a booking confirmation email and,
              where relevant, follow-up messages related to your call. You can opt out of any
              non-transactional communications at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Cookies</h2>
            <p>
              This site uses only essential cookies required for the site to function (for example,
              to protect form submissions from spam). We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Data Retention</h2>
            <p>
              We retain booking enquiry data for up to 24 months, or for as long as is necessary to
              fulfil the purpose for which it was collected, after which it is securely deleted.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Your Rights</h2>
            <p>
              Depending on where you are located you may have rights to access, correct, delete, or
              restrict the processing of your personal data. To exercise any of these rights, email us
              at{' '}
              <a href="mailto:hello@d2gtechnology.com" className="text-foreground underline underline-offset-4">
                hello@d2gtechnology.com
              </a>{' '}
              and we will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Security</h2>
            <p>
              We take reasonable technical and organisational measures to protect your information
              against unauthorised access, loss, or misuse. All data is transmitted over HTTPS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise the
              "Last updated" date at the top of this page. Continued use of the site after any changes
              constitutes your acceptance of the updated policy.
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
