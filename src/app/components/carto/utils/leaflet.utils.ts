import { Map as LeafletMap, LatLng } from "leaflet";

export function recenter({ leafletMap, latlng }: { leafletMap: LeafletMap, latlng: LatLng }) {
    // leafletMap.dragging.disable()
    leafletMap.invalidateSize({ animate: false })
    leafletMap.setView(latlng, leafletMap.getZoom() ?? 15);
}