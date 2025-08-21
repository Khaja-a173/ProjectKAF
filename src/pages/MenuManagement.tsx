import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ChefHat, 
  Plus, 
  Upload, 
  Download, 
  Bell, 
  Settings, 
  Search,
  BarChart3,
  Eye,
  RefreshCw,
  Zap,
  Edit,
  Trash2,
  GripVertical,
  EyeOff,
  Save,
  X,
  Clock,
  Star,
  Leaf,
  Flame,
  DollarSign,
  Filter,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react'

interface MenuSection {
  id: string
  tenantId: string
  locationId: string
  name: string
  description?: string
  sortIndex: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  items?: MenuItem[]
}

interface MenuItem {
  id: string
  sectionId: string
  tenantId: string
  locationId: string
  name: string
  description?: string
  price: number
  currency: string
  cost?: number
  imageUrl?: string
  images?: string[]
  isAvailable: boolean
  sortIndex: number
  tags: string[]
  allergens: string[]
  isVegetarian: boolean
  isVegan: boolean
  spicyLevel: number
  preparationTime?: number
  calories?: number
  nutritionalInfo?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export default function MenuManagement() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [editingSection, setEditingSection] = useState<MenuSection | null>(null)
  const [showItemEditor, setShowItemEditor] = useState(false)
  const [showSectionEditor, setShowSectionEditor] = useState(false)
  const [showBulkUploader, setShowBulkUploader] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')

  // Mock data - in real app, this would come from API
  const [sections, setSections] = useState<MenuSection[]>([
    {
      id: 'sec_1',
      tenantId: 'tenant_123',
      locationId: 'location_456',
      name: 'Appetizers',
      description: 'Start your meal with our delicious appetizers',
      sortIndex: 100,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: 'itm_1',
          sectionId: 'sec_1',
          tenantId: 'tenant_123',
          locationId: 'location_456',
          name: 'Truffle Arancini',
          description: 'Crispy risotto balls with black truffle, parmesan, and herb aioli',
          price: 16.00,
          currency: 'USD',
          cost: 6.50,
          imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
          isAvailable: true,
          sortIndex: 10,
          tags: ['signature', 'popular'],
          allergens: ['dairy', 'gluten'],
          isVegetarian: true,
          isVegan: false,
          spicyLevel: 0,
          preparationTime: 15,
          calories: 280,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'itm_2',
          sectionId: 'sec_1',
          tenantId: 'tenant_123',
          locationId: 'location_456',
          name: 'Pan-Seared Scallops',
          description: 'Fresh diver scallops with cauliflower purée and pancetta crisps',
          price: 24.00,
          currency: 'USD',
          cost: 12.00,
          imageUrl: 'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=400',
          isAvailable: true,
          sortIndex: 20,
          tags: ['premium', 'seafood'],
          allergens: ['shellfish'],
          isVegetarian: false,
          isVegan: false,
          spicyLevel: 0,
          preparationTime: 12,
          calories: 180,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: 'sec_2',
      tenantId: 'tenant_123',
      locationId: 'location_456',
      name: 'Main Courses',
      description: 'Our signature main dishes',
      sortIndex: 200,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: 'itm_3',
          sectionId: 'sec_2',
          tenantId: 'tenant_123',
          locationId: 'location_456',
          name: 'Wagyu Beef Tenderloin',
          description: 'Premium wagyu beef with roasted bone marrow and seasonal vegetables',
          price: 65.00,
          currency: 'USD',
          cost: 28.00,
          imageUrl: 'https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=400',
          isAvailable: true,
          sortIndex: 10,
          tags: ['premium', 'signature'],
          allergens: [],
          isVegetarian: false,
          isVegan: false,
          spicyLevel: 0,
          preparationTime: 25,
          calories: 420,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'itm_4',
          sectionId: 'sec_2',
          tenantId: 'tenant_123',
          locationId: 'location_456',
          name: 'Grilled Atlantic Salmon',
          description: 'Fresh salmon with herb crust, quinoa pilaf, and lemon butter sauce',
          price: 32.00,
          currency: 'USD',
          cost: 14.00,
          imageUrl: 'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=400',
          isAvailable: false,
          sortIndex: 20,
          tags: ['healthy', 'seafood'],
          allergens: ['fish'],
          isVegetarian: false,
          isVegan: false,
          spicyLevel: 0,
          preparationTime: 20,
          calories: 350,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: 'sec_3',
      tenantId: 'tenant_123',
      locationId: 'location_456',
      name: 'Desserts',
      description: 'Sweet endings to your meal',
      sortIndex: 300,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: 'itm_5',
          sectionId: 'sec_3',
          tenantId: 'tenant_123',
          locationId: 'location_456',
          name: 'Chocolate Lava Cake',
          description: 'Warm chocolate cake with molten center and vanilla ice cream',
          price: 14.00,
          currency: 'USD',
          cost: 4.50,
          imageUrl: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400',
          isAvailable: true,
          sortIndex: 10,
          tags: ['signature', 'popular'],
          allergens: ['dairy', 'eggs', 'gluten'],
          isVegetarian: true,
          isVegan: false,
          spicyLevel: 0,
          preparationTime: 12,
          calories: 450,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }
  ])

  // Get items for selected section or all items
  const displayItems = selectedSection 
    ? sections.find(s => s.id === selectedSection)?.items || []
    : sections.flatMap(s => s.items || [])

  // Filter items based on search and availability
  const filteredItems = displayItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAvailability = availabilityFilter === 'all' || 
                               (availabilityFilter === 'available' && item.isAvailable) ||
                               (availabilityFilter === 'out-of-stock' && !item.isAvailable)
    return matchesSearch && matchesAvailability
  })

  const stats = {
    totalItems: sections.reduce((total, section) => total + (section.items?.length || 0), 0),
    availableItems: sections.reduce((total, section) => 
      total + (section.items?.filter(item => item.isAvailable).length || 0), 0),
    totalSections: sections.filter(s => s.isActive).length,
    avgPrice: sections.reduce((total, section) => {
      const sectionTotal = section.items?.reduce((sum, item) => sum + item.price, 0) || 0
      return total + sectionTotal
    }, 0) / Math.max(1, sections.reduce((total, section) => total + (section.items?.length || 0), 0))
  }

  const handleCreateSection = () => {
    setEditingSection(null)
    setShowSectionEditor(true)
  }

  const handleEditSection = (section: MenuSection) => {
    setEditingSection(section)
    setShowSectionEditor(true)
  }

  const handleCreateItem = () => {
    setEditingItem(null)
    setShowItemEditor(true)
  }

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setShowItemEditor(true)
  }

  const handleToggleAvailability = (itemId: string, isAvailable: boolean) => {
    setSections(prev => prev.map(section => ({
      ...section,
      items: section.items?.map(item => 
        item.id === itemId ? { ...item, isAvailable } : item
      )
    })))
  }

  const getDietaryIcons = (item: MenuItem) => {
    const icons = []
    if (item.isVegan) icons.push(<Leaf key="vegan" className="w-4 h-4 text-green-600" title="Vegan" />)
    else if (item.isVegetarian) icons.push(<Leaf key="vegetarian" className="w-4 h-4 text-green-500" title="Vegetarian" />)
    
    if (item.spicyLevel > 0) {
      icons.push(
        <div key="spicy" className="flex" title={`Spicy Level: ${item.spicyLevel}`}>
          {[...Array(item.spicyLevel)].map((_, i) => (
            <Flame key={i} className="w-3 h-3 text-red-500" />
          ))}
        </div>
      )
    }
    
    return icons
  }

  const getMarginColor = (item: MenuItem) => {
    if (!item.cost) return 'text-gray-500'
    const margin = ((item.price - item.cost) / item.price) * 100
    if (margin >= 70) return 'text-green-600'
    if (margin >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMarginPercentage = (item: MenuItem) => {
    if (!item.cost) return 'N/A'
    return Math.round(((item.price - item.cost) / item.price) * 100) + '%'
  }

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
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">Live Sync</span>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
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
            <Link to="/admin/menu" className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableItems}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sections</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSections}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900">${stats.avgPrice.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCreateSection}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Section</span>
              </button>
              
              <button
                onClick={handleCreateItem}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
              
              <button
                onClick={() => setShowBulkUploader(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Bulk Upload</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Items</option>
                <option value="available">Available</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
              
              <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Sections */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Menu Sections</h3>
                  <button
                    onClick={handleCreateSection}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                <button
                  onClick={() => setSelectedSection(null)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedSection === null
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">All Sections</span>
                    <span className="text-sm text-gray-500">
                      {sections.reduce((total, section) => total + (section.items?.length || 0), 0)} items
                    </span>
                  </div>
                </button>

                {sections.map((section) => (
                  <div
                    key={section.id}
                    className={`group cursor-pointer border border-gray-200 rounded-lg transition-all ${
                      selectedSection === section.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div
                      onClick={() => setSelectedSection(section.id)}
                      className="p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div>
                            <div className="font-medium text-gray-900">{section.name}</div>
                            {section.description && (
                              <div className="text-sm text-gray-500 truncate">{section.description}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {section.items?.length || 0} items
                          </span>
                          {!section.isActive && (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-3 pb-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditSection(section)
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle archive
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Items Grid */}
          <div className="lg:col-span-3">
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedSection ? `No items in ${sections.find(s => s.id === selectedSection)?.name}` : 'No items found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {selectedSection ? 'Add your first menu item to get started' : 'Select a section or adjust your filters'}
                </p>
                {selectedSection && (
                  <button
                    onClick={handleCreateItem}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add First Item
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedSection ? sections.find(s => s.id === selectedSection)?.name : 'All Menu Items'} ({filteredItems.length})
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Live Sync</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className={`group border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all ${
                          !item.isAvailable ? 'opacity-75' : ''
                        }`}
                      >
                        <div className="relative">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="absolute top-2 right-2 flex space-x-1">
                            {item.tags.includes('popular') && (
                              <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                Popular
                              </span>
                            )}
                            {item.tags.includes('signature') && (
                              <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                Signature
                              </span>
                            )}
                            {!item.isAvailable && (
                              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                Out of Stock
                              </span>
                            )}
                          </div>

                          <div className="absolute top-2 left-2">
                            <GripVertical className="w-5 h-5 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">${item.price}</div>
                              {item.cost && (
                                <div className={`text-xs ${getMarginColor(item)}`}>
                                  {getMarginPercentage(item)} margin
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {item.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getDietaryIcons(item)}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              {item.preparationTime && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{item.preparationTime}m</span>
                                </div>
                              )}
                              {item.calories && (
                                <span>{item.calories} cal</span>
                              )}
                            </div>
                          </div>

                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {item.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                  {tag}
                                </span>
                              ))}
                              {item.tags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                  +{item.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleAvailability(item.id, !item.isAvailable)}
                                className={`p-1 rounded transition-colors ${
                                  item.isAvailable 
                                    ? 'text-green-600 hover:text-green-800' 
                                    : 'text-red-600 hover:text-red-800'
                                }`}
                              >
                                {item.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleEditItem(item)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  // Handle archive
                                }}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.isAvailable}
                                onChange={(e) => handleToggleAvailability(item.id, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Simple Modals for Demo */}
        {showSectionEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingSection ? 'Edit Section' : 'Add New Section'}
                  </h3>
                  <button
                    onClick={() => setShowSectionEditor(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Appetizers, Main Courses"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description..."
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowSectionEditor(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowSectionEditor(false)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Section
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showItemEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                  </h3>
                  <button
                    onClick={() => setShowItemEditor(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter item name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select section</option>
                        {sections.filter(s => s.isActive).map(section => (
                          <option key={section.id} value={section.id}>{section.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe the item..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          step="0.01"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cost</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          step="0.01"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowItemEditor(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowItemEditor(false)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showBulkUploader && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Bulk Upload Menu Items</h3>
                  <button
                    onClick={() => setShowBulkUploader(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Upload CSV or JSON file</p>
                  <p className="text-sm text-gray-600 mb-4">Drag and drop or click to browse</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Choose File
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    Download CSV Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}