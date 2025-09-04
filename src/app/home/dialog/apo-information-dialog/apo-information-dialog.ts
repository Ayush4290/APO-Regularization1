import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../../common/shared-module';

@Component({
  selector: 'app-apo-information-dialog',
  imports: [SharedModule],
  templateUrl: './apo-information-dialog.html',
  styleUrl: './apo-information-dialog.css'
})
export class ApoInformationDialog {
  constructor(
    public dialogRef: MatDialogRef<ApoInformationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onClick(): void {
    this.dialogRef.close();
  }
}