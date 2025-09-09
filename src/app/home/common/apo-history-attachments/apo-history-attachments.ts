import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
    if (changes) {
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
        if (this.roleId == EnumRole.INITIATOR) {
          if (audit?.status == EnumStatus.PENDING) { // For all reviewer show case
            if (audit?.roleId && audit?.deptId == null) {
              let usersList = this.originalUserList.filter((user: any) => user.role == audit.roleId);
              usersList.forEach((user: any) => {
                this.auditHistoryList.push({
                  empId: user?.empId,
                  empName: user?.empName,
                  dept: this.getDeptName(user?.dept),
                  role: this.getRoleName(audit?.roleId),
                  fileIds: audit?.fileIds,
                  date: this.datePipe.transform(audit?.changedDt, constants.dtFormat),
                  time: this.datePipe.transform(audit?.changedDt, constants.timeFormat),
                  aging: audit?.aging,
                  status: audit?.status,
                  statusName: audit?.statusName,
                  comment: audit?.comment
                });
              })
            } else if (audit?.roleId == null && audit?.deptId) { // For consult reviewer show case
              let changedByIds = this.auditHistory.filter((x: any) => x.changedBy != null).map((x: any) => x.changedBy?.empId);
              let usersList = this.originalUserList.filter((user: any) => user.dept == audit?.deptId && user?.role == EnumRole.CONSULT && !changedByIds.includes(user.empId));
              usersList.forEach((user: any) => {
                this.auditHistoryList.push({
                  empId: user?.empId,
                  empName: user?.empName,
                  dept: this.getDeptName(user?.dept),
                  role: this.getRoleName(user?.role),
                  fileIds: audit?.fileIds,
                  date: this.datePipe.transform(audit?.changedDt, constants.dtFormat),
                  time: this.datePipe.transform(audit?.changedDt, constants.timeFormat),
                  aging: audit?.aging,
                  status: audit?.status,
                  statusName: audit?.statusName,
                  comment: audit?.comment
                });
              })
            }
          }
        }
        if (this.roleId == EnumRole.REVIEWER || this.roleId == EnumRole.APPROVER) {
          if (audit?.status == EnumStatus.PENDING) {
            if (audit?.roleId && audit?.deptId == null) { // For self reviewer show case
              let usersList = this.originalUserList.filter((user: any) => user.empId == this.userId);
              usersList.forEach((user: any) => {
                this.auditHistoryList.push({
                  empId: user?.empId,
                  empName: user?.empName,
                  dept: this.getDeptName(user?.dept),
                  role: this.getRoleName(audit?.roleId),
                  fileIds: audit?.fileIds,
                  date: this.datePipe.transform(audit?.changedDt, constants.dtFormat),
                  time: this.datePipe.transform(audit?.changedDt, constants.timeFormat),
                  aging: audit?.aging,
                  status: audit?.status,
                  statusName: audit?.statusName,
                  comment: audit?.comment
                });
              })
            } else if (audit?.roleId == null && audit?.deptId) { // For self reviewer show case
              let usersList = this.originalUserList.filter((user: any) => user.dept == audit?.deptId && user.empId != this.userId && user?.role == EnumRole.CONSULT);
              usersList.forEach((user: any) => {
                this.auditHistoryList.push({
                  empId: user?.empId,
                  empName: user?.empName,
                  dept: this.getDeptName(user?.dept),
                  role: this.getRoleName(user?.role),
                  fileIds: audit?.fileIds,
                  date: this.datePipe.transform(audit?.changedDt, constants.dtFormat),
                  time: this.datePipe.transform(audit?.changedDt, constants.timeFormat),
                  aging: audit?.aging,
                  status: audit?.status,
                  statusName: audit?.statusName,
                  comment: audit?.comment
                });
              })
            }
          }
        }
        if (this.roleId == EnumRole.CONSULT) {
          if (audit?.status == EnumStatus.PENDING) {
            let usersList = this.originalUserList.filter((user: any) => user.empId == this.userId);
            usersList.forEach((user: any) => {
              this.auditHistoryList.push({
                empId: user?.empId,
                empName: user?.empName,
                dept: this.getDeptName(user?.dept),
                role: this.getRoleName(user?.role),
                fileIds: audit?.fileIds,
                date: this.datePipe.transform(audit?.changedDt, constants.dtFormat),
                time: this.datePipe.transform(audit?.changedDt, constants.timeFormat),
                aging: audit?.aging,
                status: audit?.status,
                statusName: audit?.statusName,
                comment: audit?.comment
              });
            })
          }
        }
      }
    });
    if (this.auditHistoryList?.length > 0) {
      this.originalHistory = [...this.auditHistoryList];
      let deptNamesHist = this.originalHistory?.map((x: any) => x.dept.trim());
      let empIdsHist = this.originalHistory?.map((x: any) => x.empId);

      let auditAttachment = this.auditHistoryList?.filter((item: any) => item.fileIds != null);
      this.auditAttachmentList = auditAttachment?.filter((item: any, index: any, self: any) => index === self.findIndex((t: any) => t.empId === item.empId));
      let deptNamesAttach = this.auditAttachmentList?.map((x: any) => x.dept.trim());
      let empIdsAttach = this.auditAttachmentList?.map((x: any) => x.empId);

      this.deptHistoryList = this.originalDeptList?.filter((x: any) => deptNamesHist.includes(x.deptName.trim()))
      this.userHistoryList = this.originalUserList?.filter((x: any) => empIdsHist.includes(x.empId))
      this.deptAttachmentList = this.originalDeptList?.filter((x: any) => deptNamesAttach?.includes(x.deptName.trim()))
      this.userAttachmentList = this.originalUserList?.filter((x: any) => empIdsAttach?.includes(x.empId))
    }
  }

  async getDeptAsync() {
    await this.apoService.getDeptAsync().then(res => {
      if (res) {
        this.originalDeptList = res;
      }
    })
  }

  async getEmpAsync() {
    await this.apoService.getEmpAsync().then(res => {
      if (res) {
        this.originalUserList = res;
      }
    })
  }

  getDeptName(deptId: any): any {
    return this.originalDeptList?.find((dept: any) => dept.deptId == deptId)?.deptName;
  }

  getFilesGroupBy(files: any): Map<string, any[]> {
    return this.apoService.groupBy(files, 'fileCd');
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
      if (!this.selectedDepartments.includes(department.deptName.trim())) {
        this.selectedDepartments.push(department.deptName.trim());
      }
    } else {
      this.selectedDepartments = this.selectedDepartments.filter(dept => dept !== department.deptName.trim());
    }

    this.applyFilters();
  }

  // User checkbox change handler
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
        this.selectedDepartments.includes(item?.dept.trim())
      );
    }

    // Apply user filter
    if (this.selectedUsers.length > 0) {
      filteredData = filteredData.filter(item =>
        this.selectedUsers.includes(item?.empName.trim())
      );
    }

    // Apply search filter for departments
    if (this.searchText.trim()) {
      filteredData = filteredData.filter(item =>
        item?.empName?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item?.dept?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item?.comment?.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }

    // Apply search filter for users
    if (this.userSearchText.trim()) {
      filteredData = filteredData.filter(item =>
        item?.empName?.toLowerCase().includes(this.userSearchText.toLowerCase()) ||
        item?.dept?.toLowerCase().includes(this.userSearchText.toLowerCase()) ||
        item?.comment?.toLowerCase().includes(this.userSearchText.toLowerCase())
      );
    }

    // Apply sorting
    if (this.sortOrder === 'asc') {
      filteredData.sort((a, b) => a?.empName?.localeCompare(b?.empName));
    } else {
      filteredData.sort((a, b) => b?.empName?.localeCompare(a?.empName));
    }

    this.auditHistoryList = filteredData;
    if (this.auditHistoryList?.length > 0) {
      let auditAttachment = this.auditHistoryList?.filter((item: any) => item.fileIds != null);
      this.auditAttachmentList = auditAttachment?.filter((item: any, index: any, self: any) => index === self.findIndex((t: any) => t.empId === item.empId));
    }
  }

  // Reset all filters
  resetFilters() {
    this.selectedDepartments = [];
    this.selectedUsers = [];
    this.searchText = '';
    this.userSearchText = '';
    this.deptHistoryList.forEach((dept: any) => dept.checked = false);
    this.userHistoryList.forEach((user: any) => user.checked = false);
    this.deptAttachmentList.forEach((dept: any) => dept.checked = false);
    this.userAttachmentList.forEach((user: any) => user.checked = false);
    this.showDepartmentDropdown = false;
    this.showUserDropdown = false;
    this.showSortDropdown = false;
    this.auditHistoryList = [...this.originalHistory];
    if (this.auditHistoryList?.length > 0) {
      let auditAttachment = this.auditHistoryList?.filter((item: any) => item.fileIds != null);
      this.auditAttachmentList = auditAttachment?.filter((item: any, index: any, self: any) => index === self.findIndex((t: any) => t.empId === item.empId));
    }
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

  async showAttachmentDialog(fileIds: any[], userId: any) {
    fileIds = fileIds.map((x: any) => x.fileId);
    await this.apoService.getApoDocAsync({ "fileIds": fileIds, "createdBy": userId }).then(res => {
      if (res?.files) {
        const dialogRef = this.dialog.open(ShowAttachmentDialog, {
          disableClose: true,
          width: '900px',
          data: {
            type: 'A',
            files: res.files
          }
        });
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