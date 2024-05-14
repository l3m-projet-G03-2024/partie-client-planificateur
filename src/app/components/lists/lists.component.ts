import { CdkDropList, CdkDrag, CdkDropListGroup, CdkDragDrop, moveItemInArray, transferArrayItem, } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Tournee } from '../../utils/types/tournee.type';
import { Livraison } from '../../utils/types/livraison.type';
import { TourneeService } from '../../services/tournee.service';
import { toObservable } from "@angular/core/rxjs-interop";
import { Commande } from '../../utils/types/commande.type';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import { MatChipsModule} from '@angular/material/chips';
import { EtatDeTournee } from '../../utils/enums/etat-de-tournee.enum';
import { EtatDetails } from '../../utils/shared/etat-details.shared';
import { EtatDetails as EtatDetailsType } from '../../utils/types/etat-details.type';
import { EtatDeLivraison } from '../../utils/enums/etat-de-livraison.enum';
import { LivraisonComponent } from './livraison/livraison.component';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [
    CommonModule, MatListModule,
    CdkDropList, CdkDrag, CdkDropListGroup,
    MatButtonModule, MatMenuModule,
    MatIconModule, MatChipsModule, MatIcon,
    LivraisonComponent
  ],
  providers: [
    TourneeService
  ],
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListsComponent {
  readonly sigTournees = signal<Tournee[]>([]);
  private readonly sigReferenceJournee = signal("");

  private readonly referenceTournee$ = toObservable(this.sigReferenceJournee);

  private loadTournees_ = this.referenceTournee$.subscribe(value => {
    this.loadTournees(value).then();
  });

  @Input({required: true})
  get referenceJournee() { return this.sigReferenceJournee()}
  set referenceJournee(referenceJournee: string) {
    this.sigReferenceJournee.set(referenceJournee);
  }

  @Output() canEndDay = new EventEmitter();

  constructor(private readonly tourneeService: TourneeService) {}

  drop(event: CdkDragDrop<Livraison[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  async loadTournees(referenceJournee: string) {
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
    }).sort((a, b) => a.reference.localeCompare(b.reference));
    this.sigTournees.set(tournees);
    this.checkAllTourneesEffectue(tournees);
  }

  sortLivraisons(livraisons: Livraison[]) {
    return livraisons.sort((a, b) => a.ordre - b.ordre);
  }

  sortCommandes(commandes: Commande[]) {
    return commandes.sort((a, b) => 
      new Date(a.dateDeCreation).getTime() - new Date(b.dateDeCreation).getTime()
    );
  }

  toKilometer(distanceInMeter: number | undefined): string | undefined {
    return distanceInMeter ? (distanceInMeter / 1000).toFixed(2) : undefined
  }

  defineEtat(etat: EtatDeTournee | EtatDeLivraison): Partial<EtatDetailsType> {
    if (etat) {
      const etatDetails = EtatDetails.find(x => x.etat == etat.toString());
      return {
        label: etatDetails!.label,
        color: etatDetails!.color
      }
    } else {
      return {}
    }
  }

  checkAllTourneesEffectue(tournees: Tournee[]) {
    const tourneeNotEnded = tournees.filter(tournee => tournee.etat != EtatDeTournee.EFFECTUEE);
    this.canEndDay.emit(
      tourneeNotEnded.length == 0 ? true : false
    );
  }

}
