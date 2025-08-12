export interface Category {
  category_id: number
  parent_id: number
  tree_id: number
  name: string
  url: {
    path: string
    is_customized: boolean
  }
  is_visible: boolean
  children?: Category[]
  count?: number
}

export interface CategorySelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (selectedCategories: SelectedCategory[]) => void
  initialSelectedCategories?: SelectedCategory[]
}

export interface SelectedCategory {
  id: number
  name: string
  channelId: number
  channelName: string
  path?: string
}

// Cache for API responses

// Global state to remember selections across modal opens
