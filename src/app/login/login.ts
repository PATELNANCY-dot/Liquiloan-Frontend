import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule]  ,
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  username: string = '';
  password: string = '';
  showPassword = false;

  constructor(private router: Router, private http: HttpClient) { }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (!this.username || !this.password) {

      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Please enter username and password',
        confirmButtonColor: '#ff7a00'
      });
      return;
    }

    this.http.post('http://localhost:5048/api/auth/login', {
      Username: this.username,
      Password_1: this.password
    }).subscribe({
      next: (res: any) => {
        localStorage.setItem('userId', res.userId);

        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Redirecting...',
          timer: 1500,
          showConfirmButton: false
        });

        setTimeout(() => {
          this.router.navigate(['/factor-auth']);
        }, 1500);
      },
      error: (err) => {
        if (err.status === 0) {
          Swal.fire('Error', 'Cannot connect to backend. Is the API running?', 'error');
        } else if (err.status === 401) {
          Swal.fire('Error', 'Invalid Username or Password', 'error');
        } else {
          Swal.fire('Error', 'Something went wrong', 'error');
        }
      }
    });
  }
}
