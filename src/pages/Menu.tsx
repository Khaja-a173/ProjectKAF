import React, { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Search, Filter, Star, Clock, Leaf, Flame } from 'lucide-react'

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'appetizers', name: 'Appetizers' },
    { id: 'mains', name: 'Main Courses' },
    { id: 'desserts', name: 'Desserts' },
    { id: 'beverages', name: 'Beverages' },
    { id: 'specials', name: 'Chef\'s Specials' }
  ]

  const menuItems = [
    {
      id: 1,
      name: 'Truffle Arancini',
      category: 'appetizers',
      price: 16,
      description: 'Crispy risotto balls with black truffle, parmesan, and herb aioli',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      prepTime: '15 min',
      rating: 4.8,
      dietary: ['vegetarian'],
      spiceLevel: 0
    },
    {
      id: 2,
      name: 'Pan-Seared Scallops',
      category: 'appetizers',
      price: 24,
      description: 'Fresh diver scallops with cauliflower purée and pancetta crisps',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      prepTime: '12 min',
      rating: 4.9,
      dietary: ['gluten-free'],
      spiceLevel: 0
    },
    {
      id: 3,
      name: 'Wagyu Beef Tenderloin',
      category: 'mains',
      price: 65,
      description: 'Premium wagyu beef with roasted bone marrow, seasonal vegetables, and red wine jus',
      image: 'https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=400',
      prepTime: '25 min',
      rating: 4.9,
      dietary: ['gluten-free'],
      spiceLevel: 0
    },
    {
      id: 4,
      name: 'Grilled Atlantic Salmon',
      category: 'mains',
      price: 32,
      description: 'Fresh salmon with herb crust, quinoa pilaf, and lemon butter sauce',
      image: 'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=400',
      prepTime: '20 min',
      rating: 4.7,
      dietary: ['gluten-free', 'healthy'],
      spiceLevel: 0
    },
    {
      id: 5,
      name: 'Lobster Risotto',
      category: 'mains',
      price: 42,
      description: 'Creamy arborio rice with fresh lobster, saffron, and microgreens',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      prepTime: '30 min',
      rating: 4.8,
      dietary: ['gluten-free'],
      spiceLevel: 0
    },
    {
      id: 6,
      name: 'Spicy Thai Curry',
      category: 'mains',
      price: 28,
      description: 'Coconut curry with vegetables, jasmine rice, and fresh herbs',
      image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=400',
      prepTime: '18 min',
      rating: 4.6,
      dietary: ['vegan', 'gluten-free'],
      spiceLevel: 3
    },
    {
      id: 7,
      name: 'Chocolate Lava Cake',
      category: 'desserts',
      price: 14,
      description: 'Warm chocolate cake with molten center, vanilla ice cream, and berry coulis',
      image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400',
      prepTime: '12 min',
      rating: 4.9,
      dietary: ['vegetarian'],
      spiceLevel: 0
    },
    {
      id: 8,
      name: 'Tiramisu',
      category: 'desserts',
      price: 12,
      description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone',
      image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?auto=compress&cs=tinysrgb&w=400',
      prepTime: '5 min',
      rating: 4.7,
      dietary: ['vegetarian'],
      spiceLevel: 0
    },
    {
      id: 9,
      name: 'Craft Beer Selection',
      category: 'beverages',
      price: 8,
      description: 'Rotating selection of local craft beers',
      image: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=400',
      prepTime: '2 min',
      rating: 4.5,
      dietary: [],
      spiceLevel: 0
    },
    {
      id: 10,
      name: 'Tasting Menu',
      category: 'specials',
      price: 95,
      description: '7-course chef\'s tasting menu with wine pairings',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      prepTime: '120 min',
      rating: 5.0,
      dietary: [],
      spiceLevel: 0
    }
  ]

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getDietaryIcon = (dietary: string[]) => {
    if (dietary.includes('vegan') || dietary.includes('vegetarian')) {
      return <Leaf className="w-4 h-4 text-green-500" />
    }
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
                <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{item.rating}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                  <span className="text-2xl font-bold text-orange-600">${item.price}</span>
                </div>
                
                <p className="text-gray-600 mb-4">{item.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{item.prepTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getDietaryIcon(item.dietary)}
                    {getSpiceLevel(item.spiceLevel)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  {item.dietary.map((diet, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {diet}
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