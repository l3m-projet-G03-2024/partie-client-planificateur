import { Icon, LatLng, Marker, icon, marker } from "leaflet";

/**
 * Renvoie un marqueur à partir de coordonnées géographiques
 * Un marqueur leafet est une sous classe des couches leaflet (Layer)
 * @param latlng Les coordonnées géographiques du marqueur
 * @returns Le marqueur leaflet correspondant aux coordonnées géographiques
 */
export function getMarker({ lat, lng }: LatLng): Marker<unknown> {
    return marker([lat, lng], {
        icon: icon({
            ...Icon.Default.prototype.options,
            iconUrl: 'assets/marker-icon.png',
            iconRetinaUrl: 'assets/marker-icon-2x.png',
            shadowUrl: 'assets/marker-shadow.png'
        })
    });
}
