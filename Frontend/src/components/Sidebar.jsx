import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Gauge, LogOut, Plus } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/meters', label: 'Meters', icon: Gauge },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-[calc(100vh-4rem)] sticky top-16 border-r border-line bg-paper px-4 py-4">
      {/* Removed the logo block – now starts directly with the "Add meter" button */}
      <Link
        to="/meters/new"
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
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-[10px] text-sm font-medium text-ink-soft hover:bg-surface hover:text-ink transition"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;