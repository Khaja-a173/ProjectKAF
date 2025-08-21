import React, { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Search, Filter, Star, Clock, Leaf, Flame } from 'lucide-react'
import { useMenuManagement } from '../hooks/useMenuManagement'

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Use real menu data from management system
  const { sections, loading } = useMenuManagement({
    tenantId: 'tenant_123',
    locationId: 'location_456'
  })

  const categories = [
    { id: 'all', name: 'All Items' },
    ...sections.filter(s => s.isActive).map(section => ({ id: section.id, name: section.name }))
  ]

  // Get all available items from sections
  const allItems = sections.flatMap(section => section.items || [])
  
  const filteredItems = allItems.filter(item => {
    if (!item.isAvailable) return false // Only show available items
    
    const matchesCategory = selectedCategory === 'all' || item.sectionId === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading menu...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Original beautiful menu design (unchanged)
  const getDietaryIcon = (item: any) => {
    if (item.isVegan) return <Leaf className="w-4 h-4 text-green-600" />
    if (item.isVegetarian) return <Leaf className="w-4 h-4 text-green-500" />
    return null
  }

  const getSpiceLevel = (level: number) => {
    if (level === 0) return null
    return (
      <div className="flex items-center">
        {[...Array(level)].map((_, i) => (
          <Flame key={i} className="w-3 h-3 text-red-500" />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920)'
          }}
        ></div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Our Menu</h1>
          <p className="text-xl">Discover our culinary masterpieces</p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Live Menu - Synced with Kitchen</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>
                {item.tags.includes('popular') && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Popular
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                  <span className="text-2xl font-bold text-orange-600">${item.price}</span>
                </div>
                
                <p className="text-gray-600 mb-4">{item.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    {item.preparationTime && (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>{item.preparationTime} min</span>
                      </>
                    )}
                    {item.calories && (
                      <span>{item.calories} cal</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getDietaryIcon(item)}
                    {getSpiceLevel(item.spiceLevel)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-colors font-medium">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No menu items found matching your criteria.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}