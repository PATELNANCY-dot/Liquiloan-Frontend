import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../services/loader.service';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login-email.html',
    styleUrls: ['./login-email.css']
})
export class LoginEmail {

  email: string = '';

  constructor(private http: HttpClient,
    private router: Router,
    private loaderService: LoaderService
  ) { }

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
