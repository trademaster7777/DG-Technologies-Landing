import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import {
  useCreateLead,
  useGetAvailability,
  useGetBookedSlots,
  getGetBookedSlotsQueryKey,
} from '@workspace/api-client-react';

// Cloudflare Turnstile site key. The fallback is Cloudflare's official
// always-pass test key so dev/preview work without account setup; set
// VITE_TURNSTILE_SITE_KEY (plus TURNSTILE_SECRET_KEY on the API server)
// to real keys for production.
const TURNSTILE_SITE_KEY =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ??
  '1x00000000000000000000AA';

const PACKAGE_OPTIONS = [
  { value: 'launchpad', label: 'The Launchpad — $999' },
  { value: 'presence', label: 'The Presence — $1,499' },
  { value: 'not-sure', label: 'Not sure yet' },
] as const;

function slotLabel(slot: string): string {
  const [hh, mm] = slot.split(':');
  const h = Number(hh);
  const suffix = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${suffix}`;
}

function dayOfWeekOf(dateStr: string): number {
  const [y, mo, da] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y!, mo! - 1, da!)).getUTCDay();
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Current date (YYYY-MM-DD) and hour in the business timezone. Slot times are
 * wall-clock times in that zone, so "today" and "already started" must be
 * judged there — not in the visitor's local time.
 */
function nowInTimezone(timeZone: string | undefined): { date: string; hour: number } {
  const now = new Date();
  if (!timeZone) {
    return { date: toDateString(now), hour: now.getHours() };
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    hour: Number(get('hour')),
  };
}

const inputClasses =
  'w-full rounded-xl bg-foreground/5 border border-foreground/15 px-4 py-3.5 text-foreground placeholder:text-foreground/45 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 transition-colors';

export function FinalCTA() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [packageInterest, setPackageInterest] = useState<string | null>(null);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredSlot, setPreferredSlot] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — humans never see or fill this
  const [submitted, setSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const createLead = useCreateLead({
    mutation: {
      onSuccess: () => setSubmitted(true),
      onError: (error) => {
        if (error?.status === 409) {
          // Someone grabbed the slot first — clear it and refresh availability.
          setPreferredSlot(null);
          void bookedSlotsQuery.refetch();
        }
        // Turnstile tokens are single-use; get a fresh one for the retry.
        setTurnstileToken(null);
        turnstileRef.current?.reset();
      },
    },
  });

  const availability = useGetAvailability();
  const businessTimezone = availability.data?.timezone;
  const timezoneLabel = availability.data?.timezoneLabel ?? '';

  const { date: todayStr, hour: currentHour } = nowInTimezone(businessTimezone);

  // Fetch already-booked slots for the chosen date so visitors can't pick them.
  const bookedSlotsQuery = useGetBookedSlots(
    { date: preferredDate },
    {
      query: {
        queryKey: getGetBookedSlotsQueryKey({ date: preferredDate }),
        enabled: !!preferredDate,
      },
    },
  );
  const bookedSlots = bookedSlotsQuery.data?.bookedSlots ?? [];

  // Only offer slots the owner actually takes calls in (per day of week),
  // minus slots another visitor already booked; on today's date, also hide
  // slots that have already started.
  const daySlots = preferredDate
    ? (availability.data?.days.find((d) => d.dayOfWeek === dayOfWeekOf(preferredDate))?.slots ?? [])
    : [];
  const availableSlots = daySlots.filter((slot) => {
    if (bookedSlots.includes(slot)) return false;
    if (preferredDate !== todayStr) return true;
    const [hh] = slot.split(':').map(Number);
    return hh! > currentHour;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createLead.isPending || !turnstileToken) return;
    createLead.mutate({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        ...(businessName.trim() ? { businessName: businessName.trim() } : {}),
        ...(packageInterest
          ? { packageInterest: packageInterest as 'launchpad' | 'presence' | 'not-sure' }
          : {}),
        ...(preferredDate ? { preferredDate } : {}),
        ...(preferredDate && preferredSlot ? { preferredSlot } : {}),
        ...(message.trim() ? { message: message.trim() } : {}),
        ...(website.trim() ? { website: website.trim() } : {}),
        turnstileToken,
      },
    });
  };

  return (
    <section id="book" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10" />
      <div className="container px-4 md:px-6 mx-auto relative z-10 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Your website is <br className="hidden md:block" />
            <span className="text-gradient">one phone call away.</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Book your free 30-minute discovery and strategy call. No pressure, no obligation — just a real conversation about your business and what a great website can do for it.
          </p>

          <div className="glass-card rounded-2xl p-8 md:p-12 text-left max-w-2xl mx-auto relative overflow-hidden">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
                  className="text-center py-10"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.5)]">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    You're on the list{name.trim() ? `, ${name.trim().split(' ')[0]}` : ''}.
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
                    We'll reach out within one business day to schedule your free 30-minute strategy call. Keep your phone handy.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {/* Honeypot field — visually hidden, ignored by real visitors */}
                  <div className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden" aria-hidden="true">
                    <label htmlFor="lead-website">Website</label>
                    <input
                      id="lead-website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="lead-name" className="block text-sm font-medium text-foreground/85 mb-2">
                        Your name <span className="text-accent">*</span>
                      </label>
                      <input
                        id="lead-name"
                        type="text"
                        required
                        maxLength={200}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Smith"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label htmlFor="lead-business" className="block text-sm font-medium text-foreground/85 mb-2">
                        Business name
                      </label>
                      <input
                        id="lead-business"
                        type="text"
                        maxLength={200}
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Smith & Co."
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label htmlFor="lead-phone" className="block text-sm font-medium text-foreground/85 mb-2">
                        Phone number <span className="text-accent">*</span>
                      </label>
                      <input
                        id="lead-phone"
                        type="tel"
                        required
                        minLength={7}
                        maxLength={40}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label htmlFor="lead-email" className="block text-sm font-medium text-foreground/85 mb-2">
                        Email <span className="text-accent">*</span>
                      </label>
                      <input
                        id="lead-email"
                        type="email"
                        required
                        maxLength={320}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@smithco.com"
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-sm font-medium text-foreground/85 mb-2">
                      Which package are you leaning toward?
                    </span>
                    <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Package interest">
                      {PACKAGE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={packageInterest === opt.value}
                          onClick={() =>
                            setPackageInterest(packageInterest === opt.value ? null : opt.value)
                          }
                          className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 ${
                            packageInterest === opt.value
                              ? 'bg-gradient-to-r from-primary/30 to-accent/30 border-primary/60 text-foreground shadow-[0_0_20px_hsl(var(--primary)/0.25)]'
                              : 'bg-foreground/5 border-foreground/15 text-foreground/75 hover:border-foreground/30 hover:text-foreground'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lead-date" className="block text-sm font-medium text-foreground/85 mb-2">
                      Pick a day for your call
                    </label>
                    <input
                      id="lead-date"
                      type="date"
                      min={todayStr}
                      value={preferredDate}
                      onChange={(e) => {
                        setPreferredDate(e.target.value);
                        setPreferredSlot(null);
                      }}
                      className={`${inputClasses} [color-scheme:dark]`}
                    />
                    {preferredDate && (
                      <div className="mt-3">
                        <span className="block text-sm font-medium text-foreground/85 mb-2">
                          Available time slots
                          {timezoneLabel ? (
                            <span className="text-foreground/55 font-normal"> (times in {timezoneLabel})</span>
                          ) : null}
                        </span>
                        {availableSlots.length > 0 ? (
                          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Time slot">
                            {availableSlots.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                role="radio"
                                aria-checked={preferredSlot === slot}
                                onClick={() =>
                                  setPreferredSlot(preferredSlot === slot ? null : slot)
                                }
                                className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 ${
                                  preferredSlot === slot
                                    ? 'bg-gradient-to-r from-primary/30 to-accent/30 border-primary/60 text-foreground shadow-[0_0_20px_hsl(var(--primary)/0.25)]'
                                    : 'bg-foreground/5 border-foreground/15 text-foreground/75 hover:border-foreground/30 hover:text-foreground'
                                }`}
                              >
                                {slotLabel(slot)}
                                {timezoneLabel ? ` ${timezoneLabel}` : ''}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {daySlots.length === 0 && !availability.isLoading
                              ? "We don't take calls on that day — pick another day, or submit without a slot and we'll call you back."
                              : availability.isLoading
                                ? 'Loading available times…'
                                : "No slots left today — pick another day, or submit without a slot and we'll call you back."}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lead-message" className="block text-sm font-medium text-foreground/85 mb-2">
                      Anything we should know before we call?
                    </label>
                    <textarea
                      id="lead-message"
                      rows={3}
                      maxLength={2000}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us a bit about your business, or what you want your website to do…"
                      className={`${inputClasses} resize-none`}
                    />
                  </div>

                  {/* Invisible bot challenge — only shows a widget if Cloudflare
                      needs an interactive check for this visitor. */}
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    options={{ size: 'invisible', theme: 'dark' }}
                    onSuccess={(token) => setTurnstileToken(token)}
                    onExpire={() => {
                      setTurnstileToken(null);
                      turnstileRef.current?.reset();
                    }}
                    onError={() => setTurnstileToken(null)}
                  />

                  {createLead.isError && (
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3" role="alert">
                      {createLead.error?.status === 409
                        ? 'That time slot was just booked by someone else — please pick another one.'
                        : createLead.error?.status === 429
                          ? 'Too many attempts from your network — please wait a few minutes and try again.'
                          : createLead.error?.status === 403
                            ? "We couldn't confirm you're human — please reload the page and try again."
                            : 'Something went wrong sending your info. Please try again — or double-check your email and phone number.'}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={createLead.isPending || !turnstileToken}
                    className="w-full relative inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-white text-lg bg-gradient-to-r from-primary to-accent shadow-[0_0_30px_hsl(var(--primary)/0.35)] hover:shadow-[0_0_40px_hsl(var(--accent)/0.5)] transition-shadow duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {createLead.isPending ? 'Sending…' : 'Book My Free Strategy Call'}
                  </button>

                  <p className="text-sm text-muted-foreground font-medium flex items-center justify-center gap-2 pt-1">
                    <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Free 30-minute call · No commitment required
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
