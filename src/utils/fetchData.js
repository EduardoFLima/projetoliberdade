import fallbackData from '../data/websiteFallback.json'

const FIREBASE_URL = 'https://projetoliberdade-afe28.firebaseio.com/website.json'

export async function fetchData() {
  try {
    const response = await fetch(FIREBASE_URL)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return await response.json()
  } catch {
    return fallbackData
  }
}
