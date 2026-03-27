import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private baseUrl = 'http://localhost:5048/api/auth';

  private _userId: string | null = null;
  private _fpEmail: string | null = null;
  private _fpClientId: string | null = null;

  constructor(private http: HttpClient) { }

  // ================= LOGIN =================

  setUserId(id: string) {
    this._userId = id;
    sessionStorage.setItem('userId', id); //  added
  }

  getUserId(): string | null {
    if (!this._userId) {
      this._userId = sessionStorage.getItem('userId'); //  added
    }
    return this._userId;
  }

  clearUserId() {
    this._userId = null;
    sessionStorage.removeItem('userId'); //  added
  }

  // ================= FORGOT PASSWORD EMAIL =================

  setFpEmail(email: string) {
    this._fpEmail = email;
    sessionStorage.setItem('fpEmail', email); //  added
  }

  getFpEmail(): string | null {
    if (!this._fpEmail) {
      this._fpEmail = sessionStorage.getItem('fpEmail'); //  added
    }
    return this._fpEmail;
  }

  clearFpEmail() {
    this._fpEmail = null;
    sessionStorage.removeItem('fpEmail'); //  added
  }

  // ================= FORGOT PASSWORD CLIENT ID =================

  setFpClientId(id: string) {
    this._fpClientId = id;
    sessionStorage.setItem('fpClientId', id); //  added
  }

  getFpClientId(): string | null {
    if (!this._fpClientId) {
      this._fpClientId = sessionStorage.getItem('fpClientId'); //  added
    }
    return this._fpClientId;
  }

  clearFpClientId() {
    this._fpClientId = null;
    sessionStorage.removeItem('fpClientId'); //  added
  }

  // ================= API CALLS =================

  storeLogin(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/store`, data);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, {
      email: email,
      password: password
    });
  }

  getLoginInfo(userId: string) {
    return this.http.get(`${this.baseUrl}/login-info/${userId}`);
  }

  logout(userId: string) {
    return this.http.post(`${this.baseUrl}/logout/${userId}`, {});
  }
}
