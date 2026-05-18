import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { BankDetailsService } from '../services/bank-details.service';
import { AuthService } from '../services/auth';
import { Location } from '@angular/common';

@Component({
  selector: 'app-add-bank',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-bank.html',
  styleUrls: ['./add-bank.css']
})
export class AddBank {

  bank: any = {
    clientId: 0,
    bankName: '',
    accountNumber: '',
    branchName: '',
    ifscCode: '',
    micrCode: '',
    branchAddress: '',
  };

  constructor(
    private bankService: BankDetailsService,
    private router: Router,
    private authService: AuthService,
    private location: Location
  ) { }



  ngOnInit() {
    const userId = this.authService.getUserId();
    if (!userId) {
      Swal.fire('Error', 'User not logged in', 'error');
      this.router.navigate(['/login']);
      return;
    }
    this.bank.clientId = Number(userId);
  }

  saveBank() {

    console.log("Sending Bank Data:", this.bank);

    this.bankService.addBank(this.bank).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Bank Added Successfully'
        }).then(() => {
          this.router.navigate(['/manage-account']);
        });
      },
      error: err => {
        console.error("API ERROR:", err);
        console.log("Server Response:", err.error);
      }
    });
  }

  back() {
    this.location.back();
  }
}
