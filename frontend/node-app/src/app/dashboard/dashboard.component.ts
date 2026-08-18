import { Component, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatTableModule, MatButtonModule],
  providers: [DashboardService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  endSubscription: Subject<void>;
  serverData: any;
  currentRole: number;
  displayedColumns: string[];
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _authService: AuthService,
    private _dashboardService: DashboardService,
  ) {
    this.endSubscription = new Subject<void>();
    this.serverData = {};
    this.currentRole = Number(localStorage.getItem('role'));
    this.displayedColumns = [
      'fullName',
      'email',
      'age',
      'current_role',
      'upgrade_role',
      'delete',
    ];
  }

  ngOnInit(): void {
    this._activatedRoute.data
      .pipe(takeUntil(this.endSubscription))
      .subscribe((res) => {
        this.serverData = this.currentRole
          ? res['data'].data
          : res['data'].data[0];
      });
  }

  ngOnDestroy(): void {
    this.endSubscription.next();
    this.endSubscription.complete();
  }

  handleLogout(): void {
    this._authService.logout();
    alert('You have been logged out successfully.');
    this._router.navigate(['login']);
  }

  handleUpdateRole(id: string, role: number): void {
    this._dashboardService
      .updateRole(id, role)
      .pipe(takeUntil(this.endSubscription))
      .subscribe(() => {
        const found = this.serverData.find((user: any) => user._id === id);
        if (found) {
          found.role = role === 1 ? 'admin' : 'user';
        }
        alert('User role updated successfully.');
      });
  }

  handleDelete(id: string): void {
    this._dashboardService
      .deleteUser(id)
      .pipe(takeUntil(this.endSubscription))
      .subscribe(() => {
        this.serverData = this.serverData.filter(
          (user: any) => user._id !== id,
        );
        alert('User deleted successfully.');
      });
  }
}
