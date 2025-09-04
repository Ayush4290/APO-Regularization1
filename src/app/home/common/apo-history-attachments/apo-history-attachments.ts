import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SharedModule } from '../../../common/shared-module';
import { DatePipe } from '@angular/common';
import { EnumRole, EnumStatus } from '../../../common/enums';
import { ApoService } from '../../../services/apo-service';
import { constants } from '../../../common/constants';
import { NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";
import { MatDialog } from '@angular/material/dialog';
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
  originalHistory: any = [];
  auditHistoryList: any = [];
  auditAttachmentList: any = [];
  departmentList: any = [];
  statusList: any;
  dtconstant = constants;
  // === Inline preview state (ADD THIS) ===
  previewFileId: number | null = null; // which file's preview is open
  preview: { type: string; isPdf: boolean; src: string; safeSrc: any; name: string } | null = null;

  // Department dropdown properties
  showDepartmentDropdown = false;
  showUserDropdown = false;
  showSortDropdown = false;

  selectedDepartments: string[] = [];
  selectedUsers: string[] = [];

  userList = [
    { name: 'John Doe', value: 'John Doe', checked: false },
    { name: 'Jane Smith', value: 'Jane Smith', checked: false },
    { name: 'Mike Johnson', value: 'Mike Johnson', checked: false },
    { name: 'Sarah Wilson', value: 'Sarah Wilson', checked: false },
    { name: 'David Brown', value: 'David Brown', checked: false },
    { name: 'Lisa Davis', value: 'Lisa Davis', checked: false },
    { name: 'Robert Miller', value: 'Robert Miller', checked: false }
  ];

  // Filter properties
  activeFilter = 'All';
  searchText = '';
  userSearchText = '';
  sortOrder = 'asc';

  @Input() auditHistory: any;
  constructor(
    private apoService: ApoService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    public datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.getDeptAsync();
    this.auditHistoryList = this.auditHistory ?? [];
    if (this.auditHistoryList?.length > 0) {
      this.auditAttachmentList = this.auditHistory?.filter((x: any) => x.fileIds != null)?.sort((a: any, b: any) => b.auditId - a.auditId);
      this.originalHistory = [...this.auditHistory];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.auditHistoryList = changes['auditHistory'].currentValue?.sort((a: any, b: any) => b.auditId - a.auditId);
      if (this.auditHistoryList?.length > 0) {
        this.auditAttachmentList = this.auditHistoryList?.filter((x: any) => x.fileIds != null)?.sort((a: any, b: any) => b.auditId - a.auditId);
        this.originalHistory = [...this.auditHistoryList];
      }
    }
  }

  async getDeptAsync() {
    await this.apoService.getDeptAsync().then(res => {
      if (res) {
        this.departmentList = res;
      }
    })
  }

  getDeptName(deptId: any): any {
    return this.departmentList?.find((dept: any) => dept.deptId == deptId)?.deptName;
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

  // Filter button click handlers
  onFilterButtonClick(filterType: string) {
    this.activeFilter = filterType;

    if (filterType === 'Department') {
      this.showDepartmentDropdown = !this.showDepartmentDropdown;
      this.showUserDropdown = false;
    } else if (filterType === 'User') {
      this.showUserDropdown = !this.showUserDropdown;
      this.showDepartmentDropdown = false;
    } else {
      this.showDepartmentDropdown = false;
      this.showUserDropdown = false;
      if (filterType === 'All') {
        this.resetFilters();
      }
    }
    this.showSortDropdown = false;
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

  // User checkbox change handler
  onUserChange(user: any) {
    user.checked = !user.checked;

    if (user.checked) {
      if (!this.selectedUsers.includes(user.value)) {
        this.selectedUsers.push(user.value);
      }
    } else {
      this.selectedUsers = this.selectedUsers.filter(usr => usr !== user.value);
    }

    this.applyFilters();
  }

  // Search functionality
  onSearch() {
    this.applyFilters();
  }

  onUserSearch() {
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

    // Apply user filter
    if (this.selectedUsers.length > 0) {
      filteredData = filteredData.filter(item =>
        this.selectedUsers.includes(item?.changedBy?.empName)
      );
    }

    // Apply search filter for departments
    if (this.searchText.trim()) {
      filteredData = filteredData.filter(item =>
        item?.changedBy?.empName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item?.changedBy?.dept?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item?.comment?.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    // Apply search filter for users
    if (this.userSearchText.trim()) {
      filteredData = filteredData.filter(item =>
        item?.changedBy?.empName?.toLowerCase().includes(this.userSearchText.toLowerCase()) ||
        item?.comment?.toLowerCase().includes(this.userSearchText.toLowerCase())
      );
    }

    // Apply sorting
    if (this.sortOrder === 'asc') {
      filteredData.sort((a, b) => a?.changedBy?.empName?.localeCompare(b?.changedBy?.empName));
    } else {
      filteredData.sort((a, b) => b?.changedBy?.empName?.localeCompare(a?.changedBy?.empName));
    }

    this.auditHistoryList = filteredData;
  }

  // Reset all filters
  resetFilters() {
    this.selectedDepartments = [];
    this.selectedUsers = [];
    this.searchText = '';
    this.userSearchText = '';
    this.departmentList.forEach((dept: any) => dept.checked = false);
    this.userList.forEach(user => user.checked = false);
    this.showDepartmentDropdown = false;
    this.showUserDropdown = false;
    this.showSortDropdown = false;
    this.auditHistoryList = [...this.originalHistory];
  }

  // Close dropdown when clicking outside
  closeDropdown() {
    this.showDepartmentDropdown = false;
    this.showUserDropdown = false;
    this.showSortDropdown = false;
  }

  toggleSortDropdown(event: MouseEvent) {
    event.stopPropagation(); // prevent closing when clicking inside
    this.showSortDropdown = !this.showSortDropdown;
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
        } else if (type === 'view') {
          const file = res?.files[0];
          if (!file) return;

          // Toggle off if clicking the same file again
          if (this.previewFileId === fileId) {
            this.previewFileId = null;
            this.preview = null;
            return;
          }

          const base64String = `data:${file?.fileType};base64,${file?.fileContent}`;
          const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(base64String);

          this.previewFileId = fileId;
          this.preview = {
            type: file?.fileType,
            isPdf: (file?.fileType || '').toLowerCase().includes('pdf'),
            src: base64String,
            safeSrc: safeUrl,
            name: file?.fileName
          };
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

  getRoleName(roleIndex: number): string {
    return EnumRole[roleIndex];
  }
}