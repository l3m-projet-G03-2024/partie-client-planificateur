import { Component, Inject, computed, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { 
  MatDialogTitle,
  MatDialogContent, 
  MatDialogActions, 
  MatDialogClose, 
  MatDialogRef, 
  MAT_DIALOG_DATA 
} from "@angular/material/dialog";
import { MatChipsModule} from '@angular/material/chips';
import { MatInputModule } from "@angular/material/input";
import { MatStepperModule } from "@angular/material/stepper";
import { provideNativeDateAdapter } from "@angular/material/core";
import { Commande } from "../../../../utils/types/commande.type";
import {MatCheckboxModule} from '@angular/material/checkbox';
import { FormsModule } from "@angular/forms";
import { MatTooltipModule } from "@angular/material/tooltip";
import { PlanDayFormsData } from "../../../../utils/types/plan-day-forms-data.type";
import { MatFormFieldModule } from "@angular/material/form-field";
import {MatSelectModule} from '@angular/material/select';
import { Employe } from "../../../../utils/types/employe.type";
import { Camion } from "../../../../utils/types/camion.type";
import { MatIcon } from "@angular/material/icon";
import { toObservable } from "@angular/core/rxjs-interop";
import { DeliveryTeam } from "../../../../utils/types/delivery-team.type";

export interface PlanDayDialogData {
  reference: string,
  commandes: Commande[],
  livreurs: Employe[],
  camions: Camion[]
}

export type SelectType = 'LIVREURS' | 'CAMION';
export type SortFct = (acc: CommandeGroupBy, commande: Commande) => boolean;


@Component({
  selector: 'plan-day-dialog',
  templateUrl: 'plan-day-dialog.html',
  standalone: true,
  imports: [
    MatInputModule, MatButtonModule, MatDialogTitle,
    MatDialogContent, MatDialogActions, MatDialogClose,
    MatStepperModule, MatCheckboxModule, FormsModule,
    MatTooltipModule, MatFormFieldModule, MatSelectModule,
    MatChipsModule, MatIcon
  ],
  providers: [
    provideNativeDateAdapter()
  ]
})
export class PlanDayDialog {
  readonly commandeToDeliver = signal<Commande[]>([]);
  readonly deliveryTeams = signal<DeliveryTeam[]>([]);
  readonly sigCanAddNewTeam = computed<boolean>(() => this.canAddNewTeam());
  readonly sigLivreurs = signal<Employe[]>([]);
  readonly sigCamions = signal<Camion[]>([]);
  readonly nbTurns = computed<number>(() => this.deliveryTeams().length);
  readonly canSubmit = computed(() => 
    (
      this.nbTurns() != null &&
      this.nbTurns() > 0 &&
      this.commandeToDeliver().length > 0
    )
    ? this.commandeToDeliver().length >= this.nbTurns()
    : false
  );
  disabledSubmitMsg = computed(() => 
    this.canSubmit() ? "" : "Impossible de valider"
  );
  readonly sigSortCommandsBy = signal<string>('date');
  readonly sigOrderCommandsBy = signal<string>('ancien');

  readonly sigSortFct = computed<SortFct>(() => {
    switch (this.sigSortCommandsBy()) {
      case 'adresse':
        return (acc: CommandeGroupBy, commande: Commande) => acc.adresse == commande.client.adresse;
      case 'ville':
        return (acc: CommandeGroupBy, commande: Commande) => acc.codePostal == commande.client.codePostal
      default:
        return (acc: CommandeGroupBy, commande: Commande) => acc.date == commande.dateDeCreation;
    }
  });

  readonly sigCommandes = computed(() => this.filterCommandes());

  readonly $nbTurn = toObservable(this.nbTurns);

  readonly selectCommandes = this.$nbTurn.subscribe(value => {
    const nbCommandes = value *10;
    if (nbCommandes >= this.data.commandes.length) {
      this.onCheckAll(true);
    } else {
      const sortedCommandes = this.data.commandes
        .sort((a, b) => (new Date(b.dateDeCreation!).getTime() - (new Date(a.dateDeCreation!)).getTime()));

      const selectedCommandes = sortedCommandes.slice(0, nbCommandes);
      this.commandeToDeliver.set([...selectedCommandes]);
    }
  });

  readonly canGoTo = computed(() => {
    return this.deliveryTeams().find(team => team.inEdition == true) == undefined
  });

  constructor(
    public dialogRef: MatDialogRef<PlanDayDialog>,
    @Inject(MAT_DIALOG_DATA) public data: PlanDayDialogData,
  ) {
    const newTeam: DeliveryTeam = {
      livreurs: [],
      camion: undefined,
      inEdition: true
    }
    this.deliveryTeams.set([newTeam]);
  }

  onNoClick(): void {
    this.dialogRef.close(undefined);
  }

  onCheckAll(isChecked: boolean): void {
    if (isChecked) {
      this.commandeToDeliver.set([...this.data.commandes]);
    } else {
      this.commandeToDeliver.set([]);
    }
  }

  onCheck(commandeReference: string, isChecked: boolean): void {
    if (isChecked) {
      const commande = this.data.commandes.find(x  => x.reference == commandeReference) as Commande;
      this.commandeToDeliver.set([...this.commandeToDeliver(), commande]);
    } else {
      this.commandeToDeliver.set([...this.commandeToDeliver().filter(x => x.reference != commandeReference)]);
    }
  }

  isSelected(reference: string): boolean {
    return this.commandeToDeliver().findIndex(x  => x.reference == reference) == -1
            ? false
            : true
  }

  submitData(): PlanDayFormsData {
    return {
      selectedCommandes: [...this.commandeToDeliver()],
      nbTurns: this.nbTurns(),
      deliveryTeams: [...this.deliveryTeams()]
    }
  }

  updateTeam(event: Employe[] | Camion, index: number, selectType: SelectType): void {
    const teams = this.deliveryTeams();
    const team = teams.find((_, $index) => $index == index) as DeliveryTeam;

    if (selectType == 'LIVREURS') {
      team.livreurs = (event  as Employe[]).filter(value => (value as Employe).trigramme != undefined);
    } 
    if (selectType == 'CAMION') {
      team.camion = event as Camion;
    }

    teams[index] = team;
    this.deliveryTeams.set([...teams]);
  }

  editTeam(index: number, value: boolean): void {
    const teams = this.deliveryTeams();
    const team = teams.find((_, $index) => $index == index) as DeliveryTeam;
    team.inEdition = value;
    teams[index] = team;
    this.deliveryTeams.set([...teams]);
  }

  deleteTeam(index: number) {
    this.deliveryTeams.set([
      ...this.deliveryTeams().filter((_, $index) => $index != index)
    ]);
  }

  addTeam(): void {
    const newTeam: DeliveryTeam = {
      livreurs: [],
      camion: undefined,
      inEdition: true
    }
    this.deliveryTeams.update(teams => [...teams, newTeam]);
  }

  isChosenLivreur(trigramme: string): boolean {
    const chosenLivreursTrigramme = this.deliveryTeams()
      .flatMap(team => team.livreurs.map(livreur => livreur.trigramme)
    );
    const index = chosenLivreursTrigramme.indexOf(trigramme);
    return index == -1 ? false : true;
  }

  isChosenCamion(immatriculation: string) {
    const chosenCamions = this.deliveryTeams().map(team => team.camion?.immatriculation);
    const index = chosenCamions.indexOf(immatriculation);
    return index == -1 ? false : true;
  }

  private canAddNewTeam() {
    const chosenLivreursTrigramme = this.deliveryTeams()
      .flatMap(team => team.livreurs);
    const chosenCamions = this.deliveryTeams().map(team => team.camion);
    const atLeastOneTeamInEditionMode = this.deliveryTeams().find(team => team.inEdition == true);

    return (
      chosenLivreursTrigramme.length != this.data.livreurs.length &&
      chosenCamions.length != this.data.camions.length &&
      atLeastOneTeamInEditionMode == undefined
    )
  }

  canValidateTeam(index: number) {
    const teams = this.deliveryTeams();
    const team = teams.find((_, $index) => $index == index) as DeliveryTeam;

    return team.livreurs.length > 0 && team.camion != undefined;
  }

  filterCommandes() {
    const commandes = this.groupBy(this.sigSortFct());
    if (this.sigSortCommandsBy() == 'date' && this.sigOrderCommandsBy() == 'recent') {
      return commandes.sort((a, b) => (new Date(a.date!).getTime() - (new Date(b.date!)).getTime()));
    }
    if (this.sigSortCommandsBy() == 'date' && this.sigOrderCommandsBy() == 'ancien') {
      return commandes.sort((a, b) => (new Date(b.date!).getTime() - (new Date(a.date!)).getTime()));
    }
    return commandes;
  }

  groupBy(fct: SortFct) {
    return this.data.commandes.reduce((acc, commande) => {
      const commande_  = acc.find(value => fct(value, commande));

      if (commande_ == undefined) this.addNewCommande(acc, commande);
      if (commande_ != undefined) this.addCommandeToGroup(acc, commande);
      return acc;
    }, [] as CommandeGroupBy[])
  }

  addNewCommande(commandes: CommandeGroupBy[], commande: Commande) {
    commandes.push({
      adresse: this.sigSortCommandsBy() == 'adresse' ? commande.client.adresse! : undefined,
      codePostal: this.sigSortCommandsBy() == 'ville' ? commande.client.codePostal! : undefined,
      date: this.sigSortCommandsBy() == 'date' ? commande.dateDeCreation : undefined,
      ville: this.sigSortCommandsBy() == 'ville' ? commande.client.ville! : undefined,
      commandes: [commande]
    })
  }

  addCommandeToGroup(commandes: CommandeGroupBy[], commande: Commande) {
    const clientIndex = commandes.findIndex(x =>
      x.adresse == commande.client.adresse ||
      x.codePostal == commande.client.codePostal ||
      x.date == commande.dateDeCreation
    );
    
    commandes[clientIndex].commandes.push(commande);
  }

}

export type CommandeGroupBy = {
  date?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  commandes: Commande[];
}