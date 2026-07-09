const DialMark = ({ variant = 'dark' }) => {
  const track = variant === 'light' ? 'var(--color-primary-light)' : 'rgba(255,255,255,0.15)';
  return (
    <svg width="30" height="30" viewBox="0 0 68 68" fill="none" aria-hidden="true">
      <circle cx="34" cy="34" r="26" stroke={track} strokeWidth="6" />
      <circle
        cx="34"
        cy="34"
        r="26"
        stroke="var(--color-primary)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="163.36"
        strokeDashoffset="163.36"
        transform="rotate(-90 34 34)"
        className="dial-arc"
      />
    </svg>
  );
};

const FeatureRow = ({ title, text }) => (
  <li className="flex gap-3">
    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
    <div>
      <p className="text-white text-sm font-medium mb-0.5">{title}</p>
      <p className="text-white/55 text-[13px] leading-relaxed">{text}</p>
    </div>
  </li>
);

/**
 * Desktop-only (lg+) brand panel, 55% of the width. Full pitch: headline,
 * subhead, the three core features, and a glimpse of the dashboard math.
 */
const BrandPanel = () => (
  <div className="hidden lg:flex flex-col justify-between bg-ink text-white px-14 py-12">
    <div className="flex items-center gap-2.5">
      <DialMark />
      <span className="font-display font-semibold text-lg tracking-tight">MeterClick</span>
    </div>

    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-primary mb-4">
        // why meterclick
      </p>
      <h2 className="font-display font-semibold text-[34px] leading-[1.15] mb-4 max-w-[28.75rem]">
        Know your number before the bill does.
      </h2>
      <p className="text-white/60 text-[15px] leading-relaxed mb-10 max-w-[26.25rem]">
        Track every meter, watch your daily pace, and catch an overage while
        there is still time to do something about it.
      </p>

      <ul className="flex flex-col gap-5 mb-10">
        <FeatureRow
          title="Log a reading in seconds"
          text="Type it in, or snap a photo and let MeterClick read the number for you."
        />
        <FeatureRow
          title="See your pace, not just your total"
          text="Days left in the billing cycle, and whether you're on track."
        />
        <FeatureRow
          title="One place for every meter"
          text="Electricity, gas, water — each with its own target."
        />
      </ul>
    </div>

    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-4 max-w-[26.25rem]">
      <svg width="48" height="48" viewBox="0 0 68 68" fill="none" aria-hidden="true">
        <circle cx="34" cy="34" r="26" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        <circle
          cx="34"
          cy="34"
          r="26"
          stroke="var(--color-primary)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="163.36"
          strokeDashoffset="122.5"
          transform="rotate(-90 34 34)"
        />
      </svg>
      <div>
        <p className="font-mono text-lg font-bold text-white">50 units</p>
        <p className="text-xs text-white/50">150 left of 200 &middot; on track</p>
      </div>
    </div>
  </div>
);

/**
 * Mobile-only stand-in for the illustration in the reference design: real
 * copy about the product instead of decorative art, kept to three short
 * lines so it costs almost no vertical space before the form appears.
 */
const MobilePitch = () => (
  <div className="lg:hidden mb-6">
    <div className="flex items-center gap-2 mb-5">
      <DialMark variant="light" />
      <span className="font-display font-semibold text-sm text-ink tracking-tight">
        MeterClick
      </span>
    </div>
    <p className="font-display font-semibold text-[19px] text-ink leading-snug mb-1">
      Know your number before the bill does.
    </p>
    <p className="text-ink-soft text-[13px] leading-relaxed">
      Log readings, track your pace, and catch overages before the invoice
      arrives.
    </p>
  </div>
);

/**
 * Shared chrome for Login and Signup.
 * Desktop (lg+): 55/45 split, brand panel left, bordered card right.
 * Mobile: no card chrome at all — brand pitch, heading, and form flow
 * directly on the page, sized to fit one screen without scrolling.
 */
const AuthLayout = ({ eyebrow, title, subtitle, children, footer }) => {
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[55%_45%]">
      <BrandPanel />

      <div className="flex-1 flex flex-col lg:items-center lg:justify-center bg-paper lg:bg-surface px-6 py-6 lg:px-10 lg:py-12">
        <MobilePitch />

        <div className="w-full lg:max-w-sm lg:bg-paper lg:border lg:border-line lg:rounded-[20px] lg:px-7 lg:py-8 lg:shadow-[0_10px_15px_-3px_rgba(28,27,26,0.06),0_4px_6px_-2px_rgba(28,27,26,0.03)]">
          <p className="hidden lg:block font-mono text-xs uppercase tracking-wider text-ink-soft text-center mb-1.5">
            {eyebrow}
          </p>
          <h1 className="font-display font-semibold text-[26px] text-ink text-left lg:text-center mb-1 lg:mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-ink-soft text-left lg:text-center mb-6 leading-relaxed">
              {subtitle}
            </p>
          )}

          {children}

          {footer && (
            <div className="mt-5 text-sm text-ink-soft text-left lg:text-center">{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;