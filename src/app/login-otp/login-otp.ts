import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth';
import { LoaderService } from '../services/loader.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login-otp.html',
  styleUrls: ['./login-otp.css']
})
export class LoginOtp {

  email: string = '';
  enteredOtp: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private loaderService: LoaderService,
    private route: ActivatedRoute
  ) { }


  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
  }

  // ================= SEND OTP =================
  sendOtp() {
    if (!this.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Email Required',
        text: 'Please enter your email'
      });
      return;
    }

    this.loaderService.show();

    this.http.post<any>('http://localhost:5048/api/Otp/send-otp', { email: this.email })
      .subscribe({
        next: () => {
          this.loaderService.hide();

          Swal.fire({
            icon: 'success',
            title: 'OTP Sent',
            text: 'OTP sent to your email'
          });
        },
        error: (err) => {
          console.error(err);
          this.loaderService.hide();

          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: 'Failed to send OTP'
          });
        }
      });
  }

  // ================= VERIFY OTP =================
  verifyOtp() {

    const inputs = document.querySelectorAll('.otp-input') as NodeListOf<HTMLInputElement>;
    this.enteredOtp = '';
    inputs.forEach(input => this.enteredOtp += input.value);

    if (!this.enteredOtp || this.enteredOtp.length !== 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid OTP',
        text: 'Please enter the 6-digit OTP'
      });
      return;
    }

    this.loaderService.show();

    this.http.post<any>('http://localhost:5048/api/Otp/verify-otp', {
      email: this.email,
      otp: this.enteredOtp
    }).subscribe({

      next: (res) => {
        this.loaderService.hide();

        if (res.clientId) {

          this.authService.setUserId(res.clientId.toString());

          Swal.fire({
            icon: 'success',
            title: 'Login Successful!',
            text: 'Redirecting...',
            timer: 1500,
            showConfirmButton: false
          });

          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);

        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'OTP verified but user not found'
          });
        }
      },

      error: (err) => {
        console.error(err);
        this.loaderService.hide();

        Swal.fire({
          icon: 'error',
          title: 'Invalid OTP',
          text: err.error || 'OTP is incorrect or expired'
        });
      }

    });
  }

  // ================= OTP INPUT HANDLING =================
  moveNext(event: any) {
    const input = event.target;
    if (input.value && input.nextElementSibling) {
      input.nextElementSibling.focus();
    }
  }

  moveBack(event: any) {
    const input = event.target;
    if (!input.value && input.previousElementSibling) {
      input.previousElementSibling.focus();
    }
  }

  collectOtp() {
    const inputs = document.querySelectorAll('.otp-input') as NodeListOf<HTMLInputElement>;
    this.enteredOtp = '';
    inputs.forEach(input => {
      this.enteredOtp += input.value;
    });
  }
}
