import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getMeterById } from '../services/meterService';
import { getReadings, getCycleSummary, createReading, scanReading } from '../services/readingService';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CycleDial from '../components/CycleDial';
import { ArrowLeft, Camera, Pencil, Upload, Loader2, AlertTriangle, Check } from 'lucide-react';

const numberFieldClasses =
  'w-full font-display text-2xl font-bold tabular-nums border border-line rounded-[10px] px-3 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

const getToday = () => new Date().toISOString().split('T')[0];

const AddReading = () => {
  const [searchParams] = useSearchParams();
  const meterId = searchParams.get('meterId');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const [meter, setMeter] = useState(null);
  const [cycle, setCycle] = useState(null);            // 👈 cycle summary from backend
  const [allReadings, setAllReadings] = useState([]);
  const [loadingMeter, setLoadingMeter] = useState(true);
  const [meterError, setMeterError] = useState('');

  const [mode, setMode] = useState('manual');
  const [value, setValue] = useState('');
  const [source, setSource] = useState('manual');
  const [readingDate, setReadingDate] = useState(getToday());
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    if (!meterId) {
      setMeterError('No meter selected');
      setLoadingMeter(false);
      return;
    }
    const loadData = async () => {
      try {
        const [meterData, readingsData, cycleData] = await Promise.all([
          getMeterById(meterId),
          getReadings(meterId),
          getCycleSummary(meterId),
        ]);
        setMeter(meterData);
        setAllReadings(readingsData);
        setCycle(cycleData);
      } catch (err) {
        setMeterError(err.message);
      } finally {
        setLoadingMeter(false);
      }
    };
    loadData();
  }, [meterId]);

  const resetPhotoState = () => {
    setImagePreview(null);
    setScanResult(null);
    setValue('');
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError('');
    setValue('');
    setScanResult(null);
    setImagePreview(null);
    setSource(newMode === 'photo' ? 'photo' : 'manual');
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setScanResult(null);
    setImagePreview(URL.createObjectURL(file));
    setScanning(true);

    try {
      const result = await scanReading(file);
      setScanResult(result);
      setValue(result.extractedValue !== undefined ? String(result.extractedValue) : '');
      setSource('photo');
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  // ----------------- Validation helpers -----------------
  const getNextReading = (date) => {
    const selected = new Date(date);
    const laterReadings = allReadings
      .filter((r) => new Date(r.date) > selected)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return laterReadings[0] || null;
  };

  const getPreviousReading = (date) => {
    const selected = new Date(date);
    const earlierReadings = allReadings
      .filter((r) => new Date(r.date) < selected)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return earlierReadings[0] || null;
  };

  const validatePastReading = (date, val) => {
    if (!date || !val) return null;
    const numVal = Number(val);
    const nextReading = getNextReading(date);
    if (nextReading && numVal > nextReading.value) {
      return `Cannot be higher than the reading on ${formatDate(nextReading.date)} (${nextReading.value})`;
    }
    const previousReading = getPreviousReading(date);
    if (previousReading && numVal < previousReading.value) {
      return `Cannot be lower than the reading on ${formatDate(previousReading.date)} (${previousReading.value})`;
    }
    return null;
  };

  // ----------------- Submit handler -----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!value || Number(value) < 0) {
      setError('Enter a valid reading value');
      return;
    }

    // ✅ Fixed: compare date strings (allow today)
    if (readingDate) {
      const todayStr = getToday();
      if (readingDate > todayStr) {
        setError('Cannot add a reading from the future.');
        return;
      }

      const dateError = validatePastReading(readingDate, Number(value));
      if (dateError) {
        setError(dateError);
        return;
      }
    }

    setSubmitting(true);
    try {
      await createReading({
        meterId,
        value: Number(value),
        source,
        date: readingDate || undefined,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------- Loading / Error states -----------------
  if (loadingMeter) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar onMenuClick={toggleSidebar} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          <div className="flex-1 min-w-0 px-4 py-10 text-sm text-ink-soft">Loading meter...</div>
        </div>
      </div>
    );
  }

  if (meterError || !meter || !cycle) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar onMenuClick={toggleSidebar} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          <div className="flex-1 min-w-0 px-4 py-10">
            <div className="bg-danger-light text-danger text-sm rounded-[10px] px-3 py-2.5 mb-4">
              {meterError || 'Meter not found'}
            </div>
            <Link to="/meters" className="text-primary text-sm font-medium hover:underline">
              Back to meters
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------- Preview calculations (using cycle data) -----------------
  const numericValue = Number(value);
  const hasValidValue = value !== '' && !Number.isNaN(numericValue) && numericValue >= 0;

  // Use cycle's baseline (lastBilledReading) and current reading (cycle.currentReading)
  const baselineReading = cycle.lastBilledReading;
  const currentReading = cycle.currentReading;

  // If user entered a value, use it; otherwise use current reading from cycle
  const previewValue = hasValidValue ? numericValue : currentReading;
  const previewUnitsUsed = Math.max(previewValue - baselineReading, 0);
  const previewPercent = cycle.target > 0 ? Math.min(100, Math.round((previewUnitsUsed / cycle.target) * 100)) : 0;
  const previewStatus = cycle.target > 0 && previewUnitsUsed > cycle.target ? 'danger' : 'success';
  const previewRemaining = Math.max(cycle.target - previewUnitsUsed, 0);

  // Use cycle's daysRemaining and lastBilledDate
  const daysRemaining = cycle.daysRemaining;
  const lastBilledDate = new Date(cycle.lastBilledDate);
  const nextBillDate = new Date(lastBilledDate.getTime() + (meter.billingCycleDays || 30) * 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar onMenuClick={toggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <div className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-4">
          <div className="mx-auto">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition mb-4"
            >
              <ArrowLeft size={16} />
              Back
            </Link>

            <h1 className="font-display font-semibold text-2xl text-ink mb-1">Add reading</h1>
            <p className="text-sm text-ink-soft mb-6">
              {meter.name} &middot; last reading{' '}
              <span className="font-display font-bold text-ink tabular-nums">{currentReading}</span>
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">
              {/* Left: Form */}
              <div className="bg-paper border border-line rounded-[20px] p-6">
                <div className="max-w-sm">
                  <div className="flex bg-surface border border-line rounded-[10px] p-1 mb-6">
                    <button
                      type="button"
                      onClick={() => handleModeChange('manual')}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium rounded-lg py-2 transition ${
                        mode === 'manual' ? 'bg-paper text-ink shadow-sm' : 'text-ink-soft'
                      }`}
                    >
                      <Pencil size={15} />
                      Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange('photo')}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium rounded-lg py-2 transition ${
                        mode === 'photo' ? 'bg-paper text-ink shadow-sm' : 'text-ink-soft'
                      }`}
                    >
                      <Camera size={15} />
                      Scan photo
                    </button>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {error && (
                      <div role="alert" className="bg-danger-light text-danger text-sm rounded-[10px] px-3 py-2.5 mb-4">
                        {error}
                      </div>
                    )}

                    {mode === 'manual' && (
                      <div className="mb-3">
                        <label htmlFor="value" className="block text-sm font-medium text-ink-soft mb-1.5">
                          Meter reading
                        </label>
                        <input
                          id="value"
                          type="number"
                          inputMode="decimal"
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          placeholder="e.g. 1550"
                          className={numberFieldClasses}
                        />
                      </div>
                    )}

                    {mode === 'photo' && (
                      <div className="mb-3">
                        {!imagePreview && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-line rounded-[10px] py-10 text-ink-soft hover:border-primary hover:text-primary transition"
                          >
                            <Upload size={22} />
                            <span className="text-sm font-medium">Take or upload a photo</span>
                          </button>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileSelect}
                          className="hidden"
                        />

                        {imagePreview && (
                          <div className="mb-4">
                            <img
                              src={imagePreview}
                              alt="Meter"
                              className="w-full max-h-48 object-cover rounded-[10px] border border-line"
                            />
                            <button
                              type="button"
                              onClick={resetPhotoState}
                              className="text-xs text-ink-soft hover:text-ink mt-1.5"
                            >
                              Retake photo
                            </button>
                          </div>
                        )}

                        {scanning && (
                          <div className="flex items-center gap-2 text-sm text-ink-soft py-3">
                            <Loader2 size={16} className="animate-spin" />
                            Reading meter...
                          </div>
                        )}

                        {scanResult && !scanning && (
                          <div className="mb-3">
                            {scanResult.confidence === 'low' && (
                              <div className="flex items-start gap-2 bg-danger-light text-danger text-xs rounded-[10px] px-3 py-2.5 mb-3">
                                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                                <span>
                                  Low confidence{scanResult.issue && scanResult.issue !== 'none' ? `, ${scanResult.issue}` : ''}.
                                  Double check the number below.
                                </span>
                              </div>
                            )}
                            <label htmlFor="scanValue" className="block text-sm font-medium text-ink-soft mb-1.5">
                              Detected reading, edit if wrong
                            </label>
                            <input
                              id="scanValue"
                              type="number"
                              inputMode="decimal"
                              value={value}
                              onChange={(e) => setValue(e.target.value)}
                              className={numberFieldClasses}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Date picker */}
                    <div className="mb-4">
                      <label htmlFor="readingDate" className="block text-sm font-medium text-ink-soft mb-1.5">
                        Reading date
                      </label>
                      <input
                        id="readingDate"
                        type="date"
                        value={readingDate}
                        onChange={(e) => setReadingDate(e.target.value)}
                        className="w-full border border-line rounded-[10px] px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-paper"
                      />
                      <p className="text-xs text-ink-soft mt-1">
                        Set to today's date for the current reading, or choose a past date if you forgot to log it earlier.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || scanning || (mode === 'photo' && !scanResult)}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 bg-primary text-white font-medium rounded-[10px] py-2.5 hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={16} />
                      {submitting ? 'Saving...' : 'Save reading'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Panel – Dashboard-style preview */}
              <div className="bg-paper border border-line rounded-[20px] p-6">
                <p className="font-display font-semibold text-sm text-ink-soft mb-4">
                  {hasValidValue ? 'If you save this' : 'Current standing'}
                </p>

                {/* Two boxes: Last billed & Next bill (using cycle data) */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-gray-100 rounded-[10px] p-3">
                    <p className="text-xs text-ink-soft mb-0.5">Last billed at</p>
                    <p className="font-display font-bold text-ink tabular-nums">{baselineReading} units</p>
                    <p className="text-xs text-ink-soft">on {formatDate(lastBilledDate)}</p>
                  </div>
                  <div className="bg-gray-100 rounded-[10px] p-3">
                    <p className="text-xs text-ink-soft mb-0.5">Next bill</p>
                    <p className="font-display font-bold text-ink tabular-nums">{formatDate(nextBillDate)}</p>
                    <p className="text-xs text-ink-soft">left {daysRemaining}d</p>
                  </div>
                </div>

                {/* Dial and stats */}
                <div className="flex items-center gap-5">
                  <CycleDial percent={previewPercent} status={previewStatus} />
                  <div>
                    <p className="font-display text-2xl font-bold text-ink tabular-nums">{previewUnitsUsed}</p>
                    <p className="text-xs text-ink-soft">
                      units used, {previewRemaining} left of {cycle.target}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddReading;