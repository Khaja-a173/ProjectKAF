import { useState, useEffect, useCallback } from 'react'
import { MenuSection, MenuItem, MenuFilters, BulkUploadResult, MenuRealtimeEvent } from '../types/menu'

interface UseMenuManagementProps {
  tenantId: string
  locationId: string
}

export function useMenuManagement({ tenantId, locationId }: UseMenuManagementProps) {
  const [sections, setSections] = useState<MenuSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<MenuFilters>({
    search: '',
    section: 'all',
    availability: 'all',
    tags: [],
    allergens: [],
    dietary: []
  })

  // Simulated API calls - replace with actual API integration
  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true)
      // Simulate API call
      const mockSections: MenuSection[] = [
        {
          id: 'sec_1',
          tenantId,
          locationId,
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
              tenantId,
              locationId,
              name: 'Truffle Arancini',
              description: 'Crispy risotto balls with black truffle and parmesan',
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
              tenantId,
              locationId,
              name: 'Pan-Seared Scallops',
              description: 'Fresh diver scallops with cauliflower purée',
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
          tenantId,
          locationId,
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
              tenantId,
              locationId,
              name: 'Wagyu Beef Tenderloin',
              description: 'Premium wagyu beef with seasonal vegetables',
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
              tenantId,
              locationId,
              name: 'Grilled Atlantic Salmon',
              description: 'Fresh salmon with herb crust and quinoa pilaf',
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
        }
      ]
      
      setSections(mockSections)
      setError(null)
    } catch (err) {
      setError('Failed to load menu')
      console.error('Menu fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [tenantId, locationId])

  // Real-time subscription simulation
  useEffect(() => {
    fetchMenu()
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Simulate random availability changes
      setSections(prev => prev.map(section => ({
        ...section,
        items: section.items?.map(item => 
          Math.random() > 0.95 ? { ...item, isAvailable: !item.isAvailable } : item
        )
      })))
    }, 10000)

    return () => clearInterval(interval)
  }, [fetchMenu])

  const createSection = useCallback(async (data: Partial<MenuSection>) => {
    try {
      const newSection: MenuSection = {
        id: `sec_${Date.now()}`,
        tenantId,
        locationId,
        name: data.name || '',
        description: data.description,
        sortIndex: sections.length * 100 + 100,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: []
      }
      
      setSections(prev => [...prev, newSection].sort((a, b) => a.sortIndex - b.sortIndex))
      return newSection
    } catch (err) {
      throw new Error('Failed to create section')
    }
  }, [tenantId, locationId, sections.length])

  const updateSection = useCallback(async (id: string, data: Partial<MenuSection>) => {
    try {
      setSections(prev => prev.map(section => 
        section.id === id 
          ? { ...section, ...data, updatedAt: new Date() }
          : section
      ))
    } catch (err) {
      throw new Error('Failed to update section')
    }
  }, [])

  const reorderSections = useCallback(async (order: Array<{ id: string; sortIndex: number }>) => {
    try {
      setSections(prev => prev.map(section => {
        const newOrder = order.find(o => o.id === section.id)
        return newOrder ? { ...section, sortIndex: newOrder.sortIndex } : section
      }).sort((a, b) => a.sortIndex - b.sortIndex))
    } catch (err) {
      throw new Error('Failed to reorder sections')
    }
  }, [])

  const archiveSection = useCallback(async (id: string) => {
    try {
      setSections(prev => prev.map(section => 
        section.id === id 
          ? { ...section, isActive: false, updatedAt: new Date() }
          : section
      ))
    } catch (err) {
      throw new Error('Failed to archive section')
    }
  }, [])

  const createItem = useCallback(async (data: Partial<MenuItem>) => {
    try {
      const section = sections.find(s => s.id === data.sectionId)
      if (!section) throw new Error('Section not found')

      const newItem: MenuItem = {
        id: `itm_${Date.now()}`,
        sectionId: data.sectionId!,
        tenantId,
        locationId,
        name: data.name || '',
        description: data.description,
        price: data.price || 0,
        currency: data.currency || 'USD',
        cost: data.cost,
        imageUrl: data.imageUrl,
        isAvailable: data.isAvailable ?? true,
        sortIndex: (section.items?.length || 0) * 10 + 10,
        tags: data.tags || [],
        allergens: data.allergens || [],
        isVegetarian: data.isVegetarian || false,
        isVegan: data.isVegan || false,
        spicyLevel: data.spicyLevel || 0,
        preparationTime: data.preparationTime,
        calories: data.calories,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setSections(prev => prev.map(section => 
        section.id === data.sectionId
          ? { 
              ...section, 
              items: [...(section.items || []), newItem].sort((a, b) => a.sortIndex - b.sortIndex)
            }
          : section
      ))
      
      return newItem
    } catch (err) {
      throw new Error('Failed to create item')
    }
  }, [tenantId, locationId, sections])

  const updateItem = useCallback(async (id: string, data: Partial<MenuItem>) => {
    try {
      setSections(prev => prev.map(section => ({
        ...section,
        items: section.items?.map(item => 
          item.id === id 
            ? { ...item, ...data, updatedAt: new Date() }
            : item
        )
      })))
    } catch (err) {
      throw new Error('Failed to update item')
    }
  }, [])

  const toggleItemAvailability = useCallback(async (id: string, isAvailable: boolean) => {
    try {
      setSections(prev => prev.map(section => ({
        ...section,
        items: section.items?.map(item => 
          item.id === id 
            ? { ...item, isAvailable, updatedAt: new Date() }
            : item
        )
      })))
    } catch (err) {
      throw new Error('Failed to toggle availability')
    }
  }, [])

  const reorderItems = useCallback(async (sectionId: string, order: Array<{ id: string; sortIndex: number }>) => {
    try {
      setSections(prev => prev.map(section => 
        section.id === sectionId
          ? {
              ...section,
              items: section.items?.map(item => {
                const newOrder = order.find(o => o.id === item.id)
                return newOrder ? { ...item, sortIndex: newOrder.sortIndex } : item
              }).sort((a, b) => a.sortIndex - b.sortIndex)
            }
          : section
      ))
    } catch (err) {
      throw new Error('Failed to reorder items')
    }
  }, [])

  const moveItem = useCallback(async (itemId: string, fromSectionId: string, toSectionId: string, sortIndex: number) => {
    try {
      setSections(prev => prev.map(section => {
        if (section.id === fromSectionId) {
          return {
            ...section,
            items: section.items?.filter(item => item.id !== itemId)
          }
        }
        if (section.id === toSectionId) {
          const item = prev.find(s => s.id === fromSectionId)?.items?.find(i => i.id === itemId)
          if (item) {
            return {
              ...section,
              items: [...(section.items || []), { ...item, sectionId: toSectionId, sortIndex }]
                .sort((a, b) => a.sortIndex - b.sortIndex)
            }
          }
        }
        return section
      }))
    } catch (err) {
      throw new Error('Failed to move item')
    }
  }, [])

  const bulkUpload = useCallback(async (items: BulkUploadItem[]): Promise<BulkUploadResult> => {
    try {
      let created = 0
      let updated = 0
      let skipped = 0
      const errors: Array<{ row: number; message: string; data: any }> = []

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        try {
          // Find or create section
          let section = sections.find(s => s.name.toLowerCase() === item.section.toLowerCase())
          if (!section) {
            section = await createSection({ name: item.section })
          }

          // Check if item exists
          const existingItem = section.items?.find(itm => itm.name.toLowerCase() === item.name.toLowerCase())
          
          if (existingItem) {
            await updateItem(existingItem.id, {
              description: item.description,
              price: item.price,
              cost: item.cost,
              imageUrl: item.imageUrl,
              tags: item.tags || [],
              allergens: item.allergens || [],
              isVegetarian: item.isVegetarian || false,
              isVegan: item.isVegan || false,
              spicyLevel: item.spicyLevel || 0
            })
            updated++
          } else {
            await createItem({
              sectionId: section.id,
              name: item.name,
              description: item.description,
              price: item.price,
              cost: item.cost,
              imageUrl: item.imageUrl,
              tags: item.tags || [],
              allergens: item.allergens || [],
              isVegetarian: item.isVegetarian || false,
              isVegan: item.isVegan || false,
              spicyLevel: item.spicyLevel || 0
            })
            created++
          }
        } catch (err) {
          errors.push({
            row: i + 1,
            message: err instanceof Error ? err.message : 'Unknown error',
            data: item
          })
        }
      }

      return { created, updated, skipped, errors }
    } catch (err) {
      throw new Error('Bulk upload failed')
    }
  }, [sections, createSection, createItem, updateItem])

  // Filter sections and items based on current filters
  const filteredSections = sections.filter(section => {
    if (!section.isActive && filters.availability !== 'archived') return false
    if (filters.section !== 'all' && section.id !== filters.section) return false
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const sectionMatch = section.name.toLowerCase().includes(searchLower)
      const itemMatch = section.items?.some(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      )
      if (!sectionMatch && !itemMatch) return false
    }

    return true
  }).map(section => ({
    ...section,
    items: section.items?.filter(item => {
      if (filters.availability === 'available' && !item.isAvailable) return false
      if (filters.availability === 'out-of-stock' && item.isAvailable) return false
      
      if (filters.tags.length > 0 && !filters.tags.some(tag => item.tags.includes(tag))) return false
      if (filters.allergens.length > 0 && !filters.allergens.some(allergen => item.allergens.includes(allergen))) return false
      
      if (filters.dietary.includes('vegetarian') && !item.isVegetarian) return false
      if (filters.dietary.includes('vegan') && !item.isVegan) return false

      return true
    })
  }))

  return {
    sections: filteredSections,
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
    refetch: fetchMenu
  }
}