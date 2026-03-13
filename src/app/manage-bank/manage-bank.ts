import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankDetailsService } from '../services/bank-details.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-manage-bank',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-bank.html',
  styleUrls: ['./manage-bank.css']
})
export class ManageBank implements OnInit {

  banks: any[] = [];

  constructor(private bankService: BankDetailsService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadBanks();
  }

  loadBanks() {
    const clientId = 1; // replace with logged-in client ID
    this.bankService.getBankDetails(clientId).subscribe({
      next: (data: any[]) => {
        // Assuming backend sends client name too
        this.banks = data.map(b => ({
          clientName: b.clientName || 'Account Holder',
          bankName: b.bankName,
          accountNumber: b.accountNumber
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  BACK() {
    window.history.back();
  }

}
