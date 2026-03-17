import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AccountDetails } from '../models/account-details.model';
import { ChangeDetectorRef } from '@angular/core';
import { NomineeService, UpdateNominee } from '../services/nominee';




@Component({
  selector: 'app-manage-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule ],
  templateUrl: './manage-account.html',
  styleUrls: ['./manage-account.css'],
})
export class ManageAccount implements OnInit {

  activeTab: string = 'basic';
  account?: AccountDetails;
  errorMessage: string = '';
  isLoading: boolean = true;

  private apiUrl: string = 'http://localhost:5048/api/AccountDetails';
  nomineesList: UpdateNominee[] = [];

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef, private nomineeService: NomineeService) { }

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
    this.fetchNominees();
  }


  fetchNominees() {
    const clientId = Number(localStorage.getItem('userId'));
    if (!clientId) return;

    this.nomineeService.getNominee().subscribe({
      next: (data) => {
        this.nomineesList = data;
      },
      error: (err) => {
        console.error('Error fetching nominees', err);
      }
    });
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

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  Next() {

  }


}
