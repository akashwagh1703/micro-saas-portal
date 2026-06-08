import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Workflow,
  Inbox,
  Users,
  UserPlus,
  Briefcase,
  Settings,
  LogOut,
  MessageCircle,
} from 'lucide-react';
import api from '../../services/api';
import { logout } from '../../store/authSlice';
import toast from 'react-hot-toast';
import { BillingSidebarBadge } from '../billing/BillingBanner';
import { AutoWaveMark } from '../brand/AutoWaveBrand';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home', hint: 'Your setup progress' },
  { to: '/workflows', icon: Workflow, label: 'Auto-replies', hint: 'Turn bots on or off' },
  { to: '/inbox', icon: Inbox, label: 'Messages', hint: 'Customer chats' },
  { to: '/contacts', icon: Users, label: 'Contacts', hint: 'People who messaged you' },
  { to: '/leads', icon: UserPlus, label: 'Leads', hint: 'Captured from auto-replies' },
  { to: '/career-ai', icon: Briefcase, label: 'CareerAI', hint: 'Jobs, resumes & applications' },
  { to: '/settings', icon: Settings, label: 'Settings', hint: 'WhatsApp, Instagram & AI' },
];

export default function Sidebar({ billing }) {
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
      <div className="border-b border-slate-100 px-5 py-5">
        <AutoWaveMark showTagline />
        <div className="mt-2">
          <BillingSidebarBadge billing={billing} />
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, icon: Icon, label, hint }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2.5 transition ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-emerald-600' : ''} />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <p className={`mt-0.5 pl-9 text-[11px] ${isActive ? 'text-emerald-600/80' : 'text-slate-400'}`}>
                  {hint}
                </p>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}
