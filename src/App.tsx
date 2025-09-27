// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import Login from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPassword from '@/pages/ForgotPassword';
import Callback from '@/pages/auth/Callback';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import DashboardLayout from '@/layouts/DashboardLayout';
import Menu from '@/pages/Menu';
import Events from '@/pages/Events';
import Gallery from '@/pages/Gallery';
import LiveOrders from '@/pages/LiveOrders';
import Contact from '@/pages/Contact';
import BookTable from '@/pages/BookTable';
import Reserve from '@/pages/Reserve';
import Home from '@/pages/Home';
import Header from '@/components/Header';
import { useCartStore } from '@/state/cartStore';

const MenuManagement = lazy(() => import('@/pages/MenuManagement'));
const OrderManagement = lazy(() => import('@/pages/OrderManagement'));
const TableManagement = lazy(() => import('@/pages/TableManagement'));
const StaffManagement = lazy(() => import('@/pages/StaffManagement'));
const KDS = lazy(() => import('@/pages/KDS'));
const Branding = lazy(() => import('@/pages/Branding'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const AdminPayments = lazy(() => import('@/pages/AdminPayments'));
const Subscribe = lazy(() => import('@/pages/Subscribe'));
const Billing = lazy(() => import('@/pages/Billing'));
const Paywall = lazy(() => import('@/pages/Paywall'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));

export default function App() {
  const initFromStorage = useCartStore((s) => s.initFromStorage);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={
            <>
              <Header />
              <Login />
            </>
          }
        />
        <Route
          path="/signup"
          element={
            <>
              <Header />
              <SignupPage />
            </>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <>
              <Header />
              <ForgotPassword />
            </>
          }
        />
        <Route path="/auth/callback" element={<Callback />} />

        {/* Public site pages (main header navigation targets) */}
        <Route
          path="/"
          element={
            <>
              <Header />
              <Home />
            </>
          }
        />
        {/* Removed duplicated root "/" route to avoid flickering */}

        {/* If not authenticated, ProtectedRoute will redirect to /login, else to /dashboard */}
        <Route path="/menu" element={<Menu />} />
        <Route path="/events" element={<Events />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/live-orders" element={<LiveOrders />} />
        <Route path="/book-table" element={<BookTable />} />
        <Route path="/reserve" element={<Reserve />} />
        <Route path="/contact" element={<Contact />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="menu-management" element={<MenuManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="table-management" element={<TableManagement />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="kds" element={<KDS />} />
          <Route path="branding" element={<Branding />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="qr" element={<div>QR Page Placeholder</div>} />
          <Route path="checkout" element={<div>Checkout Page Placeholder</div>} />
        </Route>
        {/* End of DashboardLayout routes */}

        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/paywall" element={<Paywall />} />
        {/* End of protected routes */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}