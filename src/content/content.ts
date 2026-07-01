import type { ContentRepository } from './ContentRepository'
import { JsonContentRepository } from './JsonContentRepository'

/**
 * The single place that selects the active content source. Swap to
 * RtdbContentRepository here when Firebase is wired up — nothing else changes.
 */
export const contentRepository: ContentRepository = new JsonContentRepository()
