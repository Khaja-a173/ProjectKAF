import { Link } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import {
  ChefHat,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  BarChart3,
} from "lucide-react";

export default function Analytics() {
  const metrics = [
    { name: "Revenue Today", value: "$2,847", change: "+12.5%", trend: "up" },
    { name: "Orders Today", value: "156", change: "+8.2%", trend: "up" },
    {
      name: "Avg Order Value",
      value: "$18.25",
      change: "-2.1%",
      trend: "down",
    },
    {
      name: "Customer Satisfaction",
      value: "4.8/5",
      change: "+0.2",
      trend: "up",
    },
  ];

  const topItems = [
    { name: "Grilled Salmon", orders: 45, revenue: "$1,282.50" },
    { name: "Caesar Salad", orders: 38, revenue: "$551.00" },
    { name: "Pasta Carbonara", orders: 32, revenue: "$704.00" },
    { name: "Chocolate Cake", orders: 28, revenue: "$336.00" },
    { name: "Craft Beer", orders: 52, revenue: "$416.00" },
  ];

  const hourlyData = [
    { hour: "11:00", orders: 8, revenue: 145 },
    { hour: "12:00", orders: 15, revenue: 287 },
    { hour: "13:00", orders: 22, revenue: 398 },
    { hour: "14:00", orders: 18, revenue: 324 },
    { hour: "15:00", orders: 12, revenue: 218 },
    { hour: "16:00", orders: 9, revenue: 162 },
    { hour: "17:00", orders: 14, revenue: 252 },
    { hour: "18:00", orders: 25, revenue: 445 },
    { hour: "19:00", orders: 28, revenue: 498 },
    { hour: "20:00", orders: 24, revenue: 432 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="RestaurantOS" subtitle="Analytics & Reports" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link
              to="/dashboard"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Dashboard
            </Link>
            <Link to="/menu" className="text-gray-500 hover:text-gray-700 pb-2">
              Menu Management
            </Link>
            <Link
              to="/orders"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Orders
            </Link>
            <Link
              to="/table-management"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Table Management
            </Link>
            <Link
              to="/staff-management"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Staff Management
            </Link>
            <Link
              to="/admin/kitchen"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Kitchen Dashboard
            </Link>
            <Link
              to="/analytics"
              className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium"
            >
              Analytics
            </Link>
            <Link
              to="/settings"
              className="text-gray-500 hover:text-gray-700 pb-2"
            >
              Settings
            </Link>
          </div>
        </nav>

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
