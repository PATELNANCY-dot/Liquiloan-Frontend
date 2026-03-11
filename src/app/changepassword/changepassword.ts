import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-changepassword',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './changepassword.html',
  styleUrls: ['./changepassword.css']
})
export class Changepassword {
  form: FormGroup;
  message: string = '';

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
    if (this.form.invalid) {
      this.message = 'Password must be 8–25 characters and include alphabet, number & special character';
      return;
    }

    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      this.message = 'New passwords do not match';
      return;
    }

    const clientId = localStorage.getItem('userId');

    if (!clientId) {
      this.message = 'User not logged in';
      return;
    }

    //  Password cannot be same as User ID
    if (this.form.value.newPassword === clientId) {
      this.message = 'Password cannot be same as User ID';
      return;
    }


    const payload = {
      clientId: parseInt(clientId),
      currentPassword: this.form.value.currentPassword,
      newPassword: this.form.value.newPassword
    };

    this.http.post('http://localhost:5048/api/PasswordChange', payload)
      .subscribe({
        next: (res: any) => {
          console.log('API response:', res);
          this.message = res.message;
          if (res.message === 'Password changed successfully') {
            alert("Password Changed sucessfully")
            this.router.navigate(['/login']);
          }
        },
        error: (err) => {
          console.log('API error:', err);
          this.message = err.error?.message || 'Error changing password';
        }
      });
  }



  showCurrent = false;
  showNew = false;
  showConfirm = false;

  toggleCurrent() {
    this.showCurrent = !this.showCurrent;
  }

  toggleNew() {
    this.showNew = !this.showNew;
  }

  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }
}
