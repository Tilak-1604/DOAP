import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ScreenList from './components/ScreenList';
import AddScreen from './components/AddScreen';
import ScreenDetail from './components/ScreenDetail';
import EditScreen from './components/EditScreen';
import AdvertiserWorkflow from './components/AdvertiserWorkflow';
import MyBookings from './components/MyBookings';
import MyAds from './components/MyAds';
import BookingEntryPage from './components/BookingEntryPage';
import UploadAdContent from './components/UploadAdContent';
import AdvertiserLayout from './components/Layout/AdvertiserLayout';
import ScreenOwnerLayout from './components/Layout/ScreenOwnerLayout';
import OwnerDashboard from './components/OwnerDashboard';
import OwnerBookings from './components/OwnerBookings';
import OwnerEarnings from './components/OwnerEarnings';
import OwnerInsights from './components/OwnerInsights';
import SpendAndPayments from './components/SpendAndPayments';
import Statistics from './components/Statistics';
import Settings from './components/Settings';
import AdminLayout from './components/Layout/AdminLayout';
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/AdminUsers';
import AdminScreens from './components/AdminScreens';
import AdminBookings from './components/AdminBookings';
import AdminRevenue from './components/AdminRevenue';
import AdminReports from './components/AdminReports';
import AdminSettings from './components/AdminSettings';
import './App.css';

// Google OAuth Client ID - Replace with your actual Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '936617371696-paae599e42u4gtbmos1ulqs4j23d52ja.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRoles={['ADMIN']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="screens" element={<AdminScreens />} />
                <Route path="screens/create" element={<AddScreen />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="revenue" element={<AdminRevenue />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>


              {/* Advertiser Only Route Example */}
              <Route
                path="/advertiser"
                element={
                  <ProtectedRoute requiredRoles={['ADVERTISER']}>
                    <div className="advertiser-page">
                      <h1>Advertiser Panel</h1>
                      <p>This page is only accessible to ADVERTISER users.</p>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Screen Management Routes */}
              <Route
                path="/screens"
                element={
                  <ProtectedRoute requiredRoles={['ADMIN', 'SCREEN_OWNER', 'ADVERTISER']}>
                    <ScreenList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/screens/add"
                element={
                  <ProtectedRoute requiredRoles={['ADMIN', 'SCREEN_OWNER']}>
                    <AddScreen />
                  </ProtectedRoute>
                }
              />

              {/* Advertiser Routes */}
              <Route path="/advertiser" element={
                <ProtectedRoute requiredRoles={['ADVERTISER']}>
                  <AdvertiserLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<Dashboard hideNav={true} />} />
                <Route path="spend" element={<SpendAndPayments />} />
                <Route path="stats" element={<Statistics />} />
                <Route path="settings" element={<Settings />} />
                {/* Redirect /advertiser to dashboard */}
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>

              {/* Screen Owner Routes */}
              <Route path="/owner" element={
                <ProtectedRoute requiredRoles={['SCREEN_OWNER']}>
                  <ScreenOwnerLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<OwnerDashboard />} />
                <Route path="screens" element={<ScreenList />} />
                <Route path="bookings" element={<OwnerBookings />} />
                <Route path="earnings" element={<OwnerEarnings />} />
                <Route path="insights" element={<OwnerInsights />} />
                <Route path="add-screen" element={<AddScreen />} />
                <Route path="screens/edit/:id" element={<EditScreen />} />
                <Route path="screens/:id" element={<ScreenDetail />} />
                <Route path="settings" element={<Settings />} />
                {/* Redirect /owner to dashboard */}
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>

              {/* Legacy Advertiser Routes - Redirect or Keep for backward compatibility if needed, but better to move.
                  For now, Dashboard is reused.
                  However, currently Dashboard is at /dashboard.
                  We want /advertiser/dashboard to be the main one.
                  If user goes to /dashboard, should they see sidebar?
                  If Dashboard component is used inside AdvertiserLayout, it will show sidebar.
                  But the Dashboard component ITSELF has a Navbar (<nav className="dashboard-nav">).
                  We need to remove Navbar from Dashboard if it's rendered inside Layout.
                  Or assume Dashboard is "Overview" content only.
                  Let's update Dashboard to conditionally render Navbar or creating a new DashboardOverview component.
                  For now, I will use Dashboard as is, and it might have double nav.
                  I should probably refactor Dashboard.js to remove inner nav if specific prop is passed, or just hide it via CSS in layout.
              */}

              <Route
                path="/screens/edit/:id"
                element={
                  <ProtectedRoute requiredRoles={['ADMIN', 'SCREEN_OWNER']}>
                    <EditScreen />
                  </ProtectedRoute>
                }
              />



              {/* Booking Entry Route */}
              <Route
                path="/booking-start"
                element={
                  <ProtectedRoute requiredRoles={['ADVERTISER']}>
                    <BookingEntryPage />
                  </ProtectedRoute>
                }
              />

              {/* Standalone Upload Route */}
              <Route
                path="/create-ad"
                element={
                  <ProtectedRoute requiredRoles={['ADVERTISER']}>
                    <UploadAdContent />
                  </ProtectedRoute>
                }
              />

              {/* Advertiser Workflow (Content First Booking) */}
              <Route
                path="/advertiser-workflow"
                element={
                  <ProtectedRoute requiredRoles={['ADVERTISER']}>
                    <AdvertiserWorkflow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute requiredRoles={['ADVERTISER']}>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-ads"
                element={
                  <ProtectedRoute requiredRoles={['ADVERTISER']}>
                    <MyAds />
                  </ProtectedRoute>
                }
              />

              {/* Screen Details Route */}
              <Route
                path="/screens/:id"
                element={
                  <ProtectedRoute requiredRoles={['ADMIN', 'SCREEN_OWNER', 'ADVERTISER']}>
                    <ScreenDetail />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

