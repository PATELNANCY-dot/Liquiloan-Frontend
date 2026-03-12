import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { OptionType } from '../services/option-type.service';
import { HttpClient } from '@angular/common/http';
import { AccountDetails } from '../models/account-details.model';
import { ChangeDetectorRef } from '@angular/core';
import { TransactionService } from '../services/transaction.service';

@Component({
  selector: 'app-investment-page',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './investment-page.html',
  styleUrls: ['./investment-page.css'],
})
export class InvestmentPage implements OnInit {



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
  options: OptionType[] = [];       // Dropdown options from DB
  selectedOptionId?: number;        // Selected option ID

  // -----------------------------
  // Custom Dropdown States
  // -----------------------------
  activeDropdown: string | null = null;       // Generic dropdown toggle
  mhpDropdownOpen = false;                    // Minimum Holding Period dropdown
  paymentModeDropdownOpen = false;
  selectedMhp: string = '';
  // -----------------------------
  // File Upload Handling
  // -----------------------------
  selectedFile: File | null = null;
  filePreview: string | ArrayBuffer | null = null;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private transactionService: TransactionService
  ) { }

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

    // Fetch options from database
    this.loadOptions();
  }

  // -----------------------------
  // Database Fetch for Options
  // -----------------------------
  loadOptions() {
    this.http.get<OptionType[]>('http://localhost:5048/api/OptionType/ActiveOptions')
      .subscribe({
        next: (data) => this.options = data,
        error: (err) => console.error('Error fetching options', err)
      });
  }

  getSelectedText(): string {
    const selected = this.options.find(o => o.optionTypeId === this.selectedOptionId);
    return selected ? selected.typeText : '';
  }

  selectOption(option: OptionType, event: Event) {
    event.stopPropagation();
    this.selectedOptionId = option.optionTypeId;
    this.activeDropdown = null;
  }

  // -----------------------------
  // Alert Methods
  // -----------------------------
  showCustomAlert(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 4000);
  }

  // -----------------------------
  // Navigation
  // -----------------------------
  goTo() {
    this.router.navigate(['/investor-page']);
  }
  goPay() {

    if (!this.selectedPayment) {
      this.showCustomAlert('Please select payment type', 'error');
      return;
    }

    if (!this.investmentAmount || this.investmentAmount <= 0) {
      this.showCustomAlert('Please enter valid amount', 'error');
      return;
    }

    if (!this.payoutType) {
      this.showCustomAlert('Please select payout type', 'error');
      return;
    }

    if (!this.selectedOptionId) {
      this.showCustomAlert('Please select option', 'error');
      return;
    }

    const storedClientId = localStorage.getItem('userId');
    const clientId = storedClientId ? Number(storedClientId) : 0;

    // ✅ GATEWAY
    if (this.selectedPayment === 'gateway') {

      this.router.navigate(['/payment-page'], {
        queryParams: {
          amount: this.investmentAmount,
          paymentType: 'Gateway',
          payoutType: this.payoutType,
          MHP: this.selectedMhp,
          option1: this.selectedOptionId,
          optionId: this.selectedOptionId
        }
      });

      return;
    }

    //NEFT / RTGS / IMPS
    // In your InvestmentPage.ts, inside goPay()
    if (this.selectedPayment === 'neft') {

      if (!this.paymentMode) {
        this.showCustomAlert('Please select payment mode', 'error');
        return;
      }

      if (!this.utrNumber) {
        this.showCustomAlert('Please enter UTR number', 'error');
        return;
      }

      if (!this.selectedFile) {
        this.showCustomAlert('Please upload payment receipt', 'error');
        return;
      }

      if (!this.selectedMhp) {
        this.showCustomAlert('Please select Minimum Holding Period', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('ClientId', clientId.toString());
      formData.append('TransactionId', this.utrNumber); // Use UTR as transactionId
      formData.append('Amount', this.investmentAmount.toString());
      formData.append('PaymentMode', this.paymentMode);
      formData.append('PaymentType', 'Bank Transfer');
      formData.append('PayoutType', this.payoutType);
      formData.append('MHP', this.selectedMhp);
      formData.append('Option1', this.selectedOptionId?.toString() || '');
      formData.append('Status', 'Pending');

      // ✅ Append the file properly (matches backend)
      if (this.selectedFile) {
        formData.append('PaymentDocPath', this.selectedFile, this.selectedFile.name);
      }

      this.transactionService.createTransaction(formData).subscribe({
        next: () => {
          this.showCustomAlert('RTGS Request Submitted. Awaiting Verification.', 'success');
          this.cdr.detectChanges();
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        },
        error: () => {
          this.showCustomAlert('Something went wrong', 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  // -----------------------------
  // File Upload Methods
  // -----------------------------
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => this.filePreview = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.filePreview = null;

    const input = document.getElementById('receiptUpload') as HTMLInputElement;
    if (input) input.value = '';
  }

  openFile() {
    if (this.filePreview) {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${this.filePreview}" frameborder="0" style="width:100%;height:100%;"></iframe>`);
      }
    }
  }

  // -----------------------------
  // Custom Dropdown Handling
  // -----------------------------
  toggleDropdown(name: string, event: Event) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  toggleMhpDropdown(event: Event) {
    event.stopPropagation();
    this.mhpDropdownOpen = !this.mhpDropdownOpen;
  }

  togglePaymentModeDropdown(event: Event) {
    event.stopPropagation();
    this.paymentModeDropdownOpen = !this.paymentModeDropdownOpen;
  }

  selectPayoutType(type: string, event: Event) {
    event.stopPropagation();
    this.payoutType = type;
    this.activeDropdown = null;
  }

  selectPaymentMode(mode: string, event: Event) {
    event.stopPropagation();
    this.paymentMode = mode;
    this.paymentModeDropdownOpen = false;
  }

  selectMhp(period: string, event: Event) {
    event.stopPropagation();
    this.selectedMhp = period;
    this.mhpDropdownOpen = false;
  }

  // -----------------------------
  // Close dropdown when click outside
  // -----------------------------
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!target.closest('.custom-dropdown')) {
      this.activeDropdown = null;
      this.mhpDropdownOpen = false;
      this.paymentModeDropdownOpen = false;
    }
  }


  ///load account details
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

}
