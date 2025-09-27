import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAccess } from "@/contexts/AccessControlContext";
import { useLogo } from "../contexts/BrandingContext";
import { ChefHat, Menu as MenuIcon, X, ShoppingCart } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/state/cartStore';

function CartBadge() {
  // Pull cart counts from the global cart store. Be defensive about shape.
  const itemCount =
    useCartStore((s: any) =>
      typeof s.count === 'number'
        ? s.count
        : typeof s.totalQty === 'number'
        ? s.totalQty
        : Array.isArray(s.items)
        ? s.items.reduce((acc: number, it: any) => acc + (Number(it.qty) || 0), 0)
        : 0
    );

  if (!itemCount || itemCount <= 0) return null;

  return (
    <span
      className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] leading-5 text-center font-semibold pointer-events-none"
      aria-label={`${itemCount} items in cart`}
    >
      {itemCount}
    </span>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logoHeader } = useLogo();

  const [session, setSession] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const { currentUser } = useAccess();
  const rolesList = Array.isArray((currentUser as any)?.roles)
    ? (currentUser as any).roles.map((r: any) => String(r))
    : ((currentUser as any)?.role ? [String((currentUser as any).role)] : []);

  const publicNavigation = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Events", href: "/events" },
    { name: "Gallery", href: "/gallery" },
    { name: "Live Orders", href: "/live-orders" },
    { name: "Contact", href: "/contact" },
    { name: "Book Table", href: "/book-table" },
  ];

  const isAdmin = rolesList.includes('admin') || rolesList.includes('tenant_admin'); // adjust this check if your app uses roles differently
  const adminNavigation = isAdmin
    ? [{ name: "Billing & Plan", href: "/billing" }]
    : [];

  const dashboardNavigation = [
    { name: "Dashboard", href: "/dashboard" },
    ...adminNavigation,
  ];

  const isActive = (href: string) => location.pathname === href;

  // Determine if current path is /dashboard or its sub-routes
  const isDashboardRoute = location.pathname === "/dashboard" || location.pathname.startsWith("/dashboard/");

  const navigation = isDashboardRoute ? dashboardNavigation : publicNavigation;

  const handleAdminClick = () => {
    if (session) {
      // Redirect based on role or just go to dashboard
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login?next=/dashboard");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate("/");
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            {logoHeader ? (
              <img
                src={logoHeader}
                alt="Restaurant Logo"
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bella Vista</h1>
              <p className="text-xs text-gray-500">Fine Dining Restaurant</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => {
                  if (item.name === "Book Table") {
                    navigate("/book-table");
                  }
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              type="button"
              aria-label="Cart"
              onClick={() => {
                // Trigger global cart open event; FloatingCart will handle displaying itself.
                window.dispatchEvent(new CustomEvent("cart:open"));
              }}
              className="p-2 text-gray-600 hover:text-orange-600 relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <CartBadge />
            </button>
            {isDashboardRoute && session ? (
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-gray-500 to-gray-700 text-white px-4 py-2 rounded-lg hover:from-gray-600 hover:to-gray-800 transition-colors"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleAdminClick}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors"
              >
                Admin
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-orange-600"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (item.name === "Book Table") {
                      navigate("/book-table");
                    }
                  }}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-orange-600 bg-orange-50"
                      : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 mt-4 space-y-2">
                <button
                  type="button"
                  aria-label="Cart"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("cart:open"));
                  }}
                  className="p-2 text-gray-600 hover:text-orange-600 relative w-full flex items-center justify-center rounded-lg border border-gray-300"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <CartBadge />
                </button>
                {isDashboardRoute && session ? (
                  <button
                    onClick={async () => {
                      await handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-center bg-gradient-to-r from-gray-500 to-gray-700 text-white px-4 py-2 rounded-lg hover:from-gray-600 hover:to-gray-800 transition-colors"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleAdminClick();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-center bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors"
                  >
                    Admin
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
