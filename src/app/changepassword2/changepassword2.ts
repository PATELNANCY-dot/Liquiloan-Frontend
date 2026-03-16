import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-changepassword2',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './changepassword2.html',
  styleUrls: ['./changepassword2.css']
})
export class Changepassword2 {
  newPassword: string = '';
  confirmPassword: string = '';
  private apiUrl = 'http://localhost:5048/api/PasswordChange'; // <-- your actual API
  private clientId: number | null = null;

  constructor(private router: Router, private http: HttpClient) {
    const id = localStorage.getItem('fpClientId');
    if (!id) {
      Swal.fire({
        icon: 'warning',
        title: 'Flow Expired',
        text: 'OTP session expired. Please start forgot password flow again',
        confirmButtonColor: '#ff7a00'
      });
      this.router.navigate(['/forgot-password']);
    } else {
      this.clientId = Number(id);
    }
  }



  goBack() {
    this.router.navigate(['/login']);
  }

  goNext() {
    if (!this.newPassword || !this.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill both password fields',
        confirmButtonColor: '#ff7a00'
      });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match',
        confirmButtonColor: '#d80000'
      });
      return;
    }

    if (!this.clientId) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Client',
        text: 'Client ID not found',
        confirmButtonColor: '#d80000'
      });
      return;
    }

    // ===== Payload for your PasswordChange API =====
    const payload = {
      clientId: this.clientId,
      newPassword: this.newPassword
    };

    this.http.post<any>('http://localhost:5048/api/Otp/change-password-forgot', {
      clientId: this.clientId,
      newPassword: this.newPassword
    })
      .subscribe({
        next: (res) => {
          alert(res.message || 'Password changed successfully!');
          localStorage.removeItem('fpClientId');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Change password error:', err);
          alert(err.error?.message || 'Failed to change password');
        }
      });
  }




  // Variables to track visibility
  showNew = false;
  showConfirm = false;

  // Toggle functions
  toggleNew() {
    this.showNew = !this.showNew;
  }

  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }

}
