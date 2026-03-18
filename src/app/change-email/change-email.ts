import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RegistrationDataService } from '../services/ client-registration.service';
import Swal from 'sweetalert2';

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
    private registrationData: RegistrationDataService
  ) {
    this.changeEmailForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.email]],
      emailOtp: ['']
    });
  }

  ngOnInit(): void {
    const cached = this.registrationData.getData();
    if (cached && cached.clientId) {
      this.account = cached;
      this.changeEmailForm.patchValue({ newEmail: this.account.email });
    } else {
      const clientId = Number(localStorage.getItem('userId'));
      if (!clientId) {
        Swal.fire('Error', 'Client ID not found', 'error');
        return;
      }
      this.loadAccount(clientId);
    }
  }

  loadAccount(clientId: number) {
    this.http.get<any>(`http://localhost:5048/api/AccountDetails/account/${clientId}`).subscribe({
      next: data => {
        this.account = data;
        this.registrationData.setData(data);
        this.changeEmailForm.patchValue({ newEmail: data.email });
      },
      error: () => Swal.fire('Error', 'Unable to load account details', 'error')
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

    this.lastEmailSent = email;

    this.http.post<any>('http://localhost:5048/api/Otp/send-otp', { email }).subscribe({
      next: () => {
        this.otpSent = true;
        Swal.fire('OTP Sent', `OTP sent to ${email}`, 'success');
      },
      error: () => {
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
      return;
    }

    this.http.post<any>('http://localhost:5048/api/Otp/verify-otp', { email, otp }).subscribe({
      next: () => {
        this.otpVerified = true;
        Swal.fire('Success', 'Email verified successfully', 'success');
      },
      error: () => Swal.fire('Error', 'Invalid or expired OTP', 'error')
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
