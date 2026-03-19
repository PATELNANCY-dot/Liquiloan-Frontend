import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { NomineeService, UpdateNominee } from '../services/nominee';
import { BankDetailsService } from '../services/bank-details.service';
import { LiquiloanService, Liquiloan } from '../services/liquiloan.service';
import { AccountDetails } from '../models/account-details.model';
import { AuthService } from '../services/auth';

declare var bootstrap: any;

@Component({
  selector: 'app-investor-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './investor-page.html',
  styleUrls: ['./investor-page.css']
})
export class InvestorPage implements OnInit {
  nomineesList: UpdateNominee[] = [];
  banksList: any[] = [];
  liquiloan?: Liquiloan;
  showWithdrawPopup = false;
  withdrawAmount = 0;
  selectedBank = '';
  totalWithdrawable = 5000;
  account?: AccountDetails;
  private apiUrl: string = 'http://localhost:5048/api/AccountDetails';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private nomineeService: NomineeService,
    private bankService: BankDetailsService,
    private liquiloanService: LiquiloanService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit() {


    const userId = this.authService.getUserId();
    if (!userId) {
      Swal.fire('Error', 'User session expired. Please login again.', 'error');
      this.router.navigate(['/login']);
      return;
    }

    const clientId = Number(userId);



    if (!clientId) return alert('Client ID missing');

    this.fetchNominees();
    this.loadBanks();
    this.loadLiquiloanStatus(clientId);
    this.loadAccount(clientId);
  }

  // ---------------- Nominee ----------------
  fetchNominees() {
    this.nomineeService.getNominee().subscribe({
      next: (data: UpdateNominee[]) => this.nomineesList = data,
      error: err => console.error('Error fetching nominees', err)
    });
  }

  openNomineeModal() {
    this.nomineeService.getNominee().subscribe({
      next: data => {
        this.nomineesList = data;
        this.cdr.detectChanges();
        const modalEl: any = document.getElementById('nomineeModal');
        new bootstrap.Modal(modalEl).show();
      },
      error: err => {
        console.error('Error fetching nominees', err);
        alert('Failed to fetch nominees.');
      }
    });
  }

  editNominee(nominee: UpdateNominee) {
    const modalEl: any = document.getElementById('nomineeModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance?.hide();
    this.router.navigate(['/change-nominee', nominee.id]);
  }

  // ---------------- Bank ----------------
  loadBanks() {
    const userId = this.authService.getUserId();
    if (!userId) {
      Swal.fire('Error', 'User session expired. Please login again.', 'error');
      this.router.navigate(['/login']);
      return;
    }

    const clientId = Number(userId);

    this.bankService.getBankDetails(clientId).subscribe({
      next: data => this.banksList = data,
      error: err => console.error('Error loading banks', err)
    });
  }

  openBankModal() {
    const userId = this.authService.getUserId();
    if (!userId) {
      Swal.fire('Error', 'User session expired. Please login again.', 'error');
      this.router.navigate(['/login']);
      return;
    }

    const clientId = Number(userId);
    if (!clientId) return alert('Client ID missing');

    this.bankService.getBankDetails(clientId).subscribe({
      next: data => {
        this.banksList = data;
        this.cdr.detectChanges();
        const modalEl: any = document.getElementById('bankModal');
        new bootstrap.Modal(modalEl).show();
      },
      error: err => {
        console.error('Error fetching banks', err);
        alert('Failed to fetch bank details');
      }
    });
  }

  editBank(bank: any) {
    const modalEl: any = document.getElementById('bankModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance?.hide();

    this.router.navigate(bank.id === 0 ? ['/manage-bank'] : ['/manage-bank', bank.id]);
  }

  // ---------------- Liquiloan ----------------
  loadLiquiloanStatus(clientId: number) {
    this.liquiloanService.getByClient(clientId).subscribe({
      next: data => {
        console.log('Liquiloan record:', data);
        this.liquiloan = data;
        this.cdr.detectChanges();
      },
      error: err => console.error('Error fetching liquiloan', err)
    });
  }

  isActivated(): boolean {
    return this.liquiloan?.activationStatus?.toLowerCase() === 'activated';
  }

  isPending(): boolean {
    return this.liquiloan?.activationStatus?.toLowerCase() === 'pending';
  }
  // ---------------- Actions ----------------
  openModal() {
    this.router.navigate(['/investment-page']);
  }

  createAccount() {
    this.router.navigate(['/investor-details-page']);
  }

  WithDraw() {
    if (this.withdrawAmount > this.totalWithdrawable) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Amount exceeds available balance!' });
      return;
    }

    Swal.fire({ icon: 'success', title: 'Success', text: 'Withdrawal request sent successfully' });
    this.showWithdrawPopup = false;
  }

   loadAccount(clientId: number) {


    this.http.get<AccountDetails>(`${this.apiUrl}/account/${clientId}`).subscribe({
      next: (data) => {
        this.account = data;
        console.log('Account loaded:', data);

        this.cdr.detectChanges(); // <-- force Angular to refresh view

      },
      error: (err) => {
        console.error('Error fetching account:', err);
        this.errorMessage = 'Unable to load account details.';

      }
    });
  }


}
