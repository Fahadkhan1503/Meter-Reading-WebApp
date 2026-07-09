import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMeters } from '../services/meterService';
import { getCycleSummary, getReadings } from '../services/readingService';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CycleDial from '../components/CycleDial';
import CustomSelect from '../components/CustomSelect'; // 👈 new import
import { Plus } from 'lucide-react';

const Dashboard = () => {
  const [meters, setMeters] = useState([]);
  const [selectedMeterId, setSelectedMeterId] = useState(null);
  const [cycle, setCycle] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loadingMeters, setLoadingMeters] = useState(true);
  const [loadingCycle, setLoadingCycle] = useState(false);
  const [error, setError] = useState('');

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
        setReadings(readingsData.slice(0, 5));
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
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 min-w-0 px-4 py-10 text-sm text-ink-soft">Loading your meters...</div>
        </div>
      </div>
    );
  }

  // Empty state
  if (meters.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 min-w-0 px-4 py-16 text-center">
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

  // Prepare options for custom select
  const meterOptions = meters.map((m) => ({ value: m._id, label: m.name }));

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          {/* Top section: meter selector and add button */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <CustomSelect
              options={meterOptions}
              value={selectedMeterId}
              onChange={(val) => setSelectedMeterId(val)}
              placeholder="Select a meter"
            />
            <Link to="/meters/new" className="text-sm text-primary font-medium hover:text-primary-dark lg:hidden whitespace-nowrap">
              + Add meter
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
            // 👇 Changed here: single column, full width, stacked vertically
            <div className="grid grid-cols-1 gap-6">
              {/* Cycle dial card – full width */}
              <div className="bg-paper border border-line rounded-[20px] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="font-display font-semibold text-lg text-ink">{selectedMeter?.name}</p>
                    <p className="text-xs text-ink-soft">
                      Billed {new Date(cycle.lastBilledDate).toLocaleDateString()} &middot; {cycle.daysRemaining} days left
                    </p>
                  </div>
                  <Link
                    to={`/readings/new?meterId=${selectedMeterId}`}
                    className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium rounded-[10px] px-3.5 py-2 hover:bg-primary-dark transition"
                  >
                    <Plus size={16} />
                    Add reading
                  </Link>
                </div>

                <div className="flex items-center gap-6">
                  <CycleDial percent={percent} status={dialStatus} />
                  <div>
                    <p className="font-mono text-2xl font-bold text-ink">{cycle.unitsUsed}</p>
                    <p className="text-xs text-ink-soft mb-3">
                      units used, {Math.max(cycle.remainingTarget, 0)} left of {cycle.target}
                    </p>
                    <span
                      className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background: paceStatus === 'danger' ? 'var(--color-danger-light)' : 'var(--color-success-light)',
                        color: paceStatus === 'danger' ? 'var(--color-danger)' : 'var(--color-success)',
                      }}
                    >
                      {cycle.userAvgPerDay}/day used
                      {cycle.requiredAvgPerDay !== null && `, needs ${cycle.requiredAvgPerDay}/day`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent readings card – full width */}
              <div className="bg-paper border border-line rounded-[20px] p-6">
                <p className="font-display font-semibold text-sm text-ink-soft mb-4">Recent readings</p>
                {readings.length === 0 ? (
                  <p className="text-sm text-ink-soft">No readings logged yet.</p>
                ) : (
                  readings.map((r) => (
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