import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SharedModule } from '../../../common/shared-module';
import { DatePipe } from '@angular/common';
import { EnumRole, EnumStatus } from '../../../common/enums';
import { ApoService } from '../../../services/apo-service';
import { constants } from '../../../common/constants';
import { NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";
import { MatDialog } from '@angular/material/dialog';
import { ShowAttachmentDialog } from '../../dialog/show-attachment-dialog/show-attachment-dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-apo-history-attachments',
  imports: [SharedModule, NgxExtendedPdfViewerModule],
  providers: [DatePipe],
  templateUrl: './apo-history-attachments.html',
  styleUrls: ['./apo-history-attachments.css']
})
export class ApoHistoryAttachments implements OnChanges, OnInit {
  title: any;
  history: any = [];
  originalHistory: any = [];
  statusList: any;
  enumRole: any = EnumRole;
  dtconstant = constants;

  // Department dropdown properties
  showDepartmentDropdown = false;
  selectedDepartments: string[] = [];
  departmentList = [
    { name: 'Home', value: 'Home', checked: false },
    { name: 'Finance', value: 'Finance', checked: false },
    { name: 'Health', value: 'Health', checked: false },
    { name: 'Admin', value: 'Admin', checked: false },
    { name: 'DoP', value: 'DoP', checked: false },
    { name: 'Legal', value: 'Legal', checked: false },
    { name: 'Education', value: 'Education', checked: false }
  ];

  // Filter properties
  activeFilter = 'All';
  searchText = '';
  sortOrder = 'asc';

  @Input() auditHistory: any;

  constructor(
    private apoService: ApoService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    public datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.history = this.auditHistory;
    this.originalHistory = [...this.auditHistory];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      const filteredData = changes['auditHistory'].currentValue?.filter((x: any) => x.changedBy != null)?.sort((a: any, b: any) => b.auditId - a.auditId);
      this.history = filteredData;
      this.originalHistory = [...filteredData];
    }
  }

  // Filter button click handlers
  onFilterButtonClick(filterType: string) {
    this.activeFilter = filterType;

    if (filterType === 'Department') {
      this.showDepartmentDropdown = !this.showDepartmentDropdown;
    } else {
      this.showDepartmentDropdown = false;
      if (filterType === 'All') {
        this.resetFilters();
      } else if (filterType === 'User') {
        this.applyFilters();
      }
    }
  }

  // Department checkbox change handler
  onDepartmentChange(department: any) {
    department.checked = !department.checked;

    if (department.checked) {
      if (!this.selectedDepartments.includes(department.value)) {
        this.selectedDepartments.push(department.value);
      }
    } else {
      this.selectedDepartments = this.selectedDepartments.filter(dept => dept !== department.value);
    }

    this.applyFilters();
  }

  // Search functionality
  onSearch() {
    this.applyFilters();
  }

  // Sort functionality
  onSortChange(order: string) {
    this.sortOrder = order;
    this.applyFilters();
  }

  // Apply all filters
  applyFilters() {
    let filteredData = [...this.originalHistory];

    // Apply department filter
    if (this.selectedDepartments.length > 0) {
      filteredData = filteredData.filter(item =>
        this.selectedDepartments.includes(item?.changedBy?.dept)
      );
    }

    // Apply search filter
    if (this.searchText.trim()) {
      filteredData = filteredData.filter(item =>
        item?.changedBy?.empName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item?.changedBy?.dept?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item?.comment?.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    // Apply sorting
    if (this.sortOrder === 'asc') {
      filteredData.sort((a, b) => a?.changedBy?.empName?.localeCompare(b?.changedBy?.empName));
    } else {
      filteredData.sort((a, b) => b?.changedBy?.empName?.localeCompare(a?.changedBy?.empName));
    }

    this.history = filteredData;
  }

  // Reset all filters
  resetFilters() {
    this.selectedDepartments = [];
    this.searchText = '';
    this.departmentList.forEach(dept => dept.checked = false);
    this.showDepartmentDropdown = false;
    this.history = [...this.originalHistory];
  }

  // Close dropdown when clicking outside
  closeDropdown() {
    this.showDepartmentDropdown = false;
  }

  getStatusClass(statusId: any): string {
    switch (statusId) {
      case EnumStatus.DRAFT.toString(): return 'draft-button';
      case EnumStatus.SUBMITTED.toString(): return 'submitted-button';
      case EnumStatus.PENDING.toString(): return 'pending-button';
      case EnumStatus.RETURNED.toString(): return 'returned-button';
      case EnumStatus.REJECTED.toString(): return 'rejected-button';
      case EnumStatus.APPROVED.toString(): return 'approved-button';
      case EnumStatus.CONSULT.toString(): return 'consult-button';
      case EnumStatus.RESPONEDED.toString(): return 'responeded-button';
      default: return 'draft-button';
    }
  }

  async getApoDocAsync(fileId: any, createdBy: any, type: any) {
    await this.apoService.getApoDocAsync({ "fileIds": [fileId], "createdBy": createdBy }).then(res => {
      if (res?.files) {
        if (type == 'download') {
          this.downloadFiles(res?.files[0]?.fileContent, res?.files[0]?.fileType, res?.files[0]?.fileName);
        } else if (type == 'open') {
          this.openFileInNewTab(res?.files[0].fileContent, res?.files[0]?.fileType);
        } else if (type == 'view') {
          let base64String = `data:${res?.files[0]?.fileType};base64,${res?.files[0]?.fileContent}`;
          const dialogRef = this.dialog.open(ShowAttachmentDialog, {
            disableClose: true,
            width: '900px',
            data: {
              type: res?.files[0]?.fileType == 'application/pdf' ? 'pdf' : 'img',
              files: res?.files[0]?.fileType == 'application/pdf' ? base64String : this.sanitizer.bypassSecurityTrustResourceUrl(base64String),
              userId: 0,
            }
          });
        }
      }
    });
  }

  async downloadFiles(base64String: any, fileType: any, fileName: any) {
    this.apoService.downloadFiles(base64String, fileType, fileName);
  }

  async openFileInNewTab(base64String: any, fileType: any) {
    this.apoService.openFileInNewTab(base64String, fileType);
  }

  onError(error: any): void {
    console.error('PDF loading error:', error);
  }
}
