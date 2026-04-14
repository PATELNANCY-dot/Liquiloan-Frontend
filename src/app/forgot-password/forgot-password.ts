import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';
import { LoaderService } from '../services/loader.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
})
export class ForgotPassword {

  email: string = '';

  private apiUrl = 'http://localhost:5048/api/Otp';

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private loaderService: LoaderService
  ) { }

  goBack() {
    this.router.navigate(['/login']);
  }

  goNext() {

    if (!this.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Email Required',
        text: 'Please enter your email'
      });
      return;
    }

    this.loaderService.show();

    // STEP 1 → CHECK EMAIL
    this.http.get<any>(`http://localhost:5048/api/Auth/check-email?email=${this.email}`)
      .subscribe({

        next: (res) => {

          if (!res.emailExists) {

            this.loaderService.hide();

            Swal.fire({
              icon: 'error',
              title: 'Email Not Found',
              text: 'This email is not registered'
            });

            return;
          }

          // STEP 2 → SEND OTP
          this.http.post<any>(`${this.apiUrl}/send-otp`, { email: this.email })
            .subscribe({

              next: (otpRes) => {

                this.loaderService.hide();

                this.authService.setFpEmail(this.email);

                Swal.fire({
                  icon: 'success',
                  title: 'OTP Sent',
                  text: otpRes.message || 'OTP sent successfully',
                  timer: 1500,
                  showConfirmButton: false
                });

                setTimeout(() => {
                  this.router.navigate(['/forgot-password2']);
                }, 1500);
              },

              error: (err: HttpErrorResponse) => {

                this.loaderService.hide();

                Swal.fire({
                  icon: 'error',
                  title: 'Failed',
                  text: err.error || `Failed to send OTP (${err.status})`
                });
              }

            });

        },

        error: () => {

          this.loaderService.hide();

          Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: 'Unable to verify email'
          });
        }

      });
  }
}
