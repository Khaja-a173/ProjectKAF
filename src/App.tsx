import React from 'react'
import { Routes, Route } from 'react-router-dom'
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/menu" element={<MenuManagement />} />
        <Route path="/orders" element={<OrderManagement />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}

export default App