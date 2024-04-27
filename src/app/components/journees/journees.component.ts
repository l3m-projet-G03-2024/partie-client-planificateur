import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AddDayDialog, AddDayDialogResponse } from './add-day-dialog/add-day-dialog';
import { MatDialog } from '@angular/material/dialog';
import { JourneeService } from '../../services/journee.service';
import { Journee } from '../../utils/types/journee.type';
import { HttpClientModule } from '@angular/common/http';
import { EtatDeJournee } from '../../utils/enums/etat-de-journee.enum';
import { Subject } from 'rxjs';
import { DeleteDayDialog } from './delete-day-dialog/delete-day-dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EntrepotService } from '../../services/entrepot.service';

export const etatDeJourneeDetails = [
  { etat: EtatDeJournee.PLANIFIEE, couleur: "#2563EB", label: 'planifiée' },
  { etat: EtatDeJournee.NONPLANIFIEE, couleur: "#D1D5DB", label: 'non planifiée' },
  { etat: EtatDeJournee.ENCOURS, couleur: "#FBBF24", label: 'en cours' },
  { etat: EtatDeJournee.EFFECTUEE, couleur: "#22C55E", label: 'effectuée' },
];

export type EtatDeJourneeEnum = 'NONPLANIFIEE' | 'PLANIFIEE' | 'ENCOURS' | 'EFFECTUEE';

@Component({
  selector: 'app-journees',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    HttpClientModule,
    MatTooltipModule
  ],
  providers: [
    JourneeService, EntrepotService
  ],
  templateUrl: './journees.component.html',
  styleUrl: './journees.component.scss'
})
export class JourneesComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private readonly journeeService: JourneeService,
    private readonly entrepotService: EntrepotService
  ) { }

  ngOnInit(): void {
    this.loadJournees().then();
  }

  private readonly sigJournees_ = signal<Journee[]>([]);
  readonly sigJournees = this.sigJournees_.asReadonly();
  readonly etatDeJourneeDetails = [...etatDeJourneeDetails];

  private readonly detectNewJournee = new Subject<number>();

  loadJournees_ = this.detectNewJournee.subscribe(() => {
    this.loadJournees();
  });

  defineColorByStatus(status: EtatDeJournee): string {
    return this.etatDeJourneeDetails.find(x => x.etat == status)!.couleur;
  }

  readonly getEtatDeJourneeLabel = (etat: EtatDeJournee): string => 
    this.etatDeJourneeDetails.find(x => x.etat == etat)!.label;

  async openAddDayDialog(): Promise<void> {
    const entrepots = await this.entrepotService.listEntrepots();

    const dialogRef = this.dialog.open(AddDayDialog, {
      data: { 
        date: undefined, 
        existedDays: this.getExistedDays(),
        entrepots
      },
    });

    dialogRef.afterClosed().subscribe((response: AddDayDialogResponse) => {
      if (response.date != undefined) {
        this.createDay(response).then(
          _ => this.detectNewJournee.next(1)
        );
      }
    });
  }

  openDeleteDayDialog(reference: string): void {
    const dialogRef = this.dialog.open(DeleteDayDialog, {
      data: {
        reference
      },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response == 'ok') {
        this.journeeService.deleteDay(reference).then(_ => {
          this.detectNewJournee.next(1);
        });
      }
    });
  }

  getExistedDays(): Date[] {
    const dates = this.sigJournees().map(x => new Date(x.date));
    return dates;
  }

  async createDay(data: AddDayDialogResponse): Promise<void> {
    await this.journeeService.createDay(data);
  }

  async listDays(): Promise<Journee[]> {
    return await this.journeeService.listDays();
  }

  async loadJournees(): Promise<void> {
    const journees = await this.journeeService.listDays();
    const resp = journees.map(x => {
      
      const etat = x.etat as unknown as EtatDeJourneeEnum;
      return {
        ...x,
        etat: EtatDeJournee[etat],
        date: x.date
      }
    }).sort((a, b) => (new Date(b.date)).getTime() - (new Date(a.date)).getTime());
    this.sigJournees_.set(resp);
  }

}
