import { useEffect, useState } from 'react'
import { contentRepository } from './content'
import type { SiteContent } from './types'

interface ContentState {
  content: SiteContent | null
  loading: boolean
  error: Error | null
}

/**
 * Loads site content through the active ContentRepository. Components use this
 * hook and never touch the data source directly (see the dependency rule).
 */
export function useContent(): ContentState {
  const [state, setState] = useState<ContentState>({
    content: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let active = true
    contentRepository
      .getContent()
      .then((content) => {
        if (active) setState({ content, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (active)
          setState({
            content: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          })
      })
    return () => {
      active = false
    }
  }, [])

  return state
}
