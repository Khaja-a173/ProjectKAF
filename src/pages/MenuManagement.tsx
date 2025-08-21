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
  Zap
} from 'lucide-react'
import { useMenuManagement } from '../hooks/useMenuManagement'
import { MenuItem, MenuSection } from '../types/menu'
import SectionList from '../components/menu/SectionList'
import ItemGrid from '../components/menu/ItemGrid'
import ItemEditor from '../components/menu/ItemEditor'
import SectionEditor from '../components/menu/SectionEditor'
import BulkUploader from '../components/menu/BulkUploader'
import MenuFilters from '../components/menu/MenuFilters'

export default function MenuManagement() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [editingSection, setEditingSection] = useState<MenuSection | null>(null)
  const [showItemEditor, setShowItemEditor] = useState(false)
  const [showSectionEditor, setShowSectionEditor] = useState(false)
  const [showBulkUploader, setShowBulkUploader] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Mock tenant and location - in real app, get from auth context
  const tenantId = 'tenant_123'
  const locationId = 'location_456'

  const {
    sections,
    loading,
    error,
    filters,
    setFilters,
    createSection,
    updateSection,
    reorderSections,
    archiveSection,
    createItem,
    updateItem,
    toggleItemAvailability,
    reorderItems,
    moveItem,
    bulkUpload,
    refetch
  } = useMenuManagement({ tenantId, locationId })

  // Get items for selected section or all items
  const displayItems = selectedSection 
    ? sections.find(s => s.id === selectedSection)?.items || []
    : sections.flatMap(s => s.items || [])

  // Get available tags and allergens for filters
  const availableTags = [...new Set(sections.flatMap(s => s.items?.flatMap(i => i.tags) || []))]
  const availableAllergens = [...new Set(sections.flatMap(s => s.items?.flatMap(i => i.allergens) || []))]

  const handleCreateSection = () => {
    setEditingSection(null)
    setShowSectionEditor(true)
  }

  const handleEditSection = (section: MenuSection) => {
    setEditingSection(section)
    setShowSectionEditor(true)
  }

  const handleSaveSection = async (data: Partial<MenuSection>) => {
    try {
      if (editingSection) {
        await updateSection(editingSection.id, data)
      } else {
        await createSection(data)
      }
    } catch (err) {
      alert('Failed to save section')
    }
  }

  const handleCreateItem = () => {
    setEditingItem(null)
    setShowItemEditor(true)
  }

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setShowItemEditor(true)
  }

  const handleSaveItem = async (data: Partial<MenuItem>) => {
    try {
      if (editingItem?.id) {
        await updateItem(editingItem.id, data)
      } else {
        await createItem(data)
      }
    } catch (err) {
      alert('Failed to save item')
    }
  }

  const handleArchiveSection = async (sectionId: string) => {
    if (confirm('Are you sure you want to archive this section? Items will be moved to "Archived" section.')) {
      try {
        await archiveSection(sectionId)
      } catch (err) {
        alert('Failed to archive section')
      }
    }
  }

  const handleArchiveItem = async (itemId: string) => {
    if (confirm('Are you sure you want to archive this item?')) {
      try {
        await updateItem(itemId, { isAvailable: false })
      } catch (err) {
        alert('Failed to archive item')
      }
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load menu</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
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
              <button
                onClick={refetch}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
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
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
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
            <div className="space-y-6">
              <SectionList
                sections={sections}
                selectedSection={selectedSection}
                onSelectSection={setSelectedSection}
                onCreateSection={handleCreateSection}
                onEditSection={handleEditSection}
                onArchiveSection={handleArchiveSection}
                onReorderSections={reorderSections}
              />

              {showFilters && (
                <MenuFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  availableTags={availableTags}
                  availableAllergens={availableAllergens}
                />
              )}
            </div>
          </div>

          {/* Main Content - Items Grid */}
          <div className="lg:col-span-3">
            <ItemGrid
              section={selectedSection ? sections.find(s => s.id === selectedSection) || null : null}
              items={displayItems}
              onEditItem={handleEditItem}
              onToggleAvailability={toggleItemAvailability}
              onArchiveItem={handleArchiveItem}
              onReorderItems={reorderItems}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ItemEditor
        item={editingItem}
        sections={sections}
        isOpen={showItemEditor}
        onClose={() => setShowItemEditor(false)}
        onSave={handleSaveItem}
      />

      <SectionEditor
        section={editingSection}
        isOpen={showSectionEditor}
        onClose={() => setShowSectionEditor(false)}
        onSave={handleSaveSection}
      />

      <BulkUploader
        isOpen={showBulkUploader}
        onClose={() => setShowBulkUploader(false)}
        onUpload={bulkUpload}
      />
    </div>
  )
}