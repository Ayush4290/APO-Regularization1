import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../common/shared-module';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApoService } from '../../services/apo-service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { constants } from '../../common/constants';
import { ApoHistoryAttachments } from "../common/apo-history-attachments/apo-history-attachments";
import { EnumStatus } from '../../common/enums';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-apo-status',
  imports: [SharedModule, ApoHistoryAttachments],
  providers: [DatePipe],
  templateUrl: './apo-status.html',
  styleUrl: './apo-status.css'
})
export class ApoStatus implements OnInit {
  displayedColumns: string[] = ['#', 'deptName', 'reasonName', 'createdDt', 'status'];
  dataSource = new MatTableDataSource<any>();

  apoForm: FormGroup;
  consultList: any = [];
  postlist: any[] = [];
  headlist: any[] = [];
  reasonslist: any[] = [];
  auditHistory: any;
  roleId: any;
  userId: any;
  dtconstant = constants;
  constructor(private fb: FormBuilder, private apoService: ApoService,
    public dialog: MatDialog, private route: ActivatedRoute, public datePipe: DatePipe) {
    this.apoForm = this.fb.group({
      personnelId: [''],
      personnelName: [''],
      department: [''],
      nameOfService: [''],
      apoOrderNumber: [''],
      apoOrderDate: [''],
      apoDate: [''],
      postingOrderNumber: [''],
      postingOrderDate: [''],
      joiningDate: [''],
      previousPost: [''],
      newPost: [''],
      apoDuration: [''],
      apoHeadquarters: [''],
      apoReasonDetails: [''],
    });
  }
  ngOnInit(): void {
    this.roleId = sessionStorage.getItem('roleId');
    this.userId = sessionStorage.getItem('userId');
    this.getPostAsync();
    this.getHeadAsync();
    this.getReasonAsync();
    this.route.queryParamMap.subscribe(async (params) => {
      await this.getApoByOrderNoAsync({ orderNo: params.get('apoNo'), createdBy: this.userId })
      await this.getConsultByAsync({ orderNo: params.get('apoNo'), createdBy: this.userId })
      await this.getAuditHistoryAsync({ orderNo: params.get('apoNo'), roleId: this.roleId })
    });
  }

  async getPostAsync() {
    await this.apoService.getPostAsync().then(result => {
      this.postlist = result;
    });
  }

  async getHeadAsync() {
    await this.apoService.getHeadAsync().then(result => {
      this.headlist = result;
    });
  }

  async getReasonAsync() {
    await this.apoService.getReasonAsync().then(res => {
      this.reasonslist = res;
    })
  }

  async getApoByOrderNoAsync(body: any) {
    await this.apoService.getApoByOrderNoAsync(body).then(result => {
      if (result.req != null) {
        this.apoForm.patchValue({
          personnelId: result.req.person.personId,
          personnelName: result.req.person.empName,
          department: result.req.person.dept,
          nameOfService: result.req.person.service,
          apoOrderNumber: result.req.apoOrderNo,
          apoOrderDate: this.datePipe.transform(result.req.orderDt, constants.dtFormat),
          apoDate: this.datePipe.transform(result.req.apoDt, constants.dtFormat),
          postingOrderNumber: result.req.posOrderNo,
          postingOrderDate: this.datePipe.transform(result.req.posOrderDt, constants.dtFormat),
          joiningDate: this.datePipe.transform(result.req.joiningDt, constants.dtFormat),
          previousPost: result.req.prevPost.postName,
          newPost: result.req.newPost.postName,
          apoDuration: result.req.apoDurtn,
          apoHeadquarters: result.req.headquarter.hqName,
          apoReasonDetails: result.req.apoRsn
        });
      }
    });
  }

  async getAuditHistoryAsync(body: any) {
    await this.apoService.getAuditHistoryAsync(body).then((result: any) => {
      if (result) {
        this.auditHistory = result;
      }
    });
  }

  async getConsultByAsync(body: any) {
    await this.apoService.getConsultByAsync(body).then((result: any) => {
      if (result) {
        result.forEach((consult: any) => {
          this.consultList.push({
            deptName: consult?.department?.deptName,
            reasonName: this.getReasonNames(consult.reasonIds),
            createdDt: this.datePipe.transform(consult?.createdDt, constants.dtFormat),
            statusId: consult?.status?.statusId,
            statusName: consult?.status?.statusName
          })
        });
        this.dataSource.data = this.consultList;
      }
    })
  }

  getReasonNames(ids: string): string {
    const idlist = ids.split(',').map(Number);
    return this.reasonslist?.filter(res => idlist.includes(res.reasonId)).map(res => res.reasonName).join(', ');
  }

  getStatusClass(statusId: any): string {
    switch (statusId) {
      case EnumStatus.DRAFT: return 'draft-button'
      case EnumStatus.SUBMITTED: return 'submitted-button';
      case EnumStatus.PENDING: return 'pending-button';
      case EnumStatus.RETURNED: return 'returned-button';
      case EnumStatus.REJECTED: return 'rejected-button';
      case EnumStatus.APPROVED: return 'approved-button';
      case EnumStatus.CONSULT: return 'consult-button';
      case EnumStatus.RESPONEDED: return 'responeded-button';
      default: return 'draft-button';
    }
  }
}