export interface Page {
  id: string
  tenantId: string
  locationId?: string
  slug: string
  name: string
  version: number
  status: 'draft' | 'published' | 'scheduled'
  sections: PageSection[]
  seoMeta: SEOMeta
  theme?: ThemeOverrides
  publishedAt?: Date
  scheduledAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface PageSection {
  id: string
  type: SectionType
  title?: string
  sortIndex: number
  visible: boolean
  props: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export type SectionType = 
  | 'hero_video'
  | 'image_gallery'
  | 'achievements_counters'
  | 'menu_sections_preview'
  | 'event_cards'
  | 'contact_block'
  | 'cta_banner'
  | 'image_slider'
  | 'rich_text'
  | 'faq_accordion'
  | 'chef_spotlight'
  | 'testimonials'
  | 'map_fullscreen'

export interface SectionSchema {
  type: SectionType
  name: string
  description: string
  icon: string
  category: 'content' | 'media' | 'interactive' | 'data'
  schema: Record<string, any>
  defaultProps: Record<string, any>
  preview: string
}

export interface Asset {
  id: string
  tenantId: string
  url: string
  secureUrl: string
  kind: 'IMAGE' | 'VIDEO' | 'SLIDE'
  source: 'device' | 'url'
  metadata: {
    width: number
    height: number
    size: number
    format: string
    duration?: number
  }
  alt?: string
  caption?: string
  tags: string[]
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Theme {
  id: string
  tenantId: string
  locationId?: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    success: string
    warning: string
    error: string
  }
  typography: {
    fontFamily: string
    headingFont?: string
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
    lineHeight: {
      tight: number
      normal: number
      relaxed: number
    }
  }
  spacing: {
    unit: number
    scale: number[]
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  logo?: Asset
  favicon?: Asset
  ogImage?: Asset
  createdAt: Date
  updatedAt: Date
}

export interface ThemeOverrides {
  colors?: Partial<Theme['colors']>
  typography?: Partial<Theme['typography']>
  spacing?: Partial<Theme['spacing']>
  borderRadius?: Partial<Theme['borderRadius']>
  shadows?: Partial<Theme['shadows']>
  logo?: Asset
  favicon?: Asset
  ogImage?: Asset
}

export interface SEOMeta {
  title: string
  description: string
  keywords: string[]
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: Asset
  twitterCard?: 'summary' | 'summary_large_image'
  noIndex?: boolean
}

export interface PageVersion {
  id: string
  pageId: string
  version: number
  sections: PageSection[]
  seoMeta: SEOMeta
  theme?: ThemeOverrides
  publishedBy: string
  publishedAt: Date
  changelog?: string
  diff?: Record<string, any>
}

export interface CustomizationFilters {
  search: string
  status: 'all' | 'draft' | 'published' | 'scheduled'
  page: string
  location: string
}

export interface BulkUploadResult {
  created: number
  updated: number
  skipped: number
  errors: Array<{
    row: number
    message: string
    data: any
  }>
}

export interface RealtimeEvent {
  type: 'page.updated' | 'page.published' | 'theme.updated' | 'asset.uploaded'
  tenantId: string
  locationId?: string
  data: any
  timestamp: Date
}