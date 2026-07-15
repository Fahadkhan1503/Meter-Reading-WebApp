import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMeters } from '../services/meterService';
import { getCycleSummary, getReadings } from '../services/readingService';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CycleDial from '../components/CycleDial';
import CustomSelect from '../components/CustomSelect';
import UsageGraph from '../components/UsageGraph';
import { Plus } from 'lucide-react';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

const msPerDay = 1000 * 60 * 60 * 24;

const groupReadingsByCycle = (readings, anchorDate, cycleDays) => {
  if (!anchorDate || readings.length === 0) return [];

  const anchor = new Date(anchorDate).getTime();
  const groups = new Map();

  readings.forEach((r) => {
    const readingTime = new Date(r.date).getTime();
    const windowIndex = Math.floor((readingTime - anchor) / (cycleDays * msPerDay));
    if (!groups.has(windowIndex)) groups.set(windowIndex, []);
    groups.get(windowIndex).push(r);
  });

  return Array.from(groups.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([windowIndex, groupReadings]) => {
      const start = new Date(anchor + windowIndex * cycleDays * msPerDay);
      const end = new Date(anchor + (windowIndex + 1) * cycleDays * msPerDay);
      const monthName = end.toLocaleDateString('en-GB', { month: 'long' });
      const rangeLabel = `${formatDate(start)} - ${formatDate(end)}`;
      return {
        key: windowIndex,
        title: `${monthName} readings`,
        subtitle: rangeLabel,
        readings: groupReadings,
      };
    });
};

const Dashboard = () => {
  const [meters, setMeters] = useState([]);
  const [selectedMeterId, setSelectedMeterId] = useState(null);
  const [cycle, setCycle] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loadingMeters, setLoadingMeters] = useState(true);
  const [loadingCycle, setLoadingCycle] = useState(false);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const loadMeters = async () => {
      try {
        const data = await getMeters();
        setMeters(data);
        if (data.length > 0) setSelectedMeterId(data[0]._id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingMeters(false);
      }
    };
    loadMeters();
  }, []);

  useEffect(() => {
    if (!selectedMeterId) return;

    const loadCycleData = async () => {
      setLoadingCycle(true);
      setError('');
      try {
        const [cycleData, readingsData] = await Promise.all([
          getCycleSummary(selectedMeterId),
          getReadings(selectedMeterId),
        ]);
        setCycle(cycleData);
        setReadings(readingsData.slice(0, 10)); // keep more readings for graph
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingCycle(false);
      }
    };

    loadCycleData();
  }, [selectedMeterId]);

  // Loading state
  if (loadingMeters) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar onMenuClick={toggleSidebar} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          <div className="flex-1 min-w-0 px-4 py-10 text-sm text-ink-soft">Loading your meters...</div>
        </div>
      </div>
    );
  }

  // Empty state
  if (meters.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar onMenuClick={toggleSidebar} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          <div className="flex-1 min-w-0 px-4 py-16 text-center">
            <img
            src="/no_meter.png"
            alt="No meters illustration"
            className="mx-auto mb-8 w-80 sm:w-96 md:w-[28rem] max-w-full h-auto object-contain"
          />
            <h1 className="font-display font-semibold text-2xl text-ink mb-2">No meters yet</h1>
            <p className="text-ink-soft mb-6">
              Add your first meter with its last billed reading, and MeterClick starts tracking from there.
            </p>
            <Link
              to="/meters/new"
              className="inline-block bg-primary text-white font-medium rounded-[10px] px-5 py-2.5 hover:bg-primary-dark transition"
            >
              Add a meter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedMeter = meters.find((m) => m._id === selectedMeterId);
  const percent = cycle && cycle.target > 0 ? Math.min(100, Math.round((cycle.unitsUsed / cycle.target) * 100)) : 0;
  const dialStatus = cycle?.overTarget ? 'danger' : 'success';
  const paceStatus = cycle?.onTrack === false ? 'danger' : 'success';

  const billingCycleDays = selectedMeter?.billingCycleDays || 30;
  const nextBillDate = cycle ? new Date(new Date(cycle.lastBilledDate).getTime() + billingCycleDays * msPerDay) : null;
  const readingGroups = cycle ? groupReadingsByCycle(readings, cycle.lastBilledDate, billingCycleDays) : [];

  const meterOptions = meters.map((m) => ({ value: m._id, label: m.name }));

  return (
    <div className="min-h-screen bg-surface">
      <Navbar onMenuClick={toggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <div className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          {/* Top section: meter selector and add button */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <CustomSelect
              options={meterOptions}
              value={selectedMeterId}
              onChange={(val) => setSelectedMeterId(val)}
              placeholder="Select a meter"
            />
            <Link
              to={`/readings/new?meterId=${selectedMeterId}`}
              className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium rounded-[10px] px-3.5 py-2 hover:bg-primary-dark transition"
            >
              <Plus size={16} />
              Add reading
            </Link>
          </div>

          {error && (
            <div role="alert" className="bg-danger-light text-danger text-sm rounded-[10px] px-3 py-2.5 mb-6">
              {error}
            </div>
          )}

          {loadingCycle || !cycle ? (
            <div className="text-sm text-ink-soft">Loading cycle data...</div>
          ) : (
            <div className="grid grid-cols-1 gap-6">

              {/* Cycle dial card */}
              <div className="bg-paper border border-line rounded-[20px] p-6">
                <div className="flex items-center justify-between gap-6 mb-6">
                  <div>
                    <p className="font-display font-semibold text-lg text-ink">{selectedMeter?.name}</p>
                    <p className="text-xs text-ink-soft">
                      Billed {new Date(cycle.lastBilledDate).toLocaleDateString()} &middot; {cycle.daysRemaining} days left
                    </p>
                    
                  </div>
                </div>

              

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

                  {/* LEFT Panel */}
                  <div className="flex flex-col gap-5">

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-100 border border-line rounded-2xl p-4">
                        <p className="text-xs text-ink-soft mb-1">Last billed at</p>
                        <p className="font-display text-xl font-bold text-ink tabular-nums">{cycle.lastBilledReading} units</p>
                        <p className="text-xs text-ink-soft">{formatDate(cycle.lastBilledDate)}</p>
                      </div>

                      <div className="bg-gray-100 border border-line rounded-2xl p-4">
                        <p className="text-xs text-ink-soft mb-1">Next bill</p>
                        <p className="font-display text-xl font-bold text-ink tabular-nums">{formatDate(nextBillDate)}</p>
                        <p className="text-xs text-ink-soft">{cycle.daysRemaining} days left</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 flex-1">
                      <CycleDial percent={percent} status={dialStatus} />

                      <div>
                        <p className="font-mono text-2xl font-bold text-ink">
                          {cycle.unitsUsed}
                        </p>

                        <p className="text-xs text-ink-soft mb-3">
                          units used, {Math.max(cycle.remainingTarget, 0)} left of {cycle.target}
                        </p>

                        <span
                          className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background:
                              paceStatus === "danger"
                                ? "var(--color-danger-light)"
                                : "var(--color-success-light)",
                            color:
                              paceStatus === "danger"
                                ? "var(--color-danger)"
                                : "var(--color-success)",
                          }}
                        >
                          {cycle.userAvgPerDay}/day used
                          {cycle.requiredAvgPerDay !== null &&
                            `, needs ${cycle.requiredAvgPerDay}/day`}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT Panel */}
                  <div className="h-64 lg:h-full">
                    <UsageGraph readings={[...readings].reverse()} />
                  </div>

                </div>
              </div>

              {/* Recent readings card */}
              <div className="bg-paper border border-line rounded-[20px] p-6">
                <p className="font-display font-semibold text-sm text-ink-soft mb-4">Recent readings</p>
                {readingGroups.length === 0 ? (
                  <p className="text-sm text-ink-soft">No readings logged yet.</p>
                ) : (
                  readingGroups.map((group) => (
                    <div key={group.key} className="mb-5 last:mb-0">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <p className="text-sm font-medium text-ink">{group.title}</p>
                        <p className="text-xs text-ink-soft">{group.subtitle}</p>
                      </div>
                      {group.readings.map((r) => (
                        <div
                          key={r._id}
                          className="flex items-center justify-between py-2.5 border-t border-line first:border-t-0 text-sm"
                        >
                          <span className="text-ink-soft">{new Date(r.date).toLocaleDateString()}</span>
                          <span className="font-mono font-bold text-ink">{r.value}</span>
                          <span className="font-mono text-xs text-primary-dark bg-primary-light px-2 py-0.5 rounded-full">
                            +{r.unitsUsed}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;