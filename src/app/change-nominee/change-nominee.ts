import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { NomineeService, UpdateNominee } from '../services/nominee';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-nominee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './change-nominee.html',
  styleUrls: ['./change-nominee.css'],
})
export class ChangeNominee implements OnInit {
  nomineeForm!: FormGroup;
  guardianBackup: { [index: number]: any } = {};

  constructor(
    private fb: FormBuilder,
    private nomineeService: NomineeService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.nomineeForm = this.fb.group({
      nominees: this.fb.array([])
    });

    const storedNominees = this.nomineeService.getStoredNominees();

    if (storedNominees && storedNominees.length > 0) {

      console.log("Using stored nominees");
      storedNominees.forEach((nominee: any) => {
        this.addNominee(nominee);
      });

    } else {

      console.log("Fetching from API (refresh case)");

      this.nomineeService.getNominee().subscribe((data: any) => {

        const list = Array.isArray(data) ? data : data?.$values || [];

        //  IMPORTANT: clear existing form array first
        this.nominees.clear();

        list.forEach((nominee: any) => {
          this.addNominee(nominee);
        });

        this.cdr.detectChanges(); // force UI update
      });
    }
  }

  get nominees(): FormArray {
    return this.nomineeForm.get('nominees') as FormArray;
  }

  // check if nominee is minor
  isMinor(dob: string | null | undefined): boolean {
    if (!dob) return false;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age < 18;
  }

  // Helper to disable PAN input
  disablePan(nominee: any): boolean {
    return this.isMinor(nominee.nomineeDob);
  }

  onDobChange(index: number) {
    const nominee = this.nominees.at(index);
    const dob = nominee.get('nomineeDob')?.value;
    const isMinorNow = this.isMinor(dob);

    // store guardian data before clearing (only if not already stored)
    if (!this.guardianBackup[index]) {
      this.guardianBackup[index] = {
        guardianName: nominee.get('guardianName')?.value,
        guardianRelation: nominee.get('guardianRelation')?.value,
        guardianDob: nominee.get('guardianDob')?.value,
        guardianPan: nominee.get('guardianPan')?.value,
        guardianAddress: nominee.get('guardianAddress')?.value,
        guardianCity: nominee.get('guardianCity')?.value,
        guardianState: nominee.get('guardianState')?.value,
        guardianCountry: nominee.get('guardianCountry')?.value,
        guardianPincode: nominee.get('guardianPincode')?.value,
        guardianEmailId: nominee.get('guardianEmailId')?.value,
        guardianMobileNo: nominee.get('guardianMobileNo')?.value
      };
    }

    if (!isMinorNow) {
      // clear guardian fields if adult
      nominee.patchValue({
        guardianName: null,
        guardianRelation: null,
        guardianDob: null,
        guardianPan: null,
        guardianAddress: null,
        guardianCity: null,
        guardianState: null,
        guardianCountry: null,
        guardianPincode: null,
        guardianEmailId: null,
        guardianMobileNo: null
      });
    } else {
      // restore from backup if switching back to minor
      nominee.patchValue(this.guardianBackup[index]);
    }
  }

  // save nominees (POST for new, PUT for existing)
  updateNominee() {

    if (this.nomineeForm.invalid) return;

    // ✅ STEP 1: Calculate total percentage
    const total = this.nominees.controls
      .map(c => Number(c.value.nomineePersentage || 0))
      .reduce((a, b) => a + b, 0);

    // ✅ STEP 2: Validate total = 100
    if (total !== 100) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Percentage',
        text: 'Total nominee percentage must be exactly 100%'
      });
      return;
    }

    // ✅ STEP 3: Continue your existing logic
    const clientId = Number(localStorage.getItem('userId'));
    if (!clientId || clientId <= 0) {
      alert('Client ID missing');
      return;
    }

    const payload: UpdateNominee[] = this.nominees.controls.map(control => {
      const n = control.value;
      const isMinor = this.isMinor(n.nomineeDob);

      return {
        id: n.id,
        clientId: clientId,

        nomineeName: n.nomineeName || null,
        nomineeRelation: n.nomineeRelation || null,
        nomineeDob: n.nomineeDob ? new Date(n.nomineeDob).toISOString() : null,
        nomineePan: n.nomineePan || null,

        nomineePersentage: n.nomineePersentage || null,
        nomineeGender: n.nomineeGender || null,
        nomineeAddress: n.nomineeAddress || null,
        nomineeCountry: n.nomineeCountry || null,
        nomineeState: n.nomineeState || null,
        nomineeCity: n.nomineeCity || null,
        nomineePincode: n.nomineePincode || null,
        nomineeDocumentType: n.nomineeDocumentType || null,
        nomineeEmailId: n.nomineeEmailId || null,
        MobileNo: n.MobileNo || n.mobileNo || null,

        guardianName: isMinor ? n.guardianName || null : null,
        guardianRelation: isMinor ? n.guardianRelation || null : null,
        guardianDob: isMinor && n.guardianDob ? new Date(n.guardianDob).toISOString() : null,
        guardianPan: isMinor ? n.guardianPan || null : null,

        guardianAddress: isMinor ? n.guardianAddress || null : null,
        guardianCity: isMinor ? n.guardianCity || null : null,
        guardianState: isMinor ? n.guardianState || null : null,
        guardianCountry: isMinor ? n.guardianCountry || null : null,
        guardianPincode: isMinor ? n.guardianPincode || null : null,
        guardianEmailId: isMinor ? n.guardianEmailId || null : null,
        guardianMobileNo: isMinor ? n.guardianMobileNo || null : null
      };
    });

    console.log("Payload to backend:", payload);

    this.nomineeService.saveNominees(payload).subscribe({
      next: res => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Nominee updated successfully',
          confirmButtonColor: '#ff7a00'
        }).then(() => {
          this.router.navigate(['/view-nominee']);
        });
      },
      error: err => {
        console.error('Error saving nominees', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Failed to save nominees'
        });
      }
    });
  }


   
  addNominee(existing: any = null) {
    if (this.nominees.length >= 3) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "you can only add 3 nomisee"
      });
      return;
    }

    const group = this.fb.group({
      id: [existing?.id || null],

      nomineeName: [existing?.nomineeName || ''],
      nomineeRelation: [existing?.nomineeRelation || ''],
      nomineeDob: [existing?.nomineeDob?.slice(0, 10) || ''],
      nomineePan: [existing?.nomineePan || ''],

      nomineePersentage: [existing?.nomineePersentage || ''],
      nomineeGender: [existing?.nomineeGender || ''],
      nomineeAddress: [existing?.nomineeAddress || ''],
      nomineeCountry: [existing?.nomineeCountry || ''],
      nomineeState: [existing?.nomineeState || ''],
      nomineeCity: [existing?.nomineeCity || ''],
      nomineePincode: [existing?.nomineePincode || ''],
      nomineeDocumentType: [existing?.nomineeDocumentType || ''],
      nomineeEmailId: [existing?.nomineeEmailId || ''],
      MobileNo: [existing?.mobileNo || ''],

      guardianName: [existing?.guardianName || ''],
      guardianRelation: [existing?.guardianRelation || ''],
      guardianDob: [existing?.guardianDob?.slice(0, 10) || ''],
      guardianPan: [existing?.guardianPan || ''],

      guardianAddress: [existing?.guardianAddress || ''],
      guardianCity: [existing?.guardianCity || ''],
      guardianState: [existing?.guardianState || ''],
      guardianCountry: [existing?.guardianCountry || ''],
      guardianPincode: [existing?.guardianPincode || ''],
      guardianEmailId: [existing?.guardianEmailId || ''],
      guardianMobileNo: [existing?.guardianMobileNo || ''],
    });

    const toggleFields = (dob: string) => {
      const isMinor = this.isMinor(dob);

      const panControl = group.get('nomineePan');
      const guardianControls = ['guardianName', 'guardianRelation', 'guardianDob', 'guardianPan'];

      if (isMinor) {
        panControl?.disable({ emitEvent: false });
        panControl?.setValue('', { emitEvent: false });
        guardianControls.forEach(ctrl => group.get(ctrl)?.enable({ emitEvent: false }));
      } else {
        panControl?.enable({ emitEvent: false });
        guardianControls.forEach(ctrl => {
          const c = group.get(ctrl);
          c?.disable({ emitEvent: false });
          c?.setValue('', { emitEvent: false });
        });
      }
    };

    group.get('nomineeDob')?.valueChanges.subscribe(dob => toggleFields(dob));
    toggleFields(group.get('nomineeDob')?.value);

    this.nominees.push(group);
  }

 

  removeNominee(index: number) {
    const nominee = this.nominees.at(index).value;

    // ✅ CASE 1: NEW nominee (no id) → delete directly
    if (!nominee.id) {
      this.nominees.removeAt(index);
      this.cdr.detectChanges();
      return;
    }

    // ✅ CASE 2: EXISTING nominee → show confirmation
    Swal.fire({
      title: 'Delete Nominee?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff7a00',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {

        this.nomineeService.deleteNominee(nominee.id).subscribe({
          next: () => {
            this.nominees.removeAt(index);
            this.cdr.detectChanges();

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Nominee deleted successfully',
              confirmButtonColor: '#ff7a00'
            });
          },
          error: err => {
            console.error('Error deleting nominee', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete nominee'
            });
          }
        });

      }
    });
  }

  BACK() {
    this.router.navigate(['./view-nominee'])
  }


  }

