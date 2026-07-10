// src/pages/Meters.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMeters, deleteMeter } from "../services/meterService";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Plus, Eye, Edit, Trash2, Loader2,Pencil,Camera } from "lucide-react";

const Meters = () => {
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const fetchMeters = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMeters();
      setMeters(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeters();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this meter and all its readings?")) return;
    setDeletingId(id);
    try {
      await deleteMeter(id);
      setMeters((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
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
            <h1 className="font-display font-semibold text-2xl text-ink">
              Meters
            </h1>
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
                const unitsUsed =
                  meter.currentReading - meter.lastBilledReading;
                const remaining = Math.max(meter.target - unitsUsed, 0);
                const percent =
                  meter.target > 0
                    ? Math.min(
                        100,
                        Math.round((unitsUsed / meter.target) * 100),
                      )
                    : 0;
                const daysElapsed = getDaysElapsed(meter.lastBilledDate);
                const avgPerDay =
                  daysElapsed > 0 ? (unitsUsed / daysElapsed).toFixed(2) : 0;
                const requiredAvg =
                  daysElapsed > 0 ? (remaining / daysElapsed).toFixed(2) : null;

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
                        onClick={() => handleDelete(meter._id)}
                        disabled={deletingId === meter._id}
                        className="p-1.5 text-danger/60 hover:text-danger transition rounded-full hover:bg-danger-light/20 disabled:opacity-50"
                        aria-label="Delete meter"
                      >
                        {deletingId === meter._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>

                    {/* Name & subtitle */}
                    <div className="mb-4">
                      <h3 className="font-display font-semibold text-lg text-ink">
                        {meter.name}
                      </h3>
                      <p className="text-xs text-ink-soft">
                        {meter.meterNumber ? `#${meter.meterNumber}` : "kWh"}
                        {!meter.isActive && " · Inactive"}
                      </p>
                    </div>

                    {/* Progress bar with left/right labels */}
                    <div className="mb-4">
                      
                      <div className="h-1.5 bg-line rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-success rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-ink-soft">
                          {unitsUsed} of {meter.target} units
                        </span>
                        <span className="text-ink-soft">
                          {daysElapsed}d elapsed
                        </span>
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
                        <div className="text-2xl font-bold text-ink tabular-nums ">
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
    </div>
  );
};

export default Meters;
