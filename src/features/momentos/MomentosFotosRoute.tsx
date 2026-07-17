import type { Route } from './+types/MomentosFotosRoute'
import MomentosPage from './MomentosPage'
import { momentosMeta } from './momentosSelectors'

export function meta({ matches }: Route.MetaArgs) {
  return momentosMeta(matches[1]?.loaderData)
}

export default function MomentosFotosRoute() {
  return <MomentosPage />
}
