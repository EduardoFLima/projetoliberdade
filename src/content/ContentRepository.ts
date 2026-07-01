import type { SiteContent } from './types'

/**
 * Port for the content source. UI depends only on this interface, never on a
 * concrete data source. Today: JsonContentRepository (bundled snapshot).
 * Later: RtdbContentRepository (Firebase Realtime Database, runtime fetch) —
 * same interface, swap the binding in content.ts. Async by design so the
 * future RTDB adapter is a drop-in.
 */
export interface ContentRepository {
  getContent(): Promise<SiteContent>
}
