import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Workflow,
  Inbox,
  Users,
  UserPlus,
  Briefcase,
  Settings,
  Shield,
  LogOut,
} from 'lucide-react';
import api from '../../services/api';
import { logout } from '../../store/authSlice';
import toast from 'react-hot-toast';
import { BillingSidebarBadge } from '../billing/BillingBanner';
import { AutoWaveMark } from '../brand/AutoWaveBrand';

const defaultNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home', hint: 'Setup & overview' },
  { to: '/workflows', icon: Workflow, label: 'Auto-replies', hint: 'Turn bots on or off' },
  { to: '/inbox', icon: Inbox, label: 'Messages', hint: 'Customer chats' },
  { to: '/contacts', icon: Users, label: 'Contacts', hint: 'People who messaged you' },
  { to: '/leads', icon: UserPlus, label: 'Leads', hint: 'Captured from auto-replies' },
  { to: '/career-ai', icon: Briefcase, label: 'CareerAI', hint: 'Jobs & job seekers' },
  { to: '/settings', icon: Settings, label: 'Settings', hint: 'WhatsApp, CareerAI & billing' },
];

const careerNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home', hint: 'Setup progress' },
  { to: '/career-ai', icon: Briefcase, label: 'CareerAI', hint: 'Jobs & candidates' },
  { to: '/inbox', icon: Inbox, label: 'Messages', hint: 'WhatsApp chats' },
  { to: '/settings', icon: Settings, label: 'Settings', hint: 'WhatsApp & AI keys' },
];

export default function Sidebar({ billing, businessCategory }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isSuperAdmin = !!user?.is_super_admin;
  const isCareerAi = businessCategory === 'career_ai';

  const adminNavItem = { to: '/admin', icon: Shield, label: 'Platform admin', hint: 'All users & billing' };

  const visibleNavItems = isSuperAdmin
    ? [adminNavItem, ...defaultNavItems]
    : isCareerAi
      ? careerNavItems
      : defaultNavItems.filter(
          (item) => item.to !== '/career-ai' || businessCategory === 'career_ai',
        );

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
    <aside className="flex h-full w-64 flex-col border-r border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5">
        <AutoWaveMark showTagline={!isCareerAi && !isSuperAdmin} />
        {isSuperAdmin && (
          <p className="mt-2 rounded-lg bg-violet-50 px-2.5 py-1.5 text-[11px] font-medium text-violet-800">
            Super admin · Full platform access
          </p>
        )}
        {isCareerAi && !isSuperAdmin && (
          <p className="mt-2 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium text-emerald-800">
            CareerAI · Job seeker bot
          </p>
        )}
        <div className="mt-2">
          {!isSuperAdmin && <BillingSidebarBadge billing={billing} />}
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {visibleNavItems.map(({ to, icon: Icon, label, hint }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block rounded-xl px-3 py-2.5 transition ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500'} />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <p
                  className={`mt-0.5 pl-9 text-[11px] ${
                    isActive ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
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
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}
