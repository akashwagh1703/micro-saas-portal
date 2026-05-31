import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import PrivacyPolicy from './pages/auth/PrivacyPolicy';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Leads from './pages/Leads';
import Inbox from './pages/Inbox';
import Workflows from './pages/Workflows';
import WorkflowBuilder from './pages/WorkflowBuilder';
import WorkflowExecutions from './pages/WorkflowExecutions';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

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
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
