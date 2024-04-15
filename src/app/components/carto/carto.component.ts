import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, Signal, computed, signal } from '@angular/core';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import {
  LatLng, Layer, TileLayer, tileLayer, polygon,
  Map as LeafletMap,
  Polygon as LeafletPolygon,
  Marker as LeafletMarker,
} from 'leaflet';

import { Subscription } from 'rxjs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { GeoapiService, PositionToLatLng } from '../../services/geoapi.service';
import { getObsResize } from './utils/rxjs';
import { HttpClientModule } from '@angular/common/http';
import { getMarker } from './utils/marker';

@Component({
  selector: 'app-carto',
  standalone: true,
  providers: [ GeoapiService ],
  imports: [
    CommonModule, LeafletModule,
    MatGridListModule, MatListModule,
    HttpClientModule,
  ],
  templateUrl: './carto.component.html',
  styleUrl: './carto.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartoComponent implements OnDestroy {
  readonly center = signal<LatLng>(new LatLng(45.166672, 5.71667));
  readonly zoom = signal<number>(12);
  private readonly tileLayer = signal<TileLayer>(tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }))
  private readonly leafletMap = signal<LeafletMap | undefined>(undefined);
  private readonly communes = signal<(LeafletPolygon | LeafletMarker)[]>([])

  readonly layers: Signal<Layer[]> = computed(() => [
    this.tileLayer(),
    ...this.communes(),
  ])

  private subResize?: Subscription;

  registerLeafletMap(m: LeafletMap, divMap: HTMLDivElement): void {
    this.leafletMap.set(m);
    this.subResize = getObsResize(divMap).subscribe(() => {
      m.invalidateSize({ animate: false })
      m.setView(this.center(), this.zoom());
    });
  }

  constructor(private geoAPI: GeoapiService) {
    [
      { postalCode: "38000", color: "blue" },
      { postalCode: "38130", color: "green" },
      { postalCode: "38170", color: "red" },
      { postalCode: "38600", color: "yellow" },
    ].forEach( async ({ postalCode, color }) => {
      const [fp, fm] = await this.geoAPI.getCommune(postalCode);
      const p = polygon(
        fp.geometry.coordinates.map(L => L.map(PositionToLatLng)),
        {color: "black", fillColor: color, fillOpacity: 0.5}
      )
      const m = getMarker( PositionToLatLng(fm.geometry.coordinates) )
      this.communes.update( LC => [...LC, p, m] )
    })
    geoAPI.getCommune('38000').then(console.log);
  }

  ngOnDestroy(): void {
    this.subResize?.unsubscribe();
  }
}
