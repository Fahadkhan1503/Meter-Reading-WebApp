import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getMeterById } from '../services/meterService';
import { createReading, scanReading } from '../services/readingService';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CycleDial from '../components/CycleDial';
import { ArrowLeft, Camera, Pencil, Upload, Loader2, AlertTriangle, Check } from 'lucide-react';

const numberFieldClasses =
  'w-full font-display text-2xl font-bold tabular-nums border border-line rounded-[10px] px-3 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

const AddReading = () => {
  const [searchParams] = useSearchParams();
  const meterId = searchParams.get('meterId');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const [meter, setMeter] = useState(null);
  const [loadingMeter, setLoadingMeter] = useState(true);
  const [meterError, setMeterError] = useState('');

  const [mode, setMode] = useState('manual');
  const [value, setValue] = useState('');
  const [source, setSource] = useState('manual');
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
    const loadMeter = async () => {
      try {
        const data = await getMeterById(meterId);
        setMeter(data);
      } catch (err) {
        setMeterError(err.message);
      } finally {
        setLoadingMeter(false);
      }
    };
    loadMeter();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!value || Number(value) < 0) {
      setError('Enter a valid reading value');
      return;
    }

    setSubmitting(true);
    try {
      await createReading({ meterId, value: Number(value), source });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

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

  if (meterError || !meter) {
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

  const numericValue = Number(value);
  const hasValidValue = value !== '' && !Number.isNaN(numericValue) && numericValue >= 0;
  const previewValue = hasValidValue ? numericValue : meter.currentReading;
  const previewUnitsUsed = Math.max(previewValue - meter.lastBilledReading, 0);
  const previewPercent =
    meter.target > 0 ? Math.min(100, Math.round((previewUnitsUsed / meter.target) * 100)) : 0;
  const previewStatus = meter.target > 0 && previewUnitsUsed > meter.target ? 'danger' : 'success';
  const previewRemaining = Math.max(meter.target - previewUnitsUsed, 0);

  const billingCycleDays = meter.billingCycleDays || 30;
  const msPerDay = 1000 * 60 * 60 * 24;
  const lastBilledDate = new Date(meter.lastBilledDate);
  const daysSinceBill = Math.max(0, Math.floor((Date.now() - lastBilledDate.getTime()) / msPerDay));
  const daysRemaining = Math.max(0, billingCycleDays - daysSinceBill);
  const nextBillDate = new Date(lastBilledDate.getTime() + billingCycleDays * msPerDay);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar onMenuClick={toggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <div className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-2xl lg:max-w-5xl mx-auto">
            <Link
              to="/meters"
              className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition mb-4"
            >
              <ArrowLeft size={16} />
              Back
            </Link>

            <h1 className="font-display font-semibold text-2xl text-ink mb-1">Add reading</h1>
            <p className="text-sm text-ink-soft mb-6">
              {meter.name} &middot; last reading{' '}
              <span className="font-display font-bold text-ink tabular-nums">{meter.currentReading}</span>
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">
              <div className="bg-paper border border-line rounded-[20px] p-6">
                <div className="max-w-sm">
                  <div className="flex bg-surface border border-line rounded-[10px] p-1 mb-6">
                    <button
                      type="button"
                      onClick={() => handleModeChange('manual')}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium rounded-[8px] py-2 transition ${
                        mode === 'manual' ? 'bg-paper text-ink shadow-sm' : 'text-ink-soft'
                      }`}
                    >
                      <Pencil size={15} />
                      Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange('photo')}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium rounded-[8px] py-2 transition ${
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
                      <div className="mb-2">
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
                      <div className="mb-2">
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
                          <div className="mb-2">
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

                    <button
                      type="submit"
                      disabled={submitting || scanning || (mode === 'photo' && !scanResult)}
                      className="mt-4 w-full flex items-center justify-center gap-1.5 bg-primary text-white font-medium rounded-[10px] py-2.5 hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={16} />
                      {submitting ? 'Saving...' : 'Save reading'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="bg-paper border border-line rounded-[20px] p-6">
                <p className="font-display font-semibold text-sm text-ink-soft mb-4">
                  {hasValidValue ? 'If you save this' : 'Current standing'}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-gray-100 rounded-[10px] p-3">
                    <p className="text-xs text-ink-soft mb-0.5">Last billed at</p>
                    <p className="font-display font-bold text-ink tabular-nums">{meter.lastBilledReading} units</p>
                    <p className="text-xs text-ink-soft">on {formatDate(meter.lastBilledDate)}</p>
                  </div>
                  <div className="bg-gray-100 rounded-[10px] p-3">
                    <p className="text-xs text-ink-soft mb-0.5">Next bill</p>
                    <p className="font-display font-bold text-ink tabular-nums">{formatDate(nextBillDate)}</p>
                    <p className="text-xs text-ink-soft">left {daysRemaining}d</p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <CycleDial percent={previewPercent} status={previewStatus} />
                  <div>
                    <p className="font-display text-2xl font-bold text-ink tabular-nums">{previewUnitsUsed}</p>
                    <p className="text-xs text-ink-soft">
                      units used, {previewRemaining} left of {meter.target}
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