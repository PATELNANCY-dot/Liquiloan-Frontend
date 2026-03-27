import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';

import { AuthService } from '../services/auth';

@Component({
  selector: 'app-manage-account',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manage-account.html',
  styleUrls: ['./manage-account.css'],
})
export class ManageAccount implements OnInit {

  activeTab: string = 'email';
  account: any = {};
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    const clientId = Number(userId);
  }
}
