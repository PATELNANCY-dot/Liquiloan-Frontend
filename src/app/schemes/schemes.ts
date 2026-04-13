import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { OptionType } from '../services/option-type.service';
import { HttpClient } from '@angular/common/http';
import { AccountDetails } from '../models/account-details.model';
import { ChangeDetectorRef } from '@angular/core';
import { TransactionService } from '../services/transaction.service';
import { AuthService } from '../services/auth';



@Component({
  selector: 'app-schemes',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
      ],
  templateUrl: './Schemes.html',
  styleUrls: ['./schemes.css'],
})
export class Schemes implements OnInit {

  schemes: any[] = [
    {
      schemeId: 1,
      schemeName: "Growth Income Plan",
      interestRate: 11.5,
      tenureMonths: 12,
      minInvestment: 10000,
      description: "Stable returns with moderate risk."
    },
    {
      schemeId: 2,
      schemeName: "Short Term Plan",
      interestRate: 9,
      tenureMonths: 6,
      minInvestment: 10000,
      description: "Short duration investment plan."
    }
  ];

  account?: AccountDetails;
  errorMessage: string = '';
  isLoading: boolean = true;

  private apiUrl: string = 'http://localhost:5048/api/AccountDetails';

  // -----------------------------
  // Investment & Payment State
  // -----------------------------
  investmentAmount: number = 0;
  selectedPayment: string = ''; // gateway or neft
  payoutType: string = '';       // Payout type dropdown (custom)
  paymentMode: string = '';      // Payment mode dropdown (custom)
  paymentStatus: 'success' | 'failed' | null = null;
  utrNumber: string = '';
  // -----------------------------
  // Alert Handling
  // -----------------------------
  showAlert = false;
  alertMessage = '';
  alertType: 'success' | 'error' | 'info' = 'info';

  // -----------------------------
  // Database-driven Options
  // -----------------------------
  options: OptionType[] = [];      
  selectedOptionId?: number;        


  activeDropdown: string | null = null;      
  mhpDropdownOpen = false;                    
  paymentModeDropdownOpen = false;
  selectedMhp: string = '';

  selectedFile: File | null = null;
  filePreview: string | ArrayBuffer | null = null;


  selectedScheme: any = null;

  selectScheme(s: any) {
    this.selectedScheme = s;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private transactionService: TransactionService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {




    const storedClientId = this.authService.getUserId();

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

    // Check query params for payment status
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.paymentStatus = params['status'];

        // Remove query params from URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });

  }



  // -----------------------------
  // Navigation
  // -----------------------------
  goTo() {
    this.router.navigate(['/investment-page']);

  }


  goback() {
    this.router.navigate(['/investor-page']);
  }





  loadAccount(clientId: number) {
    this.isLoading = true;

    this.http.get<AccountDetails>(`${this.apiUrl}/account/${clientId}`).subscribe({
      next: (data) => {
        this.account = data;
        console.log('Account loaded:', data);
        this.isLoading = false;
        this.cdr.markForCheck();

      },
      error: (err) => {
        console.error('Error fetching account:', err);
        this.errorMessage = 'Unable to load account details.';
        this.isLoading = false;
      }
    });
  }

}
