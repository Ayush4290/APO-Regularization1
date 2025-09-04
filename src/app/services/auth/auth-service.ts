import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment';
import { skip_auth } from './auth.interceptor';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(private http: HttpClient, private router: Router) { }
    public getToken(): string | null {
        return sessionStorage.getItem('token');
    }

    public isLoggedIn(): boolean {
        // const token = this.getToken();
        // return !!token;
        return true;
    }

    async login(params: any) {
        try {
            await this.http.post<any>(`${environment.loginUrl}/api/login`, params,
                { context: new HttpContext().set(skip_auth, true) }).subscribe(data => {
                    if (data) {
                        sessionStorage.setItem('token', data.token);
                        sessionStorage.setItem('personId', data.personId);
                        sessionStorage.setItem('userId', data.userId);
                        sessionStorage.setItem('roleId', data.roleId);
                        sessionStorage.setItem('deptId', data.deptId);
                        sessionStorage.setItem('userName', data.userName);
                        this.router.navigate(['/home/apo-orders']);
                    }
                });
        } catch (error) {
            throw new Error(`Failed to login: ${error}`);
        }
    }

    public logout(): void {
        sessionStorage.clear();
        this.router.navigate(['/login']);
    }
}