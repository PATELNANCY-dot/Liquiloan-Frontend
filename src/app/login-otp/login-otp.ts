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
  generatedOtp: string = '';
  enteredOtp: string = '';

  constructor(private router: Router, private http: HttpClient) { }

  // SEND OTP
  sendOtp() {
    this.http.post<any>('http://localhost:5048/api/send-otp', { email: this.email })
      .subscribe(res => {
        this.generatedOtp = res.otp;
        alert("OTP sent to email");
      });
  }

  // VERIFY OTP
  verifyOtp() {
    if (this.enteredOtp === this.generatedOtp) {
      alert("Login Successful");
      this.router.navigate(['/dashboard']);
    } else {
      alert("Invalid OTP");
    }
  }

  moveNext(event: any) {
    const input = event.target;
    if (input.value && input.nextElementSibling) {
      input.nextElementSibling.focus();
    }
  }

  moveBack(event: any) {
    const input = event.target;
    if (!input.value && input.previousElementSibling) {
      input.previousElementSibling.focus();
    }
  }

  collectOtp() {
    const inputs = document.querySelectorAll('.otp-input') as NodeListOf<HTMLInputElement>;
    this.enteredOtp = '';
    inputs.forEach(input => {
      this.enteredOtp += input.value;
    });
  }
}
