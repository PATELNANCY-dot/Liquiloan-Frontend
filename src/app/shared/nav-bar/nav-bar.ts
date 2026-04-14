import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AccountDetails } from '../../models/account-details.model';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterModule],
  templateUrl: './nav-bar.html',
  styleUrls: ['./nav-bar.css'],
})
export class NavBar {

  isNavCollapsed = true;
  accountDropdownOpen = false;
  nomineeDropdownOpen = false;
  profileOpen = false;
  account?: AccountDetails;
  activeMenu: string = 'dashboard';
  dropdownOpen: { [key: string]: boolean } = {};



  constructor(private router: Router, private cdr: ChangeDetectorRef, private http: HttpClient, private authService: AuthService) { }



    ngOnInit() {

      const clientId = this.authService.getUserId();

      console.log("ClientId from storage:", clientId);

      if (clientId) {

        this.http.get<AccountDetails>(
          `http://localhost:5048/api/AccountDetails/account/${clientId}`
        )
          .subscribe({
            next: (data) => {
              console.log("API DATA:", data);
              this.account = data;
            },
            error: (err) => {
              console.error("API ERROR:", err);
            }
          });

      }

    }
  

  setActive(menu: string) {
    this.activeMenu = menu;
  }

  toggleDropdown(menu: string) {
    this.dropdownOpen[menu] = !this.dropdownOpen[menu];
  }

  toggleAccountDropdown() {

    this.accountDropdownOpen = !this.accountDropdownOpen;

    // close other dropdown
    this.profileOpen = false;

  }

  toggleProfileDropdown() {

    this.profileOpen = !this.profileOpen;

    // close other dropdown
    this.accountDropdownOpen = false;

  }
  logout() {

    const loginId = this.authService.getLoginId();

    if (!loginId) return;

    this.authService.logout(loginId).subscribe({
      next: () => {

        // Clear session storage
        this.authService.clearUserId();
        this.authService.clearLoginId();
        this.authService.clearFpEmail();
        this.authService.clearFpClientId();

        this.router.navigate(['/home']);
      },

      error: () => {
        console.error("Logout failed");
      }
    });

  }


  /* CLOSE DROPDOWN WHEN CLICKING OUTSIDE */

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {

    const clickedInside = (event.target as HTMLElement).closest('.dropdown');

    if (!clickedInside) {
      this.accountDropdownOpen = false;
      this.nomineeDropdownOpen = false;
      this.profileOpen = false;
    }

  }

}
