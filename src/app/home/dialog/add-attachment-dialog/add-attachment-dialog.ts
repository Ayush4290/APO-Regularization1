import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApoService } from '../../../services/apo-service';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { SharedModule } from '../../../common/shared-module';
import { ApoInformationDialog } from '../apo-information-dialog/apo-information-dialog';

@Component({
  selector: 'app-add-attachment-dialog',
  imports: [SharedModule, DragDropModule],
  templateUrl: './add-attachment-dialog.html',
  styleUrl: './add-attachment-dialog.css'
})
export class AddAttachmentDialog implements OnInit {
  docForm!: FormGroup;
  title: any;
  constructor(private fb: FormBuilder, private apoService: ApoService, public dialog: MatDialog,private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<AddAttachmentDialog>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    this.docForm = this.fb.group({
      files: this.fb.array([])
    });
    this.title = this.getDocumentType(this.data.type)
  }

  get files(): FormArray {
    return this.docForm.get('files') as FormArray;
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
    this.dialogRef.close({
      status: false
    });
  }

  onSubmit(): void {
    if (this.docForm.valid) {
      let body: any[] = [];
      this.files.controls.forEach(element => {
        body.push(
          {
            fileName: element.value.fileName,
            fileType: element.value.fileType,
            fileContent: element.value.fileContent,
            fileDesc: element.value.fileDesc,
            fileCd: element.value.fileCd,
          }
        )
      });
      this.apoService.createApoDocAsync({ files: body, orderNo: this.data.orderNo, createdBy: this.data.createdBy }).then(res => {
        if (res.message == 'Success') {
          this.dialogRef.close(
            {
              status: true,
              type: this.data.type,
              files: res.fileIds
            }
          );
        }
      });
    } else {
      this.docForm.markAllAsTouched()
    }
  }

  onDrop(event: CdkDragDrop<string[]>) {
    console.log('Image was dropped!', event);
  }

  onFileSelected(event: any): void {
    let noOfFiles = this.data.noOfFiles + this.files.length;
    if (noOfFiles > 4) {
      this.dialog.open(ApoInformationDialog, {
        disableClose: true,
        width: '300px',
        data: {
          title: 'Information',
          message: 'Maximum 05 files allow to upload.',
          btntext: 'Ok'
        }
      });
      return;
    }
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.dialog.open(ApoInformationDialog, {
          disableClose: true,
          width: '300px',
          data: {
            title: 'Information',
            message: 'Only JPEG, PNG, PDF files are allowed.',
            btntext: 'Ok'
          }
        });
        event.target.value = '';
        return;
      } else if (file.size > (2 * 1024 * 1024)) {
        this.dialog.open(ApoInformationDialog, {
          disableClose: true,
          width: '300px',
          data: {
            title: 'Information',
            message: 'File size exceeds 2MB. Please choose a smaller file.',
            btntext: 'Ok'
          }
        });
        event.target.value = '';
        return;
      } else if (this.files.controls.find((element: any) => element.value.fileName == file.name)) {
        this.dialog.open(ApoInformationDialog, {
          disableClose: true,
          width: '300px',
          data: {
            title: 'Information',
            message: `File (${file.name}) already selected.`,
            btntext: 'Ok'
          }
        });
        event.target.value = '';
        return;
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setTimeout(() => {
            let base64 = reader.result?.toString().split(',')[1];
            this.files.push(this.fb.group({
              fileName: [file.name, [Validators.required]],
              fileType: [file.type, [Validators.required]],
              fileSize: [file.size, [Validators.required]],
              fileContent: [base64, [Validators.required]],
              fileDesc: ['', [Validators.required]],
              fileCd: [this.data.type, [Validators.required]]
            }));
            this.cdr.detectChanges();
          }, 100)             
        };
        reader.onerror = (error) => {
          console.error('Error reading file:', error);
        };
        reader.readAsDataURL(file); // Or use readAsDataURL for images
     
      }
    } else {
      event.target.value = '';
    }
  }

  removeFile(index: number) {
    this.files.removeAt(index);
  }
}

