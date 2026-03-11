import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [RouterLink, FormsModule, CommonModule],
})
export class Login {

  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  login() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter username and password';
      return;
    }

    this.http.post('http://localhost:5048/api/auth/login', {
      Username: this.username,
      Password_1: this.password
    }).subscribe({
      next: (res: any) => {
        console.log('API Response:', res);
       

        // Save userId in local storage
        localStorage.setItem('userId', res.userId);

        setTimeout(() => {
          this.router.navigate(['/factor-auth']);
        }, 50);
      },
      error: (err) => {
        console.error('API Error:', err);

        if (err.status === 0) {
          this.errorMessage = 'Cannot connect to backend. Is the API running?';
        } else if (err.status === 401) {
          this.errorMessage = 'Invalid Username or Password';
        } else {
          this.errorMessage = 'Something went wrong';
        }
      }
    });
  }


  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
