import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApoOrdersList } from "../common/apo-orders-list/apo-orders-list";
import { SharedModule } from '../../common/shared-module';
import { EnumRequestType, EnumRole, EnumStatus } from '../../common/enums';

@Component({
  selector: 'app-apo-orders',
  imports: [ApoOrdersList, SharedModule],
  templateUrl: './apo-orders.html',
  styleUrl: './apo-orders.css'
})
export class ApoOrders implements OnInit {
  dashboardData: any[] = [];
  allApoOrders: any[] = [];
  allCount: number = 0;
  draftCount: number = 0;
  pendingCount: number = 0;
  returnedCount: number = 0;
  submittedCount: number = 0;
  rejectedCount: number = 0;
  approvedCount: number = 0;
  consultCount: number = 0;
  responededCount: number = 0;
  enumStatus: any = EnumStatus
  enumRole: any = EnumRole;
  roleId: any;
  activeTab: any = this.enumStatus.ALL;

  constructor(private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.roleId = sessionStorage.getItem('roleId');
    this.dashboardData = this.route.snapshot.data['dashboardData'];
    if (this.dashboardData && this.dashboardData?.length > 0) {
      this.setAllCounts()
    } else if (EnumRole.INITIATOR == this.roleId) {
      this.router.navigate(['/home/request-message'], {
        queryParams: { typeId: EnumRequestType.New },
      });
    }
  }

  onOrderNoReceived(orderNo: any) {
    this.setAllCounts(orderNo);
    this.onTabChange(EnumStatus.ALL);
  }

  setAllCounts(orderNo: any = null) {
    setTimeout(() => {
      if (orderNo)
        this.allApoOrders = this.dashboardData = this.dashboardData.filter((x: any) => x.orderNo != orderNo);
      else
        this.allApoOrders = this.dashboardData;

      this.allCount = this.allApoOrders.length;
      this.draftCount = this.allApoOrders.filter((x: any) => x.status.statusId == EnumStatus.DRAFT).length;
      this.pendingCount = this.allApoOrders.filter((x: any) => x.status.statusId == EnumStatus.PENDING).length;
      this.returnedCount = this.allApoOrders.filter((x: any) => x.status.statusId == EnumStatus.RETURNED).length;
      this.submittedCount = this.allApoOrders.filter((x: any) => x.status.statusId == EnumStatus.SUBMITTED).length;
      this.rejectedCount = this.allApoOrders.filter((x: any) => x.status.statusId == EnumStatus.REJECTED).length;
      this.approvedCount = this.allApoOrders.filter((x: any) => x.status.statusId == EnumStatus.APPROVED).length;
      this.consultCount = this.allApoOrders.filter((x: any) => x.status.statusId == EnumStatus.CONSULT).length;
      this.responededCount = this.allApoOrders.filter((x: any) => x.status.statusId == EnumStatus.RESPONEDED).length;
    }, 100);
  }

  onTabChange(index: any): void {
    this.activeTab = index;

    if (index === EnumStatus.ALL) {
      this.allApoOrders = this.dashboardData;
    } else if (index === EnumStatus.DRAFT) {
      this.allApoOrders = this.dashboardData.filter((x: any) => x.status.statusId == EnumStatus.DRAFT);
    } else if (index === EnumStatus.SUBMITTED) {
      this.allApoOrders = this.dashboardData.filter((x: any) => x.status.statusId == EnumStatus.SUBMITTED);
    } else if (index === EnumStatus.PENDING) {
      this.allApoOrders = this.dashboardData.filter((x: any) => x.status.statusId == EnumStatus.PENDING);
    } else if (index === EnumStatus.RETURNED) {
      this.allApoOrders = this.dashboardData.filter((x: any) => x.status.statusId == EnumStatus.RETURNED);
    } else if (index === EnumStatus.REJECTED) {
      this.allApoOrders = this.dashboardData.filter((x: any) => x.status.statusId == EnumStatus.REJECTED);
    } else if (index === EnumStatus.APPROVED) {
      this.allApoOrders = this.dashboardData.filter((x: any) => x.status.statusId == EnumStatus.APPROVED);
    } else if (index === EnumStatus.CONSULT) {
      this.allApoOrders = this.dashboardData.filter((x: any) => x.status.statusId == EnumStatus.CONSULT);
    } else if (index === EnumStatus.RESPONEDED) {
      this.allApoOrders = this.dashboardData.filter((x: any) => x.status.statusId == EnumStatus.RESPONEDED);
    }
  }
}