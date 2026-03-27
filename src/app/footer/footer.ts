import { Component, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../services/auth';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {

  lastLogin: Date | null = null;
  lastLogout: Date | null = null;
  attempts = 0;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    const userId = this.authService.getUserId();

    if (userId) {
      this.authService.getLoginInfo(userId).subscribe((res: any) => {

        this.lastLogin = res.lastLogin ? new Date(res.lastLogin) : null;
        this.lastLogout = res.lastLogout ? new Date(res.lastLogout) : null;
        this.attempts = res.loginAttempts;

        this.cdr.detectChanges();   // ⭐ Fix
      });
    }
  }
}
