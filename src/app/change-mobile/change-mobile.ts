import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RegistrationDataService } from '../services/ client-registration.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { getAuth, Auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { firebaseConfig } from '../firebase.config';
import { AuthService } from '../services/auth';

export interface AccountDetails {
  clientId: number;
  name: string;
  email: string;
  mobile: string;
  pan: string;
}

@Component({
  selector: 'app-change-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-mobile.html',
  styleUrl: './change-mobile.css',
})
export class ChangeMobile implements OnInit {

  // Account info
  account: AccountDetails | null = null;

  // Form fields
  newMobile: string = '';
  mobileOtp: string = '';
  mobileOtpVerified: boolean = false;
  errorMessage: string = '';

  private apiUrl = 'http://localhost:5048/api/AccountDetails';

  // Firebase
  auth!: Auth;
  recaptchaVerifier!: RecaptchaVerifier;
  confirmationResult!: ConfirmationResult;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private registrationData: RegistrationDataService,
    private authService: AuthService
  ) {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
  }

  ngOnInit(): void {
    const cached = this.registrationData.getData();
    if (cached && cached.clientId) {
      this.account = cached;
      this.cdr.detectChanges();
    } else {

      const userId = this.authService.getUserId();
      if (!userId) {
        Swal.fire('Error', 'User session expired. Please login again.', 'error');
        this.router.navigate(['/login']);
        return;
      }

      const clientId = Number(userId);



      if (!clientId) {
        this.errorMessage = 'Client ID not found';
        return;
      }
      this.loadAccount(clientId);
    }
  }

  // Load account details from API
  loadAccount(clientId: number) {
    this.http.get<AccountDetails>(`${this.apiUrl}/account/${clientId}`)
      .subscribe({
        next: data => {
          this.account = data;
          this.registrationData.setData(data); // cache it
          this.cdr.detectChanges();
          console.log('Account loaded:', data);
        },
        error: err => {
          console.error(err);
          this.errorMessage = 'Unable to load account details';
        }
      });
  }

  // Send OTP to new mobile number
  sendMobileOtp() {
    if (!this.newMobile || this.newMobile.trim().length === 0) {
      Swal.fire('Error', 'Enter mobile number first', 'error');
      return;
    }

    const phoneNumber = '+91' + this.newMobile.trim();

    // Initialize RecaptchaVerifier correctly
    this.recaptchaVerifier = new RecaptchaVerifier(
      this.auth,
      'recaptcha',
      { size: 'invisible' }
    );


    signInWithPhoneNumber(this.auth, phoneNumber, this.recaptchaVerifier)
      .then((result: ConfirmationResult) => {
        this.confirmationResult = result;
        Swal.fire('OTP Sent', 'OTP sent to mobile', 'success');
      })
      .catch(err => {
        console.error(err);
        Swal.fire('Error', 'Failed to send OTP', 'error');
      });
  }

  // Verify OTP entered by user
  verifyMobileOtp() {
    if (!this.mobileOtp || this.mobileOtp.trim().length !== 6) {
      Swal.fire('Error', 'Enter valid 6-digit OTP', 'error');
      return;
    }

    this.confirmationResult.confirm(this.mobileOtp)
      .then(() => {
        this.mobileOtpVerified = true;
        Swal.fire('Success', 'Mobile verified successfully', 'success');
        this.router.navigate(['./dashbord'])
      })
      .catch(() => {
        Swal.fire('Error', 'Invalid or expired OTP', 'error');
      });
  }

  // Update mobile number after OTP verification
  updateMobile() {
    if (!this.account || !this.newMobile.trim() || !this.mobileOtpVerified) {
      Swal.fire('Error', 'Enter a valid mobile number and verify OTP', 'error');
      return;
    }

    const payload = {
      ClientId: this.account.clientId,
      NewMobile: this.newMobile.trim()
    };

    this.http.put(`${this.apiUrl}/change-mobile`, payload)
      .subscribe({
        next: () => {
          Swal.fire('Success', 'Mobile updated successfully', 'success');
          if (this.account) {
            this.account.mobile = this.newMobile;
            this.registrationData.setData(this.account);
          }
          this.newMobile = '';
          this.mobileOtp = '';
          this.mobileOtpVerified = false;
        },
        error: err => {
          Swal.fire('Error', 'Failed to update mobile', 'error');
          console.error(err);
        }
      });
  }

  // Navigate back
  BACK() {
    this.router.navigate(['/manage-account']);
  }
}
