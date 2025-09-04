import { Component, Inject, OnInit, ViewChild } from '@angular/core';
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
  base64String: any
  isPDF: boolean = false
  isAttachment: any = false
  @ViewChild(NgxExtendedPdfViewerComponent) pdfViewerRef: any = NgxExtendedPdfViewerComponent;
  constructor(private apoService: ApoService, public datePipe: DatePipe,
    private dialog: MatDialog, private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<ShowAttachmentDialog>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  async ngOnInit() {
    if (this.data.userId != 0) {
      if (this.data.type == 'AO') {
        this.title = 'APO Document';
      } else if (this.data.type == 'PO') {
        this.title = 'Posting Document';
      } else if (this.data.type == 'JO') {
        this.title = 'Joining Document';
      }
      this.files = this.data.files;
    }
  }

  onCancelClick(): void {
    if (this.data.userId != 0) {
      this.dialogRef.close({
        status: this.status, // after delete button implement then set true
        type: this.data.type,
        files: this.files.length > 0 ? this.files.map((x: any) => x.fileId) : ''
      });
    } else {
      this.dialogRef.close();
    }
  }

  deleteAttach(fileId: any) {
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
        let userId: number = 0;
        if (this.data.userId !== null) {
          userId = parseInt(this.data.userId, 0);
        }
        await this.apoService.deleteApoDocAsync({ fileIds: [fileId], createdBy: userId }).then(res => {
          if (res.message == 'Data Deleted') {
            this.status = true;
            this.files = this.files.filter((x: any) => x.fileId !== fileId);
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

  async openAttach(base64String: any, fileType: any) {
    this.isAttachment = true;
    if (fileType == 'application/pdf') {
      this.isPDF = true;
      this.base64String = `data:${fileType};base64,${base64String}`;
    } else {
      this.isPDF = false;
      const dataUri = `data:${fileType};base64,${base64String}`;
      this.base64String = this.sanitizer.bypassSecurityTrustResourceUrl(dataUri);
    }
  }

  onPdfLoaded(): void {
    this.pdfViewerRef.zoom = '50%';
  }

  onError(error: any): void {
    console.error('PDF loading error:', error);
  }
}
