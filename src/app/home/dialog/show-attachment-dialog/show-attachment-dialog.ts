import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ApoService } from '../../../services/apo-service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../../common/shared-module';
import { DatePipe } from '@angular/common';
import { constants } from '../../../common/constants';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxExtendedPdfViewerComponent, NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";
import { ApoMessageDialog } from '../apo-message-dialog/apo-message-dialog';

@Component({
  selector: 'app-show-attachment-dialog',
  imports: [SharedModule, NgxExtendedPdfViewerModule],
  providers: [DatePipe],
  templateUrl: './show-attachment-dialog.html',
  styleUrl: './show-attachment-dialog.css'
})
export class ShowAttachmentDialog implements OnInit {
  dtconstant = constants;
  status: boolean = false;
  title: any = 'Additional Documents'
  files: any[] = [];
  groupedFiles!: Map<string, any[]>;
  base64String: any
  isPDF: boolean = false
  isAttachment: any = false
  @ViewChild(NgxExtendedPdfViewerComponent) pdfViewerRef: any = NgxExtendedPdfViewerComponent;
  constructor(private apoService: ApoService, public datePipe: DatePipe,
    private dialog: MatDialog, private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<ShowAttachmentDialog>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }


  async ngOnInit() {
    this.files = this.data.files;
    this.groupedFiles = this.apoService.groupBy(this.files, 'fileCd');
  }

  getDocumentType(fileCd: any): any {
    if (fileCd == 'AO') {
      return 'APO Document'
    } else if (fileCd == 'PO') {
      return 'Posting Document'
    } if (fileCd == 'JO') {
      return 'Joining Document'
    } else {
      return 'Additional Documents'
    }
  }

  onCancelClick(): void {
    if (this.data?.orderNo) {
      this.dialogRef.close({
        status: this.status, // after delete button implement then set true
        type: this.data.type,
        files: this.files.length > 0 ? this.files.map((x: any) => x.fileId) : ''
      });
    } else {
      this.dialogRef.close();
    }
  }

  deleteAttach(fileId: any, createdBy: any) {
    const dialogRef = this.dialog.open(ApoMessageDialog, {
      disableClose: true,
      width: '500px',
      data: {
        isClose: false,
        title: 'Delete Attachment',
        message: 'Are you sure you want to delete this apo?',
        leftbtntext: 'Cancel',
        rightbtntext: 'Yes, Delete'
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result == 'yes') {
        await this.apoService.deleteApoDocAsync({ fileIds: [fileId], orderNo: this.data.orderNo, createdBy: createdBy }).then(res => {
          if (res.message == 'Data Deleted') {
            this.status = true;
            this.files = this.files.filter((x: any) => x.fileId !== fileId);
            this.groupedFiles = this.apoService.groupBy(this.files, 'fileCd');
            this.cdr.detectChanges();
            if (this.files?.length == 0) {
              this.onCancelClick();
            }
          }
        });
      }
    });
  }

  async downloadFiles(base64String: any, fileType: any, fileName: any) {
    this.apoService.downloadFiles(base64String, fileType, fileName);
  }

  async openFileInNewTab(base64String: any, fileType: any) {
    this.apoService.openFileInNewTab(base64String, fileType)
  }
}
