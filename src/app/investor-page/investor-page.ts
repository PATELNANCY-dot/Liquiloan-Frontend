import { Component } from '@angular/core';
import { Router, } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-investor-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './investor-page.html',
  styleUrls: ['./investor-page.css']
})
export class InvestorPage {

  totalWithdrawable: number = 5000;
  showWithdrawPopup: boolean = false;
  withdrawAmount: number =0;
  selectedBank: string = '';


  constructor(private router: Router) { }

  openModal() {
    this.router.navigate(['/investment-page']);
  }

  goTo() {
    this.router.navigate(['/change-nominee']);
  }


  WithDraw() {
    alert('WithDrawal Request Send Successful!');
    this.showWithdrawPopup = false;
  }
  createAccount() {
    this.router.navigate(['/investor-details-page'])
  }
}
