import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { AccountDetails } from '../models/account-details.model';
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
  account?: AccountDetails;
  isLoading: boolean = true;

  private apiUrl: string = 'http://localhost:5048/api/AccountDetails';

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
    this.loadAccount(clientId);
  }

  loadAccount(clientId: number) {
    this.isLoading = true;

    this.http.get<AccountDetails>(`${this.apiUrl}/account/${clientId}`).subscribe({
      next: (data) => {
        this.account = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching account:', err);
        this.isLoading = false;
      }
    });
  }

}
