import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import flatpickr from 'flatpickr';
import { RegistrationDataService } from '../services/ client-registration.service';


@Component({
  selector: 'app-registration2',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration2.html',
  styleUrls: ['./registration2.css'],
})
export class Registration2 {

  registrationForm: FormGroup;
  step = 2;
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  correspondingStates: any[] = [];
  correspondingCities: any[] = [];

  apiUrl = 'http://localhost:5048/api/ClientRegistrations';
    fpInstance: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private registrationService: RegistrationDataService
  ) {

    this.registrationForm = this.fb.group({
      pan: [
        '',
        [
          Validators.required,
        ]
      ],

    //  dob: ['', [Validators.required,],
      dob: ['', [Validators.required, this.ageValidator]],

    


      aadhar: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{12}$/)
        ]
      ],

      nationality: ['', Validators.required],

      placeOfBirth: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],

      stateID: [null, Validators.required],
      cityID: [null, Validators.required],
      correspondingState: [null, Validators.required],
      correspondingCity: [null, Validators.required],

      permanentAddress: [
        '',
        [
          Validators.required,
          Validators.minLength(10)
        ]
      ],

      correspondingAddress: [
        '',
        [
          Validators.required,
          Validators.minLength(10)
        ]
      ],

      pincode: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[1-9][0-9]{5}$/)
        ]
      ],

      gender: ['', Validators.required]
    });

    const savedData = JSON.parse(localStorage.getItem('clientRegistration') || '{}');
    this.registrationForm.patchValue(savedData);
  }

  //age validater
  ageValidator(control: any) {

    if (!control.value) return null;

    const parts = control.value.split('-');
    const dob = new Date(parts[2], parts[1] - 1, parts[0]);

    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age >= 18 ? null : { underAge: true };
  }
  //

  ngOnInit() {

    const savedData = this.registrationService.getData();
    this.registrationForm.patchValue(savedData);
    this.loadCountries();
  }

  // ===============================
  // Load Countries
  // ===============================
  loadCountries() {
    this.http.get<any[]>(`${this.apiUrl}/countries`)
      .subscribe(data => {
        this.countries = data;
      });
  }

  // ===============================
  // When Country Changes → Load States
  // ===============================
  onCountryChange(countryId: number) {

    if (!countryId) return;

    this.http.get<any[]>(`${this.apiUrl}/states/${countryId}`).subscribe(res => {

      this.states = res;
      this.correspondingStates = res;

      this.cities = [];
      this.correspondingCities = [];

      this.registrationForm.patchValue({
        stateID: null,
        cityID: null,
        correspondingState: null,
        correspondingCity: null
      });

    });

  }

  // State changed → load cities
  onStateChange() {
    const stateId = this.registrationForm.get('stateID')?.value;
    if (!stateId) return;
    this.http.get<any[]>(`${this.apiUrl}/cities/${stateId}`).subscribe(res => this.cities = res);
  }

  // Corresponding state → load corresponding cities
  onCorrespondingStateChange() {
    const stateId = this.registrationForm.get('correspondingState')?.value;
    if (!stateId) {
      this.correspondingCities = [];
      this.registrationForm.patchValue({ correspondingCity: null });
      return;
    }
    this.http.get<any[]>(`${this.apiUrl}/cities/${stateId}`).subscribe(res => this.correspondingCities = res);
  }
  // ===============================
  // Next Button
  // ===============================
  async goNext() {

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const formValue = this.registrationForm.value;

    const updatedData: any = {
      pan: formValue.pan,
      dob: formValue.dob,
      aadhar: formValue.aadhar,
      nationality: formValue.nationality,
      placeOfBirth: formValue.placeOfBirth,
      gender: formValue.gender,
      stateID: Number(formValue.stateID),
      cityID: Number(formValue.cityID),
      correspondingState: Number(formValue.correspondingState),
      correspondingCity: Number(formValue.correspondingCity),
      permanentAddress: formValue.permanentAddress,
      correspondingAddress: formValue.correspondingAddress,
      pincode: formValue.pincode
    };

    if (this.selectedPanFile)
      updatedData.panFile = await this.fileToBase64(this.selectedPanFile);

    if (this.selectedAddressFile)
      updatedData.addressFile = await this.fileToBase64(this.selectedAddressFile);

    if (this.selectedCorrespondingAddressFile)
      updatedData.correspondingFile = await this.fileToBase64(this.selectedCorrespondingAddressFile);

    this.registrationService.setData(updatedData);

    this.router.navigate(['/registration3']);
  }

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {

      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = error => {
        reject(error);
      };

    });
  }

  goBack() {
    this.router.navigate(['/registration1']);
  }

  //file upload
  // Separate variables for each upload
  selectedPanFile: File | null = null;
  selectedAddressFile: File | null = null;
  selectedCorrespondingAddressFile: File | null = null;

  filePreviewPan: string | ArrayBuffer | null = null;
  filePreviewAddress: string | ArrayBuffer | null = null;
  filePreviewCorresponding: string | ArrayBuffer | null = null;

  // PAN
  onPanFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedPanFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.filePreviewPan = reader.result;
      reader.readAsDataURL(this.selectedPanFile);
    }
  }
  removePanFile() {
    this.selectedPanFile = null;
    this.filePreviewPan = null;
    const input = document.getElementById('panUpload') as HTMLInputElement;
    if (input) input.value = '';
  }
  openPanFile() {
    if (this.filePreviewPan) {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${this.filePreviewPan}" frameborder="0" style="width:100%;height:100%;"></iframe>`);
      }
    }
  }

  // Address Proof
  onAddressFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedAddressFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.filePreviewAddress = reader.result;
      reader.readAsDataURL(this.selectedAddressFile);
    }
  }
  removeAddressFile() {
    this.selectedAddressFile = null;
    this.filePreviewAddress = null;
    const input = document.getElementById('addressUpload') as HTMLInputElement;
    if (input) input.value = '';
  }
  openAddressFile() {
    if (this.filePreviewAddress) {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${this.filePreviewAddress}" frameborder="0" style="width:100%;height:100%;"></iframe>`);
      }
    }
  }

  // Corresponding Address Proof
  onCorrespondingAddressFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedCorrespondingAddressFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.filePreviewCorresponding = reader.result;
      reader.readAsDataURL(this.selectedCorrespondingAddressFile);
    }
  }
  removeCorrespondingAddressFile() {
    this.selectedCorrespondingAddressFile = null;
    this.filePreviewCorresponding = null;
    const input = document.getElementById('correspondingAddressUpload') as HTMLInputElement;
    if (input) input.value = '';
  }
  openCorrespondingAddressFile() {
    if (this.filePreviewCorresponding) {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${this.filePreviewCorresponding}" frameborder="0" style="width:100%;height:100%;"></iframe>`);
      }
    }
  }
  //



  ///custome dropdown code
  // Dropdown open states
  countryDropdownOpen = false;
  stateDropdownOpen = false;
  cityDropdownOpen = false;
  correspondingStateDropdownOpen = false;
  correspondingCityDropdownOpen = false;

  toggleCountry() {
    this.countryDropdownOpen = !this.countryDropdownOpen;
  }

  toggleState() {
    this.stateDropdownOpen = !this.stateDropdownOpen;
  }

  toggleCity() {
    this.cityDropdownOpen = !this.cityDropdownOpen;
  }

  toggleCorrespondingState() {
    this.correspondingStateDropdownOpen = !this.correspondingStateDropdownOpen;
  }

  toggleCorrespondingCity() {
    this.correspondingCityDropdownOpen = !this.correspondingCityDropdownOpen;
  }

  selectCountry(country: any) {

    this.registrationForm.patchValue({
      nationality: country.countryName
    });

    this.onCountryChange(country.countryID);

    this.countryDropdownOpen = false;
  }

  selectState(state: any) {
    this.registrationForm.patchValue({ stateID: state.stateID });
    this.stateDropdownOpen = false;
    this.onStateChange();
  }

  selectCity(city: any) {
    this.registrationForm.patchValue({ cityID: city.cityID });
    this.cityDropdownOpen = false;
  }

  selectCorrespondingState(state: any) {
    this.registrationForm.patchValue({ correspondingState: state.stateID });
    this.correspondingStateDropdownOpen = false;
    this.onCorrespondingStateChange();
  }

  selectCorrespondingCity(city: any) {
    this.registrationForm.patchValue({ correspondingCity: city.cityID });
    this.correspondingCityDropdownOpen = false;
  }




  // ================= DISPLAY HELPERS =================

  getSelectedCountryName(): string {
    const name = this.registrationForm.get('nationality')?.value;
    const country = this.countries.find(c => c.countryName == name);
    return country ? country.countryName : 'Select Country';
  }

  getSelectedStateName(): string {
    const id = this.registrationForm.get('stateID')?.value;
    const state = this.states.find(s => s.stateID == id);
    return state ? state.stateName : 'Select State';
  }

  getSelectedCorrespondingStateName(): string {
    const id = this.registrationForm.get('correspondingState')?.value;
    const state = this.correspondingStates.find(s => s.stateID == id);
    return state ? state.stateName : 'Select State';
  }

  getSelectedCityName(): string {
    const id = this.registrationForm.get('cityID')?.value;
    const city = this.cities.find(c => c.cityID == id);
    return city ? city.cityName : 'Select City';
  }

  getSelectedCorrespondingCityName(): string {
    const id = this.registrationForm.get('correspondingCity')?.value;
    const city = this.correspondingCities.find(c => c.cityID == id);
    return city ? city.cityName : 'Select City';
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!target.closest('.custom-dropdown')) {
      this.countryDropdownOpen = false;
      this.stateDropdownOpen = false;
      this.cityDropdownOpen = false;
      this.correspondingStateDropdownOpen = false;
      this.correspondingCityDropdownOpen = false;
    }
  }

  //custome datebox
  @ViewChild('dobInput') dobInput!: ElementRef;

  

  ngAfterViewInit() {
    this.fpInstance = flatpickr(this.dobInput.nativeElement, {
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
    if (this.fpInstance.isOpen) {
      this.fpInstance.close();
    } else {
      this.fpInstance.open();
    }
  }
}




