import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, } from '@angular/router';
import { CommonModule } from '@angular/common'; 


@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './nav-bar.html',
  styleUrls: ['./nav-bar.css'],
})
export class NavBar {


  isNavCollapsed = true;
  accountDropdownOpen = false;
  nomineeDropdownOpen = false;


  activeMenu: string = 'dashboard';
  dropdownOpen: { [key: string]: boolean } = {};
  constructor(private router: Router) { }

  setActive(menu: string) {
    this.activeMenu = menu;
  }

  toggleDropdown(menu: string) {
    this.dropdownOpen[menu] = !this.dropdownOpen[menu];
  }


}
