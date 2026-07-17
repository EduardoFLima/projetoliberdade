import type { Route } from './+types/MomentosVideosRoute'
import MomentosPage from './MomentosPage'
import { momentosMeta } from './momentosSelectors'

export function meta({ matches }: Route.MetaArgs) {
  return momentosMeta(matches[1]?.loaderData)
}

export default function MomentosVideosRoute() {
  return <MomentosPage />
}
