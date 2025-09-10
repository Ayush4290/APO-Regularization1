import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { SharedModule } from '../../../common/shared-module';
import { DatePipe } from '@angular/common';
import { EnumRole, EnumStatus } from '../../../common/enums';
import { ApoService } from '../../../services/apo-service';
import { constants } from '../../../common/constants';
import { NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ShowAttachmentDialog } from '../../dialog/show-attachment-dialog/show-attachment-dialog';

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
  originalDeptList: any = [];
  originalUserList: any = [];

  deptHistoryList: any = [];
  userHistoryList: any = [];
  deptAttachmentList: any = [];
  userAttachmentList: any = [];

  zoomLevel: number = 1.0; // Initial zoom level
  @ViewChild('pdfIframe') pdfIframe!: ElementRef;
  statusList: any;
  dtconstant = constants;
  
  previewFileId: number | null = null; 
  preview: { type: string; isPdf: boolean; src: string; safeSrc: any; name: string } | null = null;

  // Dropdown properties
  showDepartmentDropdown = false;
  showUserDropdown = false;
  showSortDropdown = false;
  selectedDepartments: string[] = [];
  selectedUsers: string[] = [];

  // Filter properties
  activeFilter = 'All';
  searchText = '';
  userSearchText = '';
  sortOrder = 'asc';

  roleId: any;
  userId: any;

  @Input() auditHistory: any;

  constructor(
    private apoService: ApoService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    public datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.roleId = sessionStorage.getItem('roleId');
    this.userId = sessionStorage.getItem('userId');
    this.getDeptAsync();
    this.getEmpAsync();

    let auditHistory = this.auditHistory ?? [];
    this.setAuditHistory(auditHistory?.sort((a: any, b: any) => b.auditId - a.auditId));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['auditHistory']) {
      let auditHistory = changes['auditHistory'].currentValue?.sort((a: any, b: any) => b.auditId - a.auditId);
      this.setAuditHistory(auditHistory);
    }
  }

  setAuditHistory(auditHistory: any[]) {
    this.auditHistoryList = [];
    auditHistory?.forEach((audit: any) => {
      if (audit?.changedBy) {
        this.auditHistoryList.push({
          empId: audit?.changedBy?.empId,
          empName: audit?.changedBy?.empName,
          dept: audit?.changedBy?.dept,
          role: this.getRoleName(audit?.roleId ?? EnumRole.CONSULT),
          fileIds: audit?.fileIds,
          date: this.datePipe.transform(audit?.changedDt, constants.dtFormat),
          time: this.datePipe.transform(audit?.changedDt, constants.timeFormat),
          aging: audit?.aging,
          status: audit?.status,
          statusName: audit?.statusName,
          comment: audit?.comment
        });
      } else if (audit?.changedBy == null) {
        // ... (rest of your logic for handling null changedBy remains unchanged)
      }
    });

    this.originalHistory = [...this.auditHistoryList];
    this.updateFilterableLists();
  }
  
  updateFilterableLists() {
    if (this.originalHistory.length > 0) {
        let deptNamesHist = [...new Set(this.originalHistory.map((x: any) => x.dept.trim()))];
        let empIdsHist = [...new Set(this.originalHistory.map((x: any) => x.empId))];

        let auditAttachment = this.originalHistory.filter((item: any) => item.fileIds != null);
        this.auditAttachmentList = auditAttachment.filter((item: any, index: any, self: any) => 
            index === self.findIndex((t: any) => t.empId === item.empId)
        );
        
        let deptNamesAttach = [...new Set(this.auditAttachmentList.map((x: any) => x.dept.trim()))];
        let empIdsAttach = [...new Set(this.auditAttachmentList.map((x: any) => x.empId))];

        this.deptHistoryList = this.originalDeptList.filter((x: any) => deptNamesHist.includes(x.deptName.trim()));
        this.userHistoryList = this.originalUserList.filter((x: any) => empIdsHist.includes(x.empId));
        this.deptAttachmentList = this.originalDeptList.filter((x: any) => deptNamesAttach.includes(x.deptName.trim()));
        this.userAttachmentList = this.originalUserList.filter((x: any) => empIdsAttach.includes(x.empId));
    }
  }

  async getDeptAsync() {
    await this.apoService.getDeptAsync().then(res => {
      if (res) this.originalDeptList = res;
    });
  }

  async getEmpAsync() {
    await this.apoService.getEmpAsync().then(res => {
      if (res) this.originalUserList = res;
    });
  }

  zoomIn() {
    this.zoomLevel += 0.2;
    if (this.zoomLevel > 3.0) this.zoomLevel = 3.0;
    setTimeout(() => this.adjustIframeSize(), 50);
  }

  zoomOut() {
    this.zoomLevel -= 0.2;
    if (this.zoomLevel < 0.5) this.zoomLevel = 0.5;
    setTimeout(() => this.adjustIframeSize(), 50);
  }

  /**
   * FINAL FIXED PDF ZOOM LOGIC
   * This function correctly calculates the iframe dimensions for both zoom-in and zoom-out.
   */
  adjustIframeSize() {
    const iframe = this.pdfIframe?.nativeElement;
    if (iframe) {
      const container = iframe.parentElement;
      if (container) {
        const containerHeight = 450; // Must match .pdf-container height in CSS
        
        container.style.overflow = 'auto'; // Always allow scrolling
        iframe.style.transformOrigin = 'top left';
        iframe.style.transform = `scale(${this.zoomLevel})`;

        // Calculate the inverse size to make the content appear zoomed
        iframe.style.width = `calc(100% / ${this.zoomLevel})`;
        iframe.style.height = `${containerHeight / this.zoomLevel}px`;
      }
    }
  }

  getDeptName(deptId: any): any {
    return this.originalDeptList?.find((dept: any) => dept.deptId == deptId)?.deptName;
  }

  getFilesGroupBy(files: any): Map<string, any[]> {
    return this.apoService.groupBy(files, 'fileCd');
  }

  getDocumentType(fileCd: any): any {
    if (fileCd == 'AO') return 'APO Document';
    if (fileCd == 'PO') return 'Posting Document';
    if (fileCd == 'JO') return 'Joining Document';
    return 'Additional Documents';
  }

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
      if (filterType === 'All') this.resetFilters();
    }
    this.showSortDropdown = false;
  }

  onDepartmentChange(department: any) {
    department.checked = !department.checked;
    if (department.checked) {
      if (!this.selectedDepartments.includes(department.deptName.trim())) {
        this.selectedDepartments.push(department.deptName.trim());
      }
    } else {
      this.selectedDepartments = this.selectedDepartments.filter(dept => dept !== department.deptName.trim());
    }
    this.applyFilters();
  }

  onUserChange(user: any) {
    user.checked = !user.checked;
    if (user.checked) {
      if (!this.selectedUsers.includes(user.empName.trim())) {
        this.selectedUsers.push(user.empName.trim());
      }
    } else {
      this.selectedUsers = this.selectedUsers.filter(usr => usr !== user.empName.trim());
    }
    this.applyFilters();
  }

  onSearch() { this.applyFilters(); }
  onUserSearch() { this.applyFilters(); }

  onSortChange(order: string) {
    this.sortOrder = order;
    this.applyFilters();
  }

  applyFilters() {
    let filteredData = [...this.originalHistory];
    
    // Apply department and user filters
    if (this.selectedDepartments.length > 0) {
      filteredData = filteredData.filter(item => this.selectedDepartments.includes(item?.dept?.trim()));
    }
    if (this.selectedUsers.length > 0) {
      filteredData = filteredData.filter(item => this.selectedUsers.includes(item?.empName?.trim()));
    }

    // Apply search text (for respective dropdowns)
    if (this.activeFilter === 'Department' && this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      this.deptHistoryList = this.originalDeptList.filter((d: any) => d.deptName.toLowerCase().includes(search));
    }
    if (this.activeFilter === 'User' && this.userSearchText.trim()) {
      const search = this.userSearchText.toLowerCase();
      this.userHistoryList = this.originalUserList.filter((u: any) => u.empName.toLowerCase().includes(search));
    }
    
    // Sort the main list
    if (this.sortOrder === 'asc') {
      filteredData.sort((a, b) => (a?.empName || '').localeCompare(b?.empName || ''));
    } else {
      filteredData.sort((a, b) => (b?.empName || '').localeCompare(a?.empName || ''));
    }

    this.auditHistoryList = filteredData;
    this.auditAttachmentList = filteredData.filter((item: any) => item.fileIds != null)
      .filter((item: any, index: any, self: any) => index === self.findIndex((t: any) => t.empId === item.empId));
  }
  
  resetFilters() {
    this.selectedDepartments = [];
    this.selectedUsers = [];
    this.searchText = '';
    this.userSearchText = '';
    
    this.deptHistoryList.forEach((dept: any) => dept.checked = false);
    this.userHistoryList.forEach((user: any) => user.checked = false);
    
    this.showDepartmentDropdown = false;
    this.showUserDropdown = false;
    this.showSortDropdown = false;
    this.activeFilter = 'All';
    
    this.auditHistoryList = [...this.originalHistory];
    this.updateFilterableLists();
    this.applyFilters();
  }

  closeDropdown() {
    this.showDepartmentDropdown = false;
    this.showUserDropdown = false;
    this.showSortDropdown = false;
  }

  closeSortDropdown() {
    this.showSortDropdown = false;
  }

  toggleSortDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.showSortDropdown = !this.showSortDropdown;
  }

  getStatusClass(statusId: any): string {
    switch (String(statusId)) {
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

  async getApoDocAsync(fileId: any, createdBy: any, type: string) {
    await this.apoService.getApoDocAsync({ "fileIds": [fileId], "createdBy": createdBy }).then(res => {
      if (!res?.files || res.files.length === 0) return;
      
      const file = res.files[0];
      if (type === 'download') {
        this.downloadFiles(file.fileContent, file.fileType, file.fileName);
      } else if (type === 'open') {
        this.openFileInNewTab(file.fileContent, file.fileType);
      } else if (type === 'view') {
        if (this.previewFileId === fileId) {
          this.previewFileId = null;
          this.preview = null;
          return;
        }

        const base64String = `data:${file.fileType};base64,${file.fileContent}`;
        this.previewFileId = fileId;
        this.preview = {
          type: file.fileType,
          isPdf: (file.fileType || '').toLowerCase().includes('pdf'),
          src: base64String,
          safeSrc: this.sanitizer.bypassSecurityTrustResourceUrl(base64String),
          name: file.fileName
        };
        
        this.zoomLevel = 1.0;
        if (this.preview.isPdf) {
          setTimeout(() => this.adjustIframeSize(), 300);
        }
      }
    });
  }

  async showAttachmentDialog(fileIds: any[], userId: any) {
    const mappedFileIds = fileIds.map((x: any) => x.fileId);
    await this.apoService.getApoDocAsync({ "fileIds": mappedFileIds, "createdBy": userId }).then(res => {
      if (res?.files) {
        this.dialog.open(ShowAttachmentDialog, {
          disableClose: true,
          width: '900px',
          data: { type: 'A', files: res.files }
        });
      }
    });
  }
  
  downloadFiles(base64: string, type: string, name: string) {
    this.apoService.downloadFiles(base64, type, name);
  }

  openFileInNewTab(base64: string, type: string) {
    this.apoService.openFileInNewTab(base64, type);
  }

  onError(error: any): void {
    console.error('PDF loading error:', error);
  }

  getRoleName(roleIndex: number): string {
    return EnumRole[roleIndex];
  }
}
