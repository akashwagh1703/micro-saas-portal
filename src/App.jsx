import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import ProtectedRoute from './components/ProtectedRoute';
import NonCareerAiRoute from './components/NonCareerAiRoute';
import SuperAdminRoute from './components/SuperAdminRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import PageLoader from './components/ui/PageLoader';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const PrivacyPolicy = lazy(() => import('./pages/auth/PrivacyPolicy'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Contacts = lazy(() => import('./pages/Contacts'));
const Leads = lazy(() => import('./pages/Leads'));
const WebsiteLeads = lazy(() => import('./pages/WebsiteLeads'));
const Inbox = lazy(() => import('./pages/Inbox'));
const Workflows = lazy(() => import('./pages/Workflows'));
const WorkflowBuilder = lazy(() => import('./pages/WorkflowBuilder'));
const WorkflowExecutions = lazy(() => import('./pages/WorkflowExecutions'));
const InteractiveTemplates = lazy(() => import('./pages/InteractiveTemplates'));
const Settings = lazy(() => import('./pages/Settings'));
const Admin = lazy(() => import('./pages/Admin'));
const CareerAI = lazy(() => import('./pages/CareerAI'));
const CareerSeekerPortal = lazy(() => import('./pages/CareerSeekerPortal'));

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
        <Toaster
          position="top-right"
          toastOptions={{
            className: '!rounded-xl !border !border-slate-200/80 !bg-white/95 !text-slate-800 !shadow-lg !text-sm !font-medium',
            success: { iconTheme: { primary: '#059669', secondary: '#ecfdf5' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fef2f2' } },
          }}
        />
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
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/settings" element={<Settings />} />
              <Route element={<NonCareerAiRoute />}>
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/workflows" element={<Workflows />} />
                <Route path="/workflows/:id/edit" element={<WorkflowBuilder />} />
                <Route path="/workflows/:id/executions" element={<WorkflowExecutions />} />
                <Route path="/templates" element={<InteractiveTemplates />} />
              </Route>
              <Route
                path="/website-leads"
                element={
                  <SuperAdminRoute>
                    <WebsiteLeads />
                  </SuperAdminRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <SuperAdminRoute>
                    <Admin />
                  </SuperAdminRoute>
                }
              />
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
