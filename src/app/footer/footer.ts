import { Component } from '@angular/core';
import { AuthService } from '../services/auth';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {

  lastLogin = '';
  lastLogout = '';
  attempts = 0;


  constructor(
    private authService: AuthService,

  ) { }

  ngOnInit(): void {

    const userId = this.authService.getUserId();
    if (userId) {
      this.authService.getLoginInfo(userId).subscribe((res: any) => {
        this.lastLogin = res.lastLogin;
        this.lastLogout = res.lastLogout;
        this.attempts = res.loginAttempts;
      });
    }

  }
}
