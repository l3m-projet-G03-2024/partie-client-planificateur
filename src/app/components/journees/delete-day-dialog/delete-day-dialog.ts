import { Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { provideNativeDateAdapter } from "@angular/material/core";

export interface DeleteDayDialogData {
    reference: string;
}


@Component({
    selector: 'delete-day-dialog',
    templateUrl: 'delete-day-dialog.html',
    standalone: true,
    imports: [
      MatButtonModule,
      MatDialogTitle,
      MatDialogContent,
      MatDialogActions,
      MatDialogClose,
    ],
    providers: [
        provideNativeDateAdapter()
    ]
  })
  export class DeleteDayDialog {
    
    constructor(
      public dialogRef: MatDialogRef<DeleteDayDialog>,
      @Inject(MAT_DIALOG_DATA) public data: DeleteDayDialogData,
    ) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  }