import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Workflow,
  Inbox,
  Users,
  Settings,
  LogOut,
  MessageCircle,
} from 'lucide-react';
import api from '../../services/api';
import { logout } from '../../store/authSlice';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/workflows', icon: Workflow, label: 'Workflows' },
  { to: '/inbox', icon: Inbox, label: 'Inbox' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    dispatch(logout());
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <MessageCircle size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">WhatsFlow</p>
          <p className="text-xs text-slate-500">Workflow Automation</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
