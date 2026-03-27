import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth';
import { LoaderService } from '../services/loader.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  email: string = '';
  password: string = '';
  showPassword = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private loaderService: LoaderService,
    private http: HttpClient,
  ) { }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {

    if (!this.email || !this.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Please enter email and password',
        confirmButtonColor: '#ff7a00'
      });
      return;
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {

        this.authService.setUserId(res.userId);

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
        }
        else if (err.status === 401) {
          Swal.fire('Error', 'Invalid Email or Password', 'error');
        }
        else {
          Swal.fire('Error', 'Something went wrong', 'error');
        }

      }
    });
  }


  sendOtp() {

    if (!this.email) {
      Swal.fire('Error', 'Enter email', 'warning');
      return;
    }
    this.loaderService.show();
    this.http.post<any>('http://localhost:5048/api/Otp/send-otp',
      { email: this.email })
      .subscribe({

        next: () => {
          this.loaderService.hide();
          Swal.fire({
            icon: 'success',
            title: 'OTP Sent'
          });

          this.router.navigate(['/login-otp'], {
            queryParams: { email: this.email }
          });

        }

      });

  }

}
