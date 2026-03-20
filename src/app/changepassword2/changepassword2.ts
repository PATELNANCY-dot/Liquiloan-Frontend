import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';
import { LoaderService } from '../services/loader.service';

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
  private clientId: number | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private loaderService: LoaderService
  ) {

    const id = this.authService.getFpClientId();

    if (!id) {
      Swal.fire({
        icon: 'warning',
        title: 'Flow Expired',
        text: 'OTP session expired. Please start forgot password again',
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

    // ===== VALIDATION =====
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
        title: 'Invalid Session',
        text: 'Client ID not found',
        confirmButtonColor: '#d80000'
      });
      return;
    }

    // ===== API CALL =====
    this.loaderService.show();

    this.http.post<any>('http://localhost:5048/api/Otp/change-password-forgot', {
      clientId: this.clientId,
      newPassword: this.newPassword
    })
      .subscribe({
        next: (res) => {
          this.loaderService.hide();

          Swal.fire({
            icon: 'success',
            title: 'Password Changed',
            text: res.message || 'Password updated successfully',
            timer: 1800,
            showConfirmButton: false
          });

          // ✅ clear session properly
          this.authService.clearFpClientId();
          this.authService.clearFpEmail();

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1800);
        },
        error: (err) => {
          this.loaderService.hide();

          console.error('Change password error:', err);

          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: err.error?.message || 'Failed to change password',
            confirmButtonColor: '#d80000'
          });
        }
      });
  }

  // ===== PASSWORD TOGGLE =====
  showNew = false;
  showConfirm = false;

  toggleNew() {
    this.showNew = !this.showNew;
  }

  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }

}
