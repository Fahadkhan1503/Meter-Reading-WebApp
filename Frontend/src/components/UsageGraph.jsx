import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-paper border border-line rounded-[10px] px-3 py-2 shadow-sm">
      <p className="text-xs text-ink-soft mb-0.5">{label}</p>
      <p className="font-mono text-sm font-bold text-ink">{payload[0].value} units</p>
    </div>
  );
};

const UsageGraph = ({ readings = [] }) => {
  const data = readings.map((r) => ({
    label: new Date(r.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
    units: r.unitsUsed,
  }));

  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-ink-soft">
        No readings yet
      </div>
    );
  }

  return (
    <div className="w-auto h-full min-h-27.5">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="20%" >
          <CartesianGrid vertical={false} stroke="var(--color-line)" />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--color-ink-soft)', fontSize: 10 }}
            axisLine={{ stroke: 'var(--color-line)' }}
            tickLine={false}
          />
          <YAxis tick={{ fill: 'var(--color-ink-soft)', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-surface)' }} />
          <Bar dataKey="units" fill="var(--color-primary)" radius={[3, 3, 0, 0]} maxBarSize={15} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UsageGraph;