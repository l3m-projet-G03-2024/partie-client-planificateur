import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import {MatTooltipModule} from '@angular/material/tooltip';
import { Journee } from '../../../utils/types/journee.type';
import { EtatDeJourneeEnum, etatDeJourneeDetails } from '../journees.component';
import { EtatDeJournee } from '../../../utils/enums/etat-de-journee.enum';
import { DetailsView } from '../../../utils/enums/details-view.enum';
import { ListsComponent } from '../../lists/lists.component';
import { CartoComponent } from '../../carto/carto.component';
import { MatDialog } from '@angular/material/dialog';
import { PlanDayDialog } from './plan-day-dialog/plan-day-dialog';
import { JourneeService } from '../../../services/journee.service';
import { PlanDayFormsData } from '../../../utils/types/plan-day-forms-data.type';
import { HttpClientModule } from '@angular/common/http';
import { GeoapiService } from '../../../services/geoapi.service';
import { journee } from '../../../utils/data/journee.data';
import { CommandeService } from '../../../services/commande.service';
import { EtatDeCommande } from '../../../utils/enums/etat-de-commande.enum';
import { TourneeService } from '../../../services/tournee.service';
import { LivraisonService } from '../../../services/livraison.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { DayPlanInProgress } from '../../../utils/enums/day-plan-in-progress.enum';
import { CamionService } from '../../../services/camion.service';
import { EmployeService } from '../../../services/employe.service';
import { Emploi } from '../../../utils/enums/emploi.enum';

@Component({
  selector: 'app-details-journee',
  standalone: true,
  imports: [
    MatTooltipModule,
    ListsComponent,
    CartoComponent,
    HttpClientModule,
    MatProgressSpinnerModule
  ],
  providers: [
    JourneeService,
    GeoapiService,
    CommandeService,
    TourneeService,
    LivraisonService,
    EmployeService,
    CamionService
  ],
  templateUrl: './details-journee.component.html',
  styleUrl: './details-journee.component.scss'
})
export class DetailsJourneeComponent implements OnInit {
  private readonly sigJournee_ = signal<Journee>({...journee});
  readonly sigJournee = this.sigJournee_.asReadonly();

  readonly etatDeJourneeDetails = [...etatDeJourneeDetails];

  readonly detailsView = signal(DetailsView.LISTVIEW as string);

  readonly getEtatDeJourneeLabel = (etat: EtatDeJournee): string => 
    this.etatDeJourneeDetails.find(x => x.etat == etat)!.label;

  readonly planInProgress = signal({
    value: false,
    label: ''
  });

  readonly sigCanEndDay = signal<boolean>(false);
  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private readonly journeeService: JourneeService,
    private readonly geoapiService: GeoapiService,
    private readonly commandeService: CommandeService,
    private readonly tourneeService: TourneeService,
    private readonly livraisonService: LivraisonService,
    private readonly employeService: EmployeService,
    private readonly camionService: CamionService
  ) {}

  ngOnInit(): void {
      const paramReferenceJournee = this.route.snapshot.paramMap.get('referenceJournee');
      if (!paramReferenceJournee) {
        this.router.navigate(['/','dashboard' , 'journees']);
        return
      }

      this.loadDayDetails(paramReferenceJournee).then();
  }

  defineColorByStatus(status: EtatDeJournee): string {
    return this.etatDeJourneeDetails.find(x => x.etat == status)!.couleur;
  }

  changeView(view: string): void {
    this.detailsView.set(view);
  }

  async openPlanDayDialog(reference: string): Promise<void> {
    const openedCommandes = await this.commandeService.listCommandes(EtatDeCommande.OUVERTE);
    const livreurs = (await this.employeService.listEmployes(Emploi.LIVREUR, this.sigJournee().entrepot?.nom!))
    .filter(livreur => {
      return livreur.entrepot.nom == this.sigJournee().entrepot?.nom! &&
             livreur.emploi == Emploi.LIVREUR
    });
    
    const camions = await this.camionService.listCamions(this.sigJournee().entrepot?.nom!);

    const dialogRef = this.dialog.open(PlanDayDialog, {
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '200ms',
      data: {
        reference,
        commandes: [...openedCommandes],
        livreurs: [...livreurs],
        camions: [...camions]
      },
    });

    dialogRef.afterClosed().subscribe((result: PlanDayFormsData) => {
      if (result != undefined) {
        this.planInProgress.set({
          value: true,
          label: DayPlanInProgress.IN_PROGRESS
        });
        this.planDay(result).then(response_ => {
          this.planInProgress.set(
            {
              value: false,
              label: ''
            }
          );
          this.loadDayDetails(this.sigJournee().reference);
        });
      }
    });
  }

  async loadDayDetails(reference: string): Promise<void> {
    const response = await this.journeeService.getDayDetails(reference);
    
    const etat = response.etat as unknown as EtatDeJourneeEnum;
    this.sigJournee_.set({
      ...response,
      etat: EtatDeJournee[etat],
      date: response.date.slice(0, 10)
    });
  }

  async planDay(data: PlanDayFormsData): Promise<Object> {
    const clients = this.journeeService.groupCommandsByClientGeoLocation(data.selectedCommandes);
    
    this.updatePlanInProgress(true, DayPlanInProgress.DISTANCE_GET);
    const entrepotCoords = [
      this.sigJournee().entrepot!.longitude,
      this.sigJournee().entrepot!.latitude
    ];
    const distanceMatrix = (await this.geoapiService.getDistancesMatrix(clients, entrepotCoords)).distances;
    
    this.updatePlanInProgress(true, DayPlanInProgress.TURNS_REPARTITION);
    const optimizedDayData = await this.journeeService.planDay({
      ...data,
      clientDeliveries: clients,
      dayReference: this.sigJournee().reference
    }, distanceMatrix);

    this.updatePlanInProgress(true, DayPlanInProgress.TURNS_CREATION);
    await this.tourneeService.createTournees(this.sigJournee().reference, optimizedDayData);

    this.updatePlanInProgress(true, DayPlanInProgress.TEAM_REPARTITION);
    await this.tourneeService.addTeamsToTournees(optimizedDayData, data.deliveryTeams);

    this.updatePlanInProgress(true, DayPlanInProgress.DELIVERIES_CREATION);
    await this.livraisonService.createLivraisons(optimizedDayData);
    return await this.commandeService.updateCommandes(optimizedDayData);
  }

  toKilometer(distanceInMeter: number | undefined): string | undefined {
    return distanceInMeter ? (distanceInMeter / 1000).toFixed(2) : undefined
  }

  updatePlanInProgress(value: boolean, label: DayPlanInProgress) {
    this.planInProgress.set({value,label});
  }

  canEndDay(value: boolean) {
    this.sigCanEndDay.set(value);
  }

  endDay(): void {
    this.journeeService.updateDay(this.sigJournee().reference, {etat: EtatDeJournee.EFFECTUEE}).then(_ => 
      this.loadDayDetails(this.sigJournee().reference)
    );
  }

}
