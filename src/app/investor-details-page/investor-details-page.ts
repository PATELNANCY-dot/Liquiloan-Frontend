import { Component } from '@angular/core';
import { Router  } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AccountDetails } from '../models/account-details.model';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';


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

  accountActivation() {
    if (!this.account) return;

    const clientId = this.account.clientId;

    this.http.put(`http://localhost:5048/api/liquiloan/activate/${clientId}`, {})
      .subscribe({
        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Activated',
            text: ' activated successfully!',
            timer: 2000,
            showConfirmButton: false
          });

          this.router.navigate(['/investor-page']);
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: 'Failed to activate loan'
          });
        }
      });
  }


  //otp varification

  emailOtp: string = '';
  otpSent: boolean = false;
  openOtpModal() {
    if (!this.account) return;

    const email = this.account.email;

    this.http.post<any>('http://localhost:5048/api/Otp/send-otp', { email })
      .subscribe({
        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'OTP Sent',
            text: 'OTP sent to your email',
            confirmButtonText: 'OK'
          }).then(() => {
            // 👇 modal opens ONLY after clicking OK
            const modal = new (window as any).bootstrap.Modal(
              document.getElementById('otpModal')
            );
            modal.show();
          });

        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: 'Failed to send OTP'
          });
        }
      });
  }
  verifyOtp() {
    if (!this.account) return;

    const email = this.account.email;

    if (!this.emailOtp || this.emailOtp.length !== 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid OTP',
        text: 'Enter valid 6-digit OTP'
      });
      return;
    }

    this.http.post<any>('http://localhost:5048/api/Otp/verify-otp', {
      email: email,
      otp: this.emailOtp
    }).subscribe({
      next: () => {

        Swal.fire({
          icon: 'success',
          title: 'Verified',
          text: 'OTP verified successfully'
        });

        const modalEl = document.getElementById('otpModal');
        const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        this.accountActivation();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Invalid or expired OTP'
        });
      }
    });
  }


}
