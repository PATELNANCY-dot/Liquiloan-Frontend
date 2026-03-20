import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-forgot-password2',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './forgot-password2.html',
  styleUrls: ['./forgot-password2.css'],
})
export class ForgotPassword2 {

  enteredOtp: string = '';
  email: string = '';
  private apiUrl = 'http://localhost:5048/api/Otp';

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private loaderService: LoaderService
  ) {

    const storedEmail = this.authService.getFpEmail();

    if (!storedEmail) {
      Swal.fire({
        icon: 'error',
        title: 'Session Expired',
        text: 'Please try again'
      });

      this.router.navigate(['/forgot-password']);
    } else {
      this.email = storedEmail;
    }
  }

  // ================= VERIFY OTP =================
  verifyOtp() {

    if (!this.enteredOtp || this.enteredOtp.length !== 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid OTP',
        text: 'Enter 6-digit OTP'
      });
      return;
    }

    this.loaderService.show();

    this.http.post<any>(`${this.apiUrl}/verify-otp`, {
      email: this.email,
      otp: this.enteredOtp
    }).subscribe({

      next: (res) => {
        this.loaderService.hide();

        Swal.fire({
          icon: 'success',
          title: 'Verified',
          text: 'OTP Verified Successfully',
          timer: 1500,
          showConfirmButton: false
        });

        this.authService.setFpClientId(res.clientId.toString());

        setTimeout(() => {
          this.router.navigate(['/changepassword2']);
        }, 1500);
      },

      error: (err) => {
        this.loaderService.hide();
        console.error('OTP verify error:', err);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error || 'Invalid or expired OTP'
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/forgot-password']);
  }
}
