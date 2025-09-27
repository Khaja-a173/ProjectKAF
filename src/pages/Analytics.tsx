import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useContext } from "react";
import { AccessControlContext, AccessControlContextType } from "@/contexts/AccessControlContext";
import { useNavigate } from "react-router-dom";
import {
  ChefHat,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  BarChart3,
  CornerUpLeft,
  ChevronDown,
} from "lucide-react";

export default function Analytics() {
  // Preflight + dynamic analytics state
  const [isReady, setIsReady] = useState(false);
  const [summary, setSummary] = useState<{ revenue: string; orders: number }>({ revenue: "0.00", orders: 0 });
  const [metrics, setMetrics] = useState<Array<{ name: string; value: string; change: string; trend: "up" | "down" }>>([]);
  const [topItems, setTopItems] = useState<Array<{ name: string; orders: number; revenue: string }>>([]);
  const [hourlyData, setHourlyData] = useState<Array<{ hour: string; orders: number; revenue: number }>>([]);
  const [qaOpen, setQaOpen] = useState(false);

  const { users } = useContext(AccessControlContext) as AccessControlContextType;
  const user = users?.[0]; // Temporarily select the first user from the array
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!user.roles?.some((r) => ["tenant_admin", "manager"].includes(String(r)))) {
      navigate("/paywall");
    }
  }, []);

  // Preflight to avoid UI stall
  useEffect(() => {
    let aborted = false;
    const ctrl = new AbortController();
    (async () => {
      try {
        await apiFetch('/auth/whoami');
        await apiFetch('/health/supabase');
      } catch (e) {
        console.warn('Analytics preflight warning:', e);
      } finally {
        if (!aborted) setIsReady(true);
      }
    })();
    return () => { aborted = true; ctrl.abort(); };
  }, []);

  // Load analytics once preflight is ready
  useEffect(() => {
    if (!isReady) return;
    let aborted = false;
    (async () => {
      try {
        // Summary
        const s: any = await apiFetch('/analytics/summary');
        if (!aborted) setSummary({ revenue: s.revenue ?? '0.00', orders: s.orders ?? 0 });

        // Revenue timeseries → derive hourly-like view (fallback if empty)
        const rt: any = await apiFetch('/analytics/revenue_timeseries?range=7d&interval=day');
        const series = Array.isArray(rt?.series) ? rt.series : [];
        const h = series.slice(-10).map((p: any, i: number) => ({
          hour: String(i).padStart(2, '0') + ':00',
          orders: Number(p.orders ?? 0),
          revenue: Number(p.revenue ?? 0),
        }));
        if (!aborted) setHourlyData(h);

        // Top items (if available in your API; otherwise skip)
        try {
          const ti: any = await apiFetch('/analytics/top-items');
          if (!aborted && ti && Array.isArray(ti.rows)) {
            setTopItems(
              ti.rows.map((r: any) => ({
                name: r.name ?? r.item_name ?? 'Item',
                orders: Number(r.count ?? r.orders ?? 0),
                revenue: String(r.revenue ?? '0.00'),
              }))
            );
          }
        } catch {}

        // Compose headline metrics
        if (!aborted && s) {
          setMetrics([
            { name: 'Revenue (7d)', value: `$${s.revenue ?? '0.00'}`, change: '+0.0%', trend: 'up' },
            { name: 'Orders (7d)', value: String(s.orders ?? 0), change: '+0.0%', trend: 'up' },
            { name: 'Avg Order Value', value: `$${(Number(s.revenue ?? 0) / Math.max(1, Number(s.orders ?? 0))).toFixed(2)}`, change: '+0.0%', trend: 'up' },
            { name: 'Customers', value: String(s.orders ?? 0), change: '+0.0%', trend: 'up' },
          ]);
        }
      } catch (e) {
        console.error('Analytics load failed:', e);
      }
    })();
    return () => { aborted = true; };
  }, [isReady]);

  if (!metrics.length && !hourlyData.length && !topItems.length) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500 text-lg">
        Loading Analytics...  
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="mt-1 text-sm text-gray-500">Revenue &amp; funnel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-600 text-white hover:bg-orange-700 transition-colors shadow-sm"
            >
              <CornerUpLeft className="w-5 h-5" />
              Dashboard
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setQaOpen((s) => !s)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm"
              >
                Quick actions
                <ChevronDown className={`w-4 h-4 transition-transform ${qaOpen ? 'rotate-180' : ''}`} />
              </button>

              {qaOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2.5 hover:bg-gray-50 text-gray-900"
                      onClick={() => setQaOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/menu-management"
                      className="block px-4 py-2.5 hover:bg-gray-50 text-gray-900"
                      onClick={() => setQaOpen(false)}
                    >
                      Menu Management
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2.5 hover:bg-gray-50 text-gray-900"
                      onClick={() => setQaOpen(false)}
                    >
                      View Orders
                    </Link>
                    <Link
                      to="/table-management"
                      className="block px-4 py-2.5 hover:bg-gray-50 text-gray-900"
                      onClick={() => setQaOpen(false)}
                    >
                      Table Management
                    </Link>
                    <Link
                      to="/staff-management"
                      className="block px-4 py-2.5 hover:bg-gray-50 text-gray-900"
                      onClick={() => setQaOpen(false)}
                    >
                      Staff Management
                    </Link>
                    <Link
                      to="/kds"
                      className="block px-4 py-2.5 hover:bg-gray-50 text-gray-900"
                      onClick={() => setQaOpen(false)}
                    >
                      Kitchen Dashboard
                    </Link>
                    <Link
                      to="/analytics"
                      className="block px-4 py-2.5 hover:bg-gray-50 text-gray-900"
                      onClick={() => setQaOpen(false)}
                    >
                      Analytics
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2.5 hover:bg-gray-50 text-gray-900"
                      onClick={() => setQaOpen(false)}
                    >
                      Settings
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {metric.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {metric.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    metric.trend === "up"
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  <TrendingUp
                    className={`w-6 h-6 ${metric.trend === "down" ? "rotate-180" : ""}`}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span
                  className={`text-sm font-medium ${
                    metric.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {metric.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  from yesterday
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hourly Performance */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Today's Performance
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {hourlyData.map((data, index) => (
                    <div
                      key={data.hour}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-600 w-12">
                          {data.hour}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(data.orders / 30) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {data.orders} orders
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                          ${data.revenue}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Items */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Selling Items
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topItems.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.orders} orders
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {item.revenue}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Quick Insights</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">Peak hours: 6-8 PM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Best margin: Desserts (67%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Avg table turnover: 1.2h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Avg prep time: 18 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
