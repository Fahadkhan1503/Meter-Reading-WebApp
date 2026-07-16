import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMeterById } from "../services/meterService";
import { getReadings, deleteReading } from "../services/readingService";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ConfirmDialog from "../components/ConfirmDialog";
import { ArrowLeft, Pencil, Camera, Plus, Trash2, Loader2 } from "lucide-react";

const msPerDay = 1000 * 60 * 60 * 24;

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });

const groupReadingsByCycle = (readings, meter) => {
  if (!meter?.lastBilledDate || readings.length === 0) return [];

  const cycleDays = meter.billingCycleDays || 30;
  const anchor = new Date(meter.lastBilledDate).getTime();

  const getWindowIndex = (date) => {
    const dayNumber = Math.floor(
      (new Date(date).getTime() - anchor) / msPerDay,
    );
    return dayNumber <= 0 ? 0 : Math.floor((dayNumber - 1) / cycleDays);
  };

  const currentWindowIndex = getWindowIndex(Date.now());

  const rawGroups = new Map();
  readings.forEach((r) => {
    const windowIndex = getWindowIndex(r.date);
    if (!rawGroups.has(windowIndex)) rawGroups.set(windowIndex, []);
    rawGroups.get(windowIndex).push(r);
  });

  const sortedIndexes = Array.from(rawGroups.keys()).sort((a, b) => a - b);

  let runningBaseline = meter.lastBilledReading;
  const groups = sortedIndexes.map((windowIndex) => {
    const chronological = [...rawGroups.get(windowIndex)].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );

    const groupBaseline = runningBaseline;
    let chainValue = groupBaseline;
    const withDelta = chronological.map((r) => {
      const displayDelta = r.value - chainValue;
      chainValue = r.value;
      return { ...r, displayDelta };
    });

    runningBaseline = chronological[chronological.length - 1].value;

    const start = new Date(anchor + windowIndex * cycleDays * msPerDay);
    const end = new Date(anchor + (windowIndex + 1) * cycleDays * msPerDay);
    const monthName = end.toLocaleDateString("en-GB", { month: "long" });
    const total = chronological[chronological.length - 1].value - groupBaseline;

    const isCurrent = windowIndex === currentWindowIndex;
    const elapsedDays = isCurrent
      ? Math.max(1, Math.floor((Date.now() - start.getTime()) / msPerDay))
      : cycleDays;

    const percent =
      meter.target > 0
        ? Math.min(100, Math.round((total / meter.target) * 100))
        : 0;
    const status =
      meter.target > 0 && total > meter.target ? "danger" : "success";
    const avgPerDay =
      elapsedDays > 0 ? (total / elapsedDays).toFixed(2) : "0.00";

    return {
      key: windowIndex,
      title: `${monthName} readings`,
      subtitle: `${formatDate(start)} - ${formatDate(end)}`,
      total,
      percent,
      status,
      avgPerDay,
      isCurrent,
      readings: withDelta.reverse(),
    };
  });

  return groups.reverse();
};

const History = () => {
  const { id } = useParams();
  const [meter, setMeter] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [meterData, readingsData] = await Promise.all([
          getMeterById(id),
          getReadings(id),
        ]);
        setMeter(meterData);
        setReadings(readingsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteReading(deletingId);
      const [meterData, readingsData] = await Promise.all([
        getMeterById(id),
        getReadings(id),
      ]);
      setMeter(meterData);
      setReadings(readingsData);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar onMenuClick={toggleSidebar} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          <div className="flex-1 min-w-0 px-4 py-10 text-sm text-ink-soft">
            Loading history...
          </div>
        </div>
      </div>
    );
  }

  if (error || !meter) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar onMenuClick={toggleSidebar} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          <div className="flex-1 min-w-0 px-4 py-10">
            <div className="bg-danger-light text-danger text-sm rounded-[10px] px-3 py-2.5 mb-4">
              {error || "Meter not found"}
            </div>
            <Link
              to="/meters"
              className="text-primary text-sm font-medium hover:underline"
            >
              Back to meters
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const groups = groupReadingsByCycle(readings, meter);
  const totalUnitsAllTime =
    readings.length > 0 ? readings[0].value - meter.lastBilledReading : 0;
  const totalDaysTracked = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(meter.lastBilledDate).getTime()) / msPerDay,
    ),
  );
  const overallAvgPerDay = (totalUnitsAllTime / totalDaysTracked).toFixed(2);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar onMenuClick={toggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <div className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-4">
          <div className="max-w-2xl lg:max-w-5xl xl:max-w-6xl mx-auto">
            <Link
              to="/meters"
              className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition mb-4"
            >
              <ArrowLeft size={16} />
              Back
            </Link>

            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h1 className="font-display font-semibold text-2xl text-ink">
                {meter.name}
              </h1>
              <Link
                to={`/readings/new?meterId=${id}`}
                className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium rounded-[10px] px-3.5 py-2 hover:bg-primary-dark transition"
              >
                <Plus size={16} />
                Add reading
              </Link>
            </div>
            <p className="text-sm text-ink-soft mb-6">
              Tracking since {formatDate(meter.lastBilledDate)}
            </p>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="bg-paper border border-line rounded-[14px] p-3.5 sm:p-4">
                <p className="text-xs text-ink-soft mb-1">Total used</p>
                <p className="font-display text-xl sm:text-2xl font-bold text-ink tabular-nums">
                  {totalUnitsAllTime}
                </p>
              </div>
              <div className="bg-paper border border-line rounded-[14px] p-3.5 sm:p-4">
                <p className="text-xs text-ink-soft mb-1">Readings</p>
                <p className="font-display text-xl sm:text-2xl font-bold text-ink tabular-nums">
                  {readings.length}
                </p>
              </div>
              <div className="bg-paper border border-line rounded-[14px] p-3.5 sm:p-4">
                <p className="text-xs text-ink-soft mb-1">Avg/day</p>
                <p className="font-display text-xl sm:text-2xl font-bold text-ink tabular-nums">
                  {overallAvgPerDay}
                </p>
              </div>
            </div>

            {groups.length === 0 ? (
              <div className="bg-paper border border-line rounded-[20px] p-6">
                <p className="text-sm text-ink-soft">No readings logged yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:gap-6">
                {groups.map((group) => (
                  <div
                    key={group.key}
                    className="bg-paper border border-line rounded-[20px] p-4 sm:p-5 lg:p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-ink">
                            {group.title}
                          </p>
                          {group.isCurrent && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary-light text-primary-dark">
                              In progress
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ink-soft">
                          {group.subtitle}
                        </p>
                      </div>
                      <p className="font-display text-lg sm:text-xl font-bold text-ink tabular-nums mt-1 sm:mt-0">
                        {group.total} units
                      </p>
                    </div>

                    <div className="h-1.5 bg-line rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${group.percent}%`,
                          background:
                            group.status === "danger"
                              ? "var(--color-danger)"
                              : "var(--color-success)",
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between text-xs text-ink-soft mb-4">
                      <span>
                        {group.percent}% of {meter.target} target
                      </span>
                      <span>
                        {group.avgPerDay}/day{group.isCurrent ? " so far" : ""}
                      </span>
                    </div>

                    <div className="border-t border-line pt-1">
                      {group.readings.map((r) => (
                        <div
                          key={r._id}
                          className="flex items-center justify-between py-2.5 border-b border-line last:border-b-0 text-sm"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-30">
                            <span className="text-ink-soft text-xs sm:text-sm">
                              {new Date(r.date).toLocaleDateString()}
                            </span>
                            {r.source === "photo" ? (
                              <Camera
                                size={14}
                                className="text-ink-soft shrink-0"
                              />
                            ) : (
                              <Pencil
                                size={14}
                                className="text-ink-soft shrink-0"
                              />
                            )}
                          </div>
                          <span className="font-display font-bold text-ink tabular-nums text-sm sm:text-base">
                            {r.value}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-primary-dark bg-primary-light px-2 py-0.5 rounded-full whitespace-nowrap">
                              +{r.displayDelta}
                            </span>
                            <button
                              onClick={() => handleDeleteClick(r._id)}
                              disabled={isDeleting}
                              className="text-danger/60 hover:text-danger transition disabled:opacity-50"
                              aria-label="Delete reading"
                            >
                              {deletingId === r._id && isDeleting ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Reading"
        message="Are you sure you want to delete this reading? This action cannot be undone."
        confirmText="Delete Reading"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default History;