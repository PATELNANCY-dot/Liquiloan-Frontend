import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { NomineeService, UpdateNominee } from '../services/nominee';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-change-nominee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './change-nominee.html',
  styleUrls: ['./change-nominee.css'],
})
export class ChangeNominee implements OnInit {
  nomineeForm!: FormGroup;

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

    this.addNominee(); // add first empty row

    const nomineeId = this.route.snapshot.paramMap.get('id');
    if (nomineeId) {
      this.nomineeService.getNomineeById(nomineeId).subscribe((data: any) => {
        // patch form including backend Id
        this.nominees.at(0).patchValue({
          id: data.id, // important for update
          nomineeName: data.nomineeName,
          nomineeRelation: data.nomineeRelation,
          nomineeDob: data.nomineeDob?.slice(0, 10),
          nomineePan: data.nomineePan,
          guardianName: data.guardianName,
          guardianRelation: data.guardianRelation,
          guardianDob: data.guardianDob?.slice(0, 10),
          guardianPan: data.guardianPan
        });
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

  // Called when nominee DOB changes
  onDobChange(index: number) {
    const nominee = this.nominees.at(index);
    if (!this.isMinor(nominee.value.nomineeDob)) {
      // Clear guardian fields if not minor
      nominee.patchValue({
        guardianName: null,
        guardianRelation: null,
        guardianDob: null,
        guardianPan: null,
      });
    }
  }

  // save nominees (POST for new, PUT for existing)
  updateNominee() {
    if (this.nomineeForm.invalid) return;

    const clientId = Number(localStorage.getItem('userId'));
    if (!clientId || clientId <= 0) return alert('Client ID missing');

    const payload: UpdateNominee[] = this.nominees.controls.map(control => {
      const n = control.value;
      const isMinor = this.isMinor(n.nomineeDob);

      return {
        id: n.id, // null for new, existing for update
        clientId: clientId,
        nomineeName: n.nomineeName || null,
        nomineeRelation: n.nomineeRelation || null,
        nomineeDob: n.nomineeDob ? new Date(n.nomineeDob).toISOString() : null,
        nomineePan: n.nomineePan || null,
        guardianName: isMinor ? n.guardianName || null : null,
        guardianRelation: isMinor ? n.guardianRelation || null : null,
        guardianDob: isMinor && n.guardianDob ? new Date(n.guardianDob).toISOString() : null,
        guardianPan: isMinor ? n.guardianPan || null : null
      };
    });

    console.log("Payload to backend:", payload);

    this.nomineeService.saveNominees(payload).subscribe({
      next: res => {
        alert(res); // backend se JSON message
        this.router.navigate(['/view-nominee']);
      },
      error: err => {
        console.error('Error saving nominees', err);
        const backendMessage = err.error?.message || err.error || 'Failed to save nominees';
        alert(backendMessage);
      }
    });
  }

   
  addNominee(existing: any = null) {
    if (this.nominees.length >= 3) {
      alert('A client can have maximum 3 nominees');
      return;
    }

    const group = this.fb.group({
      id: [existing?.id || null],
      nomineeName: [existing?.nomineeName || ''],
      nomineeRelation: [existing?.nomineeRelation || ''],
      nomineeDob: [existing?.nomineeDob?.slice(0, 10) || ''],
      nomineePan: [existing?.nomineePan || ''],
      guardianName: [existing?.guardianName || ''],
      guardianRelation: [existing?.guardianRelation || ''],
      guardianDob: [existing?.guardianDob?.slice(0, 10) || ''],
      guardianPan: [existing?.guardianPan || '']
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

      if (nominee.id) {
        // If existing nominee, delete from backend first
        this.nomineeService.deleteNominee(nominee.id).subscribe({
          next: () => {
            // Remove from form array after successful deletion
            this.nominees.removeAt(index);
            alert('Nominee deleted successfully');

          },
          error: err => {
            console.error('Error deleting nominee', err);
            alert('Failed to delete nominee. Check console.');
          }
        });
      } else {
        // Just remove from form array if it's a new, unsaved nominee
        this.nominees.removeAt(index);
      }
  }

  BACK() {
    this.router.navigate(['./view-nominee'])
  }


  }

