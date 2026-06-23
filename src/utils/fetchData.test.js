import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchData } from '../utils/fetchData'

const FIREBASE_URL = 'https://projetoliberdade-afe28.firebaseio.com/website.json'

describe('fetchData', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns data from Firebase when fetch succeeds', async () => {
    const mockData = { home: { foto1: { src: 'test.jpg' } } }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    })

    const result = await fetchData()

    expect(global.fetch).toHaveBeenCalledWith(FIREBASE_URL)
    expect(result).toEqual(mockData)
  })

  it('returns fallback data when fetch throws a network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const result = await fetchData()

    expect(result).toBeDefined()
    expect(result).toHaveProperty('home')
    expect(result).toHaveProperty('historia')
    expect(result).toHaveProperty('servicos')
  })

  it('returns fallback data when response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    const result = await fetchData()

    expect(result).toBeDefined()
    expect(result).toHaveProperty('contato')
  })
})
