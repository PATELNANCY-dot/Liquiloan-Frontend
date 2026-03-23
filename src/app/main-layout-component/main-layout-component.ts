import { Component } from '@angular/core';
import { NavBar } from '../shared/nav-bar/nav-bar';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavBar, RouterOutlet, CommonModule, Footer],
 template: `
  <div class="app-layout">

    <app-nav-bar></app-nav-bar>

    <div class="page-container">
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>

      <app-footer></app-footer>
    </div>

  </div>
`
})
export class MainLayoutComponent { }
