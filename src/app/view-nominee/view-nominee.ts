import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NomineeService } from '../services/nominee';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-view-nominee',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-nominee.html',
  styleUrls: ['./view-nominee.css']
})
export class ViewNominee implements OnInit {

  nominees: any[] = [];

  constructor(private nomineeService: NomineeService, private router: Router, private cdr: ChangeDetectorRef, private location: Location) { }

  ngOnInit(): void {
    this.loadNominees(); 
  }

  loadNominees() {
    this.nomineeService.getNominee().subscribe({
      next: (data: any) => {

        console.log("API DATA:", data);

        // Ensure we always assign an array
        if (Array.isArray(data)) {
          this.nominees = data;
        } else if (data?.$values) {
          this.nominees = data.$values;
        } else {
          this.nominees = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Nominee load failed", err);
      }
    });
  }

  changeNominee(id: number) {
    this.router.navigate(['/change-nominee', id]);
  }


  back() {
    this.router.navigate(['/dashboard'])
  }
}
