// import { NavLink, Link, useNavigate } from 'react-router-dom';

import { NavLink, Link, useNavigate } from 'react-router-dom'; // 👈 加上 useNavigate
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Gauge, LogOut, Plus, X } from 'lucide-react';


const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/meters', label: 'Meters', icon: Gauge },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // 👈 现在可以用了

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const content = (
    <>
      {/* Project name – visible only on mobile overlay */}
      <div className="flex items-center justify-between lg:hidden mb-6">
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
        <button
          onClick={onClose}
          className="p-1 text-ink-soft hover:text-ink transition lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>
      </div>

      <Link
        to="/meters/new"
        onClick={onClose}
        className="flex items-center justify-center gap-1.5 bg-primary text-white text-sm font-medium rounded-[10px] py-2.5 mb-6 hover:bg-primary-dark transition"
      >
        <Plus size={16} />
        Add meter
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm font-medium transition ${
                isActive ? 'bg-primary-light text-primary-dark' : 'text-ink-soft hover:bg-surface hover:text-ink'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line pt-4 mt-4">
        <p className="px-3 text-sm text-ink mb-2 truncate">{user?.name}</p>
        <button
          onClick={() => { handleLogout(); onClose(); }}
          className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-[10px] text-sm font-medium text-ink-soft hover:bg-surface hover:text-ink transition"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 lg:hidden z-40 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-60 shrink-0
          bg-paper border-r border-line px-4 py-4
          transition-transform duration-300 ease-in-out
          flex flex-col
          lg:h-[calc(100vh-4rem)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {content}
      </aside>
    </>
  );
};

export default Sidebar;