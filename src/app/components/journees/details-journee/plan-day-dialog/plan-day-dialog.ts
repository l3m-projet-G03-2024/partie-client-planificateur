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
import { MatInputModule } from "@angular/material/input";
import { MatStepperModule } from "@angular/material/stepper";
import { provideNativeDateAdapter } from "@angular/material/core";
import { Commande } from "../../../../utils/types/commande.type";
import {MatCheckboxModule} from '@angular/material/checkbox';
import { FormsModule } from "@angular/forms";
import { MatTooltipModule } from "@angular/material/tooltip";
import { PlanDayFormsData } from "../../../../utils/types/plan-day-return-forms-data.type";

export interface PlanDayDialogData {
  reference: string,
  commandes: Commande[]
}


@Component({
  selector: 'plan-day-dialog',
  templateUrl: 'plan-day-dialog.html',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatStepperModule,
    MatCheckboxModule,
    FormsModule,
    MatTooltipModule
  ],
  providers: [
    provideNativeDateAdapter()
  ]
})
export class PlanDayDialog {
  
  readonly commandeToDeliver = signal<Commande[]>([]);
  readonly canGoTo = computed(() => (
    this.commandeToDeliver().length > 0 ? true : false
  ));
  readonly nbTurns = signal<number>(0);

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

  constructor(
    public dialogRef: MatDialogRef<PlanDayDialog>,
    @Inject(MAT_DIALOG_DATA) public data: PlanDayDialogData,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
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

  updateNbTurns(nb: number): void {
    this.nbTurns.set(nb);
  }

  submitData(): PlanDayFormsData {
    return {
      selectedCommandes: [...this.commandeToDeliver()],
      nbTurns: this.nbTurns()
    }
  }
}