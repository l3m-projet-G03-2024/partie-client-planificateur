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
import { MatDialog } from '@angular/material/dialog';
import { PlanDayDialog } from './plan-day-dialog/plan-day-dialog';
import { commandes } from '../../../utils/data/commande.data';
import { JourneeService } from '../../../services/journee.service';
import { PlanDayReturnFormsData } from '../../../utils/types/plan-day-return-forms-data.type';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-details-journee',
  standalone: true,
  imports: [
    MatTooltipModule,
    ListsComponent,
    CartoComponent,
    HttpClientModule
  ],
  providers: [
    JourneeService
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
    private router: Router,
    public dialog: MatDialog,
    private readonly journeeService: JourneeService
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

  openPlanDayDialog(reference: string): void {
    const dialogRef = this.dialog.open(PlanDayDialog, {
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '200ms',
      data: {
        reference,
        commandes: [...commandes]
      },
    });

    dialogRef.afterClosed().subscribe((result: PlanDayReturnFormsData) => {
      this.journeeService.planDay(result);
    });
  }

}
