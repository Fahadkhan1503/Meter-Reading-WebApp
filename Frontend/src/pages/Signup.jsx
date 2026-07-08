import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

const inputClasses =
  'w-full border border-line rounded-[10px] px-3 py-2.5 text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error && (
          <div
            role="alert"
            className="bg-danger-light text-danger text-sm rounded-[10px] px-3 py-2.5"
          >
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink-soft mb-1.5">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            value={form.name}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Jordan Blake"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink-soft mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            className={inputClasses}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink-soft mb-1.5">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={form.password}
            onChange={handleChange}
            className={inputClasses}
            placeholder="At least 6 characters"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full bg-primary text-white font-medium rounded-[10px] py-2.5 hover:bg-primary-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Signup;