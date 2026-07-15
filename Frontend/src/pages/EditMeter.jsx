// src/pages/EditMeter.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getMeterById, updateMeter } from '../services/meterService';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { ArrowLeft, Loader2 } from 'lucide-react';

const fieldClasses =
  'w-full bg-paper border border-line rounded-[10px] px-4 py-3 text-sm text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition';

const EditMeter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    meterNumber: '',
    target: '',
    isActive: true,
    billingCycleDays: 30,
  });

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const loadMeter = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMeterById(id);
        setForm({
          name: data.name || '',
          meterNumber: data.meterNumber || '',
          target: data.target || '',
          isActive: data.isActive !== undefined ? data.isActive : true,
          billingCycleDays: data.billingCycleDays || 30,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadMeter();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Meter name is required');
      return;
    }

    setSubmitting(true);
    try {
      await updateMeter(id, {
        name: form.name.trim(),
        meterNumber: form.meterNumber.trim() || undefined,
        target: form.target ? Number(form.target) : 0,
        isActive: form.isActive,
        billingCycleDays: Number(form.billingCycleDays) || 30,
      });
      navigate('/meters');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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

  if (error && !form.name) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar onMenuClick={toggleSidebar} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          <div className="flex-1 min-w-0 px-4 py-10">
            <div className="bg-danger-light text-danger text-sm rounded-[10px] px-3 py-2.5 mb-4">
              {error}
            </div>
            <Link to="/meters" className="text-primary text-sm font-medium hover:underline">
              Back to meters
            </Link>
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
          <div className="max-w-2xl mx-auto">
            <Link
              to="/meters"
              className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition mb-4"
            >
              <ArrowLeft size={16} />
              Back to meters
            </Link>

            <h1 className="font-display font-semibold text-2xl text-ink mb-2">Edit meter</h1>
            <p className="text-sm text-ink-soft mb-6">
              Update the details of this meter.
            </p>

            {error && (
              <div className="bg-danger-light text-danger text-sm rounded-[10px] px-3 py-2.5 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-paper border border-line rounded-[20px] p-6 space-y-4">
              {/* Name */}
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
                  placeholder="e.g., Home, Office"
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

              {/* Active status toggle */}
              <div className="flex items-center gap-3 pt-2">
                <label htmlFor="isActive" className="text-sm font-medium text-ink">
                  Active
                </label>
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-line text-primary focus:ring-primary/30"
                />
                <span className="text-xs text-ink-soft">
                  {form.isActive ? 'Meter is active and appears in dashboards' : 'Meter is hidden from dashboards'}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary text-white font-medium rounded-[10px] py-3 hover:bg-primary-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      Updating…
                    </span>
                  ) : (
                    'Update meter'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/meters')}
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

export default EditMeter;