import { Component, Inject, OnInit } from '@angular/core';
import { SharedModule } from '../../../common/shared-module';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApoService } from '../../../services/apo-service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApoMessageDialog } from '../apo-message-dialog/apo-message-dialog';

@Component({
  selector: 'app-apo-consult-dialog',
  imports: [SharedModule],
  templateUrl: './apo-consult-dialog.html',
  styleUrl: './apo-consult-dialog.css'
})
export class ApoConsultDialog implements OnInit {
  consultForm: FormGroup;
  deptList: any[] = [];
  reasons: any[] = [];
  constructor(private fb: FormBuilder, private apoService: ApoService, public dialog: MatDialog, public dialogRef: MatDialogRef<ApoConsultDialog>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.consultForm = this.fb.group({
      consults: this.fb.array([])
    });
  }

  get consults(): FormArray {
    return this.consultForm.get('consults') as FormArray;
  }

  ngOnInit(): void {
    this.getDeptAsync();
    this.getReasonAsync();
  }

  async getDeptAsync() {
    await this.apoService.getDeptAsync().then(res => {
      if (res) {
       this.deptList = res;
        setTimeout(() => {
          this.consults.push(this.fb.group({
            department: ['', [Validators.required]],
            reason: ['', [Validators.required]],
            deptList: [this.deptList]
          }));
        }, 100)
      }
    })
  }

  async getReasonAsync() {
    await this.apoService.getReasonAsync().then(res => {
      if (res) {
        this.reasons = res;
      }
    })
  }

  addMoreConsult() {
    if (this.consultForm.valid) {
      let deptIds = this.consults.controls.map(x => x.value.department);
      this.consults.push(this.fb.group({
        department: ['', [Validators.required]],
        reason: ['', [Validators.required]],
        deptList: [this.deptList.filter((dept: any) => !deptIds.includes(dept.deptId))]
      }));
    } else {
      this.consultForm.markAllAsTouched()
    }
  }

  removeConsult(index: number): void {
    this.consults.removeAt(index);
  }

  onCancelClick(status: any): void {
    this.dialogRef.close(status);
  }

  onSubmit(): void {
    if (this.consultForm.valid) {
      const deptReaspn: any[] = [];
      const dialogMsgRef = this.dialog.open(ApoMessageDialog, {
        disableClose: true,
        width: '500px',
        data: {
          isClose: false,
          title: 'Consult Application',
          message: 'Are you sure you want to consult this application?',
          leftbtntext: 'Cancel',
          rightbtntext: 'Yes, Submit'
        }
      });

      dialogMsgRef.afterClosed().subscribe(async (result) => {
        if (result == 'yes') {
          this.consults.controls.forEach((control) => {
            deptReaspn.push({
              "deptId": control.value.department.toString(),
              "reasonIds": [control.value.reason.toString()],
            })
          });
          await this.apoService.createConsultAsync({
            "orderNo": this.data.orderNo,
            "deptReaspn": deptReaspn,
            "createdBy": this.data.createdBy,
            "roleId": this.data.roleId,
          });
          this.onCancelClick(result);
        }
      });
    } else {
      this.consultForm.markAllAsTouched()
    }
  }
}
