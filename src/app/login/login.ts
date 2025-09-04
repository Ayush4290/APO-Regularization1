import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../common/shared-module';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth/auth-service';

@Component({
  selector: 'app-login',
  imports: [SharedModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginFG = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.maxLength(10)]),
    password: new FormControl('', [Validators.required, Validators.maxLength(10)])
  });

  get fc() {
    return this.loginFG.controls;
  }

  constructor(private authService: AuthService, @Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.clear();
    }
  }

  async onSubmit() {
    if (this.loginFG.valid) {
      await this.authService.login({ 'username': this.loginFG.value.username, 'password': this.loginFG.value.password });
    } else {
      this.loginFG.markAllAsTouched();
    }
  }
}
