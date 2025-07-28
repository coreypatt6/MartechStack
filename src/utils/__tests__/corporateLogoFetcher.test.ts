import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchCorporateLogo, generateHighQualityFallback } from '../corporateLogoFetcher'

// Mock fetch
global.fetch = vi.fn()

describe('corporateLogoFetcher', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('generateHighQualityFallback', () => {
    it('generates consistent fallback logo for vendor', () => {
      const fallback1 = generateHighQualityFallback('Salesforce', 'CRM')
      const fallback2 = generateHighQualityFallback('Salesforce', 'CRM')
      
      expect(fallback1).toBe(fallback2)
      expect(fallback1).toContain('ui-avatars.com')
      expect(fallback1).toContain('name=S') // Uses first letter
    })

    it('generates different fallbacks for different vendors', () => {
      const salesforce = generateHighQualityFallback('Salesforce', 'CRM')
      const hubspot = generateHighQualityFallback('HubSpot', 'Marketing')
      
      expect(salesforce).not.toBe(hubspot)
    })
  })

  describe('fetchCorporateLogo', () => {
    it('returns a logo result structure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({
          'content-type': 'image/png'
        })
      } as Response)

      const result = await fetchCorporateLogo('Salesforce')
      
      expect(result).toHaveProperty('vendorName', 'Salesforce')
      expect(result).toHaveProperty('logoUrl')
      expect(result).toHaveProperty('source')
      expect(result).toHaveProperty('confidence')
      expect(result).toHaveProperty('alternativeUrls')
    })
  })
})