// src/pages/Meters.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMeters, deleteMeter } from "../services/meterService";
import { getCycleSummary } from "../services/readingService"; 
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Plus, Eye, Edit, Trash2, Loader2, Pencil, Camera } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog"; 
const Meters = () => {
  const [meters, setMeters] = useState([]);
  const [cycleData, setCycleData] = useState({}); // key: meterId, value: cycle summary
  const [loading, setLoading] = useState(true);
  const [loadingCycle, setLoadingCycle] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);  
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const fetchMeters = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMeters();
      setMeters(data);
      // After meters are loaded, fetch cycle summaries
      await fetchCycleSummaries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCycleSummaries = async (metersList) => {
    if (!metersList || metersList.length === 0) return;
    setLoadingCycle(true);
    const summaries = {};
    try {
      await Promise.all(
        metersList.map(async (meter) => {
          try {
            const summary = await getCycleSummary(meter._id);
            summaries[meter._id] = summary;
          } catch (err) {
            console.error(`Failed to fetch cycle for ${meter._id}:`, err);
            // Fallback: use raw data
            const fallback = {
              unitsUsed: meter.currentReading - meter.lastBilledReading,
              daysSinceBill: Math.floor((Date.now() - new Date(meter.lastBilledDate).getTime()) / (1000 * 60 * 60 * 24)),
              remainingTarget: meter.target - (meter.currentReading - meter.lastBilledReading),
              target: meter.target,
              overTarget: meter.target > 0 && (meter.currentReading - meter.lastBilledReading) > meter.target,
              userAvgPerDay: 0,
              requiredAvgPerDay: null,
              onTrack: null,
            };
            summaries[meter._id] = fallback;
          }
        })
      );
      setCycleData(summaries);
    } catch (err) {
      console.error("Failed to fetch cycle summaries:", err);
    } finally {
      setLoadingCycle(false);
    }
  };

  useEffect(() => {
    fetchMeters();
    // eslint-disable-next-line
  }, []);

  const handleDeleteClick = (id) => {
        setDeletingId(id);
        setShowDeleteDialog(true);
      };

      const confirmDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        try {
          await deleteMeter(deletingId);
          setMeters((prev) => prev.filter((m) => m._id !== deletingId));
          setCycleData((prev) => {
            const newData = { ...prev };
            delete newData[deletingId];
            return newData;
          });
        } catch (err) {
          setError(err.message);
        } finally {
          setIsDeleting(false);
          setDeletingId(null);
          setShowDeleteDialog(false);
        }
      };

      const cancelDelete = () => {
        setDeletingId(null);
        setShowDeleteDialog(false);
        setIsDeleting(false);
      };

  const getDaysElapsed = (lastBilledDate) => {
    const diff = new Date() - new Date(lastBilledDate);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar onMenuClick={toggleSidebar} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          <div className="flex-1 min-w-0 px-4 py-10 text-sm text-ink-soft">
            Loading meters...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar onMenuClick={toggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <div className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="font-display font-semibold text-2xl text-ink">Meters</h1>
            <Link
              to="/meters/new"
              className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium rounded-[10px] px-4 py-2 hover:bg-primary-dark transition"
            >
              <Plus size={16} />
              Add meter
            </Link>
          </div>

          {error && (
            <div className="bg-danger-light text-danger text-sm rounded-[10px] px-3 py-2.5 mb-6">
              {error}
            </div>
          )}

          {meters.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-ink-soft mb-4">No meters yet.</p>
              <Link to="/meters/new" className="text-primary hover:underline">
                Add your first meter
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {meters.map((meter) => {
                // Use cycle data if available, otherwise fallback to raw
                const cycle = cycleData[meter._id];
                const unitsUsed = cycle?.unitsUsed ?? (meter.currentReading - meter.lastBilledReading);
                const daysElapsed = cycle?.daysSinceBill ?? getDaysElapsed(meter.lastBilledDate);
                const remaining = cycle?.remainingTarget ?? Math.max(meter.target - unitsUsed, 0);
                const target = cycle?.target ?? meter.target;
                const overTarget = cycle?.overTarget ?? (target > 0 && unitsUsed > target);
                const percent = target > 0 ? Math.min(100, Math.round((unitsUsed / target) * 100)) : 0;
                const avgPerDay = cycle?.userAvgPerDay ?? (daysElapsed > 0 ? (unitsUsed / daysElapsed).toFixed(2) : 0);
                const requiredAvg = cycle?.requiredAvgPerDay ?? (daysElapsed > 0 ? (remaining / daysElapsed).toFixed(2) : null);
                const onTrack = cycle?.onTrack ?? null;

                return (
                  <div
                    key={meter._id}
                    className="bg-paper border border-line rounded-[20px] p-5 hover:shadow-md transition relative"
                  >
                    {/* Edit & Delete icons – top right */}
                    <div className="absolute top-4 right-4 flex items-center gap-1">
                      <Link
                        to={`/meters/${meter._id}/edit`}
                        className="p-1.5 text-ink-soft hover:text-ink transition rounded-full hover:bg-surface"
                        aria-label="Edit meter"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(meter._id)}
                        disabled={isDeleting}
                        className="p-1.5 text-danger/60 hover:text-danger transition rounded-full hover:bg-danger-light/20 disabled:opacity-50"
                        aria-label="Delete meter"
                      >
                        {deletingId === meter._id && isDeleting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>

                    {/* Name & subtitle */}
                    <div className="mb-4">
                      <h3 className="font-display font-semibold text-lg text-ink">{meter.name}</h3>
                      <p className="text-xs text-ink-soft">
                        {meter.meterNumber ? `#${meter.meterNumber}` : "kWh"}
                        {!meter.isActive && " · Inactive"}
                        {cycle && !cycle.onTrack && cycle.onTrack !== null && (
                          <span className="ml-2 text-danger">· behind</span>
                        )}
                      </p>
                    </div>

                    {/* Progress bar with left/right labels */}
                    <div className="mb-4">
                      <div className="h-1.5 bg-line rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            overTarget ? 'bg-danger' : 'bg-success'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ink-soft">{unitsUsed} of {target} units</span>
                        <span className="text-ink-soft">{daysElapsed}d elapsed</span>
                      </div>
                    </div>

                    {/* Current reading - grey box */}
                    <div className="bg-gray-50 rounded-[10px] p-3 mb-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-ink-soft mb-0.5">Current reading</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-ink-soft">
                            {new Date(meter.lastBilledDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: "#6366f118",
                              color: "#6366f1",
                            }}
                          >
                            {meter.lastReadingSource === "photo" ? (
                              <Camera size={16} />
                            ) : (
                              <Pencil size={16} />
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-ink tabular-nums">
                        {meter.currentReading}
                      </div>
                    </div>

                    {/* Avg per day box */}
                    {unitsUsed > 0 && (
                      <div
                        className="text-xs px-3 py-2 rounded-lg mb-4"
                        style={{
                          backgroundColor: "#fef5f0",
                          color: "#e86128",
                        }}
                      >
                        <span className="font-semibold">{avgPerDay}/day</span>
                        {requiredAvg !== null && requiredAvg > 0 && (
                          <span className="text-ink-soft ml-1">
                            · maxlimit {requiredAvg}/day
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Link
                        to={`/meters/${meter._id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-surface border border-line text-ink-soft text-sm font-medium rounded-[10px] px-3 py-2 hover:bg-paper transition"
                      >
                        <Eye size={16} />
                        View history
                      </Link>
                      <Link
                        to={`/readings/new?meterId=${meter._id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white text-sm font-medium rounded-[10px] px-3 py-2 hover:bg-primary-dark transition"
                      >
                        <Plus size={16} />
                        Reading
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
      isOpen={showDeleteDialog}
      onClose={cancelDelete}
      onConfirm={confirmDelete}
      title="Delete Meter"
      message="Are you sure you want to delete this meter and all its readings? This action cannot be undone."
      confirmText="Delete Meter"
      isLoading={isDeleting}
    />
    </div>
  );
};

export default Meters;
