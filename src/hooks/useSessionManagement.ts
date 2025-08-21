import { useState, useEffect, useCallback } from 'react'
import { TableSession, SessionCart, CartItem, DineInOrder, OrderItem, Payment, RealtimeEvent } from '../types/session'

// Global state for session management (simulating real-time sync)
let globalSessionState: {
  sessions: TableSession[]
  carts: SessionCart[]
  orders: DineInOrder[]
  payments: Payment[]
} = {
  sessions: [],
  carts: [],
  orders: [],
  payments: []
}

// Safe empty cart template
const EMPTY_CART = {
  id: '',
  sessionId: '',
  tenantId: '',
  locationId: '',
  status: 'active' as const,
  items: [],
  subtotalMinor: 0,
  taxMinor: 0,
  totalMinor: 0,
  currency: 'INR',
  lastActivity: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
}

// Safe storage utility
const safeStore = {
  get(key: string) {
    try {
      if (typeof window === 'undefined') return null
      const raw = window.localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch { 
      return null 
    }
  },
  set(key: string, value: unknown) {
    try {
      if (typeof window === 'undefined') return
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch { 
      /* swallow */ 
    }
  }
}

const sessionSubscribers: Set<(state: typeof globalSessionState) => void> = new Set()

const notifySessionSubscribers = () => {
  console.log('🔄 Notifying session subscribers of changes')
  sessionSubscribers.forEach(callback => callback({ ...globalSessionState }))
}

const updateGlobalSession = (updater: (prev: typeof globalSessionState) => typeof globalSessionState) => {
  globalSessionState = updater(globalSessionState)
  console.log('📝 Session state updated:', {
    sessions: globalSessionState.sessions.length,
    carts: globalSessionState.carts.length,
    orders: globalSessionState.orders.length,
    payments: globalSessionState.payments.length
  })
  notifySessionSubscribers()
}

const broadcastEvent = (event: RealtimeEvent) => {
  console.log('📡 Broadcasting event:', event.type, event)
  // In real app, this would use WebSocket/SSE
  setTimeout(() => {
    notifySessionSubscribers()
  }, 100)
}

// Currency exponent helper
const getCurrencyExponent = (currency: string): number => {
  const CURRENCY_EXPONENTS: Record<string, number> = { 
    KWD: 3, BHD: 3, OMR: 3, // 3 decimal places
    JPY: 0, KRW: 0,          // 0 decimal places
    // Default: 2 decimal places for INR, AUD, USD, EUR, etc.
  }
  return CURRENCY_EXPONENTS[currency] ?? 2
}

interface UseSessionManagementProps {
  tenantId: string
  locationId: string
}

export function useSessionManagement({ tenantId, locationId }: UseSessionManagementProps) {
  const [sessions, setSessions] = useState<TableSession[]>([])
  const [carts, setCarts] = useState<SessionCart[]>([])
  const [orders, setOrders] = useState<DineInOrder[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  // Subscribe to global session changes
  useEffect(() => {
    const updateState = (newState: typeof globalSessionState) => {
      console.log('🔄 Received session update:', {
        sessions: newState.sessions.length,
        orders: newState.orders.length
      })
      setSessions(newState.sessions)
      setCarts(newState.carts)
      setOrders(newState.orders)
      setPayments(newState.payments)
      setLoading(false)
    }
    
    sessionSubscribers.add(updateState)
    
    // Initialize with current global state
    updateState(globalSessionState)
    
    return () => {
      sessionSubscribers.delete(updateState)
    }
  }, [])

  const createTableSession = useCallback(async (tableId: string, customerData?: Partial<TableSession>) => {
    try {
      console.log('🪑 Creating table session for:', tableId)
      
      // Check for existing active session (idempotent)
      const existingSession = globalSessionState.sessions.find(
        s => s.tableId === tableId && s.status === 'active'
      )
      
      if (existingSession) {
        console.log('♻️ Reusing existing session:', existingSession.id)
        return existingSession
      }

      const newSession: TableSession = {
        id: `session_${Date.now()}`,
        tenantId,
        locationId,
        tableId,
        status: 'active',
        customerName: customerData?.customerName,
        customerEmail: customerData?.customerEmail,
        customerPhone: customerData?.customerPhone,
        partySize: customerData?.partySize || 2,
        startedAt: new Date(),
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Create associated cart
      const newCart: SessionCart = {
        id: `cart_${Date.now()}`,
        sessionId: newSession.id,
        tenantId,
        locationId,
        status: 'active',
        items: [],
        subtotalMinor: 0,
        taxMinor: 0,
        totalMinor: 0,
        currency: 'INR', // Default currency
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      updateGlobalSession(prev => ({
        ...prev,
        sessions: [...prev.sessions, newSession],
        carts: [...prev.carts, newCart]
      }))

      // Broadcast table session started
      broadcastEvent({
        type: 'table.session.started',
        tenantId,
        locationId,
        tableId,
        sessionId: newSession.id,
        data: { session: newSession },
        timestamp: new Date()
      })

      console.log('✅ Table session created:', newSession.id)
      return newSession
    } catch (err) {
      console.error('❌ Failed to create table session:', err)
      throw new Error('Failed to create table session')
    }
  }, [tenantId, locationId])

  const addToCart = useCallback(async (sessionId: string, menuItemId: string, quantity: number, customizations?: any, specialInstructions?: string) => {
    try {
      console.log('🛒 Adding to cart:', { sessionId, menuItemId, quantity })
      
      const cart = globalSessionState.carts.find(c => c.sessionId === sessionId)
      if (!cart) throw new Error('Cart not found')
      
      if (cart.status === 'locked') {
        throw new Error('Cart is locked - order is being processed')
      }

      // Mock menu item data (in real app, fetch from menu)
      const mockMenuItems: Record<string, any> = {
        'itm_1': { name: 'Truffle Arancini', price: 16.00, allergens: ['dairy', 'gluten'], isVegetarian: true, isVegan: false, spicyLevel: 0 },
        'itm_2': { name: 'Pan-Seared Scallops', price: 24.00, allergens: ['shellfish'], isVegetarian: false, isVegan: false, spicyLevel: 0 },
        'itm_3': { name: 'Wagyu Beef Tenderloin', price: 65.00, allergens: [], isVegetarian: false, isVegan: false, spicyLevel: 0 },
        'itm_4': { name: 'Grilled Atlantic Salmon', price: 32.00, allergens: ['fish'], isVegetarian: false, isVegan: false, spicyLevel: 0 }
      }

      const menuItem = mockMenuItems[menuItemId] || {
        name: 'Unknown Item',
        price: 15.99,
        allergens: [],
        isVegetarian: false,
        isVegan: false,
        spicyLevel: 0
      }

      const existingItem = cart.items.find(item => 
        item.menuItemId === menuItemId && 
        JSON.stringify(item.customizations) === JSON.stringify(customizations)
      )

      let updatedItems: CartItem[]
      
      if (existingItem) {
        // Update quantity of existing item
        updatedItems = cart.items.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `cartitem_${Date.now()}`,
          cartId: cart.id,
          menuItemId,
          name: menuItem.name,
          price: menuItem.price,
          quantity,
          customizations,
          specialInstructions,
          allergens: menuItem.allergens,
          isVegetarian: menuItem.isVegetarian,
          isVegan: menuItem.isVegan,
          spicyLevel: menuItem.spicyLevel,
          addedAt: new Date()
        }
        updatedItems = [...cart.items, newItem]
      }

      const subtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const taxAmount = subtotal * 0.08
      const totalAmount = subtotal + taxAmount
      
      // Convert to minor units
      const exponent = getCurrencyExponent('INR')
      const subtotalMinor = Math.round(subtotal * Math.pow(10, exponent))
      const taxMinor = Math.round(taxAmount * Math.pow(10, exponent))
      const totalMinor = Math.round(totalAmount * Math.pow(10, exponent))

      updateGlobalSession(prev => ({
        ...prev,
        carts: prev.carts.map(c =>
          c.sessionId === sessionId
            ? {
                ...c,
                items: updatedItems,
                subtotalMinor,
                taxMinor,
                totalMinor,
                lastActivity: new Date(),
                updatedAt: new Date()
              }
            : c
        ),
        sessions: prev.sessions.map(s =>
          s.id === sessionId
            ? { ...s, lastActivity: new Date(), updatedAt: new Date() }
            : s
        )
      }))

      console.log('✅ Item added to cart successfully')
      return updatedItems
    } catch (err) {
      console.error('❌ Failed to add to cart:', err)
      throw err
    }
  }, [])

  const updateCartQuantity = useCallback(async (cartItemId: string, newQuantity: number) => {
    try {
      console.log('🔄 Updating cart item quantity:', cartItemId, newQuantity)
      
      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        return removeFromCart(cartItemId)
      }

      updateGlobalSession(prev => ({
        ...prev,
        carts: prev.carts.map(cart => {
          const updatedItems = cart.items.map(item => {
            if (item.id === cartItemId) {
              return { ...item, quantity: newQuantity }
            }
            return item
          })
          
          const subtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          const taxAmount = subtotal * 0.08
          const totalAmount = subtotal + taxAmount
          
          // Convert to minor units
          const exponent = getCurrencyExponent('INR')
          const subtotalMinor = Math.round(subtotal * Math.pow(10, exponent))
          const taxMinor = Math.round(taxAmount * Math.pow(10, exponent))
          const totalMinor = Math.round(totalAmount * Math.pow(10, exponent))

          return {
            ...cart,
            items: updatedItems,
            subtotalMinor,
            taxMinor,
            totalMinor,
            lastActivity: new Date(),
            updatedAt: new Date()
          }
        })
      }))

      console.log('✅ Cart quantity updated successfully')
    } catch (err) {
      console.error('❌ Failed to update cart quantity:', err)
      throw err
    }
  }, [])

  const removeFromCart = useCallback(async (cartItemId: string) => {
    try {
      console.log('🗑️ Removing item from cart:', cartItemId)
      
      updateGlobalSession(prev => ({
        ...prev,
        carts: prev.carts.map(cart => {
          const updatedItems = cart.items.filter(item => item.id !== cartItemId)
          const subtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          const taxAmount = subtotal * 0.08
          const totalAmount = subtotal + taxAmount
          
          // Convert to minor units
          const exponent = getCurrencyExponent('INR')
          const subtotalMinor = Math.round(subtotal * Math.pow(10, exponent))
          const taxMinor = Math.round(taxAmount * Math.pow(10, exponent))
          const totalMinor = Math.round(totalAmount * Math.pow(10, exponent))

          return {
            ...cart,
            items: updatedItems,
            subtotalMinor,
            taxMinor,
            totalMinor,
            lastActivity: new Date(),
            updatedAt: new Date()
          }
        })
      }))

      console.log('✅ Item removed from cart successfully')
    } catch (err) {
      console.error('❌ Failed to remove from cart:', err)
      throw err
    }
  }, [])

  const placeOrder = useCallback(async (sessionId: string, specialInstructions?: string) => {
    try {
      console.log('📝 Placing order for session:', sessionId)
      
      const session = globalSessionState.sessions.find(s => s.id === sessionId)
      const cart = globalSessionState.carts.find(c => c.sessionId === sessionId)
      
      if (!session || !cart) throw new Error('Session or cart not found')
      if (cart.items.length === 0) throw new Error('Cart is empty')
      if (cart.status === 'locked') throw new Error('Order already being processed')

      const orderNumber = `#ORD-${Date.now()}`
      const orderId = `order_${Date.now()}`
      
      const newOrder: DineInOrder = {
        id: orderId,
        orderNumber,
        tenantId,
        locationId,
        sessionId,
        tableId: session.tableId,
        status: 'placed',
        items: cart.items.map(cartItem => ({
          id: `orderitem_${Date.now()}_${cartItem.id}`,
          orderId: orderId,
          menuItemId: cartItem.menuItemId,
          name: cartItem.name,
          quantity: cartItem.quantity,
          unitPrice: cartItem.price,
          totalPrice: cartItem.price * cartItem.quantity,
          status: 'queued',
          station: 'hot', // Mock station assignment
          customizations: cartItem.customizations,
          specialInstructions: cartItem.specialInstructions,
          allergens: cartItem.allergens,
          isVegetarian: cartItem.isVegetarian,
          isVegan: cartItem.isVegan,
          spicyLevel: cartItem.spicyLevel,
          preparationTime: 15, // Mock prep time
          createdAt: new Date(),
          updatedAt: new Date()
        })),
        subtotal: cart.subtotalMinor / Math.pow(10, getCurrencyExponent(cart.currency || 'INR')),
        taxAmount: cart.taxMinor / Math.pow(10, getCurrencyExponent(cart.currency || 'INR')),
        tipAmount: 0,
        totalAmount: cart.totalMinor / Math.pow(10, getCurrencyExponent(cart.currency || 'INR')),
        specialInstructions,
        priority: 'normal',
        placedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Lock cart and add order
      updateGlobalSession(prev => ({
        ...prev,
        carts: prev.carts.map(c =>
          c.sessionId === sessionId
            ? { ...c, status: 'locked' as const, updatedAt: new Date() }
            : c
        ),
        orders: [...prev.orders, newOrder],
        sessions: prev.sessions.map(s =>
          s.id === sessionId
            ? { ...s, lastActivity: new Date(), updatedAt: new Date() }
            : s
        )
      }))

      // Broadcast order placed
      broadcastEvent({
        type: 'order.placed',
        tenantId,
        locationId,
        tableId: session.tableId,
        sessionId,
        orderId: newOrder.id,
        data: { order: newOrder },
        timestamp: new Date(),
        actor: {
          userId: 'customer',
          role: 'customer',
          name: session.customerName || 'Guest'
        }
      })

      console.log('✅ Order placed successfully:', newOrder.orderNumber)
      return newOrder
    } catch (err) {
      console.error('❌ Failed to place order:', err)
      throw err
    }
  }, [tenantId, locationId])

  const confirmOrder = useCallback(async (orderId: string, staffId: string) => {
    try {
      console.log('✅ Confirming order:', orderId)
      
      updateGlobalSession(prev => ({
        ...prev,
        orders: prev.orders.map(order =>
          order.id === orderId
            ? {
                ...order,
                status: 'confirmed' as const,
                confirmedAt: new Date(),
                estimatedReadyAt: new Date(Date.now() + 20 * 60 * 1000), // 20 min estimate
                updatedAt: new Date()
              }
            : order
        ),
        carts: prev.carts.map(cart => {
          const order = prev.orders.find(o => o.id === orderId)
          return cart.sessionId === order?.sessionId
            ? { ...cart, status: 'active' as const, updatedAt: new Date() }
            : cart
        })
      }))

      // Broadcast order confirmed
      const order = globalSessionState.orders.find(o => o.id === orderId)
      if (order) {
        broadcastEvent({
          type: 'order.confirmed',
          tenantId,
          locationId,
          tableId: order.tableId,
          sessionId: order.sessionId,
          orderId,
          data: { order },
          timestamp: new Date(),
          actor: {
            userId: staffId,
            role: 'manager',
            name: 'Manager'
          }
        })
      }

      console.log('✅ Order confirmed successfully')
    } catch (err) {
      console.error('❌ Failed to confirm order:', err)
      throw err
    }
  }, [tenantId, locationId])

  const cancelOrder = useCallback(async (orderId: string, reason: string, staffId: string) => {
    try {
      console.log('❌ Cancelling order:', orderId, 'Reason:', reason)
      
      updateGlobalSession(prev => ({
        ...prev,
        orders: prev.orders.map(order =>
          order.id === orderId
            ? {
                ...order,
                status: 'cancelled' as const,
                cancelledAt: new Date(),
                cancellationReason: reason,
                updatedAt: new Date()
              }
            : order
        ),
        carts: prev.carts.map(cart => {
          const order = prev.orders.find(o => o.id === orderId)
          return cart.sessionId === order?.sessionId
            ? { ...cart, status: 'active' as const, updatedAt: new Date() }
            : cart
        })
      }))

      // Broadcast order cancelled
      const order = globalSessionState.orders.find(o => o.id === orderId)
      if (order) {
        broadcastEvent({
          type: 'order.cancelled',
          tenantId,
          locationId,
          tableId: order.tableId,
          sessionId: order.sessionId,
          orderId,
          data: { order, reason },
          timestamp: new Date(),
          actor: {
            userId: staffId,
            role: 'manager',
            name: 'Manager'
          }
        })
      }

      console.log('✅ Order cancelled successfully')
    } catch (err) {
      console.error('❌ Failed to cancel order:', err)
      throw err
    }
  }, [tenantId, locationId])

  const startOrderItem = useCallback(async (itemId: string, chefId: string) => {
    try {
      console.log('🔥 Starting order item:', itemId)
      
      updateGlobalSession(prev => ({
        ...prev,
        orders: prev.orders.map(order => ({
          ...order,
          items: order.items.map(item =>
            item.id === itemId
              ? {
                  ...item,
                  status: 'in_progress' as const,
                  startedAt: new Date(),
                  assignedChef: chefId,
                  updatedAt: new Date()
                }
              : item
          ),
          status: order.items.some(i => i.id === itemId) ? 'preparing' as const : order.status,
          updatedAt: new Date()
        }))
      }))

      // Broadcast item started
      const order = globalSessionState.orders.find(o => o.items.some(i => i.id === itemId))
      if (order) {
        broadcastEvent({
          type: 'item.started',
          tenantId,
          locationId,
          tableId: order.tableId,
          sessionId: order.sessionId,
          orderId: order.id,
          itemId,
          data: { itemId, chefId },
          timestamp: new Date(),
          actor: {
            userId: chefId,
            role: 'chef',
            name: 'Chef'
          }
        })

        // If order status changed to preparing, broadcast that too
        if (order.status !== 'preparing') {
          broadcastEvent({
            type: 'order.preparing',
            tenantId,
            locationId,
            tableId: order.tableId,
            sessionId: order.sessionId,
            orderId: order.id,
            data: { order },
            timestamp: new Date()
          })
        }
      }

      console.log('✅ Order item started successfully')
    } catch (err) {
      console.error('❌ Failed to start order item:', err)
      throw err
    }
  }, [tenantId, locationId])

  const markItemReady = useCallback(async (itemId: string, chefId: string) => {
    try {
      console.log('✅ Marking item ready:', itemId)
      
      updateGlobalSession(prev => ({
        ...prev,
        orders: prev.orders.map(order => {
          const updatedItems = order.items.map(item =>
            item.id === itemId
              ? {
                  ...item,
                  status: 'ready_item' as const,
                  readyAt: new Date(),
                  updatedAt: new Date()
                }
              : item
          )
          
          // Check if all items are ready
          const allItemsReady = updatedItems.every(item => 
            item.status === 'ready_item' || item.status === 'served_item'
          )
          
          return {
            ...order,
            items: updatedItems,
            status: allItemsReady ? 'ready' as const : order.status,
            readyAt: allItemsReady ? new Date() : order.readyAt,
            updatedAt: new Date()
          }
        })
      }))

      // Broadcast item ready
      const order = globalSessionState.orders.find(o => o.items.some(i => i.id === itemId))
      if (order) {
        broadcastEvent({
          type: 'item.ready',
          tenantId,
          locationId,
          tableId: order.tableId,
          sessionId: order.sessionId,
          orderId: order.id,
          itemId,
          data: { itemId },
          timestamp: new Date(),
          actor: {
            userId: chefId,
            role: 'chef',
            name: 'Chef'
          }
        })

        // Check if order is now ready
        const updatedOrder = globalSessionState.orders.find(o => o.id === order.id)
        if (updatedOrder?.status === 'ready') {
          broadcastEvent({
            type: 'order.ready',
            tenantId,
            locationId,
            tableId: order.tableId,
            sessionId: order.sessionId,
            orderId: order.id,
            data: { order: updatedOrder },
            timestamp: new Date()
          })
        }
      }

      console.log('✅ Item marked ready successfully')
    } catch (err) {
      console.error('❌ Failed to mark item ready:', err)
      throw err
    }
  }, [tenantId, locationId])

  const markOrderServed = useCallback(async (orderId: string, staffId: string) => {
    try {
      console.log('🍽️ Marking order served:', orderId)
      
      updateGlobalSession(prev => ({
        ...prev,
        orders: prev.orders.map(order =>
          order.id === orderId
            ? {
                ...order,
                status: 'served' as const,
                servedAt: new Date(),
                assignedStaffId: staffId,
                items: order.items.map(item => ({
                  ...item,
                  status: 'served_item' as const,
                  servedAt: new Date(),
                  updatedAt: new Date()
                })),
                updatedAt: new Date()
              }
            : order
        )
      }))

      // Broadcast order served
      const order = globalSessionState.orders.find(o => o.id === orderId)
      if (order) {
        broadcastEvent({
          type: 'order.served',
          tenantId,
          locationId,
          tableId: order.tableId,
          sessionId: order.sessionId,
          orderId,
          data: { order, staffId },
          timestamp: new Date(),
          actor: {
            userId: staffId,
            role: 'staff',
            name: 'Staff'
          }
        })
      }

      console.log('✅ Order marked served successfully')
    } catch (err) {
      console.error('❌ Failed to mark order served:', err)
      throw err
    }
  }, [tenantId, locationId])

  const processPayment = useCallback(async (orderId: string, method: 'cash' | 'card' | 'digital', amount: number) => {
    try {
      console.log('💳 Processing payment for order:', orderId)
      
      const order = globalSessionState.orders.find(o => o.id === orderId)
      if (!order) throw new Error('Order not found')

      const payment: Payment = {
        id: `payment_${Date.now()}`,
        orderId,
        sessionId: order.sessionId,
        tenantId,
        amount,
        method,
        status: 'processing',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Add payment and update order status
      updateGlobalSession(prev => ({
        ...prev,
        payments: [...prev.payments, payment],
        orders: prev.orders.map(o =>
          o.id === orderId
            ? { ...o, status: 'paying' as const, updatedAt: new Date() }
            : o
        )
      }))

      // Simulate payment processing
      setTimeout(() => {
        updateGlobalSession(prev => ({
          ...prev,
          payments: prev.payments.map(p =>
            p.id === payment.id
              ? { ...p, status: 'completed' as const, processedAt: new Date(), updatedAt: new Date() }
              : p
          ),
          orders: prev.orders.map(o =>
            o.id === orderId
              ? { ...o, status: 'paid' as const, paidAt: new Date(), updatedAt: new Date() }
              : o
          )
        }))

        // Broadcast payment completed
        broadcastEvent({
          type: 'order.paid',
          tenantId,
          locationId,
          tableId: order.tableId,
          sessionId: order.sessionId,
          orderId,
          data: { order, payment, amount, method },
          timestamp: new Date()
        })
      }, 2000)

      console.log('✅ Payment processing started')
      return payment
    } catch (err) {
      console.error('❌ Failed to process payment:', err)
      throw err
    }
  }, [tenantId, locationId])

  const clearTable = useCallback(async (tableId: string, staffId: string) => {
    try {
      console.log('🧹 Clearing table:', tableId)
      
      // Close active session
      const activeSession = globalSessionState.sessions.find(
        s => s.tableId === tableId && s.status === 'active'
      )
      
      if (activeSession) {
        updateGlobalSession(prev => ({
          ...prev,
          sessions: prev.sessions.map(s =>
            s.id === activeSession.id
              ? { ...s, status: 'closed' as const, endedAt: new Date(), updatedAt: new Date() }
              : s
          )
        }))

        // Broadcast session closed
        broadcastEvent({
          type: 'table.session.closed',
          tenantId,
          locationId,
          tableId,
          sessionId: activeSession.id,
          data: { session: activeSession },
          timestamp: new Date(),
          actor: {
            userId: staffId,
            role: 'staff',
            name: 'Staff'
          }
        })
      }

      // Simulate table cleaning process
      broadcastEvent({
        type: 'table.status.changed',
        tenantId,
        locationId,
        tableId,
        data: { status: 'cleaning', previousStatus: 'occupied' },
        timestamp: new Date(),
        actor: {
          userId: staffId,
          role: 'staff',
          name: 'Staff'
        }
      })

      // After cleaning timer, mark available
      setTimeout(() => {
        broadcastEvent({
          type: 'table.status.changed',
          tenantId,
          locationId,
          tableId,
          data: { status: 'available', previousStatus: 'cleaning' },
          timestamp: new Date()
        })
      }, 5000) // 5 second cleaning simulation

      console.log('✅ Table clearing initiated')
    } catch (err) {
      console.error('❌ Failed to clear table:', err)
      throw err
    }
  }, [tenantId, locationId])

  const getSessionByTable = useCallback((tableId: string) => {
    return sessions.find(s => s.tableId === tableId && s.status === 'active')
  }, [sessions])

  const getCartBySession = useCallback((sessionId: string) => {
    const cart = carts.find(c => c.sessionId === sessionId)
    // Return safe cart with defaults if not found
    return cart || { ...EMPTY_CART, sessionId }
  }, [carts])

  const getOrdersBySession = useCallback((sessionId: string) => {
    return orders.filter(o => o.sessionId === sessionId)
  }, [orders])

  const getOrdersByTable = useCallback((tableId: string) => {
    const tableSessions = sessions.filter(s => s.tableId === tableId)
    return orders.filter(o => tableSessions.some(s => s.id === o.sessionId))
  }, [sessions, orders])

  return {
    sessions,
    carts,
    orders,
    payments,
    loading,
    error,
    createTableSession,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    placeOrder,
    confirmOrder,
    cancelOrder,
    startOrderItem,
    markItemReady,
    markOrderServed,
    processPayment,
    clearTable,
    getSessionByTable,
    getCartBySession,
    getOrdersBySession,
    getOrdersByTable
  }
}