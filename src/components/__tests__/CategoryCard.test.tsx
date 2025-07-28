import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CategoryCard } from '../CategoryCard'

const mockCategory = {
  id: 'test-category',
  name: 'Test Category',
  description: 'A test category description',
  vendors: [],
  color: '#3B82F6',
  icon: 'Package',
  gradient: 'from-blue-500 to-purple-600'
}

describe('CategoryCard', () => {
  const mockOnClick = vi.fn()

  it('renders category name and description', () => {
    render(<CategoryCard category={mockCategory} onClick={mockOnClick} />)
    
    expect(screen.getByText('Test Category')).toBeInTheDocument()
    expect(screen.getByText('A test category description')).toBeInTheDocument()
  })

  it('displays vendor count correctly', () => {
    const categoryWithVendors = {
      ...mockCategory,
      vendors: [
        { id: '1', name: 'Vendor 1', website: '', logo: '', category: 'test', description: '' },
        { id: '2', name: 'Vendor 2', website: '', logo: '', category: 'test', description: '' }
      ]
    }
    
    render(<CategoryCard category={categoryWithVendors} onClick={mockOnClick} />)
    expect(screen.getByText('2 vendors')).toBeInTheDocument()
  })
})