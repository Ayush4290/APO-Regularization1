import { Component, Inject } from '@angular/core';
import { SharedModule } from '../../../common/shared-module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-apo-request-dialog',
  imports: [SharedModule],
  templateUrl: './apo-message-dialog.html',
  styleUrl: './apo-message-dialog.css'
})
export class ApoMessageDialog {
  constructor(
    public dialogRef: MatDialogRef<ApoMessageDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onClick(value: any): void {
    this.dialogRef.close(value);
  }
}