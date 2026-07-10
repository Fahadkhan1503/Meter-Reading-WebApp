// src/pages/CreateMeter.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createMeter } from '../services/meterService';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { ArrowLeft, Loader2 } from 'lucide-react';

const fieldClasses =
  'w-full bg-paper border border-line rounded-[10px] px-4 py-3 text-sm text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition';

const CreateMeter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    meterNumber: '',
    currentReading: '',
    lastBilledReading: '',
    lastBilledDate: '',
    target: '',
    billingCycleDays: 30,
  });

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.name.trim()) {
      setError('Meter name is required');
      return;
    }
    if (form.currentReading === '' || isNaN(form.currentReading)) {
      setError('Current reading is required');
      return;
    }
    if (form.lastBilledReading === '' || isNaN(form.lastBilledReading)) {
      setError('Last billed reading is required');
      return;
    }
    if (!form.lastBilledDate) {
      setError('Last billed date is required');
      return;
    }
    if (Number(form.currentReading) < Number(form.lastBilledReading)) {
      setError('Current reading cannot be lower than last billed reading');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        meterNumber: form.meterNumber.trim() || undefined,
        currentReading: Number(form.currentReading),
        lastBilledReading: Number(form.lastBilledReading),
        lastBilledDate: new Date(form.lastBilledDate).toISOString(),
        target: form.target !== '' ? Number(form.target) : 0,
        billingCycleDays: Number(form.billingCycleDays) || 30,
      };
      const result = await createMeter(payload);
      // Navigate to the meter detail page
      navigate(`/dashboard`); // or navigate(`/meters/${result.meter._id}`) if you want to go to the meter detail page
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar onMenuClick={toggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <div className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition mb-4"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <div className="max-w-2xl mx-auto">
            <h1 className="font-display font-semibold text-2xl text-ink mb-2">Add a meter</h1>
            <p className="text-sm text-ink-soft mb-6">
              Enter the details of your meter. The last billed reading is the starting point.
            </p>

            {error && (
              <div className="bg-danger-light text-danger text-sm rounded-[10px] px-3 py-2.5 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-paper border border-line rounded-[20px] p-6 space-y-4">
              {/* Meter Name */}
              <div>
                <label htmlFor="name" className="text-sm font-medium text-ink block mb-1">
                  Meter name <span className="text-danger">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Home, Office, Shop"
                  className={fieldClasses}
                  required
                />
              </div>

              {/* Meter Number */}
              <div>
                <label htmlFor="meterNumber" className="text-sm font-medium text-ink block mb-1">
                  Meter number <span className="text-ink-soft text-xs">(optional)</span>
                </label>
                <input
                  id="meterNumber"
                  name="meterNumber"
                  type="text"
                  value={form.meterNumber}
                  onChange={handleChange}
                  placeholder="e.g., 123456789"
                  className={fieldClasses}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Current Reading */}
                <div>
                  <label htmlFor="currentReading" className="text-sm font-medium text-ink block mb-1">
                    Current reading <span className="text-danger">*</span>
                  </label>
                  <input
                    id="currentReading"
                    name="currentReading"
                    type="number"
                    step="any"
                    value={form.currentReading}
                    onChange={handleChange}
                    placeholder="e.g., 1500"
                    className={fieldClasses}
                    required
                  />
                </div>

                {/* Last Billed Reading */}
                <div>
                  <label htmlFor="lastBilledReading" className="text-sm font-medium text-ink block mb-1">
                    Last billed reading <span className="text-danger">*</span>
                  </label>
                  <input
                    id="lastBilledReading"
                    name="lastBilledReading"
                    type="number"
                    step="any"
                    value={form.lastBilledReading}
                    onChange={handleChange}
                    placeholder="e.g., 1450"
                    className={fieldClasses}
                    required
                  />
                </div>
              </div>

              {/* Last Billed Date */}
              <div>
                <label htmlFor="lastBilledDate" className="text-sm font-medium text-ink block mb-1">
                  Last billed date <span className="text-danger">*</span>
                </label>
                <input
                  id="lastBilledDate"
                  name="lastBilledDate"
                  type="date"
                  value={form.lastBilledDate}
                  onChange={handleChange}
                  className={fieldClasses}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Target */}
                <div>
                  <label htmlFor="target" className="text-sm font-medium text-ink block mb-1">
                    Monthly target <span className="text-ink-soft text-xs">(optional)</span>
                  </label>
                  <input
                    id="target"
                    name="target"
                    type="number"
                    step="any"
                    value={form.target}
                    onChange={handleChange}
                    placeholder="e.g., 200"
                    className={fieldClasses}
                  />
                </div>

                {/* Billing Cycle Days */}
                <div>
                  <label htmlFor="billingCycleDays" className="text-sm font-medium text-ink block mb-1">
                    Billing cycle days
                  </label>
                  <input
                    id="billingCycleDays"
                    name="billingCycleDays"
                    type="number"
                    min="1"
                    value={form.billingCycleDays}
                    onChange={handleChange}
                    placeholder="30"
                    className={fieldClasses}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white font-medium rounded-[10px] py-3 hover:bg-primary-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      Creating…
                    </span>
                  ) : (
                    'Create meter'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 bg-surface border border-line text-ink-soft font-medium rounded-[10px] py-3 hover:bg-paper transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMeter;