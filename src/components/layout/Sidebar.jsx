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
  Globe,
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
  { to: '/website-leads', icon: Globe, label: 'Website Leads', hint: 'Demo requests from website' },
  { to: '/career-ai', icon: Briefcase, label: 'CareerAI', hint: 'Jobs & job seekers' },
  { to: '/settings', icon: Settings, label: 'Settings', hint: 'WhatsApp, CareerAI & billing' },
];

const careerNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home', hint: 'Setup progress' },
  { to: '/career-ai', icon: Briefcase, label: 'CareerAI', hint: 'Jobs & candidates' },
  { to: '/inbox', icon: Inbox, label: 'Messages', hint: 'WhatsApp chats' },
  { to: '/settings', icon: Settings, label: 'Settings', hint: 'WhatsApp & AI keys' },
];

const adminNavItem = { to: '/admin', icon: Shield, label: 'Platform admin', hint: 'All users & billing', admin: true };

function NavItem({ to, icon: Icon, label, hint, isAdmin, onNavClick }) {
  return (
    <NavLink
      to={to}
      onClick={onNavClick}
      className={({ isActive }) =>
        `group block rounded-xl px-3 py-2.5 transition duration-200 ${
          isActive
            ? isAdmin
              ? 'nav-active-admin'
              : 'nav-active'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <Icon
              size={18}
              strokeWidth={isActive ? 2 : 1.75}
              className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}
            />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <p
            className={`mt-0.5 pl-9 text-[11px] leading-snug ${
              isActive ? 'text-white/75' : 'text-slate-600 group-hover:text-slate-500'
            }`}
          >
            {hint}
          </p>
        </>
      )}
    </NavLink>
  );
}

function NavSection({ label, items, onNavClick }) {
  if (!items.length) return null;
  return (
    <div className="space-y-1">
      {label && (
        <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          {label}
        </p>
      )}
      {items.map((item) => (
        <NavItem key={item.to} {...item} onNavClick={onNavClick} />
      ))}
    </div>
  );
}

export default function Sidebar({ billing, businessCategory, mobileOpen = false, onNavClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isSuperAdmin = !!user?.is_super_admin;
  const isCareerAi = businessCategory === 'career_ai';

  const workspaceItems = isSuperAdmin
    ? defaultNavItems
    : isCareerAi
      ? careerNavItems
      : defaultNavItems.filter(
          (item) => item.to !== '/career-ai' || businessCategory === 'career_ai',
        );

  const navGroups = isSuperAdmin
    ? [
        { label: 'Platform', items: [adminNavItem] },
        { label: 'Workspace', items: workspaceItems },
      ]
    : [{ label: null, items: workspaceItems }];

  const handleLogout = async () => {
    onNavClick?.();
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    dispatch(logout());
    toast.success('Logged out');
    navigate('/login');
  };

  const initial = (user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-full min-h-0 w-[17.5rem] shrink-0 flex-col border-r border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 shadow-xl shadow-slate-950/40 transition-transform duration-200 md:relative md:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-500/10 to-transparent" />

      <div className="relative shrink-0 border-b border-white/5 px-5 py-5">
        <AutoWaveMark variant="dark" showTagline={!isCareerAi && !isSuperAdmin} />
        {isSuperAdmin && (
          <p className="mt-3 rounded-xl bg-violet-500/15 px-3 py-2 text-[11px] font-medium text-violet-200 ring-1 ring-violet-400/20">
            Super admin · Full platform access
          </p>
        )}
        {isCareerAi && !isSuperAdmin && (
          <p className="mt-3 rounded-xl bg-emerald-500/15 px-3 py-2 text-[11px] font-medium text-emerald-200 ring-1 ring-emerald-400/20">
            CareerAI · Job seeker bot
          </p>
        )}
        {!isSuperAdmin && (
          <div className="mt-2">
            <BillingSidebarBadge billing={billing} dark />
          </div>
        )}
      </div>

      <nav className="sidebar-scroll relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-2">
        {navGroups.map((group) => (
          <NavSection key={group.label || 'main'} {...group} onNavClick={onNavClick} />
        ))}
      </nav>

      <div className="relative shrink-0 border-t border-white/5 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white shadow-md shadow-emerald-500/30">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name || 'Operator'}</p>
            <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}
