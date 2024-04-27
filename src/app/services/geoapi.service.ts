import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Feature, FeatureCollection, Point, Polygon, Position } from 'geojson';
import { LatLng, LatLngLiteral } from 'leaflet';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { GeoDistancesMatrixResponse } from '../utils/types/geo-distance-matrix-response.type';
import { ClientGroupBy } from '../utils/types/client-deliveries-group-by.type';
import { GeoPoint } from '../utils/types/geo-point.type';
import { GeoDirections } from '../utils/types/geo-directions.type';
 
const urlCommune = 'https://geo.api.gouv.fr/communes';

@Injectable()
export class GeoapiService {

  /*
  * Le service de la plateforme openrouteservice permet d’obtenir  
  * une matrices carrée de distance entre les différents coordonnées entrées
  * voir plus: https://openrouteservice.org/dev/#/api-docs/v2/matrix/
  */
  private openRouteServiceBaseURL = "https://api.openrouteservice.org";

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

  async getDistancesMatrix(clients: ClientGroupBy[], entrepotCoord: number[]): Promise<GeoDistancesMatrixResponse> {
    const data: geoCoords[] = await Promise.all(
      clients.map(async (client) => await this.getLocationCoords(
        `${client.adresse}, ${client.codePostal} ${client.ville}`
      ))
    );
    
    
    return firstValueFrom(this.httpClient.post<GeoDistancesMatrixResponse>(
      `${this.openRouteServiceBaseURL}/v2/matrix/driving-car`,
      {
        locations: [ entrepotCoord, ...data], // les coordonnées sour format [[lat, lng], ...]
        metrics: ["distance"], // retourne une matrice de distance
        units: "m" // l'unité de mesure de la distance en mètre
      },
      {
        headers: { Authorization: environment.openRouteService.apiKey },
      }
    ));
  }

  async getLocationCoords(location: string): Promise<geoCoords> {
    const response = await firstValueFrom(this.httpClient.get<GeoPoint>(
      `${this.openRouteServiceBaseURL}/geocode/search`,
      {
        headers: { Authorization: environment.openRouteService.apiKey },
        params: {
          api_key: environment.openRouteService.apiKey,
          text: location
        }
      }
    ));

    return response.features[0].geometry.coordinates;
  }

  async getDirections(coordinates: [lng: number, lat: number][]): Promise<[lat: number, lng: number][]> {
    const response = await firstValueFrom(this.httpClient.post<GeoDirections>(
      `${this.openRouteServiceBaseURL}/v2/directions/driving-car/geojson`,
      {
        coordinates
      },
      {
        headers: { Authorization: environment.openRouteService.apiKey },
      }
    ));

    return response.features[0].geometry.coordinates.map(x => [x[1], x[0]]); // return [lat, lng]
    
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

export type geoCoords = [longitude: number, latitude: number];