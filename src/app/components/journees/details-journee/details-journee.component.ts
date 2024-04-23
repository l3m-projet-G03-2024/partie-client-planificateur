import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import {MatTooltipModule} from '@angular/material/tooltip';
import { Journee } from '../../../utils/types/journee.type';
import { EtatDeJourneeEnum, etatDeJourneeCouleur } from '../journees.component';
import { EtatDeJournee } from '../../../utils/enums/etat-de-journee.enum';
import { DetailsView } from '../../../utils/enums/details-view.enum';
import { ListsComponent } from '../../lists/lists.component';
import { CartoComponent } from '../../carto/carto.component';
import { MatDialog } from '@angular/material/dialog';
import { PlanDayDialog } from './plan-day-dialog/plan-day-dialog';
import { commandes } from '../../../utils/data/commande.data';
import { JourneeService } from '../../../services/journee.service';
import { PlanDayFormsData } from '../../../utils/types/plan-day-return-forms-data.type';
import { HttpClientModule } from '@angular/common/http';
import { GeoapiService } from '../../../services/geoapi.service';
import { journee } from '../../../utils/data/journee';

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
    JourneeService,
    GeoapiService
  ],
  templateUrl: './details-journee.component.html',
  styleUrl: './details-journee.component.scss'
})
export class DetailsJourneeComponent implements OnInit {
  private readonly sigJournee_ = signal<Journee>({...journee});
  readonly sigJournee = this.sigJournee_.asReadonly();

  readonly detailsView = signal(DetailsView.LISTVIEW as string);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private readonly journeeService: JourneeService,
    private readonly geoapiService: GeoapiService
  ) {}

  ngOnInit(): void {
      const paramReferenceJournee = this.route.snapshot.paramMap.get('referenceJournee');
      if (!paramReferenceJournee) {
        this.router.navigate(['/','dashboard' , 'journees']);
      }

      //this.loadDayDetails(paramReferenceJournee as string);
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

    dialogRef.afterClosed().subscribe((result: PlanDayFormsData) => {
      this.planDay(result).then();
    });
  }

  async loadDayDetails(reference: string) {
    const response = await this.journeeService.getDayDetails(reference);
    const etat = response.etat as unknown as EtatDeJourneeEnum;
    this.sigJournee_.set({
      ...response,
      etat: EtatDeJournee[etat],
      date: response.date.slice(0, 10)
    });
  }

  async planDay(data: PlanDayFormsData) {
    const clients = this.journeeService.groupCommandsByClientGeoLocation(data.selectedCommandes);
    
    const distanceMatrix = (await this.geoapiService.getDistancesMatrix(clients)).distances;
    console.log(distanceMatrix);

    const optimizedData = await this.journeeService.planDay(data, distanceMatrix);
    console.log(optimizedData);
    
    
    
  }

}
