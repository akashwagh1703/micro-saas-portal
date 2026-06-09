import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const PrivacyPolicy = lazy(() => import('./pages/auth/PrivacyPolicy'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Contacts = lazy(() => import('./pages/Contacts'));
const Leads = lazy(() => import('./pages/Leads'));
const Inbox = lazy(() => import('./pages/Inbox'));
const Workflows = lazy(() => import('./pages/Workflows'));
const WorkflowBuilder = lazy(() => import('./pages/WorkflowBuilder'));
const WorkflowExecutions = lazy(() => import('./pages/WorkflowExecutions'));
const Settings = lazy(() => import('./pages/Settings'));
const CareerAI = lazy(() => import('./pages/CareerAI'));
const CareerSeekerPortal = lazy(() => import('./pages/CareerSeekerPortal'));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
        <Toaster position="top-right" />
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/career/seeker" element={<CareerSeekerPortal />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/workflows/:id/edit" element={<WorkflowBuilder />} />
              <Route path="/workflows/:id/executions" element={<WorkflowExecutions />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/career-ai" element={<CareerAI />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </Provider>
  );
}
