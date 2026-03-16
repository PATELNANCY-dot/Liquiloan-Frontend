import { Component } from '@angular/core';
import { Router  } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AccountDetails } from '../models/account-details.model';
import { ChangeDetectorRef } from '@angular/core';



@Component({
  selector: 'app-investor-details-page',
  standalone:true ,
  imports: [CommonModule, FormsModule],
  templateUrl: './investor-details-page.html',
  styleUrl: './investor-details-page.css',
})
export class InvestorDetailsPage {


  account?: AccountDetails;
  errorMessage: string = '';
  isLoading: boolean = true;

  private apiUrl: string = 'http://localhost:5048/api/AccountDetails';

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    const storedClientId = localStorage.getItem('userId');
    console.log('Stored Client ID:', storedClientId);

    if (!storedClientId) {
      this.errorMessage = 'No user found. Please login.';
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    const clientId = Number(storedClientId);
    if (isNaN(clientId)) {
      this.errorMessage = 'Invalid user ID. Please login again.';
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    this.loadAccount(clientId);
  }

  loadAccount(clientId: number) {
    this.isLoading = true;

    this.http.get<AccountDetails>(`${this.apiUrl}/account/${clientId}`).subscribe({
      next: (data) => {
        this.account = data;
        console.log('Account loaded:', data);
        this.isLoading = false;
        this.cdr.detectChanges(); // <-- force Angular to refresh view

      },
      error: (err) => {
        console.error('Error fetching account:', err);
        this.errorMessage = 'Unable to load account details.';
        this.isLoading = false;
      }
    });
  }

  back() {
    this.router.navigate(['/investor-page'])
  }

  activateLoan() {
    if (!this.account) return;

    const clientId = this.account.clientId; // make sure your AccountDetails has clientId

    this.http.put(`http://localhost:5048/api/liquiloan/activate/${clientId}`, {}).subscribe({
      next: (res: any) => {
        console.log('Loan activated:', res);
        alert('Your loan status has been updated to Activated!');
        
        // Optionally update the local account object if you have ActivationStatus
        if (this.account) {
          (this.account as any).ActivationStatus = 'Activated';
        }
        this.router.navigate(['./investor-page'])
      },
      error: (err) => {
        console.error('Error activating loan:', err);
        alert('Failed to update loan status. Please try again.');
      }
    });
  }

}
