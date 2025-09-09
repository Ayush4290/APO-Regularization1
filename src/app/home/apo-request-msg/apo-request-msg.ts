import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../common/shared-module';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { EnumRequestType } from '../../common/enums';
import { ApoService } from '../../services/apo-service';
import { ApoMessageDialog } from '../dialog/apo-message-dialog/apo-message-dialog';

@Component({
  selector: 'app-apo-request-msg',
  imports: [SharedModule],
  templateUrl: './apo-request-msg.html',
  styleUrl: './apo-request-msg.css'
})
export class ApoRequestMsg implements OnInit {
  typeId: number = 0;
  reqMsg: any = EnumRequestType;
  constructor(private apoService: ApoService, public dialog: MatDialog, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.typeId = this.route.snapshot.queryParams['typeId'] || null;
  }

  async genApoAsync(message: string) {
    await this.apoService.genApoAsync().then(res => {
      if (res) {
        if (message == 'yes') { // For Self User
          this.router.navigate(['/home/apo-request'], {
            queryParams: { apoNo: res.orderNo, perId: sessionStorage.getItem('personId') },
          });
        } else if (message == 'no') { // For Other User
          this.router.navigate(['/home/apo-request'], {
            queryParams: { apoNo: res.orderNo },
          });
        }
      }
    });
  }

  newRequestDialog() {
    const dialogRef = this.dialog.open(ApoMessageDialog, {
      disableClose: true,
      width: '500px',
      data: {
        isClose: true,
        title: 'New Request',
        message: 'Choose whether you are creating the request for \n yourself or on behalf of soomeone else',
        leftbtntext: 'Other',
        rightbtntext: 'Myself',
         icon: 'assets/images/new-request.png',

      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.genApoAsync(result);
    });
  }

  submittedSuccessfuly(): void {
    this.router.navigate(['/home/apo-orders']);
  }
}