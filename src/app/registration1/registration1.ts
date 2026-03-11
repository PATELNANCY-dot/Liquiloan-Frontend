import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration1',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration1.html',
  styleUrls: ['./registration1.css'],
})
export class Registration1 {
  registrationForm: FormGroup;
  step = 1;
  constructor(private router: Router, private fb: FormBuilder) {
     localStorage.removeItem('clientRegistration');
    this.registrationForm = this.fb.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.pattern(/^[A-Za-z\s]+$/)
          ]
        ],
        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],
        mobile: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[6-9]\d{9}$/)
          ]
        ],
        Password_1: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(25),
            Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,25}$/)
          ]
        ],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );

    const savedData = JSON.parse(localStorage.getItem('clientRegistration') || '{}');
    this.registrationForm.patchValue(savedData);
  }

  goNext() {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const existingData = JSON.parse(localStorage.getItem('clientRegistration') || '{}');
    const updatedData = { ...existingData, ...this.registrationForm.value };

    localStorage.setItem('clientRegistration', JSON.stringify(updatedData));
    this.router.navigate(['/registration2']);
  }
  goBack() {
    this.router.navigate(['/new-invester-page']);
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('Password_1')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      const errors = form.get('confirmPassword')?.errors;
      if (errors) {
        delete errors['mismatch'];
        if (Object.keys(errors).length === 0) {
          form.get('confirmPassword')?.setErrors(null);
        }
      }
    }
    return null;
  }

  showPassword = false;
  showConfirmPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

}
