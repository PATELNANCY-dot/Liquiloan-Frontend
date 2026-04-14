import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private baseUrl = 'http://localhost:5048/api/auth';

  // CLIENT ID (used for account related APIs)
  private _userId: string | null = null;

  // LOGIN ID (used for login-info and logout)
  private _loginId: string | null = null;

  private _fpEmail: string | null = null;
  private _fpClientId: string | null = null;

  constructor(private http: HttpClient) { }

  // ================= CLIENT ID =================

  setUserId(id: string) {
    this._userId = id;
    sessionStorage.setItem('clientId', id);
  }

  getUserId(): string | null {
    if (!this._userId) {
      this._userId = sessionStorage.getItem('clientId');
    }
    return this._userId;
  }

  clearUserId() {
    this._userId = null;
    sessionStorage.removeItem('clientId');
  }

  // ================= LOGIN ID =================

  setLoginId(id: string) {
    this._loginId = id;
    sessionStorage.setItem('loginId', id);
  }

  getLoginId(): string | null {
    if (!this._loginId) {
      this._loginId = sessionStorage.getItem('loginId');
    }
    return this._loginId;
  }

  clearLoginId() {
    this._loginId = null;
    sessionStorage.removeItem('loginId');
  }

  // ================= FORGOT PASSWORD EMAIL =================

  setFpEmail(email: string) {
    this._fpEmail = email;
    sessionStorage.setItem('fpEmail', email);
  }

  getFpEmail(): string | null {
    if (!this._fpEmail) {
      this._fpEmail = sessionStorage.getItem('fpEmail');
    }
    return this._fpEmail;
  }

  clearFpEmail() {
    this._fpEmail = null;
    sessionStorage.removeItem('fpEmail');
  }

  // ================= FORGOT PASSWORD CLIENT ID =================

  setFpClientId(id: string) {
    this._fpClientId = id;
    sessionStorage.setItem('fpClientId', id);
  }

  getFpClientId(): string | null {
    if (!this._fpClientId) {
      this._fpClientId = sessionStorage.getItem('fpClientId');
    }
    return this._fpClientId;
  }

  clearFpClientId() {
    this._fpClientId = null;
    sessionStorage.removeItem('fpClientId');
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

  getLoginInfo(loginId: string) {
    return this.http.get(`${this.baseUrl}/login-info/${loginId}`);
  }

  logout(loginId: string) {
    return this.http.post(`${this.baseUrl}/logout/${loginId}`, {});
  }
}
