import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from 'react';
import HealthBanner from "./health/HealthBanner";
import JoinPinModal from "./components/JoinPinModal";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import BookTable from "./pages/BookTable";
import Reserve from "./pages/Reserve";
import TakeAway from "./pages/TakeAway";
import Dashboard from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import OrderManagement from "./pages/OrderManagement";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import LiveOrders from "./pages/LiveOrders";
import Gallery from "./pages/Gallery";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import TableManagement from "./pages/TableManagement";
import StaffManagement from "./pages/StaffManagement";
import CustomerMenu from "./pages/CustomerMenu";
import ApplicationCustomization from "./pages/ApplicationCustomization";
import KitchenDashboard from "./pages/KitchenDashboard";
import Orders from "./pages/Orders";
import MenuAdmin from "./pages/MenuAdmin";
import Tables from "./pages/Tables";
import Staff from "./pages/Staff";
import KDS from "./pages/KDS";
import Branding from "./pages/Branding";

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [firstPin, setFirstPin] = useState<string | null>(null); // show once to first device

  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get('token');
    if (t) {
      setToken(t);
      fetch('/api/table-session/open', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ token: t })
      }).then(async (r)=>{
        if (r.status === 201) {
          const { pin } = await r.json();
          setFirstPin(pin); // display once to first joiner (e.g., toast)
        } else if (r.status === 409) {
          setShowPin(true);
        } else {
          const j = await r.json().catch(()=>({}));
          alert(`QR invalid: ${j.error ?? r.statusText}`);
        }
      });
    }
  }, []);

  async function handleJoin(pin: string) {
    if (!token) throw new Error('missing token');
    const r = await fetch('/api/table-session/join', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ token, pin })
    });
    if (!r.ok) {
      const j = await r.json().catch(()=>({}));
      throw new Error(j.error ?? 'bad_pin');
    }
    setShowPin(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HealthBanner />
      {firstPin && (
        <div style={{padding:8, background:'#e7f7ee', color:'#0a6b3d'}}>
          Session locked. Share PIN with others: <b>{firstPin}</b>
        </div>
      )}
      <JoinPinModal open={showPin} onSubmit={handleJoin} onClose={()=>setShowPin(false)} />
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
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute requiredDashboard="MENU">
              <MenuManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute requiredDashboard="LIVE_ORDERS">
              <OrderManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requiredDashboard="REPORTS">
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/table-management"
          element={
            <ProtectedRoute requiredDashboard="TABLES">
              <TableManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-management"
          element={
            <ProtectedRoute requiredDashboard="STAFF">
              <StaffManagement />
            </ProtectedRoute>
          }
        />
        <Route path="/customer-menu" element={<CustomerMenu />} />
        <Route
          path="/application-customization"
          element={
            <ProtectedRoute requiredDashboard="CUSTOMIZATION">
              <ApplicationCustomization />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/menu-admin"
          element={
            <ProtectedRoute>
              <MenuAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tables"
          element={
            <ProtectedRoute>
              <Tables />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <Staff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kds"
          element={
            <ProtectedRoute>
              <KDS />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branding"
          element={
            <ProtectedRoute>
              <Branding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kitchen-dashboard"
          element={
            <ProtectedRoute requiredDashboard="KITCHEN">
              <KitchenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/kitchen"
          element={
            <ProtectedRoute requiredDashboard="KITCHEN">
              <KitchenDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
