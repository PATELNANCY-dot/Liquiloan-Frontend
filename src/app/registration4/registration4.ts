import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import flatpickr from 'flatpickr';
import Swal from 'sweetalert2';
import { RegistrationDataService } from '../services/ client-registration.service';

@Component({
  selector: 'app-registration4',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration4.html',
  styleUrls: ['./registration4.css'],
})
export class Registration4 {

  registrationForm: FormGroup;
  step = 4;
  isMinor = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private registrationService: RegistrationDataService
  ) {

    this.registrationForm = this.fb.group({

      /* Nominee */
      nomineeName: ['', Validators.required],
      nomineeRelation: ['', Validators.required],
      nomineeDob: ['', Validators.required],
      nomineePan: [''],

      nomineePercentage: [''],
      nomineeAddress: [''],
      nomineeGender: [''],
      nomineeCountry: [''],
      nomineeState: [''],
      nomineeCity: [''],
      nomineePincode: [''],
      nomineeEmailId: [''],
      nomineeMobileNo: [''],

      /* Guardian (Minor Case) */
      guardianName: [''],
      guardianDob: [''],
      guardianRelation: [''],
      guardianPan: [''],

      guardianAddress: [''],
      guardianCountry: [''],
      guardianState: [''],
      guardianCity: [''],
      guardianPincode: [''],
      guardianEmailId: [''],
      guardianMobileNo: ['']

    });
    const savedData = JSON.parse(localStorage.getItem('clientRegistration') || '{}');
    this.registrationForm.patchValue(savedData);
  }

  /* ---------------- DATE PICKERS ---------------- */

  @ViewChild('dobInput') dobInput!: ElementRef;
  @ViewChild('guardianDobInput') guardianDobInput!: ElementRef;

  nomineeFp: any;
  guardianFp: any;

  ngOnInit(): void {

    this.registrationForm.get('nomineeDob')?.valueChanges.subscribe(dob => {

      if (!dob) {
        this.isMinor = false;
        return;
      }

      const parts = dob.split('-');
      if (parts.length !== 3) return;

      const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);

      this.checkNomineeAge(date);

    });

  }

  ngAfterViewInit(): void {

    this.nomineeFp = flatpickr(this.dobInput.nativeElement, {
      dateFormat: "d-m-Y",
      maxDate: "today",
      disableMobile: true,
      allowInput: false,
      monthSelectorType: "dropdown",
      clickOpens: false,

      onReady: (_, __, instance) => {
        this.removeYearSpinner(instance);
      },

      onMonthChange: (_, __, instance) => {
        this.removeYearSpinner(instance);
      },

      onYearChange: (_, __, instance) => {
        this.removeYearSpinner(instance);
      },

      onChange: (selectedDates) => {
        if (selectedDates.length > 0) {
          this.checkNomineeAge(selectedDates[0]);
        }
      }
    });

  }

  initGuardianCalendar() {

    if (this.guardianDobInput) {

      this.guardianFp = flatpickr(this.guardianDobInput.nativeElement, {
        dateFormat: "d-m-Y",
        maxDate: "today",
        disableMobile: true,
        allowInput: false,
        monthSelectorType: "dropdown",
        clickOpens: false,

        onReady: (_, __, instance) => {
          this.removeYearSpinner(instance);
        },

        onMonthChange: (_, __, instance) => {
          this.removeYearSpinner(instance);
        },

        onYearChange: (_, __, instance) => {
          this.removeYearSpinner(instance);
        }
      });

    }

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

  toggleCalendar() {
    if (this.nomineeFp.isOpen) {
      this.nomineeFp.close();
    } else {
      this.nomineeFp.open();
    }
  }

  toggleGuardianCalendar() {
    if (this.guardianFp?.isOpen) {
      this.guardianFp.close();
    } else {
      this.guardianFp?.open();
    }
  }

  /* ---------------- AGE CHECK ---------------- */

  checkNomineeAge(dob: Date) {

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();

    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {

      this.isMinor = true;

      // Disable nominee PAN and clear value
      this.registrationForm.get('nomineePan')?.disable();
      this.registrationForm.patchValue({
        nomineePan: ''
      });

      // Guardian fields required
      this.registrationForm.get('guardianName')?.setValidators([Validators.required]);
      this.registrationForm.get('guardianDob')?.setValidators([Validators.required]);
      this.registrationForm.get('guardianRelation')?.setValidators([Validators.required]);

      // Initialize guardian calendar
      setTimeout(() => {
        this.initGuardianCalendar();
      });

    }
    else {

      this.isMinor = false;

      // Enable nominee PAN again
      this.registrationForm.get('nomineePan')?.enable();
      this.registrationForm.get('nomineePan')?.updateValueAndValidity();

      // Clear guardian fields
      this.registrationForm.patchValue({
        guardianName: '',
        guardianDob: '',
        guardianRelation: '',
        guardianPan: ''
      });

      // Remove guardian validators
      this.registrationForm.get('guardianName')?.clearValidators();
      this.registrationForm.get('guardianDob')?.clearValidators();
      this.registrationForm.get('guardianRelation')?.clearValidators();
    }

    // Update validation state
    this.registrationForm.get('guardianName')?.updateValueAndValidity();
    this.registrationForm.get('guardianDob')?.updateValueAndValidity();
    this.registrationForm.get('guardianRelation')?.updateValueAndValidity();

  }

  /* ---------------- DATE FORMAT ---------------- */

  private formatToISO(dateString: string | null): string | null {

    if (!dateString) return null;

    const parts = dateString.split('-');
    if (parts.length !== 3) return null;

    const [day, month, year] = parts;

    const isoDate = new Date(`${year}-${month}-${day}`);

    return isNaN(isoDate.getTime()) ? null : isoDate.toISOString();
  }

  /* ---------------- SUBMIT ---------------- */

  submit() {

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const existingData = this.registrationService.getData();
    const formData = new FormData();

    /* ---------- BASIC DETAILS ---------- */

    formData.append("Name", existingData.name || '');
    formData.append("Email", existingData.email || '');
    formData.append("Mobile", existingData.mobile || '');
    formData.append("Pan", existingData.pan || '');
    formData.append("Aadhar", existingData.aadhar || '');

    const dob = this.formatToISO(existingData.dob);
    if (dob) formData.append("Dob", dob);

    formData.append("Gender", existingData.gender || '');
    formData.append("PlaceOfBirth", existingData.placeOfBirth || '');
    formData.append("Nationality", existingData.nationality || '');

    /* ---------- ADDRESS ---------- */

    formData.append("PermanentAddress", existingData.permanentAddress || '');
    formData.append("CorrespondingAddress", existingData.correspondingAddress || '');
    formData.append("Pincode", existingData.pincode || '');

    /* ---------- BANK ---------- */

    formData.append("BankName", existingData.bankName || '');
    formData.append("AccountNumber", existingData.accountNumber || '');
    formData.append("BranchName", existingData.branchName || '');
    formData.append("IfscCode", existingData.ifscCode || '');
    formData.append("BranchAddress", existingData.branchAddress || '');
    formData.append("MicrCode", existingData.micrCode || '');



    //STATE AND CITY ID
    // State
    if (existingData.stateID !== undefined && existingData.stateID !== null) {
      formData.append("StateID", existingData.stateID.toString());
    }

    // City
    if (existingData.cityID !== undefined && existingData.cityID !== null) {
      formData.append("CityID", existingData.cityID.toString());
    }

    // Corresponding State
    if (existingData.correspondingState !== undefined && existingData.correspondingState !== null) {
      formData.append("CorrespondingState", existingData.correspondingState.toString());
    }

    // Corresponding City
    if (existingData.correspondingCity !== undefined && existingData.correspondingCity !== null) {
      formData.append("CorrespondingCity", existingData.correspondingCity.toString());
    }

    /* ---------- GUARDIAN (ONLY IF MINOR) ---------- */

    if (this.isMinor) {

      formData.append("NomineeName", this.registrationForm.value.nomineeName);
      formData.append("NomineeRelation", this.registrationForm.value.nomineeRelation);

      formData.append("NomineePercentage", this.registrationForm.value.nomineePercentage || '');
      formData.append("NomineeAddress", this.registrationForm.value.nomineeAddress || '');
      formData.append("NomineeGender", this.registrationForm.value.nomineeGender || '');
      formData.append("NomineeCountry", this.registrationForm.value.nomineeCountry || '');
      formData.append("NomineeState", this.registrationForm.value.nomineeState || '');
      formData.append("NomineeCity", this.registrationForm.value.nomineeCity || '');
      formData.append("NomineePincode", this.registrationForm.value.nomineePincode || '');
      formData.append("NomineeEmailId", this.registrationForm.value.nomineeEmailId || '');
      formData.append("NomineeMobileNo", this.registrationForm.value.nomineeMobileNo || '');
      const nomineeDob = this.formatToISO(this.registrationForm.value.nomineeDob);
      if (nomineeDob) formData.append("NomineeDob", nomineeDob);

      formData.append("GuardianName", this.registrationForm.value.guardianName);
      formData.append("GuardianRelation", this.registrationForm.value.guardianRelation);
      formData.append("GuardianPan", this.registrationForm.value.guardianPan || '');

      const guardianDob = this.formatToISO(this.registrationForm.value.guardianDob);
      if (guardianDob) formData.append("GuardianDob", guardianDob);
      formData.append("GuardianAddress", this.registrationForm.value.guardianAddress || '');
      formData.append("GuardianCountry", this.registrationForm.value.guardianCountry || '');
      formData.append("GuardianState", this.registrationForm.value.guardianState || '');
      formData.append("GuardianCity", this.registrationForm.value.guardianCity || '');
      formData.append("GuardianPincode", this.registrationForm.value.guardianPincode || '');
      formData.append("GuardianEmailId", this.registrationForm.value.guardianEmailId || '');
      formData.append("GuardianMobileNo", this.registrationForm.value.guardianMobileNo || '');

    }
    else {

      formData.append("NomineeName", this.registrationForm.value.nomineeName);
      formData.append("NomineeRelation", this.registrationForm.value.nomineeRelation);

      const nomineeDob = this.formatToISO(this.registrationForm.value.nomineeDob);
      if (nomineeDob) formData.append("NomineeDob", nomineeDob);

      formData.append("NomineePan", this.registrationForm.value.nomineePan);
      formData.append("NomineePercentage", this.registrationForm.value.nomineePercentage || '');
      formData.append("NomineeAddress", this.registrationForm.value.nomineeAddress || '');
      formData.append("NomineeGender", this.registrationForm.value.nomineeGender || '');
      formData.append("NomineeCountry", this.registrationForm.value.nomineeCountry || '');
      formData.append("NomineeState", this.registrationForm.value.nomineeState || '');
      formData.append("NomineeCity", this.registrationForm.value.nomineeCity || '');
      formData.append("NomineePincode", this.registrationForm.value.nomineePincode || '');
      formData.append("NomineeEmailId", this.registrationForm.value.nomineeEmailId || '');
      formData.append("NomineeMobileNo", this.registrationForm.value.nomineeMobileNo || '');

    }

    /* ---------- FILES ---------- */

    if (existingData.panFile)
      formData.append("PanCardFile", this.base64ToFile(existingData.panFile, "pan.pdf"));

    if (existingData.addressFile)
      formData.append("AddressFile", this.base64ToFile(existingData.addressFile, "address.pdf"));

    if (existingData.correspondingFile)
      formData.append("CorrespondingAddressFile", this.base64ToFile(existingData.correspondingFile, "corresponding.pdf"));

    if (existingData.bankStatementFile)
      formData.append("BankStatementFile", this.base64ToFile(existingData.bankStatementFile, "bank.pdf"));

    if (existingData.cancelChequeFile)
      formData.append("CancelChequeFile", this.base64ToFile(existingData.cancelChequeFile, "cheque.pdf"));

    /* ---------- API ---------- */

    console.log(existingData);
    this.http.post<any>('http://localhost:5048/api/clientregistrations', formData)
      .subscribe({
        next: res => {
          console.log("SUCCESS RESPONSE:", res);

          const clientId = res.clientId;

          const finalData1 = {
            Username: existingData.name,
            Password_1: existingData.Password_1,
            ClientId: clientId
          };

          this.http.post('http://localhost:5048/api/auth/store', finalData1)
            .subscribe({
              next: () => {
                Swal.fire({
                  icon: 'success',
                  title: 'Success!',
                  text: 'Registration successful!',
                  confirmButtonText: 'OK'
                }).then(() => {
                  this.registrationService.clearData();
                  this.router.navigate(['/login']);
                });
              
              },
              error: err => {
                console.error("Auth Store Error:", err);
                console.error("Server Response:", err.error);
                alert('Login store failed.');
              }
            });

        },
        error: err => {

          console.error("FULL ERROR OBJECT:", err);

          if (err.error) {
            console.error("SERVER ERROR MESSAGE:", err.error);
          }

          if (err.message) {
            console.error("ANGULAR ERROR MESSAGE:", err.message);
          }

          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Registration failed. Check console.',
            confirmButtonText: 'OK'
          });
        }
      });
  }
  base64ToFile(base64: string, filename: string): File {

    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;

    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });

  }
  goBack() {
    this.router.navigate(['/registration3']);
  }

}
