import { Component, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth.service';

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
  ) {
    this.endSubscription = new Subject<void>();
    this.serverData = {};
    this.currentRole = Number(localStorage.getItem('role'));
    this.displayedColumns = ['fullName', 'email', 'age'];
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
    this._router.navigate(['login']);
  }
}
