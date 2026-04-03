import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import flatpickr from 'flatpickr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-factor-auth',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './factor-auth.html',
  styleUrls: ['./factor-auth.css'],
})
export class FactorAuth implements AfterViewInit {

  dob: string = '';
  pan: string = '';

  constructor(private router: Router, private http: HttpClient) { }

  // ================= SUBMIT =================
  submit() {

    if (!this.dob || !this.pan) {
      console.log("DOB:", this.dob);
      console.log("PAN:", this.pan);
      alert('Please fill both fields.');
      return;
    }


    this.http.post('http://localhost:5048/api/TwoFactorAuth',
      { Dob: this.dob, Pan: this.pan })
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Vrified  Successful!',
            text: 'Redirecting...',
            timer: 1500,
            showConfirmButton: false
          });
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Please enter Valid Pan and DOB',
            confirmButtonColor: '#ff7a00'
          });
        }
      });
  }



  // ================= FLATPICKR =================
  @ViewChild('nomineeDobInput') nomineeDobInput!: ElementRef;
  fpInstance: any;

  ngAfterViewInit(): void {
    this.fpInstance = flatpickr(this.nomineeDobInput.nativeElement, {
      dateFormat: "Y-m-d",
      maxDate: "today",
      disableMobile: true,
      allowInput: false,
      monthSelectorType: "dropdown",
      clickOpens: false,

      // ⭐ THIS IS THE FIX
      onChange: (selectedDates, dateStr) => {
        this.dob = dateStr;
        console.log("Selected DOB:", this.dob);
      },

      onReady: (_, __, instance) => this.removeYearSpinner(instance),
      onMonthChange: (_, __, instance) => this.removeYearSpinner(instance),
      onYearChange: (_, __, instance) => this.removeYearSpinner(instance)
    });
  }

  toggleNomineeCalendar() {
    this.fpInstance.isOpen
      ? this.fpInstance.close()
      : this.fpInstance.open();
  }

  removeYearSpinner(instance: any) {
    setTimeout(() => {
      const yearInput =
        instance.calendarContainer.querySelector(".cur-year");

      if (yearInput) {
        yearInput.setAttribute("type", "text");
        yearInput.style.width = "60px";
      }
    });
  }
}
