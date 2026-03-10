import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NomineeService, UpdateNominee } from '../services/nominee';
import { ChangeDetectorRef } from '@angular/core';


declare var bootstrap: any;

@Component({
  selector: 'app-investor-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './investor-page.html',
  styleUrls: ['./investor-page.css']
})
export class InvestorPage implements OnInit {
  nomineesList: UpdateNominee[] = [];
  showWithdrawPopup: boolean = false;
  withdrawAmount: number = 0;
  selectedBank: string = '';
  totalWithdrawable: number = 5000;

  constructor(private router: Router, private nomineeService: NomineeService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    const clientId = Number(localStorage.getItem('userId'));
    if (!clientId) return alert('Client ID missing');

    this.fetchNominees();
  }

  fetchNominees() {
    const clientId = Number(localStorage.getItem('userId'));
    if (!clientId) return alert('Client ID missing');

    this.nomineeService.getNominee().subscribe({
      next: (data: UpdateNominee[]) => {
        this.nomineesList = data;
      },
      error: (err) => {
        console.error('Error fetching nominees', err);
      }
    });
  }

  openNomineeModal() {
    const clientId = Number(localStorage.getItem('userId'));
    if (!clientId) return alert('Client ID missing');

    this.nomineeService.getNominee().subscribe({
      next: (data: UpdateNominee[]) => {
        this.cdr.detectChanges(); // <-- force Angular to refresh view
        this.nomineesList = data;

        const modalEl: any = document.getElementById('nomineeModal');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      },
      error: (err) => {
        console.error('Error fetching nominees', err);
        alert('Failed to fetch nominees.');
      }
    });
  }

  editNominee(nominee: UpdateNominee) {
    const modalEl: any = document.getElementById('nomineeModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);

    if (modalInstance) {
      modalInstance.hide(); // hide the modal and remove backdrop
    }

    // Navigate after hiding
    this.router.navigate(['/change-nominee', nominee.id]);
  }

  openModal() {
    this.router.navigate(['/investment-page']);
  }

  goTo() {
    this.router.navigate(['/change-nominee']);
  }

  WithDraw() {
    alert('Withdrawal Request Sent Successfully!');
    this.showWithdrawPopup = false;
  }

  createAccount() {
    this.router.navigate(['/investor-details-page']);
  }
}
