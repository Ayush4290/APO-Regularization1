import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../services/auth/auth-guard';
import { DashboardResolver } from '../services/resolves/dashboard-resolver';

export const routes: Routes = [
  {
    path: '', loadComponent: () => import('./home').then(m => m.Home), canActivate: [AuthGuard],
    children: [
      { path: 'apo-orders', loadComponent: () => import('./apo-orders/apo-orders').then(m => m.ApoOrders), canActivate: [AuthGuard], resolve: { dashboardData: DashboardResolver } },
      { path: 'apo-orders:id', loadComponent: () => import('./apo-orders/apo-orders').then(m => m.ApoOrders), canActivate: [AuthGuard], resolve: { dashboardData: DashboardResolver } },
      { path: 'request-message', loadComponent: () => import('./apo-request-msg/apo-request-msg').then(m => m.ApoRequestMsg), canActivate: [AuthGuard] },
      { path: 'request-message:id', loadComponent: () => import('./apo-request-msg/apo-request-msg').then(m => m.ApoRequestMsg), canActivate: [AuthGuard] },
      { path: 'apo-request', loadComponent: () => import('./apo-request/apo-request').then(m => m.ApoRequest), canActivate: [AuthGuard] },
      { path: 'apo-request:id', loadComponent: () => import('./apo-request/apo-request').then(m => m.ApoRequest), canActivate: [AuthGuard] },
      { path: 'apo-pending', loadComponent: () => import('./apo-pending/apo-pending').then(m => m.ApoPending), canActivate: [AuthGuard] },
      { path: 'apo-pending:id', loadComponent: () => import('./apo-pending/apo-pending').then(m => m.ApoPending), canActivate: [AuthGuard] },
      { path: 'apo-approver', loadComponent: () => import('./apo-approver/apo-approver').then(m => m.ApoApprover), canActivate: [AuthGuard] },
      { path: 'apo-approver:id', loadComponent: () => import('./apo-approver/apo-approver').then(m => m.ApoApprover), canActivate: [AuthGuard] },
      { path: 'apo-status', loadComponent: () => import('./apo-status/apo-status').then(m => m.ApoStatus), canActivate: [AuthGuard] },
      { path: 'apo-status:id', loadComponent: () => import('./apo-status/apo-status').then(m => m.ApoStatus), canActivate: [AuthGuard] },
    ]
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class HomeModule { }