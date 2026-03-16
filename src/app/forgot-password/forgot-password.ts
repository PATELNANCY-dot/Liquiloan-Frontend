import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
})
export class ForgotPassword {
  email: string = '';
  clientId: number | null = null;
  isLoading: boolean = false;

  private apiUrl = 'http://localhost:5048/api/Otp';

  constructor(private router: Router, private http: HttpClient) { }

  goBack() {
    this.router.navigate(['/login']);
  }

  goNext() {
    if (!this.email) {
      alert('Please enter your email');
      return;
    }

    this.isLoading = true;

    this.http.post<any>(`${this.apiUrl}/send-otp`, { email: this.email })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          // clientId is optional in your backend, so save email to use in OTP verification
          localStorage.setItem('fpEmail', this.email);
          alert(res.message || 'OTP sent successfully');
          this.router.navigate(['/forgot-password2']);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('Send OTP error:', err);
          alert(err.error || `Failed to send OTP: ${err.status} ${err.statusText}`);
        }
      });
  }
}
