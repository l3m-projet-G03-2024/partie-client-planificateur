import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import {MatTooltipModule} from '@angular/material/tooltip';
import { Journee } from '../../../utils/types/journee.type';
import { etatDeJourneeCouleur } from '../journees.component';
import { EtatDeJournee } from '../../../utils/enums/etat-de-journee.enum';
import { DetailsView } from '../../../utils/enums/details-view.enum';
import { ListsComponent } from '../../lists/lists.component';
import { CartoComponent } from '../../carto/carto.component';

@Component({
  selector: 'app-details-journee',
  standalone: true,
  imports: [
    MatTooltipModule,
    ListsComponent,
    CartoComponent
  ],
  templateUrl: './details-journee.component.html',
  styleUrl: './details-journee.component.scss'
})
export class DetailsJourneeComponent implements OnInit {

  private readonly journee: Journee = {
    reference: "",
    etat: EtatDeJournee.NONPLANIFIEE,
    date: "2024-04-19"
  };

  private readonly sigJournee_ = signal({...this.journee});
  readonly sigJournee = this.sigJournee_.asReadonly();

  readonly detailsView = signal(DetailsView.LISTVIEW as string);

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
      const paramReferenceJournee = this.route.snapshot.paramMap.get('referenceJournee');
      if (paramReferenceJournee) {
        this.sigJournee_.update(x => ({...x, reference: paramReferenceJournee}));
      } else {
        this.router.navigate(['/','dashboard' , 'journees']);
      }
  }

  defineColorByStatus(status: EtatDeJournee): string {
    return etatDeJourneeCouleur.find(x => x.etat == status)!.couleur;
  }

  changeView(view: string): void {
    this.detailsView.set(view);
  }

}
