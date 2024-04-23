import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Feature, FeatureCollection, Point, Polygon, Position } from 'geojson';
import { LatLng, LatLngLiteral } from 'leaflet';
import { firstValueFrom } from 'rxjs';
import { ClientGroupBy } from './journee.service';
import { environment } from '../../environments/environment';
import { GeoDistancesMatrixResponse } from '../utils/types/geo-distance-matrix-response.type';
 
const urlCommune = 'https://geo.api.gouv.fr/communes';

/*
* Le service de la plateforme openrouteservice permet d’obtenir  
* une matrices carrée de distance entre les différents coordonnées entrées
* voir plus: https://openrouteservice.org/dev/#/api-docs/v2/matrix/
*/
const urlDistanceMatrix = 'https://api.openrouteservice.org/v2/matrix/driving-car';

@Injectable()
export class GeoapiService {

  constructor(private httpClient: HttpClient) { }

  async getCommune(postalCode: string): Promise<[Feature<Polygon, GeoPropertiesForCommune>, Feature<Point, GeoPropertiesForCommune>]> {
    const urlContour = `${urlCommune}?codePostal=${postalCode}&format=geojson&geometry=contour`
    const urlMairie  = `${urlCommune}?codePostal=${postalCode}&format=geojson&geometry=mairie`

    const PC = firstValueFrom( this.httpClient.get<FeatureCollection<Polygon, GeoPropertiesForCommune>>( urlContour ) )
    const PM = firstValueFrom(this.httpClient.get<FeatureCollection<Point, GeoPropertiesForCommune>>(urlMairie))
    
    return Promise.all([
      PC.then(fg => fg.features.length > 0 ? fg.features[0] : Promise.reject(`No commune found for postal code ${postalCode}`)),
      PM.then(fg => fg.features.length > 0 ? fg.features[0] : Promise.reject(`No commune found for postal code ${postalCode}`)),
    ]);
  }

  getDistancesMatrix(clients: ClientGroupBy[]): Promise<GeoDistancesMatrixResponse> {
    const entrepotCoord = [45.14852, 5.7369725]; //31 rue Pierre Mendes France, 38320 Eybens
    const data  = clients.map((x) => [x.lat, x.lng])
    return firstValueFrom(this.httpClient.post<GeoDistancesMatrixResponse>(
      urlDistanceMatrix,
      {
        locations: [ entrepotCoord, ...data], // les coordonnées sour format [[lat, lng], ...]
        metrics: ["distance"], // retourne une matrice de distance
        units: "m" // l'unité de mesure de la distance en mètre
      },
      {
        headers: { Authorization: environment.openRouteService.apiKey },
      }
    ))
  }

  getDistanceBetween(start: LatLngLiteral, end: LatLngLiteral) {
    const queryParams = {
      resource: "bdtopo-pgr",
      profile: "car",
      optimization: "shortest",
      start: `${start.lat},${start.lng}`,
      end: `${end.lat},${end.lng}`,
    }
    
    
  }
}

export function PositionToLatLng(p: Position): LatLng {
  return new LatLng(p[1], p[0])
}


export interface GeoPropertiesForCommune {
  readonly code: string;
  readonly codeDepartement: string;
  readonly codeEpci: string;
  readonly codeRegion: string;
  readonly codesPostaux: readonly string[];
  readonly nom: string;
  readonly population: number;
  readonly siren: string;
}