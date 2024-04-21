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

export const  etatDeJourneeCouleur =  [
    {etat: EtatDeJournee.PLANIFIEE, couleur: "#2563EB"},
    {etat: EtatDeJournee.NONPLANIFIEE, couleur: "#D1D5DB"},
    {etat: EtatDeJournee.ENCOURS, couleur: "#FBBF24"},
    {etat: EtatDeJournee.EFFECTUEE, couleur: "#22C55E"},
  ];

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
  ) {}

  ngOnInit(): void {
      // this.loadJournees().then(response => {
      //   console.log(response);
      // });
  }

  readonly journees = [
    {reference: 'J020G', etat:EtatDeJournee.NONPLANIFIEE, date: "2024-04-22"},
    {reference: 'J019G', etat:EtatDeJournee.NONPLANIFIEE, date: "2024-04-19"},
    {reference: 'J018G', etat:EtatDeJournee.ENCOURS, date: "2024-04-18"},
    {reference: 'J013G', etat:EtatDeJournee.EFFECTUEE, date: "2024-04-13"},
    {reference: 'J012G', etat:EtatDeJournee.EFFECTUEE, date: "2024-04-12"},
    {reference: 'J011G', etat:EtatDeJournee.EFFECTUEE, date: "2024-04-11"},
    {reference: 'J010G', etat:EtatDeJournee.EFFECTUEE, date: "2024-04-10"},
  ];

  private readonly sigJournees_ = signal([...this.journees]);
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
      data: {date: undefined, existedDays: this.getExistedDays()},
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
    const dates = this.journees.map(x => new Date(x.date));
    return dates;
  }

  async createDay(date: Date) {
    await this.journeeService.createDay(date);
  }

  async listDays(): Promise<Journee[]> {
    return await this.journeeService.listDays();
  }

  async loadJournees() {
    const journees = await this.journeeService.listDays();
    this.sigJournees_.set(journees);
  }

}
