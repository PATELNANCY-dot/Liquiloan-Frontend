import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-changepassword',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './changepassword.html',
  styleUrls: ['./changepassword.css']
})
export class Changepassword {
  form: FormGroup;

  showCurrent = false;
  showNew = false;
  showConfirm = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(25),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,25}$/)
      ]],
      confirmPassword: ['', Validators.required]
    });
  }

  submit() {
    // ===== Form validations =====
    if (this.form.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Password',
        text: 'Password must be 8–25 characters and include alphabet, number & special character',
        confirmButtonColor: '#ff7a00'
      });
      return;
    }

    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'New passwords do not match',
        confirmButtonColor: '#d80000'
      });
      return;
    }

    const clientId = localStorage.getItem('userId');
    if (!clientId) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'User not logged in',
        confirmButtonColor: '#ff7a00'
      });
      return;
    }

    if (this.form.value.newPassword === clientId) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Password',
        text: 'Password cannot be same as User ID',
        confirmButtonColor: '#d80000'
      });
      return;
    }

    // ===== Payload =====
    const payload = {
      clientId: parseInt(clientId),
      currentPassword: this.form.value.currentPassword,
      newPassword: this.form.value.newPassword
    };

    // ===== API Call =====
    this.http.post('http://localhost:5048/api/PasswordChange', payload)
      .subscribe({
        next: (res: any) => {
          console.log('API response:', res);

          if (res.message === 'Password changed successfully') {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: res.message,
              confirmButtonColor: '#00a651'
            }).then(() => {
              this.router.navigate(['/login']);
            });
          } else {
            Swal.fire({
              icon: 'info',
              title: 'Info',
              text: res.message,
              confirmButtonColor: '#0b2c5f'
            });
          }
        },
        error: (err) => {
          console.error('API error:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.error?.message || 'Error changing password',
            confirmButtonColor: '#d80000'
          });
        }
      });
  }

  toggleCurrent() { this.showCurrent = !this.showCurrent; }
  toggleNew() { this.showNew = !this.showNew; }
  toggleConfirm() { this.showConfirm = !this.showConfirm; }
}
