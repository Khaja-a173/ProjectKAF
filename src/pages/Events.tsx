import React, { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Calendar, Clock, MapPin, Users, Wine, Music, ChefHat, Heart } from 'lucide-react'

export default function Events() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'dining', name: 'Special Dining' },
    { id: 'wine', name: 'Wine Events' },
    { id: 'cooking', name: 'Cooking Classes' },
    { id: 'private', name: 'Private Events' }
  ]

  const events = [
    {
      id: 1,
      title: 'Wine Tasting Evening',
      category: 'wine',
      date: '2024-03-15',
      time: '7:00 PM - 10:00 PM',
      price: 85,
      capacity: 20,
      booked: 15,
      description: 'Join our sommelier for an exclusive wine tasting featuring rare vintages from around the world.',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=600',
      features: ['Expert Sommelier', '6 Wine Varieties', 'Cheese Pairings', 'Take-home Notes'],
      icon: Wine
    },
    {
      id: 2,
      title: 'Chef\'s Table Experience',
      category: 'dining',
      date: '2024-03-20',
      time: '6:30 PM - 9:30 PM',
      price: 150,
      capacity: 8,
      booked: 6,
      description: 'An intimate dining experience at the chef\'s table with a 7-course tasting menu.',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
      features: ['7-Course Menu', 'Wine Pairings', 'Chef Interaction', 'Kitchen View'],
      icon: ChefHat
    },
    {
      id: 3,
      title: 'Cooking Masterclass',
      category: 'cooking',
      date: '2024-03-25',
      time: '2:00 PM - 5:00 PM',
      price: 120,
      capacity: 12,
      booked: 8,
      description: 'Learn to prepare our signature dishes with hands-on guidance from our head chef.',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600',
      features: ['Hands-on Cooking', 'Recipe Cards', 'Apron & Tools', 'Full Meal'],
      icon: ChefHat
    },
    {
      id: 4,
      title: 'Valentine\'s Special Dinner',
      category: 'dining',
      date: '2024-02-14',
      time: '7:00 PM - 10:00 PM',
      price: 95,
      capacity: 30,
      booked: 28,
      description: 'Romantic dinner for couples with special menu and live acoustic music.',
      image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=600',
      features: ['Romantic Setting', 'Special Menu', 'Live Music', 'Complimentary Champagne'],
      icon: Heart
    },
    {
      id: 5,
      title: 'Jazz Night Dinner',
      category: 'dining',
      date: '2024-03-30',
      time: '8:00 PM - 11:00 PM',
      price: 75,
      capacity: 40,
      booked: 22,
      description: 'Enjoy dinner with live jazz performances by local musicians.',
      image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=600',
      features: ['Live Jazz Band', 'Special Menu', 'Cocktail Selection', 'Dancing'],
      icon: Music
    },
    {
      id: 6,
      title: 'Private Corporate Event',
      category: 'private',
      date: '2024-04-05',
      time: '6:00 PM - 10:00 PM',
      price: 200,
      capacity: 50,
      booked: 0,
      description: 'Exclusive venue hire for corporate events, team building, and celebrations.',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600',
      features: ['Full Venue', 'Custom Menu', 'AV Equipment', 'Dedicated Staff'],
      icon: Users
    }
  ]

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getAvailabilityColor = (booked: number, capacity: number) => {
    const percentage = (booked / capacity) * 100
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-green-600'
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
            backgroundImage: 'url(https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1920)'
          }}
        ></div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Events</h1>
          <p className="text-xl">Special experiences and memorable occasions</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
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

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <event.icon className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                  <span className="text-2xl font-bold text-orange-600">${event.price}</span>
                </div>
                
                <p className="text-gray-600 mb-4">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-orange-500" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-orange-500" />
                    <span className={getAvailabilityColor(event.booked, event.capacity)}>
                      {event.capacity - event.booked} spots available ({event.booked}/{event.capacity})
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">What's Included:</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {event.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button 
                  className={`w-full py-3 rounded-xl font-medium transition-colors ${
                    event.booked >= event.capacity
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700'
                  }`}
                  disabled={event.booked >= event.capacity}
                >
                  {event.booked >= event.capacity ? 'Fully Booked' : 'Book Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Event Booking Info */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Host Your Event</h2>
            <p className="text-xl text-gray-600">Let us create an unforgettable experience for your special occasion</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Private Events</h3>
              <p className="text-gray-600">Corporate events, birthdays, anniversaries, and more</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Menus</h3>
              <p className="text-gray-600">Tailored menus to suit your preferences and dietary needs</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Service</h3>
              <p className="text-gray-600">Complete event planning and coordination services</p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-colors font-medium">
              Contact Event Planner
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}