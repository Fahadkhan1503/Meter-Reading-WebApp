const DialMark = ({ variant = 'light' }) => {
  const track = variant === 'dark' ? 'rgba(255,255,255,0.15)' : 'var(--color-primary-light)';
  return (
    <svg width="36" height="36" viewBox="0 0 68 68" fill="none" aria-hidden="true">
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
 * Desktop-only brand panel: explains what MeterClick does so the auth
 * screen doesn't read as an empty form. Hidden below the lg breakpoint,
 * where the form panel's own compact header carries the branding instead.
 */
const BrandPanel = () => (
  <div className="hidden lg:flex flex-col justify-between bg-ink text-white px-14 py-12">
    <div className="flex items-center gap-2.5">
      <DialMark variant="dark" />
      <span className="font-display font-semibold text-lg tracking-tight">MeterClick</span>
    </div>

    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-primary mb-4">
        // why meterclick
      </p>
      <h2 className="font-display font-semibold text-[34px] leading-[1.15] mb-4 max-w-[380px]">
        Know your number before the bill does.
      </h2>
      <p className="text-white/60 text-[15px] leading-relaxed mb-10 max-w-[380px]">
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

    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-4 max-w-[380px]">
      <svg width="52" height="52" viewBox="0 0 68 68" fill="none" aria-hidden="true">
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
 * Shared chrome for Login and Signup: brand panel on the left (desktop),
 * form card on the right. Pages supply their own form as children.
 */
const AuthLayout = ({ eyebrow, title, subtitle, children, footer }) => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <BrandPanel />

      <div className="flex flex-col bg-surface px-6 py-10 lg:py-12">
        <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
          <DialMark />
          <span className="font-display font-semibold text-base text-ink tracking-tight">
            MeterClick
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div
            className="w-full max-w-[420px] bg-paper border border-line rounded-[20px] px-8 py-10"
            style={{
              boxShadow: '0 10px 15px -3px rgba(28,27,26,0.06), 0 4px 6px -2px rgba(28,27,26,0.03)',
            }}
          >
            <p className="font-mono text-xs uppercase tracking-wider text-ink-soft text-center mb-2">
              {eyebrow}
            </p>
            <h1 className="font-display font-semibold text-[26px] text-ink text-center mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-ink-soft text-center mb-8 leading-relaxed">{subtitle}</p>
            )}

            {children}

            {footer && <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;