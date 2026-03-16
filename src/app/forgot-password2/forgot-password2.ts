import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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

  constructor(private router: Router, private http: HttpClient) {
    const storedEmail = localStorage.getItem('fpEmail');
    if (!storedEmail) {
      alert('No email found. Start from email entry.');
      this.router.navigate(['/forgot-password']);
    } else {
      this.email = storedEmail;
    }
  }

  verifyOtp() {
    if (!this.enteredOtp || this.enteredOtp.length !== 6) {
      alert('Enter 6-digit OTP');
      return;
    }

    this.http.post<any>(`${this.apiUrl}/verify-otp`, {
      email: this.email,
      otp: this.enteredOtp
    }).subscribe({
      next: (res) => {
        alert('OTP Verified ✅');
        localStorage.setItem('fpClientId', res.clientId.toString());
        this.router.navigate(['/changepassword2']);
      },
      error: (err) => {
        console.error('OTP verify error:', err);
        alert(err.error || 'Invalid OTP');
      }
    });
  }

  goBack() {
    this.router.navigate(['/forgot-password']);
  }
}
