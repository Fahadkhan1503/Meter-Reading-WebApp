import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const fieldClasses =
  'w-full bg-surface rounded-2xl pl-11 pr-4 py-3 text-sm text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-2 focus:ring-primary/30 transition';

const iconClasses = 'w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="// start tracking"
      title="Create account"
      subtitle="Set up your meter and catch overages before the bill does."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:text-primary-dark">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        {error && (
          <div role="alert" className="bg-danger-light text-danger text-sm rounded-2xl px-3 py-2.5">
            {error}
          </div>
        )}

        <div className="relative">
          <User className={iconClasses} />
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            aria-label="Name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className={fieldClasses}
          />
        </div>

        <div className="relative">
         <Mail className={iconClasses} />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-label="Email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className={fieldClasses}
          />
        </div>

        <div className="relative">
          <Lock className={iconClasses} />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={6}
            aria-label="Password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password (min. 6 characters)"
            className={`${fieldClasses} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition"
          >
            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1.5 w-full bg-primary text-white font-medium rounded-2xl py-3 hover:bg-primary-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Signup;