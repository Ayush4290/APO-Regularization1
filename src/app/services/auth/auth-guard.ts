import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Check if the code is running in the browser
    if (isPlatformBrowser(this.platformId)) {
      const authToken = sessionStorage.getItem('token');
      if (authToken) {
        return true; 
      } else {
        return this.router.createUrlTree(['/login']); 
      }
    }

    if (isPlatformServer(this.platformId)) {
      return true;
    }

    return false;
  }
}