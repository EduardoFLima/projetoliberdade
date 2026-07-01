import rawContent from './content.json'
import type { ContentRepository } from './ContentRepository'
import type { SiteContent } from './types'

/**
 * Loads content from the bundled content.json snapshot. Returns a Promise to
 * satisfy the ContentRepository contract and to mirror the future RTDB adapter,
 * which will fetch asynchronously.
 */
export class JsonContentRepository implements ContentRepository {
  getContent(): Promise<SiteContent> {
    return Promise.resolve(rawContent as unknown as SiteContent)
  }
}
