import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankDetailsService } from '../services/bank-details.service';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-bank',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-bank.html',
  styleUrls: ['./manage-bank.css']
})
export class ManageBank implements OnInit {

  banks: any[] = [];

  constructor(private bankService: BankDetailsService, private cdr: ChangeDetectorRef, private router: Router) { }

  ngOnInit(): void {
    this.loadBanks();
  }

  loadBanks() {

   
    const clientId = Number(localStorage.getItem("userId"));

    if (!clientId) {
      console.error("ClientId not found in localStorage");
      return;
    }

    this.bankService.getBankDetails(clientId).subscribe({
      next: (data: any[]) => {

        this.banks = data.map(b => ({
          clientName: b.clientName || 'Account Holder',
          bankName: b.bankName,
          accountNumber: b.accountNumber
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error loading bank details:", err)
    });

  }

  addBank() {
    this.router.navigate(['/add-bank']);
  }

  BACK() {
    window.history.back();
  }

}
