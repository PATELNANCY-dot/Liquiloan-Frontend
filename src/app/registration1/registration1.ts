import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegistrationDataService } from '../services/ client-registration.service';
import { HttpClient } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { firebaseConfig } from '../firebase.config';


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
  constructor(private router: Router, private fb: FormBuilder, private registrationService: RegistrationDataService, private http: HttpClient) {


    this.registrationForm = this.fb.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.pattern(/^[A-Za-z\s]+$/)
          ]
        ],
        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],
        mobile: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[6-9]\d{9}$/)
          ]
        ],
        Password_1: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(25),
            Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,25}$/)
          ]
        ],
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

  goNext() {
    if (this.registrationForm.invalid || !this.otpVerified ) {
      this.registrationForm.markAllAsTouched();

      if (!this.otpVerified) {
        alert("Please verify your email first");
      }

      return;
    }

    this.registrationService.setData(this.registrationForm.value);
    this.router.navigate(['/registration2']);
  }

  goBack() {
    this.router.navigate(['/new-invester-page']);
  }

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

  showPassword = false;
  showConfirmPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  lastEmailSent: string = '';
  otpSent: boolean = false;

  emailOtp: string = '';
  otpVerified: boolean = false;


  onEmailBlur() {
    console.log("Blur triggered"); 
    const emailControl = this.registrationForm.get('email');
    const email = emailControl?.value;

    if (!email || emailControl?.invalid) return;

    if (this.lastEmailSent === email) return;

    this.lastEmailSent = email;

    this.http.post<any>('http://localhost:5048/api/Otp/send-otp', { email })
      .subscribe({
        next: () => {
          this.otpSent = true;
          alert("OTP sent to your email");
        },
        error: (err) => {
          console.error(err);
          this.lastEmailSent = '';
          alert("Failed to send OTP");
        }
      });
    console.log("Sending OTP to:", email);
  }

  verifyEmailOtp() {
    const email = this.registrationForm.get('email')?.value;
    const otp = this.registrationForm.get('emailOtp')?.value;

    if (!otp || otp.length !== 6) {
      alert("Enter valid 6-digit OTP");
      return;
    }

    this.http.post<any>('http://localhost:5048/api/Otp/verify-otp', {
      email: email,
      otp: otp
    }).subscribe({
      next: () => {
        this.otpVerified = true;
        alert("Email verified successfully");
      },
      error: () => {
        alert("Invalid or expired OTP");
      }
    });
  }


  //obile otp  [ not used becaues neeed payment ok]

  lastMobileSent: string = '';
  mobileOtpVerified: boolean = false;

  auth: any;
  recaptchaVerifier: any;
  confirmationResult: any;



  sendMobileOtp() {
    const mobile = this.registrationForm.get('mobile')?.value;

    if (!mobile) {
      alert("Enter mobile number first");
      return;
    }

    const phoneNumber = '+91' + mobile;

    this.recaptchaVerifier = new RecaptchaVerifier(
      this.auth,
      'recaptcha',
      { size: 'invisible' }
    );

    signInWithPhoneNumber(this.auth, phoneNumber, this.recaptchaVerifier)
      .then((result: any) => {
        this.confirmationResult = result;
        alert("OTP sent to mobile");
      })
      .catch((error: any) => {
        console.error(error);
        alert("Failed to send OTP");
      });
  }

  verifyMobileOtp() {
    const otp = this.registrationForm.get('mobileOtp')?.value;

    if (!otp || otp.length !== 6) {
      alert("Enter valid 6-digit OTP");
      return;
    }

    this.confirmationResult.confirm(otp)
      .then(() => {
        this.mobileOtpVerified = true;
        alert("Mobile verified successfully");
      })
      .catch(() => {
        alert("Invalid or expired OTP");
      });
  }

}
