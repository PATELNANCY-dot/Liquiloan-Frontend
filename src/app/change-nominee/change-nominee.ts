import { Component, OnInit } from '@angular/core';
import {  ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NomineeService } from '../services/nominee';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import flatpickr from 'flatpickr';




@Component({
  selector: 'app-change-nominee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './change-nominee.html',
  styleUrls: ['./change-nominee.css'], 
})
export class ChangeNominee implements OnInit {
  nomineeForm!: FormGroup;
  isMinor = false;

  constructor(private fb: FormBuilder,
    private nomineeService: NomineeService,
    private router: Router) { }

  ngOnInit(): void {
    this.nomineeForm = this.fb.group({
      nomineeName: [''],
      nomineeRelation: [''],
      nomineeDob: [''],
      nomineePan: [''],
      guardianName: [''],
      guardianRelation: [''],
      guardianDob: [''],
      guardianPan: ['']
    });

    // Load existing nominee info
    this.nomineeService.getNominee().subscribe(data => {
        const formattedData = {
      ...data,
      nomineeDob: data.nomineeDob ? data.nomineeDob.slice(0, 10) : '',
      guardianDob: data.guardianDob ? data.guardianDob.slice(0, 10) : ''
      };
      // Use formattedData here, not data
      this.nomineeForm.patchValue(formattedData);
      this.checkMinor(formattedData.nomineeDob);
    
    });

    // Watch nominee DOB to detect minor
    this.nomineeForm.get('nomineeDob')?.valueChanges.subscribe(dob => {
      this.checkMinor(dob);
    });
  }
checkMinor(dob: string) {
  if (!dob) { 
    this.isMinor = false; 
    return; 
  }
  const birth = new Date(dob);
  let age = new Date().getFullYear() - birth.getFullYear(); // <-- changed const -> let

  // Adjust if birthday hasn't occurred yet this year
  if (new Date().getMonth() < birth.getMonth() || 
      (new Date().getMonth() === birth.getMonth() && new Date().getDate() < birth.getDate())) {
    age--;
  }

  this.isMinor = age < 18;
  }
  private formatToISO(dateString: string | null): string | null {
    if (!dateString) return null;

    const parts = dateString.split('-'); // expecting dd-mm-yyyy

    if (parts.length !== 3) return null;

    const [day, month, year] = parts;

    const isoDate = new Date(`${year}-${month}-${day}`);

    return isNaN(isoDate.getTime())
      ? null
      : isoDate.toISOString();
  }
  updateNominee() {
    if (this.nomineeForm.invalid) return;

    const formValue = { ...this.nomineeForm.value };

    // Convert dd-mm-yyyy to ISO
    const nomineeDobISO = formValue.nomineeDob ? this.formatToISO(formValue.nomineeDob) : null;
    const guardianDobISO = this.isMinor && formValue.guardianDob ? this.formatToISO(formValue.guardianDob) : null;

    const payload = {
      nomineeName: formValue.nomineeName || null,
      nomineeRelation: formValue.nomineeRelation || null,
      nomineeDob: nomineeDobISO,
      nomineePan: formValue.nomineePan || null,

      guardianName: this.isMinor ? (formValue.guardianName || null) : null,
      guardianRelation: this.isMinor ? (formValue.guardianRelation || null) : null,
      guardianDob: guardianDobISO,
      guardianPan: this.isMinor ? (formValue.guardianPan || null) : null
    };

    console.log("Sending Payload:", payload);

    this.nomineeService.updateNominee(payload).subscribe({
      next: res => {
        alert(res);
        this.router.navigate(['/dashboard']);
      },
      error: err => console.error('Error updating nominee', err)
    });
  }




  //CUSTOME DATECOX
  @ViewChild('nomineeDobInput') nomineeDobInput!: ElementRef;
  @ViewChild('guardianDobInput') guardianDobInput!: ElementRef;

  nomineeFp: any;
  guardianFp: any;


  ngAfterViewInit(): void {
    this.nomineeFp = flatpickr(this.nomineeDobInput.nativeElement, {
      dateFormat: "d-m-Y",
      maxDate: "today",
      disableMobile: true,
      allowInput: false,
      monthSelectorType: "dropdown",
      clickOpens: false,
      onReady: (_, __, instance) => this.removeYearSpinner(instance),
      onMonthChange: (_, __, instance) => this.removeYearSpinner(instance),
      onYearChange: (_, __, instance) => this.removeYearSpinner(instance)
    });

    this.guardianFp = flatpickr(this.guardianDobInput.nativeElement, {
      dateFormat: "d-m-Y",
      maxDate: "today",
      disableMobile: true,
      allowInput: false,
      monthSelectorType: "dropdown",
      clickOpens: false,
      onReady: (_, __, instance) => this.removeYearSpinner(instance),
      onMonthChange: (_, __, instance) => this.removeYearSpinner(instance),
      onYearChange: (_, __, instance) => this.removeYearSpinner(instance)
    });
  }
  toggleNomineeCalendar() {
    this.nomineeFp.isOpen ? this.nomineeFp.close() : this.nomineeFp.open();
  }

  toggleGuardianCalendar() {
    this.guardianFp.isOpen ? this.guardianFp.close() : this.guardianFp.open();
  }

  removeYearSpinner(instance: any) {
    setTimeout(() => {
      const yearInput = instance.calendarContainer.querySelector(".cur-year");
      if (yearInput) {
        yearInput.setAttribute("type", "text");
        yearInput.style.width = "60px";
      }
    });
  }

  @ViewChild('nomineeContainer') nomineeContainer!: ElementRef;
  cloneCount = 0; // keep track of clones
  maxClones = 2;  // maximum 2 duplicates

  // existing ngOnInit and other logic here...

  addNomineeClone() {
    if (this.cloneCount >= this.maxClones) return;

    const original = this.nomineeContainer.nativeElement as HTMLElement;
    const clone = original.cloneNode(true) as HTMLElement;

    // Clear all input/select/textarea values
    clone.querySelectorAll('input, select, textarea').forEach((el: any) => el.value = '');

    // Change button text
    const cloneButton = clone.querySelector('button.next-btn');
    if (cloneButton) {
      cloneButton.innerHTML = '<span><i class="bi bi-pencil-square"></i> EDIT NOMINEE</span>';
    }

    // Add CSS class for spacing
    clone.classList.add('cloned-form');

    // Append clone
    const container = document.getElementById('clonedNomineesContainer');
    if (container) {
      container.appendChild(clone);
      this.cloneCount++;
    }
  }
}
