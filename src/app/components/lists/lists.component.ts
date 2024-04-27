import { CdkDropList, CdkDrag, CdkDropListGroup, CdkDragDrop, moveItemInArray, transferArrayItem, } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Tournee } from '../../utils/types/tournee.type';
import { Livraison } from '../../utils/types/livraison.type';
import { TourneeService } from '../../services/tournee.service';
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { Commande } from '../../utils/types/commande.type';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [
    CommonModule, MatListModule,
    CdkDropList, CdkDrag, CdkDropListGroup
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
    })
    this.sigTournees.set(tournees);
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

}
