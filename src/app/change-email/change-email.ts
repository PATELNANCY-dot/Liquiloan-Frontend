import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RegistrationDataService } from '../services/ client-registration.service';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth';
import { LoaderService } from '../services/loader.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-change-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-email.html',
  styleUrls: ['./change-email.css']
})
export class ChangeEmail implements OnInit {
  account: any = null;
  changeEmailForm: FormGroup;

  otpSent = false;
  otpVerified = false;
  lastEmailSent = '';
  emailForm!: FormGroup;

  private apiUrl = 'http://localhost:5048/api/ClientRegistrations';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private registrationData: RegistrationDataService,
    private authService: AuthService,
    private loaderService: LoaderService,
    private cdr: ChangeDetectorRef
  ) {
    this.changeEmailForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.email]],
      emailOtp: ['']
    });
  }

  ngOnInit(): void {

    const userId = this.authService.getUserId();

    if (!userId) {
      Swal.fire('Error', 'User session expired. Please login again.', 'error');
      this.router.navigate(['/login']);
      return;
    }

    const clientId = Number(userId);

    if (!clientId) {
      Swal.fire('Error', 'Client ID not found', 'error');
      return;
    }

    const cached = this.registrationData.getData();

    //  ONLY use cache if it matches logged-in user
    if (cached && cached.clientId === clientId) {
      this.account = cached;
    } else {
      this.loadAccount(clientId); //  fetch fresh data
    }
  }

  loadAccount(clientId: number) {

    this.http.get<any>(`http://localhost:5048/api/AccountDetails/account/${clientId}`).subscribe({
      next: data => {
        this.account = data;
        this.registrationData.setData(data);
        this.loaderService.hide();
        this.cdr.detectChanges(); //  FORCE UI UPDATE
      },
      error: () => {
        this.loaderService.hide();
        Swal.fire('Error', 'Unable to load account details', 'error');
      }
    });
  }

  // =====================
  // SEND OTP (like registration)
  // =====================
  sendOtp() {
    const email = this.changeEmailForm.get('newEmail')?.value;

    if (!email || email === this.account.email) {
      Swal.fire('Error', 'Enter a new valid email', 'error');
      return;
    }

    if (this.lastEmailSent === email) return;

    this.loaderService.show(); // ✅ moved here

    this.lastEmailSent = email;

    this.http.post<any>('http://localhost:5048/api/Otp/send-otp', { email }).subscribe({
      next: () => {
        this.loaderService.hide();
        this.otpSent = true;
        Swal.fire('OTP Sent', `OTP sent to ${email}`, 'success');
      },
      error: () => {
        this.loaderService.hide();
        this.lastEmailSent = '';
        Swal.fire('Error', 'Failed to send OTP', 'error');
      }
    });
  }

  // =====================
  // VERIFY OTP (like registration)
  // =====================
  verifyEmailOtp() {
    const email = this.changeEmailForm.get('newEmail')?.value;
    const otp = this.changeEmailForm.get('emailOtp')?.value;

    if (!otp || otp.length !== 6) {
      Swal.fire('Error', 'Enter valid 6-digit OTP', 'error');
      return; // ✅ no loader before this
    }

    this.loaderService.show(); // ✅ moved below validation

    this.http.post<any>('http://localhost:5048/api/Otp/verify-otp', { email, otp }).subscribe({
      next: () => {
        this.loaderService.hide();
        this.otpVerified = true;
        Swal.fire('Success', 'Email verified successfully', 'success');
      },
      error: () => {
        this.loaderService.hide();
        Swal.fire('Error', 'Invalid or expired OTP', 'error');
      }
    });
  }

  // =====================
  // UPDATE EMAIL
  // =====================
  updateEmail() {
    if (!this.otpVerified) {
      Swal.fire('Error', 'Please verify OTP before updating email', 'error');
      return;
    }

    const payload = {
      ClientId: this.account.clientId,
      NewEmail: this.changeEmailForm.get('newEmail')?.value
    };

    this.http.put(`${this.apiUrl}/change-email`, payload).subscribe({
      next: () => {
        Swal.fire('Success', 'Email updated successfully', 'success');
        this.account.email = payload.NewEmail;
        this.registrationData.setData(this.account);
        this.changeEmailForm.get('emailOtp')?.reset();
        this.otpVerified = false;
        this.otpSent = false;
        this.router.navigate(['./dashboard'])
      },
      error: () => Swal.fire('Error', 'Failed to update email', 'error')
    });
  }

  // =====================
  // EMAIL BLUR TO SEND OTP automatically
  // =====================
  onEmailBlur() {
    const emailControl = this.changeEmailForm.get('newEmail');
    const email = emailControl?.value;

    if (!email || emailControl?.invalid || email === this.account.email) return;
    if (this.lastEmailSent === email) return;

    this.sendOtp();
  }

  BACK() {
    this.router.navigate(['/manage-account']);
  }
}
