import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
    { path: 'home', loadChildren: () => import('./home/home-module').then(m => m.HomeModule)},
];
