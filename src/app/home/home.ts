import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../common/shared-module';
import { ShowApoOrderNumber } from './common/show-apo-order-number/show-apo-order-number';
import { AuthService } from '../services/auth/auth-service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [SharedModule, ShowApoOrderNumber],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  name: any;
  showNotifications = false;   // 👈 added toggle state

  constructor(private authService: AuthService, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.name = sessionStorage.getItem('userName');
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  logout() {
    this.authService.logout();
  }
}
