import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../common/shared-module';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ApoService } from '../../../services/apo-service';
import { MatDialog } from '@angular/material/dialog';
import { ApoMessageDialog } from '../../dialog/apo-message-dialog/apo-message-dialog';
import { EnumRole } from '../../../common/enums';

@Component({
  selector: 'app-show-apo-order-number',
  imports: [SharedModule],
  templateUrl: './show-apo-order-number.html',
  styleUrls: ['./show-apo-order-number.css'], // ✅ fixed (styleUrls)
})
export class ShowApoOrderNumber implements OnInit {
  persdetail: any;
  isNewRequest: boolean = false;
  apoOrderNo: any = '';
  roleId: any;

  constructor(
    private apoService: ApoService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.extractQueryParams();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.extractQueryParams();
      });
  }

  extractQueryParams(): void {
    this.roleId = sessionStorage.getItem('roleId');
    this.isNewRequest = false;

    if (this.router.url === '/home/apo-orders') {
      this.apoOrderNo = '';
      if (EnumRole.INITIATOR == this.roleId) {
        this.isNewRequest = true;
      }
    } else {
      this.route.queryParamMap.subscribe((params) => {
        this.apoOrderNo = params.get('apoNo');
      });
    }
  }

  newRequestDialog() {
    const dialogRef = this.dialog.open(ApoMessageDialog, {
      disableClose: true,
      width: '500px',
      data: {
        isClose: true,
        title: 'New Request',
        message:
          'Choose whether you are creating the request for \n yourself or on behalf of someone else',
        leftbtntext: 'Other',
        icon: 'assets/images/new-request.png',
        rightbtntext: 'Myself',
        // optional icon
      },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.genApoAsync(result);
    });
  }

  async genApoAsync(message: any) {
    await this.apoService.genApoAsync().then((res) => {
      if (res) {
        if (message == 'yes') {
          // For Self User
          this.router.navigate(['/home/apo-request'], {
            queryParams: {
              apoNo: res.orderNo,
              perId: sessionStorage.getItem('personId'),
            },
          });
        } else if (message == 'no') {
          // For Other User
          this.router.navigate(['/home/apo-request'], {
            queryParams: { apoNo: res.orderNo },
          });
        }
      }
    });
  }

  goToOrders() {
    this.router.navigate(['/home/apo-orders']);
  }
}
