import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AddDayDialog } from './add-day-dialog/add-day-dialog';
import { MatDialog } from '@angular/material/dialog';
import { JourneeService } from '../../services/journee.service';
import { Journee } from '../../utils/types/journee.type';
import { HttpClientModule } from '@angular/common/http';
import { EtatDeJournee } from '../../utils/enums/etat-de-journee.enum';
import { Subject } from 'rxjs';
import { DeleteDayDialog } from './delete-day-dialog/delete-day-dialog';
import { journees } from '../../utils/data/journees.data';

export const etatDeJourneeCouleur = [
  { etat: EtatDeJournee.PLANIFIEE, couleur: "#2563EB" },
  { etat: EtatDeJournee.NONPLANIFIEE, couleur: "#D1D5DB" },
  { etat: EtatDeJournee.ENCOURS, couleur: "#FBBF24" },
  { etat: EtatDeJournee.EFFECTUEE, couleur: "#22C55E" },
];

export type EtatDeJourneeEnum = 'NONPLANIFIEE' | 'PLANIFIEE' | 'ENCOURS' | 'EFFECTUEE';

@Component({
  selector: 'app-journees',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    HttpClientModule
  ],
  providers: [
    JourneeService
  ],
  templateUrl: './journees.component.html',
  styleUrl: './journees.component.scss'
})
export class JourneesComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private readonly journeeService: JourneeService
  ) { }

  ngOnInit(): void {
    //this.loadJournees().then();
  }

  private readonly sigJournees_ = signal<Journee[]>([...journees]);
  readonly sigJournees = this.sigJournees_.asReadonly();

  private readonly detectNewJournee = new Subject<number>();

  loadJournees_ = this.detectNewJournee.subscribe(() => {
    this.loadJournees();
  });

  defineColorByStatus(status: EtatDeJournee): string {
    return etatDeJourneeCouleur.find(x => x.etat == status)!.couleur;
  }

  openAddDayDialog(): void {
    const dialogRef = this.dialog.open(AddDayDialog, {
      data: { date: undefined, existedDays: this.getExistedDays() },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.createDay(result).then(
        _ => this.detectNewJournee.next(1)
      );
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
        this.journeeService.deleteDay(reference);
        this.detectNewJournee.next(1);
      }
    });
  }

  getExistedDays(): Date[] {
    const dates = this.sigJournees().map(x => new Date(x.date));
    return dates;
  }

  async createDay(date: Date): Promise<void> {
    await this.journeeService.createDay(date);
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
        date: x.date.slice(0, 10)
      }
    });
    this.sigJournees_.set(resp);
  }

}
