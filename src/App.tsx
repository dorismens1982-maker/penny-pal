import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TransactionsProvider } from '@/contexts/TransactionsContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import { InstallPWA } from '@/components/InstallPWA';
import Dashboard from '@/pages/Dashboard';
import Manage from '@/pages/Manage';
import Insights from '@/pages/Insights';
import InsightsPost from '@/pages/InsightsPost';
import InsightsSeries from '@/pages/InsightsSeries';
import Settings from '@/pages/Settings';
import Guide from '@/pages/Guide';
import PublicBlog from '@/pages/PublicBlog';
import AboutPage from '@/pages/AboutPage';
import TermsOfService from '@/pages/TermsOfService';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import CookiePolicy from '@/pages/CookiePolicy';
import Community from '@/pages/Community';


// Super Admin Imports
import { SuperAdminLayout } from '@/layouts/SuperAdminLayout';
import SuperAdminDashboard from '@/pages/superadmin/Dashboard';
import UsersPage from '@/pages/superadmin/Users';
import ContentPage from '@/pages/superadmin/Content';
import SettingsPage from '@/pages/superadmin/Settings';
import SubscribersPage from '@/pages/superadmin/Subscribers';

import { PWAReloadPrompt } from '@/components/PWAReloadPrompt';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
        <AuthProvider>
          <ThemeProvider>
            <TransactionsProvider>
              <Router>
                <InstallPWA />
                <PWAReloadPrompt />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/signup" element={<AuthPage />} />
                  <Route path="/guide" element={<Guide />} />
                  <Route path="/blog" element={<PublicBlog />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/cookies" element={<CookiePolicy />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Protected User Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/manage"
                    element={
                      <ProtectedRoute>
                        <Manage />
                      </ProtectedRoute>
                    }
                  />
                  {/* /blog → /insights redirect for SEO */}
                  <Route path="/blog" element={<Navigate to="/insights" replace />} />
                  <Route path="/blog/:slug" element={<Navigate to="/insights" replace />} />

                  <Route path="/insights" element={<Insights />} />
                  <Route path="/insights/:slug" element={<InsightsPost />} />
                  <Route path="/insights/series/:slug" element={<InsightsSeries />} />

                  {/* Super Admin Routes */}
                  <Route
                    path="/superadmin"
                    element={
                      <ProtectedRoute>
                        <SuperAdminLayout>
                          <SuperAdminDashboard />
                        </SuperAdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/superadmin/users"
                    element={
                      <ProtectedRoute>
                        <SuperAdminLayout>
                          <UsersPage />
                        </SuperAdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/superadmin/subscribers"
                    element={
                      <ProtectedRoute>
                        <SuperAdminLayout>
                          <SubscribersPage />
                        </SuperAdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/superadmin/content"
                    element={
                      <ProtectedRoute>
                        <SuperAdminLayout>
                          <ContentPage />
                        </SuperAdminLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/superadmin/settings"
                    element={
                      <ProtectedRoute>
                        <SuperAdminLayout>
                          <SettingsPage />
                        </SuperAdminLayout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
                <Toaster />
              </Router>
            </TransactionsProvider>
          </ThemeProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
