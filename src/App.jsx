import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { QueueProvider } from './context/QueueContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import MobileDrawer from './components/layout/MobileDrawer';
import Footer from './components/layout/Footer';
import ToastContainer from './components/ui/Toast';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegistrationPage from './pages/RegistrationPage';
import PatientDisplayPage from './pages/PatientDisplayPage';
import PredictionsPage from './pages/PredictionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PriorityReviewPage from './pages/PriorityReviewPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

function AppLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // The Patient Display TV page is full-screen standalone without dashboard chrome
  const isDisplayPage = location.pathname === '/display';
  const isLoginPage = location.pathname === '/login';

  if (isDisplayPage || isLoginPage) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        {children}
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
      <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <MobileDrawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <Footer />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <QueueProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/display" element={<PatientDisplayPage />} />
              <Route path="/predictions" element={<PredictionsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/priority-review" element={<PriorityReviewPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AppLayout>
        </QueueProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
