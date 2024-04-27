import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, Signal, computed, signal } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import {
  LatLng, Layer, TileLayer, tileLayer, polyline,
  Map as LeafletMap,
  Marker as LeafletMarker,
  Polyline as LeafletPolyline,
} from 'leaflet';
import { Subscription } from 'rxjs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { GeoapiService, PositionToLatLng } from '../../services/geoapi.service';
import { getObsResize } from './utils/rxjs';
import { HttpClientModule } from '@angular/common/http';
import { getCustomMarker, getMarker } from './utils/marker';
import { Tournee } from '../../utils/types/tournee.type';
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { TourneeService } from '../../services/tournee.service';
import { entrepots } from '../../utils/data/entrepot.data';
import { Commande } from '../../utils/types/commande.type';
import { Livraison } from '../../utils/types/livraison.type';
import { LeafletColors } from './utils/colors';
import { Entrepot } from '../../utils/types/entrepot-type';

type geoAPICoordinatesFormat = [lng: number, lat:number];
type leafetCoordinatesFormat = [lat: number, lng:number];

@Component({
  selector: 'app-carto',
  standalone: true,
  providers: [ GeoapiService, TourneeService ],
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
  readonly zoom = signal<number>(10);
  private readonly tileLayer = signal<TileLayer>(tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }))
  private readonly leafletMap = signal<LeafletMap | undefined>(undefined);
  private readonly tournees = signal<(LeafletPolyline | LeafletMarker)[]>([]);

  readonly sigTournees = signal<Tournee[]>([]);
  private readonly sigReferenceJournee = signal("");

  private readonly referenceTournee$ = toObservable(this.sigReferenceJournee);

  private loadTournees_ = this.referenceTournee$.subscribe(value => {
    this.loadTournees(value).then(()=> {
      this.displayMarkers();
      this.displayPolylines().then();
    });
    
  });

  @Input({required: true})
  get referenceJournee() { return this.sigReferenceJournee()}
  set referenceJournee(referenceJournee: string) {
    this.sigReferenceJournee.set(referenceJournee);
  }

  @Input({required: true}) entrepot!: Entrepot;

  readonly layers: Signal<Layer[]> = computed(() => [
    this.tileLayer(),
    ...this.tournees(),
  ])

  private subResize?: Subscription;

  registerLeafletMap(m: LeafletMap, divMap: HTMLDivElement): void {
    this.leafletMap.set(m);
    this.subResize = getObsResize(divMap).subscribe(() => {
      m.invalidateSize({ animate: false })
      m.setView(this.center(), this.zoom());
    });
  }

  constructor(private geoAPI: GeoapiService, private readonly tourneeService: TourneeService) {}

  displayMarkers(): void {
    const coords =  this.sigTournees().map(tournee => 
      tournee.livraisons.map(livraison => {
        const {latitude: lat, longitude: lng} = livraison.commandes![0].client;
        return new LatLng(lat!, lng!);
      })
    );

    const markers = coords.flatMap((x, index) => 
      x.map(y => getCustomMarker(y, LeafletColors[index]))
    );

    markers.push(getCustomMarker({
      lat: this.entrepot.latitude,
      lng: this.entrepot.longitude
    } as LatLng, 'gold'));
    
    this.tournees.update(u => [...u, ...markers]);
  }

  async displayPolylines(): Promise<void> {
    const coords =  this.sigTournees().map(tournee => 
      tournee.livraisons.map(livraison => {
        const {latitude: lat, longitude: lng} = livraison.commandes![0].client;
        return [lng, lat] as geoAPICoordinatesFormat;
      })
    );

    const entrepotCoords = await this.geoAPI.getLocationCoords(
      `${this.entrepot.adresse}, ${this.entrepot.code_postal} ${this.entrepot.ville}`
    )
    

    const directions: leafetCoordinatesFormat[][] = await Promise.all(
      coords.map(async (x) => await this.geoAPI.getDirections([
        [this.entrepot.longitude, this.entrepot.latitude],
        ...x
      ]))
    );
    
    const polylines = directions.map((coords, index) => polyline(coords, {color: LeafletColors[index]}));
    this.tournees.update(u => [...u, ...polylines]);
  }

  ngOnDestroy(): void {
    this.subResize?.unsubscribe();
  }

  async loadTournees(referenceJournee: string): Promise<void> {
    let tournees = await this.tourneeService.listTournees({ 
      reference: referenceJournee
    });

    tournees = tournees.map(tournee => {
      const livraisons =  tournee.livraisons.map(livraison => ({
        ...livraison,
        commandes: this.sortCommandes(livraison.commandes!)
      }));
      return {
        ...tournee,
        livraisons: this.sortLivraisons(livraisons)
      }
    })
    this.sigTournees.set(tournees);
  }

  sortLivraisons(livraisons: Livraison[]): Livraison[] {
    return livraisons.sort((a, b) => a.ordre - b.ordre);
  }

  sortCommandes(commandes: Commande[]): Commande[] {
    return commandes.sort((a, b) => 
      new Date(a.dateDeCreation).getTime() - new Date(b.dateDeCreation).getTime()
    );
  }
}
