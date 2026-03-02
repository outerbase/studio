import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(outerbase)/nav-header-local')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(outerbase)/nav-header-local"!</div>
}
