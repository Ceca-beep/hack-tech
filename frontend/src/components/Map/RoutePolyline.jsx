import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useStore } from '../../store'

export default function RoutePolyline({ clientRoute }) {
  const map = useMap()
  const { route, navGraph, currentStepIndex } = useStore()
  const routeLayerRef = useRef(null)
  const activeLayerRef = useRef(null)

  useEffect(() => {
    // Clean up previous layers
    routeLayerRef.current?.remove()
    activeLayerRef.current?.remove()

    if (!route) return

    let coords

    // If we have client-side coords (from client-side A*), use them directly
    if (clientRoute?.length >= 2) {
      coords = clientRoute.map((n) => [n.y_m, n.x_m])
    } else if (route.node_sequence?.length >= 2 && navGraph?.nodes?.length) {
      // Server-side route — look up node positions from nav graph
      const nodeMap = {}
      for (const n of navGraph.nodes) {
        nodeMap[n.id] = n
      }
      coords = route.node_sequence
        .map((nid) => nodeMap[nid])
        .filter(Boolean)
        .map((n) => [n.y_m, n.x_m])
    }

    if (!coords || coords.length < 2) return

    // Full route line (subtle background)
    routeLayerRef.current = L.polyline(coords, {
      color: '#64748b',
      weight: 4,
      opacity: 0.4,
      dashArray: '8,8',
      interactive: false,
    }).addTo(map)

    // Active/remaining route (bright, animated)
    const activeCoords = coords.slice(Math.max(0, currentStepIndex))
    if (activeCoords.length >= 2) {
      activeLayerRef.current = L.polyline(activeCoords, {
        color: '#38bdf8',
        weight: 5,
        opacity: 0.8,
        dashArray: '12,8',
        className: 'route-animated',
        interactive: false,
      }).addTo(map)
    }

    return () => {
      routeLayerRef.current?.remove()
      activeLayerRef.current?.remove()
    }
  }, [route, navGraph, currentStepIndex, map, clientRoute])

  return null
}
