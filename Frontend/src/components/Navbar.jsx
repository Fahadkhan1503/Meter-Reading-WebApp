import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50  flex items-center justify-between px-4 sm:px-6 py-4 border-b border-line bg-paper">
      <div className="flex items-center gap-2">
        <svg width="26" height="26" viewBox="0 0 68 68" fill="none" aria-hidden="true">
          <circle cx="34" cy="34" r="26" fill="none" stroke="var(--color-primary-light)" strokeWidth="6" />
          <circle
            cx="34"
            cy="34"
            r="26"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="163.36"
            strokeDashoffset="41"
            transform="rotate(-90 34 34)"
          />
        </svg>
        <span className="font-display font-semibold text-ink">MeterClick</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-ink-soft hidden sm:inline">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;