import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './login-otp.html',
  styleUrls: ['./login-otp.css']
})
export class LoginOtp {

  email: string = '';
  enteredOtp: string = '';

  constructor(private router: Router, private http: HttpClient) { }

  // SEND OTP via backend
  sendOtp() {
    if (!this.email) {
      alert("Please enter your email");
      return;
    }

    this.http.post<any>('http://localhost:5048/api/Otp/send-otp', { email: this.email })
      .subscribe({
        next: () => {
          alert("OTP sent to your email");
        },
        error: (err) => {
          console.error(err);
          alert("Failed to send OTP");
        }
      });
  }

  verifyOtp() {

    const inputs = document.querySelectorAll('.otp-input') as NodeListOf<HTMLInputElement>;
    this.enteredOtp = '';
    inputs.forEach(input => this.enteredOtp += input.value);

    if (!this.enteredOtp || this.enteredOtp.length !== 6) {
      alert("Please enter the 6-digit OTP");
      return;
    }

    this.http.post<any>('http://localhost:5048/api/Otp/verify-otp', {
      email: this.email,
      otp: this.enteredOtp
    }).subscribe({

      next: (res) => {

        console.log("API Response:", res); 
      
        localStorage.setItem("userId", res.clientId.toString());

        alert("Login Successful");

        this.router.navigate(['/dashboard']);
      },

      error: (err) => {
        console.error(err);
        alert(err.error?.message || "Invalid OTP");
      }

    });

  }

  // Move to next input box
  moveNext(event: any) {
    const input = event.target;
    if (input.value && input.nextElementSibling) {
      input.nextElementSibling.focus();
    }
  }

  // Move to previous input box
  moveBack(event: any) {
    const input = event.target;
    if (!input.value && input.previousElementSibling) {
      input.previousElementSibling.focus();
    }
  }

  // Collect OTP from 6 boxes
  collectOtp() {
    const inputs = document.querySelectorAll('.otp-input') as NodeListOf<HTMLInputElement>;
    this.enteredOtp = '';
    inputs.forEach(input => {
      this.enteredOtp += input.value;
    });
  }
}
