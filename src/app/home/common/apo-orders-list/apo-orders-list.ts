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

@Component({
  selector: 'app-apo-orders-list',
  imports: [SharedModule],
  providers: [DatePipe],
  templateUrl: './apo-orders-list.html',
  styleUrl: './apo-orders-list.css'
})
export class ApoOrdersList implements AfterViewInit, OnChanges, OnInit {
  displayedColumns: string[] = ['#', 'orderNo', 'name', 'service', 'apoDt', 'posOrderDt', 'joiningDt', 'apoDurtn', 'aging', 'status', 'action'];
  dataSource = new MatTableDataSource<any>();
  @Input() allApoOrders: any;
  @Output() orderNoSent = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator: any;
  @ViewChild(MatSort) sort: any;

  enumRole: any = EnumRole;
  enumStatus: any = EnumStatus;
  constants: any = constants;
  roleId: any;
  userId: any;
  isDelete:boolean=false;
  constructor(private apoService: ApoService, public dialog: MatDialog, private router: Router,private route: ActivatedRoute, public datePipe: DatePipe) {
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
      if (changes) {
        this.dataSource.data = changes['allApoOrders'].currentValue;
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

      //Based on column filter
      // this.dataSource.filterPredicate = this.filterPredicate();
    }, 200);
  }

  //Based on column filter
  // private filterColumn: string = '';
  // filterPredicate() {
  //   return (data: PeriodicElement, filter: string): boolean => {
  //     const searchTerms = JSON.parse(filter);
  //     const filterValue = searchTerms.filterValue.trim().toLowerCase();
  //     switch (this.filterColumn) {
  //       case 'orderNo':
  //         return data.orderNo.toLowerCase().includes(filterValue);
  //       case 'name':
  //         return data.person.empName.toLowerCase().includes(filterValue);
  //       case 'service':
  //         return data.person.service.toLowerCase().includes(filterValue);
  //       case 'apoDt':
  //         return data.apoDt.toDateString().toLowerCase().includes(filterValue);
  //       case 'posOrderDt':
  //         return data.posOrderDt.toDateString().toLowerCase().includes(filterValue);
  //       case 'joiningDt':
  //         return data.joiningDt.toDateString().toLowerCase().includes(filterValue);
  //       case 'apoDurtn':
  //         return data.apoDurtn.toLowerCase().includes(filterValue);
  //       default:
  //         const dataStr = JSON.stringify(data).toLowerCase();
  //         return dataStr.includes(filterValue);
  //     }
  //   };
  // }

  // applyFilter(event: Event, column: string) {
  //   this.filterColumn = column;
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.dataSource.filter = JSON.stringify({
  //     filterValue: filterValue,
  //     column: column
  //   });
  // }
  //End based on column filter

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
        rightbtntext: 'Yes, Delete'
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
