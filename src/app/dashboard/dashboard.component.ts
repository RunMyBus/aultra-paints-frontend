import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { takeUntil } from 'rxjs';
import {AuthService} from "../services/auth.service";
import {ApiRequestService} from "../services/api-request.service";
import {ApiUrlsService} from "../services/api-urls.service";
import { Unsubscribable } from '../shared/unsubscribable';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends Unsubscribable implements OnInit {
  isSidebarCollapsed: boolean = false;
  active: boolean = false;
  currentUser: any = {};
  userDashboardData: any;

  constructor(private router: Router, private AuthService: AuthService, private apiService: ApiRequestService, private apiUrls: ApiUrlsService) {
    super();
    this.currentUser = this.AuthService.currentUserValue;
  }

  ngOnInit() {
    this.userDashboard();
  }

  userDashboard(): void {
    this.apiService
      .create(this.apiUrls.userDashboard, { id: this.currentUser.id, accountType: this.currentUser.accountType })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => { this.userDashboardData = response.data; },
        (error) => { console.error('Failed to load user dashboard', error); }
      );
  }
}
