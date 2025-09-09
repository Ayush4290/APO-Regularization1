import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../../../common/shared-module';
import { EnumRole, EnumStatus } from '../../../common/enums';
import { ApoService } from '../../../services/apo-service';
import { MatSort } from '@angular/material/sort';
import { constants } from '../../../common/constants';
import { MatDialog } from '@angular/material/dialog';
import { ApoMessageDialog } from '../../dialog/apo-message-dialog/apo-message-dialog';
import { PeriodicElement } from '../../../common/interfaces';

@Component({
  selector: 'app-apo-orders-list',
  imports: [SharedModule],
  providers: [DatePipe],
  templateUrl: './apo-orders-list.html',
  styleUrl: './apo-orders-list.css'
})
export class ApoOrdersList implements AfterViewInit, OnChanges, OnInit {
  displayedColumns: string[] = ['#', 'orderNo', 'empName', 'service', 'apoDt', 'posOrderDt', 'joiningDt', 'apoDurtn', 'aging', 'status', 'action'];
  dataSource = new MatTableDataSource<any>();
  @Input() allApoOrders: any;
  @Output() orderNoSent = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator: any;
  @ViewChild(MatSort) sort: any;

  enumRole: any = EnumRole;
  enumStatus: any = EnumStatus;
  roleId: any;
  userId: any;
  isDelete: boolean = false;

  showFilterDialog: boolean = false;
  filterData: any = {
    requestId: '',
    name: '',
    service: '',
    apoFromDate: null,
    apoToDate: null,
    apoDuration: '',
    postFromDate: null,
    postToDate: null,
    postDuration: '',
    joinFromDate: null,
    joinToDate: null,
    status: ''
  };
  activeFilters: any = {};

  constructor(private apoService: ApoService, public dialog: MatDialog, private router: Router, private route: ActivatedRoute, public datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.roleId = sessionStorage.getItem('roleId');
    this.userId = sessionStorage.getItem('userId');
    this.isDelete = this.route.snapshot.queryParams['isDelete'] || null;
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => {
      if (changes && changes['allApoOrders']) {
        let allApoOrders: any[] = changes['allApoOrders'].currentValue ?? [];
        allApoOrders?.forEach((row: any) => {
          row.apoDt = this.datePipe.transform(row?.apoDt, constants.dtFormat)
          row.posOrderDt = this.datePipe.transform(row?.posOrderDt, constants.dtFormat)
          row.joiningDt = this.datePipe.transform(row?.joiningDt, constants.dtFormat),
          row.aging = row.aging ?? '-'
        })
        this.dataSource.data = allApoOrders;
      }
    }, 200);
  }

  loadData(orderNo: any = null) {
    setTimeout(() => {
      this.dataSource.data = []
      if (orderNo)
        this.dataSource.data = this.allApoOrders = this.allApoOrders.filter((x: any) => x.orderNo != orderNo);
      else
        this.dataSource.data = this.allApoOrders;

      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.dataSource.sortingDataAccessor = (item, property) => {
        if (property === 'name') {
          return item.person.empName;
        }
        if (property === 'service') {
          return item.person.service;
        }
        if (property === 'status' || property === 'action') {
          return item.status.statusName;
        }
        return item[property];
      };

      this.filterPredicate();
    }, 200);
  }

  filterPredicate() {
    this.dataSource.filterPredicate = (data: PeriodicElement, filter: string) => {
      const dataStr = Object.values(data).join('').toLowerCase();
      const empNameStr = data.person.empName.toLowerCase();
      const serviceStr = data.person.service.toLowerCase();
      const apoDtStr = data.apoDt.toString().toLowerCase();
      const posOrderDtStr = data.posOrderDt.toString().toLowerCase();
      const joiningDtStr = data.joiningDt.toString().toLowerCase();
      const apoDurtnStr = data.apoDurtn.toString().toLowerCase();

      const filterStr = filter.trim().toLowerCase();

      return dataStr.includes(filterStr) || empNameStr.includes(filterStr)
        || serviceStr.includes(filterStr) || apoDtStr.includes(filterStr)
        || posOrderDtStr.includes(filterStr) || joiningDtStr.includes(filterStr)
        || apoDurtnStr.includes(filterStr);
    };
  }

  openFilterDialog(): void {
    this.showFilterDialog = true;
  }

  closeFilterDialog(): void {
    this.showFilterDialog = false;
  }

  applyRequestIdFilter(): void {
    if (this.filterData.requestId) {
      this.dataSource.filter = this.filterData.requestId.trim().toLowerCase();
    } else {
      this.dataSource.filter = '';
    }
  }

  applyNameFilter(): void {
    if (this.filterData.name) {
      this.dataSource.filter = this.filterData.name.trim().toLowerCase();
    } else {
      this.dataSource.filter = '';
    }
  }

  applyAllFilters(): void {
    let filterValue = '';
    if (this.filterData.requestId) filterValue += this.filterData.requestId + ' ';
    if (this.filterData.name) filterValue += this.filterData.name + ' ';
    if (this.filterData.service) filterValue += this.filterData.service + ' ';

    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.closeFilterDialog();
  }

  clearAllFilters(): void {
    this.filterData = {
      requestId: '',
      name: '',
      service: '',
      apoFromDate: null,
      apoToDate: null,
      apoDuration: '',
      postFromDate: null,
      postToDate: null,
      postDuration: '',
      joinFromDate: null,
      joinToDate: null,
      status: ''
    };
    this.dataSource.filter = '';
    this.closeFilterDialog();
  }

  hasActiveFilters(): boolean {
    return this.filterData.requestId || this.filterData.name || this.filterData.service || Object.values(this.filterData).some(v => v !== '' && v !== null);
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

  goToAPO(orderNo: any, statusId: any) {
    if (statusId == EnumStatus.DRAFT) {
      this.router.navigate(['/home/apo-request'], {
        queryParams: { apoNo: orderNo },
      });
    } else if (statusId == EnumStatus.PENDING) {
      if (EnumRole.INITIATOR == this.roleId) {
        this.router.navigate(['/home/apo-pending'], {
          queryParams: { apoNo: orderNo },
        });
      } else {
        this.router.navigate(['/home/apo-approver'], {
          queryParams: { apoNo: orderNo },
        });
      }
    } else {
      this.router.navigate(['/home/apo-status'], {
        queryParams: { apoNo: orderNo },
      });
    }
  }

  deleteApoOrder(orderNo: any) {
    const dialogRef = this.dialog.open(ApoMessageDialog, {
      disableClose: true,
      width: '500px',
      data: {
        isClose: false,
        title: 'Delete APO',
        message: 'Are you sure you want to delete this apo?',
        leftbtntext: 'Cancel',
        rightbtntext: 'Yes, Delete',
        icon: 'assets/images/discord-application.png'
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result == 'yes') {
        this.apoService.deteleApoOrderAsync(orderNo).then(res => {
          if (res.message) {
            this.orderNoSent.emit(orderNo);
            this.loadData(orderNo)
          }
        });
      }
    });
  }
}