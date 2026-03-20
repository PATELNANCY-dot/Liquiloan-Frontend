import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegistrationDataService } from '../services/ client-registration.service';
import { HttpClient } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { firebaseConfig } from '../firebase.config';
import { LoaderService } from '../services/loader.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registration1',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration1.html',
  styleUrls: ['./registration1.css'],
})
export class Registration1 {

  registrationForm: FormGroup;
  step = 1;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private registrationService: RegistrationDataService,
    private http: HttpClient,
    private loaderService: LoaderService
  ) {

    this.registrationForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[A-Za-z\s]+$/)]],
        email: ['', [Validators.required, Validators.email]],
        mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
        Password_1: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(25),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,25}$/)
        ]],
        confirmPassword: ['', Validators.required],
        emailOtp: [''],
        mobileOtp: ['']
      },
      { validators: this.passwordMatchValidator }
    );

    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);

    const savedData = JSON.parse(localStorage.getItem('clientRegistration') || '{}');
    this.registrationForm.patchValue(savedData);
  }

  // ================= NEXT =================
  goNext() {
    if (this.registrationForm.invalid || !this.otpVerified) {
      this.registrationForm.markAllAsTouched();

      if (!this.otpVerified) {
        Swal.fire({
          icon: 'warning',
          title: 'Verification Required',
          text: 'Please verify your email first'
        });
      }
      return;
    }

    this.registrationService.setData(this.registrationForm.value);
    this.router.navigate(['/registration2']);
  }

  goBack() {
    this.router.navigate(['/new-invester-page']);
  }

  // ================= PASSWORD VALIDATOR =================
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('Password_1')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      const errors = form.get('confirmPassword')?.errors;
      if (errors) {
        delete errors['mismatch'];
        if (Object.keys(errors).length === 0) {
          form.get('confirmPassword')?.setErrors(null);
        }
      }
    }
    return null;
  }

  // ================= PASSWORD TOGGLE =================
  showPassword = false;
  showConfirmPassword = false;

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  // ================= EMAIL OTP =================
  lastEmailSent: string = '';
  otpSent: boolean = false;
  otpVerified: boolean = false;

  onEmailBlur() {
    const emailControl = this.registrationForm.get('email');
    const email = emailControl?.value;

    if (!email || emailControl?.invalid) return;
    if (this.lastEmailSent === email) return;

    this.loaderService.show();
    this.lastEmailSent = email;

    this.http.post<any>('http://localhost:5048/api/Otp/send-otp', { email })
      .subscribe({
        next: () => {
          this.loaderService.hide();
          this.otpSent = true;

          Swal.fire({
            icon: 'success',
            title: 'OTP Sent',
            text: `OTP sent to ${email}`
          });
        },
        error: (err) => {
          this.loaderService.hide();
          this.lastEmailSent = '';

          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: 'Failed to send OTP'
          });
        }
      });
  }

  verifyEmailOtp() {
    const email = this.registrationForm.get('email')?.value;
    const otp = this.registrationForm.get('emailOtp')?.value;

    if (!otp || otp.length !== 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid OTP',
        text: 'Enter valid 6-digit OTP'
      });
      return;
    }

    this.loaderService.show();

    this.http.post<any>('http://localhost:5048/api/Otp/verify-otp', { email, otp })
      .subscribe({
        next: () => {
          this.loaderService.hide();
          this.otpVerified = true;

          Swal.fire({
            icon: 'success',
            title: 'Verified',
            text: 'Email verified successfully'
          });
        },
        error: () => {
          this.loaderService.hide();

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Invalid or expired OTP'
          });
        }
      });
  }

  // ================= MOBILE OTP =================
  auth: any;
  recaptchaVerifier: any;
  confirmationResult: any;
  mobileOtpVerified: boolean = false;

  sendMobileOtp() {
    const mobile = this.registrationForm.get('mobile')?.value;

    if (!mobile) {
      Swal.fire({
        icon: 'warning',
        title: 'Required',
        text: 'Enter mobile number first'
      });
      return;
    }

    const phoneNumber = '+91' + mobile;

    this.recaptchaVerifier = new RecaptchaVerifier(
      this.auth,
      'recaptcha',
      { size: 'invisible' }
    );

    this.loaderService.show();

    signInWithPhoneNumber(this.auth, phoneNumber, this.recaptchaVerifier)
      .then((result: any) => {
        this.loaderService.hide();
        this.confirmationResult = result;

        Swal.fire({
          icon: 'success',
          title: 'OTP Sent',
          text: 'OTP sent to mobile'
        });
      })
      .catch((error: any) => {
        this.loaderService.hide();
        console.error(error);

        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Failed to send OTP'
        });
      });
  }

  verifyMobileOtp() {
    const otp = this.registrationForm.get('mobileOtp')?.value;

    if (!otp || otp.length !== 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid OTP',
        text: 'Enter valid 6-digit OTP'
      });
      return;
    }

    this.loaderService.show();

    this.confirmationResult.confirm(otp)
      .then(() => {
        this.loaderService.hide();
        this.mobileOtpVerified = true;

        Swal.fire({
          icon: 'success',
          title: 'Verified',
          text: 'Mobile verified successfully'
        });
      })
      .catch(() => {
        this.loaderService.hide();

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Invalid or expired OTP'
        });
      });
  }
}
