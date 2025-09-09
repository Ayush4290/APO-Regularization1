import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApoService } from '../../services/apo-service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SharedModule } from '../../common/shared-module';
import { AddAttachmentDialog } from '../dialog/add-attachment-dialog/add-attachment-dialog';
import { ApoMessageDialog } from '../dialog/apo-message-dialog/apo-message-dialog';
import { EnumRequestType, EnumStatus } from '../../common/enums';
import { ShowAttachmentDialog } from '../dialog/show-attachment-dialog/show-attachment-dialog';
import { ApoHistoryAttachments } from "../common/apo-history-attachments/apo-history-attachments";
import { ApoInformationDialog } from '../dialog/apo-information-dialog/apo-information-dialog';

@Component({
  selector: 'app-apo-pending',
  imports: [SharedModule, ApoHistoryAttachments],
  providers: [DatePipe],
  templateUrl: './apo-pending.html',
  styleUrl: './apo-pending.css'
})
export class ApoPending implements OnInit {
  orderNo: any = '';
  submitted = false;
  apoForm!: FormGroup;
  postlist: any[] = [];
  headlist: any[] = [];
  isPersonnel: boolean = false;
  dateTimeMax: Date = new Date;
  personnelDetail: any;
  auditHistory: any;
  roleId: any;
  userId: any;
  constructor(private fb: FormBuilder, private apoService: ApoService, private ngZone: NgZone, private cdr: ChangeDetectorRef,
    public dialog: MatDialog, private router: Router, private route: ActivatedRoute, private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.roleId = sessionStorage.getItem('roleId');
    this.userId = sessionStorage.getItem('userId');
    this.initiateForm();
    this.getPostAsync();
    this.getHeadAsync();
    this.route.queryParamMap.subscribe(async (params) => {
      await this.getApoByOrderNoAsync({ orderNo: params.get('apoNo'), createdBy: this.userId });
      await this.getAuditHistoryAsync({ orderNo: params.get('apoNo'), roleId: this.roleId })
    });
  }

  initiateForm() {
    this.apoForm = this.fb.group({
      orderNo: ['', [Validators.required]],
      personnelId: ['', [Validators.required]],
      personnelName: [''],
      department: [''],
      nameOfService: [''],
      apoOrderNumber: ['', [Validators.required]],
      apoOrderDate: ['', [Validators.required]],
      apoDate: ['', [Validators.required]],
      postingOrderNumber: ['', [Validators.required]],
      postingOrderDate: ['', [Validators.required]],
      joiningDate: ['', [Validators.required]],
      previousPost: ['', [Validators.required]],
      newPost: ['', [Validators.required]],
      apoDuration: ['', [Validators.required, Validators.max(999), Validators.min(1)]],
      apoHeadquarters: ['', [Validators.required]],
      apoReasonDetails: ['', [Validators.required]],
      additionalComments: ['', [Validators.required]],
      apoDocument: ['', [Validators.required]],
      postingDocument: ['', [Validators.required]],
      joiningDocument: ['', [Validators.required]],
      otherDocument: ['']
    });
  }

  get fc() {
    return this.apoForm.controls;
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

  getAttachedDocument(files: any[], type: any): any {
    if (files?.find(x => x.fileCd == type)) {
      return files.filter(x => x.fileCd == type)?.map(y => y.fileId)
    }
    return '';
  }

  async getApoByOrderNoAsync(body: any) {
    await this.apoService.getApoByOrderNoAsync(body).then((result: any) => {
      if (result.req) {
        this.apoForm.patchValue({
          orderNo: result.req?.orderNo,
          personnelId: result.req?.person?.personId,
          personnelName: result.req?.person?.empName,
          department: result.req?.person?.dept,
          nameOfService: result.req?.person?.service,
          apoOrderNumber: result.req?.apoOrderNo,
          apoOrderDate: result.req?.orderDt,
          apoDate: result.req?.apoDt,
          postingOrderNumber: result.req?.posOrderNo,
          postingOrderDate: result.req?.posOrderDt,
          joiningDate: result.req?.joiningDt,
          previousPost: result.req.prevPost?.postId,
          newPost: result.req.newPost?.postId,
          apoDuration: result.req?.apoDurtn,
          apoHeadquarters: result.req?.headquarter?.hqId,
          apoReasonDetails: result.req?.apoRsn,
          apoDocument: this.getAttachedDocument(result.req?.files, 'AO'),
          postingDocument: this.getAttachedDocument(result.req?.files, 'PO'),
          joiningDocument: this.getAttachedDocument(result.req?.files, 'JO'),
          otherDocument: this.getAttachedDocument(result.req?.files, 'A')
        });
      } else {
        this.apoForm.patchValue({
          orderNo: body.orderNo
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

  dateValidate() {
    let isValid = true;
    let message = ''
    if (!this.apoForm.value.apoOrderDate && this.apoForm.value.apoDate) {
      isValid = false;
      message = 'Please select first apo order date.'
      this.apoForm.patchValue({ apoDate: '' });
    } else if (!this.apoForm.value.apoDate && this.apoForm.value.postingOrderDate) {
      isValid = false;
      message = 'Please select first apo date.'
      this.apoForm.patchValue({ postingOrderDate: '' });
    } else if (this.apoForm.value.joiningDate && (!this.apoForm.value.postingOrderDate && this.apoForm.value.joiningDate)) {
      isValid = false;
      message = 'Please select first posting order date.'
      this.apoForm.patchValue({ joiningDate: '' });
    } else if (this.apoForm.value.apoDate && (this.apoForm.value.apoOrderDate > this.apoForm.value.apoDate)) {
      isValid = false;
      this.apoForm.patchValue({ apoDate: '' });
      message = 'APO date must be on or after the Apo order date.'
    } else if (this.apoForm.value.postingOrderDate && (this.apoForm.value.apoDate > this.apoForm.value.postingOrderDate)) {
      isValid = false;
      message = 'Posting order date must be on or after the Apo date.'
      this.apoForm.patchValue({ postingOrderDate: '' });
    } if (this.apoForm.value.joiningDate && (this.apoForm.value.postingOrderDate > this.apoForm.value.joiningDate)) {
      isValid = false;
      message = 'Joining date must be on or after the posting order date.'
      this.apoForm.patchValue({ joiningDate: '' });
    }
    if (!isValid) {
      this.dialog.open(ApoInformationDialog, {
        disableClose: true,
        width: '300px',
        data: {
          title: 'Information',
          message: message,
          btntext: 'Ok'
        }
      });
    } else {
      this.getApoDuration();
    }
  }
  getApoDuration() {
    const fd = new Date(this.apoForm.value.postingOrderDate).getTime();
    const sd = new Date(this.apoForm.value.apoDate).getTime();
    if (fd.toString() != 'NaN' && sd.toString() != 'NaN') {
      this.apoForm.patchValue({
        apoDuration: Math.floor(Math.abs(fd - sd) / (1000 * 60 * 60 * 24))
      })
    }
  }

  addAttachmentDialog(type: any): void {
    let noOfFiles = 0;
    if (this.apoForm.value.apoDocument != null && type == 'AO') {
      noOfFiles = this.apoForm.value.apoDocument?.length ?? 0;
    } else if (this.apoForm.value.postingDocument != null && type == 'PO') {
      noOfFiles = this.apoForm.value.postingDocument?.length ?? 0;
    } else if (this.apoForm.value.joiningDocument != null && type == 'JO') {
      noOfFiles = this.apoForm.value.joiningDocument?.length ?? 0;
    } else if (this.apoForm.value.otherDocument != null && type == 'A') {
      noOfFiles = this.apoForm.value.otherDocument?.length ?? 0;
    }
    const dialogRef = this.dialog.open(AddAttachmentDialog, {
      disableClose: true,
      width: '1500px',
      data: {
        type: type,
        noOfFiles: noOfFiles,
        orderNo: this.apoForm.value.orderNo,
        createdBy: this.userId
      }
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result.status) {
        this.ngZone.run(() => {
          if (result.type == 'AO') {
            let apoDocument = this.apoForm.value.apoDocument;
            if (apoDocument != null && apoDocument?.length > 0) {
              this.apoForm.patchValue({
                apoDocument: [...apoDocument, ...result.files]
              })
            } else {
              this.apoForm.patchValue({
                apoDocument: result.files
              });
            }
          } else if (result.type == 'PO') {
            let postingDocument = this.apoForm.value.postingDocument;
            if (postingDocument != null && postingDocument?.length > 0) {
              this.apoForm.patchValue({
                postingDocument: [...postingDocument, ...result.files]
              })
            } else {
              this.apoForm.patchValue({
                postingDocument: result.files
              })
            }
          } else if (result.type == 'JO') {
            let joiningDocument = this.apoForm.value.joiningDocument;
            if (joiningDocument != null && joiningDocument?.length > 0) {
              this.apoForm.patchValue({
                joiningDocument: [...joiningDocument, ...result.files]
              })
            } else {
              this.apoForm.patchValue({
                joiningDocument: result.files
              })
            };
          } else if (result.type == 'A') {
            let otherDocument = this.apoForm.value.otherDocument;
            if (otherDocument != null && otherDocument?.length > 0) {
              this.apoForm.patchValue({
                otherDocument: [...otherDocument, ...result.files]
              })
            } else {
              this.apoForm.patchValue({
                otherDocument: result.files
              })
            };
          }
          this.cdr.detectChanges();
        });
      }
    });
  }

  async showAttachmentDialog(type: any) {
    let fileIds: any[] = [];
    if (this.apoForm.value.apoDocument != null && type == 'AO') {
      fileIds = this.apoForm.value.apoDocument;
    } else if (this.apoForm.value.postingDocument != null && type == 'PO') {
      fileIds = this.apoForm.value.postingDocument;
    } else if (this.apoForm.value.joiningDocument != null && type == 'JO') {
      fileIds = this.apoForm.value.joiningDocument;
    } else if (this.apoForm.value.otherDocument != null && type == 'A') {
      fileIds = this.apoForm.value.otherDocument;
    }

    await this.apoService.getApoDocAsync({ "fileIds": fileIds, "createdBy": this.userId }).then(res => {
      if (res?.files) {
        const dialogRef = this.dialog.open(ShowAttachmentDialog, {
          disableClose: true,
          width: '900px',
          data: {
            type: type,
            files: res.files,
            orderNo: this.apoForm.value.orderNo
          }
        });

        dialogRef.afterClosed().subscribe((result: any) => {
          if (result.status) {
            if (result.type == 'AO') {
              this.apoForm.patchValue({
                apoDocument: result.files
              })
            } else if (result.type == 'PO') {
              this.apoForm.patchValue({
                postingDocument: result.files
              })
            } else if (result.type == 'JO') {
              this.apoForm.patchValue({
                joiningDocument: result.files
              })
            } else if (result.type == 'A') {
              this.apoForm.patchValue({
                otherDocument: result.files
              })
            }
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.apoForm.valid) {
      const dialogRef = this.dialog.open(ApoMessageDialog, {
        disableClose: true,
        width: '500px',
        data: {
          isClose: false,
          title: 'Submit Application',
          message: 'Are you sure you want to submit this application?',
          leftbtntext: 'Cancel',
          rightbtntext: 'Yes, Submit',
          icon: 'assets/images/submit-Application.png'
        }
      });
      dialogRef.afterClosed().subscribe(async (result) => {
        if (result == 'yes') {
          await this.updateApoAsync(EnumStatus.SUBMITTED, result);
        }
      });
    } else {
      this.apoForm.markAllAsTouched();
    }
  }

  async updateApoAsync(enumStatus: EnumStatus, dialogMsg: any = null) {
    let body = {
      "orderNo": this.apoForm.value.orderNo,
      "person": {
        "personId": this.apoForm.value.personnelId,
        "name": this.apoForm.value.personnelName,
        "department": this.apoForm.value.department,
        "service": this.apoForm.value.nameOfService
      },
      "apoOrderNo": this.apoForm.value.apoOrderNumber,
      "orderDate": this.apoForm.value.apoOrderDate,
      "apoDate": this.apoForm.value.apoDate,
      "posOrderNo": this.apoForm.value.postingOrderNumber,
      "posOrderDate": this.apoForm.value.postingOrderDate,
      "joiningDate": this.apoForm.value.joiningDate,
      "prevPostId": this.apoForm.value.previousPost,
      "newPostId": this.apoForm.value.newPost,
      "apoDuration": this.apoForm.value.apoDuration,
      "headQrtrId": this.apoForm.value.apoHeadquarters,
      "apoReason": this.apoForm.value.apoReasonDetails,
      "statusId": enumStatus,
      "updatedBy": this.userId,
      "addFiles": this.apoForm.value.otherDocument?.length > 0
        ? [...this.apoForm.value.apoDocument, ...this.apoForm.value.postingDocument, ...this.apoForm.value.joiningDocument, ...this.apoForm.value.otherDocument]
        : [...this.apoForm.value.apoDocument, ...this.apoForm.value.postingDocument, ...this.apoForm.value.joiningDocument],
      "comments": this.apoForm.value.additionalComments
    }
    await this.apoService.updateApoAsync(body).then(result => {
      if (result.status == 'UPDATED') {
        this.submitted = false;
        if (dialogMsg == 'yes') {
          this.router.navigate(['/home/request-message'], {
            queryParams: { typeId: EnumRequestType.Success },
          });
        }
      }
    });
  }
}