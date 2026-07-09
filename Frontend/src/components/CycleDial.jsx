const CycleDial = ({ percent, status = 'success' }) => {
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(percent, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;
  const color = status === 'danger' ? 'var(--color-danger)' : 'var(--color-success)';
  const track = status === 'danger' ? 'var(--color-danger-light)' : 'var(--color-primary-light)';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)' }}
      />
      <text x="50%" y="46%" textAnchor="middle" fontFamily="Space Mono, monospace" fontWeight="700" fontSize="26" fill="var(--color-ink)">
        {Math.round(clamped)}%
      </text>
      <text x="50%" y="62%" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" fill="var(--color-ink-soft)">
        of target
      </text>
    </svg>
  );
};

export default CycleDial;