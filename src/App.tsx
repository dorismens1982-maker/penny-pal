import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import Manage from '@/pages/Manage';
import Insights from '@/pages/Insights';
import InsightsPost from '@/pages/InsightsPost';
import Settings from '@/pages/Settings';
import { BlogAdmin } from '@/pages/BlogAdmin';

// Super Admin Imports
import { SuperAdminLayout } from '@/layouts/SuperAdminLayout';
import SuperAdminDashboard from '@/pages/superadmin/Dashboard';
import UsersPage from '@/pages/superadmin/Users';
import ContentPage from '@/pages/superadmin/Content';
import SettingsPage from '@/pages/superadmin/Settings';

import './App.css';

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
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AuthPage />} />

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
            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <Insights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights/:slug"
              element={
                <ProtectedRoute>
                  <InsightsPost />
                </ProtectedRoute>
              }
            />

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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
