import { Component, Inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { provideNativeDateAdapter } from "@angular/material/core";
import {MatSelectModule} from '@angular/material/select';
import { Entrepot } from "../../../utils/types/entrepot-type";

export interface AddDayDialogData {
    date: Date,
    existedDays: Date[],
    entrepots: Entrepot[]
  }

export interface AddDayDialogResponse {
  date: Date,
  selectedEntrepot: Entrepot
}

@Component({
    selector: 'add-day-dialog',
    templateUrl: 'add-day-dialog.html',
    standalone: true,
    imports: [
      MatFormFieldModule,
      MatInputModule,
      FormsModule,
      MatButtonModule,
      MatDialogTitle,
      MatDialogContent,
      MatDialogActions,
      MatDialogClose,
      MatDatepickerModule,
      MatFormFieldModule, MatSelectModule
    ],
    providers: [
        provideNativeDateAdapter()
    ]
  })
  export class AddDayDialog {
    readonly minDate: Date = new Date();
    readonly selectedEntrepot = signal<Partial<Entrepot>>({});

    constructor(
      public dialogRef: MatDialogRef<AddDayDialog>,
      @Inject(MAT_DIALOG_DATA) public data: AddDayDialogData,
    ) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }

    withoutSaturdayAndSundayFilter = (d: Date | null): boolean => {
        const day = (d || new Date()).getDay();
        // empêcher la selection de Samedi et dimanche
        return day !== 0 && day !== 6 && 
        this.data.existedDays.findIndex(t => t.toDateString() == (d || new Date()).toDateString()) < 0;
    };

    sendData(): AddDayDialogResponse {
      return {
        date: this.data.date,
        selectedEntrepot: this.selectedEntrepot() as Entrepot
      }
    }
  }