import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Resolve } from '@angular/router';
import { ApoService } from '../apo-service';
import { isPlatformBrowser } from '@angular/common';
import { EnumRole } from '../../common/enums';

@Injectable({
  providedIn: 'root'
})
export class DashboardResolver implements Resolve<any> {
  constructor(private apoService: ApoService, @Inject(PLATFORM_ID) private platformId: Object) {
  }
  async resolve(): Promise<any> {
    if (isPlatformBrowser(this.platformId)) {
      let roleId = sessionStorage.getItem('roleId');
      if (EnumRole.CONSULT.toString() == roleId)
        return await this.apoService.getAllConsultAsync({ 'createdBy': sessionStorage.getItem('userId'), 'deptId': sessionStorage.getItem('deptId') });
      else
        return await this.apoService.getDashboardAsync({ 'createdBy': sessionStorage.getItem('userId'), 'roleId': roleId });
    }
  }
}
