import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Edit, Trash2, ChefHat, DollarSign } from 'lucide-react'

export default function MenuManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Items', count: 45 },
    { id: 'appetizers', name: 'Appetizers', count: 8 },
    { id: 'mains', name: 'Main Courses', count: 18 },
    { id: 'desserts', name: 'Desserts', count: 12 },
    { id: 'beverages', name: 'Beverages', count: 7 },
  ]

  const menuItems = [
    {
      id: 1,
      name: 'Grilled Salmon',
      category: 'mains',
      price: 28.50,
      cost: 12.00,
      description: 'Fresh Atlantic salmon with herbs and lemon',
      image: 'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=300',
      status: 'available',
      popularity: 'high'
    },
    {
      id: 2,
      name: 'Caesar Salad',
      category: 'appetizers',
      price: 14.50,
      cost: 5.50,
      description: 'Crisp romaine lettuce with parmesan and croutons',
      image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=300',
      status: 'available',
      popularity: 'medium'
    },
    {
      id: 3,
      name: 'Chocolate Lava Cake',
      category: 'desserts',
      price: 12.00,
      cost: 4.00,
      description: 'Warm chocolate cake with molten center',
      image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=300',
      status: 'available',
      popularity: 'high'
    },
    {
      id: 4,
      name: 'Craft Beer',
      category: 'beverages',
      price: 8.00,
      cost: 3.00,
      description: 'Local brewery selection',
      image: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=300',
      status: 'available',
      popularity: 'medium'
    },
  ]

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">RestaurantOS</h1>
              </Link>
            </div>
            
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-blue-700 hover:to-indigo-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Menu Item</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 pb-2">
              Dashboard
            </Link>
            <Link to="/menu" className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium">
              Menu Management
            </Link>
            <Link to="/orders" className="text-gray-500 hover:text-gray-700 pb-2">
              Orders
            </Link>
            <Link to="/table-management" className="text-gray-500 hover:text-gray-700 pb-2">
              Table Management
            </Link>
            <Link to="/staff-management" className="text-gray-500 hover:text-gray-700 pb-2">
              Staff Management
            </Link>
            <Link to="/analytics" className="text-gray-500 hover:text-gray-700 pb-2">
              Analytics
            </Link>
            <Link to="/settings" className="text-gray-500 hover:text-gray-700 pb-2">
              Settings
            </Link>
          </div>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <span className="text-sm text-gray-500">{category.count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items</span>
                  <span className="font-medium">45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available</span>
                  <span className="font-medium text-green-600">42</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Out of Stock</span>
                  <span className="font-medium text-red-600">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Price</span>
                  <span className="font-medium">$18.50</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.popularity === 'high' ? 'bg-green-100 text-green-800' :
                            item.popularity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.popularity} demand
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <span className="text-lg font-bold text-green-600">${item.price}</span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Cost: ${item.cost}</span>
                            <span>Margin: {Math.round(((item.price - item.cost) / item.price) * 100)}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                          
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-gray-400 hover:text-blue-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}