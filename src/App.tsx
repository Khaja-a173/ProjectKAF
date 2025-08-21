import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import Home from './pages/Home'
import Menu from './pages/Menu'
import BookTable from './pages/BookTable'
import Reserve from './pages/Reserve'
import TakeAway from './pages/TakeAway'
import Dashboard from './pages/Dashboard'
import MenuManagement from './pages/MenuManagement'
import OrderManagement from './pages/OrderManagement'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import LiveOrders from './pages/LiveOrders'
import Gallery from './pages/Gallery'
import Events from './pages/Events'
import Contact from './pages/Contact'
import TableManagement from './pages/TableManagement'
import StaffManagement from './pages/StaffManagement'
import CustomerMenu from './pages/CustomerMenu'
import ApplicationCustomization from './pages/ApplicationCustomization'
import KitchenDashboard from './pages/KitchenDashboard'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/book-table" element={<BookTable />} />
        <Route path="/reserve" element={<Reserve />} />
        <Route path="/take-away" element={<TakeAway />} />
        <Route path="/live-orders" element={<LiveOrders />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/events" element={<Events />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/menu" element={
          <ProtectedRoute requiredDashboard="MENU">
            <MenuManagement />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute requiredDashboard="LIVE_ORDERS">
            <OrderManagement />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute requiredDashboard="REPORTS">
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={<Settings />} />
        <Route path="/table-management" element={
          <ProtectedRoute requiredDashboard="TABLES">
            <TableManagement />
          </ProtectedRoute>
        } />
        <Route path="/staff-management" element={
          <ProtectedRoute requiredDashboard="STAFF">
            <StaffManagement />
          </ProtectedRoute>
        } />
        <Route path="/customer-menu" element={<CustomerMenu />} />
        <Route path="/application-customization" element={
          <ProtectedRoute requiredDashboard="CUSTOMIZATION">
            <ApplicationCustomization />
          </ProtectedRoute>
        } />
        <Route path="/kitchen-dashboard" element={
          <ProtectedRoute requiredDashboard="KITCHEN">
            <KitchenDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/kitchen" element={
          <ProtectedRoute requiredDashboard="KITCHEN">
            <KitchenDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default App