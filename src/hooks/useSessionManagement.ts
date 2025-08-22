import { useState, useEffect, useCallback } from "react";
import {
  TableSession,
  SessionCart,
  CartItem,
  DineInOrder,
  Payment,
  RealtimeEvent,
  OrderItem,
} from "../types/session";

// Global state for session management (simulating real-time sync)
let globalSessionState: {
  sessions: TableSession[];
  carts: SessionCart[];
  orders: DineInOrder[];
  payments: Payment[];
  archivedOrders: DineInOrder[];
} = {
  sessions: [],
  carts: [],
  orders: [],
  payments: [],
  archivedOrders: [],
};

const sessionSubscribers: Set<(state: typeof globalSessionState) => void> = new Set();

const notifySessionSubscribers = () => {
  console.log("🔄 Notifying session subscribers of changes");
  console.log("Current state:", {
    sessions: globalSessionState.sessions.length,
    carts: globalSessionState.carts.length,
    orders: globalSessionState.orders.length,
    archivedOrders: globalSessionState.archivedOrders.length
  });
  sessionSubscribers.forEach((callback) => callback({ ...globalSessionState }));
};

const updateGlobalSession = (
  updater: (prev: typeof globalSessionState) => typeof globalSessionState,
) => {
  const prevState = { ...globalSessionState };
  globalSessionState = updater(globalSessionState);
  console.log("📝 Session state updated:", {
    before: {
      sessions: prevState.sessions.length,
      orders: prevState.orders.length,
      archivedOrders: prevState.archivedOrders.length,
    },
    after: {
      sessions: globalSessionState.sessions.length,
      orders: globalSessionState.orders.length,
      archivedOrders: globalSessionState.archivedOrders.length,
    },
  });
  
  // Force immediate notification
  setTimeout(() => {
    notifySessionSubscribers();
  }, 50);
};

const broadcastEvent = (event: RealtimeEvent) => {
  console.log("📡 Broadcasting event:", event.type, event);
  // Simulate real-time broadcast
  setTimeout(() => {
    notifySessionSubscribers();
  }, 100);
};

// Currency exponent helper
const getCurrencyExponent = (currency: string): number => {
  const CURRENCY_EXPONENTS: Record<string, number> = {
    KWD: 3, BHD: 3, OMR: 3, // 3 decimal places
    JPY: 0, KRW: 0, // 0 decimal places
    // Default: 2 decimal places for INR, AUD, USD, EUR, etc.
  };
  return CURRENCY_EXPONENTS[currency] ?? 2;
};

interface UseSessionManagementProps {
  tenantId: string;
  locationId: string;
}

export function useSessionManagement({
  tenantId,
  locationId,
}: UseSessionManagementProps) {
  const [sessions, setSessions] = useState<TableSession[]>([]);
  const [carts, setCarts] = useState<SessionCart[]>([]);
  const [orders, setOrders] = useState<DineInOrder[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [archivedOrders, setArchivedOrders] = useState<DineInOrder[]>([]);

  // Subscribe to global session changes
  useEffect(() => {
    const updateState = (newState: typeof globalSessionState) => {
      console.log("🔄 Received session update:", {
        sessions: newState.sessions.length,
        orders: newState.orders.length,
        archivedOrders: newState.archivedOrders.length,
      });
      setSessions(newState.sessions);
      setCarts(newState.carts);
      setOrders(newState.orders);
      setPayments(newState.payments);
      setArchivedOrders(newState.archivedOrders || []);
      setLoading(false);
    };

    sessionSubscribers.add(updateState);

    // Initialize with current global state
    updateState(globalSessionState);

    return () => {
      sessionSubscribers.delete(updateState);
    };
  }, []);

  const createTableSession = useCallback(
    async (tableId: string, customerData?: Partial<TableSession>) => {
      try {
        console.log("🪑 Creating table session for:", tableId);

        // Check for existing active session (idempotent)
        const existingSession = globalSessionState.sessions.find(
          (s) => s.tableId === tableId && s.status === "active",
        );

        if (existingSession) {
          console.log("♻️ Reusing existing session:", existingSession.id);
          return existingSession;
        }

        const newSession: TableSession = {
          id: `session_${Date.now()}`,
          tenantId,
          locationId,
          tableId,
          status: "active",
          customerName: customerData?.customerName,
          customerEmail: customerData?.customerEmail,
          customerPhone: customerData?.customerPhone,
          partySize: customerData?.partySize || 2,
          startedAt: new Date(),
          lastActivity: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Create associated cart
        const newCart: SessionCart = {
          id: `cart_${Date.now()}`,
          sessionId: newSession.id,
          tenantId,
          locationId,
          status: "active",
          items: [],
          subtotalMinor: 0,
          taxMinor: 0,
          totalMinor: 0,
          currency: "USD",
          lastActivity: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        updateGlobalSession((prev) => ({
          ...prev,
          sessions: [...prev.sessions, newSession],
          carts: [...prev.carts, newCart],
        }));

        // Broadcast table session started
        broadcastEvent({
          type: "table.session.started",
          tenantId,
          locationId,
          tableId,
          sessionId: newSession.id,
          data: { session: newSession },
          timestamp: new Date(),
        });

        console.log("✅ Table session created:", newSession.id);
        return newSession;
      } catch (err) {
        console.error("❌ Failed to create table session:", err);
        throw new Error("Failed to create table session");
      }
    },
    [tenantId, locationId],
  );

  const addToCart = useCallback(
    async (
      sessionId: string,
      menuItemId: string,
      quantity: number,
      customizations?: any,
      specialInstructions?: string,
    ) => {
      try {
        console.log("🛒 Adding to cart:", { sessionId, menuItemId, quantity });

        const cart = globalSessionState.carts.find(
          (c) => c.sessionId === sessionId,
        );
        if (!cart) throw new Error("Cart not found");

        if (cart.status === "locked") {
          throw new Error("Cart is locked - order is being processed");
        }

        // Mock menu item data (in real app, fetch from menu)
        const mockMenuItems: Record<string, any> = {
          itm_1: {
            name: "Truffle Arancini",
            price: 16.0,
            allergens: ["dairy", "gluten"],
            isVegetarian: true,
            isVegan: false,
            spicyLevel: 0,
          },
          itm_2: {
            name: "Pan-Seared Scallops",
            price: 24.0,
            allergens: ["shellfish"],
            isVegetarian: false,
            isVegan: false,
            spicyLevel: 0,
          },
          itm_3: {
            name: "Wagyu Beef Tenderloin",
            price: 65.0,
            allergens: [],
            isVegetarian: false,
            isVegan: false,
            spicyLevel: 0,
          },
          itm_4: {
            name: "Grilled Atlantic Salmon",
            price: 32.0,
            allergens: ["fish"],
            isVegetarian: false,
            isVegan: false,
            spicyLevel: 0,
          },
        };

        const menuItem = mockMenuItems[menuItemId] || {
          name: "Unknown Item",
          price: 15.99,
          allergens: [],
          isVegetarian: false,
          isVegan: false,
          spicyLevel: 0,
        };

        const existingItem = cart.items.find(
          (item) =>
            item.menuItemId === menuItemId &&
            JSON.stringify(item.customizations) ===
              JSON.stringify(customizations),
        );

        let updatedItems: CartItem[];

        if (existingItem) {
          // Update quantity of existing item
          updatedItems = cart.items.map((item) =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
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
            addedAt: new Date(),
          };
          updatedItems = [...cart.items, newItem];
        }

        const subtotal = updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        const taxAmount = subtotal * 0.08;
        const totalAmount = subtotal + taxAmount;

        // Convert to minor units
        const exponent = getCurrencyExponent("USD");
        const subtotalMinor = Math.round(subtotal * Math.pow(10, exponent));
        const taxMinor = Math.round(taxAmount * Math.pow(10, exponent));
        const totalMinor = Math.round(totalAmount * Math.pow(10, exponent));

        updateGlobalSession((prev) => ({
          ...prev,
          carts: prev.carts.map((c) =>
            c.sessionId === sessionId
              ? {
                  ...c,
                  items: updatedItems,
                  subtotalMinor,
                  taxMinor,
                  totalMinor,
                  lastActivity: new Date(),
                  updatedAt: new Date(),
                }
              : c,
          ),
          sessions: prev.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, lastActivity: new Date(), updatedAt: new Date() }
              : s,
          ),
        }));

        console.log("✅ Item added to cart successfully");
        return updatedItems;
      } catch (err) {
        console.error("❌ Failed to add to cart:", err);
        throw err;
      }
    },
    [],
  );

  const updateCartQuantity = useCallback(
    async (cartItemId: string, newQuantity: number) => {
      try {
        console.log("🔄 Updating cart item quantity:", cartItemId, newQuantity);

        if (newQuantity <= 0) {
          return removeFromCart(cartItemId);
        }

        updateGlobalSession((prev) => ({
          ...prev,
          carts: prev.carts.map((cart) => {
            const updatedItems = cart.items.map((item) => {
              if (item.id === cartItemId) {
                return { ...item, quantity: newQuantity };
              }
              return item;
            });

            const subtotal = updatedItems.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0,
            );
            const taxAmount = subtotal * 0.08;
            const totalAmount = subtotal + taxAmount;

            const exponent = getCurrencyExponent("USD");
            const subtotalMinor = Math.round(subtotal * Math.pow(10, exponent));
            const taxMinor = Math.round(taxAmount * Math.pow(10, exponent));
            const totalMinor = Math.round(totalAmount * Math.pow(10, exponent));

            return {
              ...cart,
              items: updatedItems,
              subtotalMinor,
              taxMinor,
              totalMinor,
              lastActivity: new Date(),
              updatedAt: new Date(),
            };
          }),
        }));

        console.log("✅ Cart quantity updated successfully");
      } catch (err) {
        console.error("❌ Failed to update cart quantity:", err);
        throw err;
      }
    },
    [],
  );

  const removeFromCart = useCallback(async (cartItemId: string) => {
    try {
      console.log("🗑️ Removing item from cart:", cartItemId);

      updateGlobalSession((prev) => ({
        ...prev,
        carts: prev.carts.map((cart) => {
          const updatedItems = cart.items.filter(
            (item) => item.id !== cartItemId,
          );
          const subtotal = updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          );
          const taxAmount = subtotal * 0.08;
          const totalAmount = subtotal + taxAmount;

          const exponent = getCurrencyExponent("USD");
          const subtotalMinor = Math.round(subtotal * Math.pow(10, exponent));
          const taxMinor = Math.round(taxAmount * Math.pow(10, exponent));
          const totalMinor = Math.round(totalAmount * Math.pow(10, exponent));

          return {
            ...cart,
            items: updatedItems,
            subtotalMinor,
            taxMinor,
            totalMinor,
            lastActivity: new Date(),
            updatedAt: new Date(),
          };
        }),
      }));

      console.log("✅ Item removed from cart successfully");
    } catch (err) {
      console.error("❌ Failed to remove from cart:", err);
      throw err;
    }
  }, []);

  const placeOrder = useCallback(
    async (sessionId: string, specialInstructions?: string) => {
      try {
        console.log("📝 PLACING ORDER - Starting process for session:", sessionId);
        
        const session = globalSessionState.sessions.find(
          (s) => s.id === sessionId,
        );
        const cart = globalSessionState.carts.find(
          (c) => c.sessionId === sessionId,
        );

        console.log("📝 PLACING ORDER - Found session:", !!session);
        console.log("📝 PLACING ORDER - Found cart:", !!cart);
        console.log("📝 PLACING ORDER - Cart items:", cart?.items?.length || 0);
        
        if (!session || !cart) {
          console.error("❌ PLACING ORDER - Session or cart not found");
          throw new Error("Session or cart not found");
        }
        if (cart.items.length === 0) {
          console.error("❌ PLACING ORDER - Cart is empty");
          throw new Error("Cart is empty");
        }
        if (cart.status === "locked") {
          console.error("❌ PLACING ORDER - Cart is locked");
          throw new Error("Order already being processed");
        }

        const orderNumber = `#ORD-${String(Date.now()).slice(-6)}`;
        const orderId = `order_${Date.now()}`;

        console.log("📝 PLACING ORDER - Creating order:", orderNumber);
        
        const newOrder: DineInOrder = {
          id: orderId,
          orderNumber,
          tenantId,
          locationId,
          sessionId,
          tableId: session.tableId,
          status: "placed",
          items: cart.items.map((cartItem) => ({
            id: `orderitem_${Date.now()}_${cartItem.id}`,
            orderId: orderId,
            menuItemId: cartItem.menuItemId,
            name: cartItem.name,
            quantity: cartItem.quantity,
            unitPrice: cartItem.price,
            totalPrice: cartItem.price * cartItem.quantity,
            status: "queued",
            station: cartItem.name.toLowerCase().includes("salad") ? "cold" : 
                    cartItem.name.toLowerCase().includes("drink") ? "bar" : 
                    cartItem.name.toLowerCase().includes("scallop") ? "grill" :
                    cartItem.name.toLowerCase().includes("beef") ? "grill" : "hot",
            customizations: cartItem.customizations,
            specialInstructions: cartItem.specialInstructions,
            allergens: cartItem.allergens,
            isVegetarian: cartItem.isVegetarian,
            isVegan: cartItem.isVegan,
            spicyLevel: cartItem.spicyLevel,
            preparationTime: 15,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
          subtotal: cart.subtotalMinor / Math.pow(10, getCurrencyExponent(cart.currency || "USD")),
          taxAmount: cart.taxMinor / Math.pow(10, getCurrencyExponent(cart.currency || "USD")),
          tipAmount: 0,
          totalAmount: cart.totalMinor / Math.pow(10, getCurrencyExponent(cart.currency || "USD")),
          specialInstructions,
          priority: "normal",
          placedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        console.log("📝 PLACING ORDER - New order object created:", {
          id: newOrder.id,
          orderNumber: newOrder.orderNumber,
          tableId: newOrder.tableId,
          itemCount: newOrder.items.length,
          total: newOrder.totalAmount
        });

        // Lock cart and add order
        updateGlobalSession((prev) => {
          console.log("📝 PLACING ORDER - Updating global state");
          console.log("📝 PLACING ORDER - Previous orders:", prev.orders.length);
          
          const newState = {
            ...prev,
            carts: prev.carts.map((c) =>
              c.sessionId === sessionId
                ? { ...c, status: "locked" as const, updatedAt: new Date() }
                : c,
            ),
            orders: [...prev.orders, newOrder],
            sessions: prev.sessions.map((s) =>
              s.id === sessionId
                ? { ...s, lastActivity: new Date(), updatedAt: new Date() }
                : s,
            ),
          };
          
          console.log("📝 PLACING ORDER - New orders count:", newState.orders.length);
          return newState;
        });

        // Broadcast order placed event
        console.log("📡 PLACING ORDER - Broadcasting order placed event");
        broadcastEvent({
          type: "order.placed",
          tenantId,
          locationId,
          tableId: session.tableId,
          sessionId,
          orderId: newOrder.id,
          data: { order: newOrder },
          timestamp: new Date(),
          actor: {
            userId: "customer",
            role: "customer",
            name: session.customerName || "Guest",
          },
        });

        console.log("✅ PLACING ORDER - Order placed successfully:", newOrder.orderNumber);
        console.log("✅ PLACING ORDER - Final global orders count:", globalSessionState.orders.length);
        
        return newOrder;
      } catch (err) {
        console.error("❌ PLACING ORDER - Failed:", err);
        throw err;
      }
    },
    [tenantId, locationId],
  );

  const confirmOrder = useCallback(
    async (orderId: string, staffId: string) => {
      try {
        console.log("✅ CONFIRMING ORDER:", orderId);

        updateGlobalSession((prev) => ({
          ...prev,
          orders: prev.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: "confirmed" as const,
                  confirmedAt: new Date(),
                  estimatedReadyAt: new Date(Date.now() + 20 * 60 * 1000),
                  updatedAt: new Date(),
                }
              : order,
          ),
          carts: prev.carts.map((cart) => {
            const order = prev.orders.find((o) => o.id === orderId);
            return cart.sessionId === order?.sessionId
              ? { ...cart, status: "active" as const, updatedAt: new Date() }
              : cart;
          }),
        }));

        const order = globalSessionState.orders.find((o) => o.id === orderId);
        if (order) {
          broadcastEvent({
            type: "order.confirmed",
            tenantId,
            locationId,
            tableId: order.tableId,
            sessionId: order.sessionId,
            orderId,
            data: { order },
            timestamp: new Date(),
            actor: {
              userId: staffId,
              role: "manager",
              name: "Manager",
            },
          });
        }

        console.log("✅ Order confirmed successfully");
      } catch (err) {
        console.error("❌ Failed to confirm order:", err);
        throw err;
      }
    },
    [tenantId, locationId],
  );

  const startOrderItem = useCallback(
    async (itemId: string, chefId: string) => {
      try {
        console.log("🔥 Starting order item:", itemId);

        updateGlobalSession((prev) => ({
          ...prev,
          orders: prev.orders.map((order) => {
            const updatedItems = order.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    status: "in_progress" as const,
                    startedAt: new Date(),
                    assignedChef: chefId,
                    updatedAt: new Date(),
                  }
                : item,
            );

            // Check if order should move to preparing
            const hasStartedItems = updatedItems.some(i => i.status === "in_progress");
            
            return {
              ...order,
              items: updatedItems,
              status: hasStartedItems ? ("preparing" as const) : order.status,
              updatedAt: new Date(),
            };
          }),
        }));

        const order = globalSessionState.orders.find((o) =>
          o.items.some((i) => i.id === itemId),
        );
        
        if (order) {
          broadcastEvent({
            type: "item.started",
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
              role: "chef",
              name: "Chef",
            },
          });

          // Broadcast order preparing if status changed
          const updatedOrder = globalSessionState.orders.find(o => o.id === order.id);
          if (updatedOrder?.status === "preparing") {
            broadcastEvent({
              type: "order.preparing",
              tenantId,
              locationId,
              tableId: order.tableId,
              sessionId: order.sessionId,
              orderId: order.id,
              data: { order: updatedOrder },
              timestamp: new Date(),
            });
          }
        }

        console.log("✅ Order item started successfully");
      } catch (err) {
        console.error("❌ Failed to start order item:", err);
        throw err;
      }
    },
    [tenantId, locationId],
  );

  const markItemReady = useCallback(
    async (itemId: string, chefId: string) => {
      try {
        console.log("✅ Marking item ready:", itemId);

        updateGlobalSession((prev) => ({
          ...prev,
          orders: prev.orders.map((order) => {
            const updatedItems = order.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    status: "ready_item" as const,
                    readyAt: new Date(),
                    updatedAt: new Date(),
                  }
                : item,
            );

            // Check if all items are ready
            const allItemsReady = updatedItems.every(
              (item) =>
                item.status === "ready_item" || item.status === "served_item",
            );

            return {
              ...order,
              items: updatedItems,
              status: allItemsReady ? ("ready" as const) : order.status,
              readyAt: allItemsReady ? new Date() : order.readyAt,
              updatedAt: new Date(),
            };
          }),
        }));

        const order = globalSessionState.orders.find((o) =>
          o.items.some((i) => i.id === itemId),
        );
        
        if (order) {
          broadcastEvent({
            type: "item.ready",
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
              role: "chef",
              name: "Chef",
            },
          });

          // Check if order is now ready
          const updatedOrder = globalSessionState.orders.find(o => o.id === order.id);
          if (updatedOrder?.status === "ready") {
            broadcastEvent({
              type: "order.ready",
              tenantId,
              locationId,
              tableId: order.tableId,
              sessionId: order.sessionId,
              orderId: order.id,
              data: { order: updatedOrder },
              timestamp: new Date(),
            });
          }
        }

        console.log("✅ Item marked ready successfully");
      } catch (err) {
        console.error("❌ Failed to mark item ready:", err);
        throw err;
      }
    },
    [tenantId, locationId],
  );

  const markOrderServed = useCallback(
    async (orderId: string, staffId: string) => {
      try {
        console.log("🍽️ Marking order served:", orderId);

        updateGlobalSession((prev) => ({
          ...prev,
          orders: prev.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: "served" as const,
                  servedAt: new Date(),
                  assignedStaffId: staffId,
                  items: order.items.map((item) => ({
                    ...item,
                    status: "served_item" as const,
                    servedAt: new Date(),
                    updatedAt: new Date(),
                  })),
                  updatedAt: new Date(),
                }
              : order,
          ),
        }));

        const order = globalSessionState.orders.find((o) => o.id === orderId);
        if (order) {
          broadcastEvent({
            type: "order.served",
            tenantId,
            locationId,
            tableId: order.tableId,
            sessionId: order.sessionId,
            orderId,
            data: { order, staffId },
            timestamp: new Date(),
            actor: {
              userId: staffId,
              role: "staff",
              name: "Staff",
            },
          });
        }

        console.log("✅ Order marked served successfully");
      } catch (err) {
        console.error("❌ Failed to mark order served:", err);
        throw err;
      }
    },
    [tenantId, locationId],
  );

  const assignStaffToOrder = useCallback(
    async (orderId: string, staffId: string, staffName: string) => {
      try {
        console.log("👤 Assigning staff to order:", orderId, staffId);

        updateGlobalSession((prev) => ({
          ...prev,
          orders: prev.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  assignedStaffId: staffId,
                  updatedAt: new Date(),
                }
              : order,
          ),
        }));

        const order = globalSessionState.orders.find((o) => o.id === orderId);
        if (order) {
          broadcastEvent({
            type: "order.assigned",
            tenantId,
            locationId,
            tableId: order.tableId,
            sessionId: order.sessionId,
            orderId,
            data: { order, staffId, staffName },
            timestamp: new Date(),
          });
        }

        console.log("✅ Staff assigned successfully");
      } catch (err) {
        console.error("❌ Failed to assign staff:", err);
        throw err;
      }
    },
    [tenantId, locationId],
  );

  const markOrderForDelivery = useCallback(
    async (orderId: string, staffId: string) => {
      try {
        console.log("🚚 Marking order for delivery:", orderId);

        updateGlobalSession((prev) => ({
          ...prev,
          orders: prev.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: "delivering" as const,
                  assignedStaffId: staffId,
                  updatedAt: new Date(),
                }
              : order,
          ),
        }));

        const order = globalSessionState.orders.find((o) => o.id === orderId);
        if (order) {
          broadcastEvent({
            type: "order.delivering",
            tenantId,
            locationId,
            tableId: order.tableId,
            sessionId: order.sessionId,
            orderId,
            data: { order, staffId },
            timestamp: new Date(),
            actor: {
              userId: staffId,
              role: "staff",
              name: "Staff",
            },
          });
        }

        console.log("✅ Order marked for delivery");
      } catch (err) {
        console.error("❌ Failed to mark for delivery:", err);
        throw err;
      }
    },
    [tenantId, locationId],
  );

  const initiatePayment = useCallback(
    async (orderId: string, staffId: string) => {
      try {
        console.log("💳 Initiating payment for order:", orderId);

        updateGlobalSession((prev) => ({
          ...prev,
          orders: prev.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: "paying" as const,
                  updatedAt: new Date(),
                }
              : order,
          ),
        }));

        const order = globalSessionState.orders.find((o) => o.id === orderId);
        if (order) {
          broadcastEvent({
            type: "order.paying",
            tenantId,
            locationId,
            tableId: order.tableId,
            sessionId: order.sessionId,
            orderId,
            data: { order, staffId },
            timestamp: new Date(),
          });
        }

        console.log("✅ Payment initiated");
      } catch (err) {
        console.error("❌ Failed to initiate payment:", err);
        throw err;
      }
    },
    [tenantId, locationId],
  );

  const markOrderPaid = useCallback(
    async (orderId: string, paymentMethod: "cash" | "card" | "digital", staffId: string) => {
      try {
        console.log("✅ MARKING ORDER PAID:", orderId);

        const order = globalSessionState.orders.find((o) => o.id === orderId);
        if (!order) throw new Error("Order not found");

        // Create payment record
        const payment: Payment = {
          id: `payment_${Date.now()}`,
          orderId,
          sessionId: order.sessionId,
          tenantId,
          amount: order.totalAmount,
          method: paymentMethod,
          status: "completed",
          processedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Move order to archived and update status
        updateGlobalSession((prev) => ({
          ...prev,
          orders: prev.orders.filter((o) => o.id !== orderId),
          archivedOrders: [
            ...prev.archivedOrders,
            {
              ...order,
              status: "paid" as const,
              paidAt: new Date(),
              closedAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          payments: [...prev.payments, payment],
        }));

        // Broadcast order completion
        broadcastEvent({
          type: "order.paid",
          tenantId,
          locationId,
          tableId: order.tableId,
          sessionId: order.sessionId,
          orderId,
          data: { order, payment, staffId },
          timestamp: new Date(),
        });

        console.log("✅ Order marked as paid and archived");
      } catch (err) {
        console.error("❌ Failed to mark order as paid:", err);
        throw err;
      }
    },
    [tenantId, locationId],
  );

  const cancelOrder = useCallback(
    async (orderId: string, reason: string, staffId: string) => {
      try {
        console.log("❌ Cancelling order:", orderId, "Reason:", reason);

        updateGlobalSession((prev) => ({
          ...prev,
          orders: prev.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: "cancelled" as const,
                  cancelledAt: new Date(),
                  cancellationReason: reason,
                  updatedAt: new Date(),
                }
              : order,
          ),
          carts: prev.carts.map((cart) => {
            const order = prev.orders.find((o) => o.id === orderId);
            return cart.sessionId === order?.sessionId
              ? { ...cart, status: "active" as const, updatedAt: new Date() }
              : cart;
          }),
        }));

        const order = globalSessionState.orders.find((o) => o.id === orderId);
        if (order) {
          broadcastEvent({
            type: "order.cancelled",
            tenantId,
            locationId,
            tableId: order.tableId,
            sessionId: order.sessionId,
            orderId,
            data: { order, reason },
            timestamp: new Date(),
            actor: {
              userId: staffId,
              role: "manager",
              name: "Manager",
            },
          });
        }

        console.log("✅ Order cancelled successfully");
      } catch (err) {
        console.error("❌ Failed to cancel order:", err);
        throw err;
      }
    },
    [tenantId, locationId],
  );

  const clearTable = useCallback(
    async (tableId: string, staffId: string) => {
      try {
        console.log("🧹 Clearing table:", tableId);

        const activeSession = globalSessionState.sessions.find(
          (s) => s.tableId === tableId && s.status === "active",
        );

        if (activeSession) {
          updateGlobalSession((prev) => ({
            ...prev,
            sessions: prev.sessions.map((s) =>
              s.id === activeSession.id
                ? {
                    ...s,
                    status: "closed" as const,
                    endedAt: new Date(),
                    updatedAt: new Date(),
                  }
                : s,
            ),
          }));

          broadcastEvent({
            type: "table.session.closed",
            tenantId,
            locationId,
            tableId,
            sessionId: activeSession.id,
            data: { session: activeSession },
            timestamp: new Date(),
            actor: {
              userId: staffId,
              role: "staff",
              name: "Staff",
            },
          });
        }

        console.log("✅ Table cleared successfully");
      } catch (err) {
        console.error("❌ Failed to clear table:", err);
        throw err;
      }
    },
    [tenantId, locationId],
  );

  // Helper functions
  const getSessionByTable = useCallback(
    (tableId: string) => {
      return sessions.find(
        (s) => s.tableId === tableId && s.status === "active",
      );
    },
    [sessions],
  );

  const getCartBySession = useCallback(
    (sessionId: string) => {
      const cart = carts.find((c) => c.sessionId === sessionId);
      return cart || null;
    },
    [carts],
  );

  const getOrdersBySession = useCallback(
    (sessionId: string) => {
      return orders.filter((o) => o.sessionId === sessionId);
    },
    [orders],
  );

  const getOrdersByTable = useCallback(
    (tableId: string) => {
      const tableSessions = sessions.filter((s) => s.tableId === tableId);
      return orders.filter((o) =>
        tableSessions.some((s) => s.id === o.sessionId),
      );
    },
    [sessions, orders],
  );

  return {
    sessions,
    carts,
    orders,
    archivedOrders,
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
    assignStaffToOrder,
    markOrderForDelivery,
    initiatePayment,
    markOrderPaid,
    clearTable,
    getSessionByTable,
    getCartBySession,
    getOrdersBySession,
    getOrdersByTable,
  };
}