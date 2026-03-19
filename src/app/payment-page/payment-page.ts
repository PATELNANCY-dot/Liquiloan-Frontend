import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TransactionService } from '../services/transaction.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth';


@Component({
  selector: 'app-payment-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './payment-page.html',
  styleUrls: ['./payment-page.css']
})
export class PaymentPage {

  paymentType: string = '';
  paymentModeFromInvestment: string = '';
  payoutType: string = '';

  amount: number = 10000;
  transactionId: string = ''; // will be generated dynamically
  selectedPayment: string = '';
  showConfirm: boolean = false;

  activeDropdown: string | null = null;
  mhpDropdownOpen: boolean = false;
  paymentModeDropdownOpen: boolean = false;
  languageDropdownOpen: boolean = false;

  languages: string[] = ['English', 'Hindi', 'Gujarati'];
  selectedLanguage: string = 'English';
  selectedOptionId: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private transactionService: TransactionService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['amount']) this.amount = Number(params['amount']);
      if (params['paymentType']) this.paymentType = params['paymentType'];
      if (params['paymentMode']) this.paymentModeFromInvestment = params['paymentMode'];
      if (params['payoutType']) this.payoutType = params['payoutType'];
      if (params['option1']) this.selectedOptionId = params['option1'];

      console.log('Amount:', this.amount);
      console.log('Payment Type:', this.paymentType);
      console.log('Payment Mode:', this.paymentModeFromInvestment);
      console.log('Payout Type:', this.payoutType);
      console.log('Option ID:', this.selectedOptionId);
    });
  }

  // -----------------------------
  // Generate transaction ID dynamically
  // -----------------------------
  generateTransactionId(): string {
    const now = new Date();
    const datePart = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14); // YYYYMMDDHHMMSS
    const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    return `TXN-${datePart}-${randomPart}`;
  }

  // -----------------------------
  // Payment Methods
  continuePayment() {
    this.showConfirm = false
    this.transactionId = this.generateTransactionId();

    const storedClientId = this.authService.getUserId();

    const clientId = storedClientId ? Number(storedClientId) : 0;
    const queryParams = this.route.snapshot.queryParams;

    // Generate PDF BEFORE sending to backend
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text('Transaction Receipt', 14, 25);
    doc.setFontSize(12);
    doc.setTextColor(50);
    const transactionTime = new Date().toLocaleString();
    doc.text(`Date: ${transactionTime}`, 14, 35);

    const formattedAmount = `RS.${this.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    const tableColumn = ['Field', 'Value'];
    const tableRows = [
      ['Transaction ID', this.transactionId],
      ['Amount', formattedAmount],
      ['Status', 'SUCCESS'],
      ['Date & Time', transactionTime],
    ];
    autoTable(doc, { startY: 45, head: [tableColumn], body: tableRows, theme: 'grid' });

    const pdfBlob = doc.output('blob');
    const pdfFile = new File([pdfBlob], `transaction-${this.transactionId}.pdf`, { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('clientId', clientId.toString());
    formData.append('transactionId', this.transactionId);
    formData.append('amount', this.amount.toString());
    formData.append('paymentMode', this.paymentModeFromInvestment || this.selectedPayment || 'Gateway');
    formData.append('paymentType', this.paymentType || 'Gateway');
    formData.append('payoutType', this.payoutType || queryParams['payoutType'] || '');
    formData.append('MHP', queryParams['MHP'] || '');
    formData.append('option1', queryParams['option1'] || '');
    formData.append('status', 'success');
    formData.append('PaymentDocPath', pdfFile);

    this.transactionService.createTransaction(formData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Transaction Successful!',
          text: `Transaction ID: ${this.transactionId}`,
          confirmButtonColor: '#00a651'
        }).then(() => {
          this.router.navigate(['/transaction-status'], {
            queryParams: {
              status: 'success',
              amount: this.amount,
              txn: this.transactionId
            }
          });
        });
      },
      error: (err) => {
        console.error('Transaction Save Failed', err);
        Swal.fire({
          icon: 'error',
          title: 'Transaction Failed!',
          text: `Transaction ID: ${this.transactionId}`,
          confirmButtonColor: '#d80000'
        }).then(() => {
          this.router.navigate(['/transaction-status'], {
            queryParams: {
              status: 'failed',
              amount: this.amount,
              txn: this.transactionId
            }
          });
        });
      }
    });
  }

  // Cancel Payment
  cancelPayment() {
    this.showConfirm = false
    this.transactionId = this.generateTransactionId();

    const storedClientId = this.authService.getUserId();

    const clientId = storedClientId ? Number(storedClientId) : 0;
    const queryParams = this.route.snapshot.queryParams;

    // Generate PDF for failed transaction
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(255, 0, 0);
    doc.text('Transaction Receipt', 14, 25);
    doc.setFontSize(12);
    doc.setTextColor(50);
    const transactionTime = new Date().toLocaleString();
    doc.text(`Date: ${transactionTime}`, 14, 35);

    const formattedAmount = `RS.${this.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    const tableColumn = ['Field', 'Value'];
    const tableRows = [
      ['Transaction ID', this.transactionId],
      ['Amount', formattedAmount],
      ['Status', 'FAILED'],
      ['Date & Time', transactionTime],
    ];
    autoTable(doc, { startY: 45, head: [tableColumn], body: tableRows, theme: 'grid' });

    const pdfBlob = doc.output('blob');
    const pdfFile = new File([pdfBlob], `transaction-${this.transactionId}.pdf`, { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('clientId', clientId.toString());
    formData.append('transactionId', this.transactionId);
    formData.append('amount', this.amount.toString());
    formData.append('paymentMode', this.paymentModeFromInvestment || this.selectedPayment || 'Gateway');
    formData.append('paymentType', this.paymentType || 'Gateway');
    formData.append('payoutType', this.payoutType || queryParams['payoutType'] || '');
    formData.append('MHP', queryParams['MHP'] || '');
    formData.append('option1', queryParams['option1'] || '');
    formData.append('status', 'failed');
    formData.append('PaymentDocPath', pdfFile);

    this.transactionService.createTransaction(formData).subscribe(() => {
      Swal.fire({
        icon: 'error',
        title: 'Transaction Cancelled',
        text: `Transaction ID: ${this.transactionId}`,
        confirmButtonColor: '#d80000'
      }).then(() => {
        this.router.navigate(['/transaction-status'], {
          queryParams: {
            status: 'failed',
            amount: this.amount,
            txn: this.transactionId
          }
        });
      });
    });
  }
  back() {
    this.router.navigate(['/investment-page']);
  }

  // -----------------------------
  // Custom Dropdown Methods
  // -----------------------------
  toggleLanguageDropdown(event: Event) {
    event.stopPropagation();
    this.languageDropdownOpen = !this.languageDropdownOpen;
  }

  selectLanguage(lang: string, event: Event) {
    event.stopPropagation();
    this.selectedLanguage = lang;
    this.languageDropdownOpen = false;
  }

  toggleMhpDropdown(event: Event) {
    event.stopPropagation();
    this.mhpDropdownOpen = !this.mhpDropdownOpen;
  }

  togglePaymentModeDropdown(event: Event) {
    event.stopPropagation();
    this.paymentModeDropdownOpen = !this.paymentModeDropdownOpen;
  }

  selectMhp(period: string, event: Event) {
    event.stopPropagation();
    this.mhpDropdownOpen = false;
    this.selectedPayment = period;
  }

  selectPaymentMode(mode: string, event: Event) {
    event.stopPropagation();
    this.paymentModeDropdownOpen = false;
    this.selectedPayment = mode;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown') && !target.closest('.language-dropdown')) {
      this.activeDropdown = null;
      this.mhpDropdownOpen = false;
      this.paymentModeDropdownOpen = false;
      this.languageDropdownOpen = false;
    }
  }

}
