// registration-data.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class RegistrationDataService {

  private registrationData: any = {};

  setData(data: any) {
    this.registrationData = {
      ...this.registrationData,
      ...data
    };
  }

  getData() {
    return this.registrationData;
  }

  clearData() {
    this.registrationData = {};
  }

  private apiUrl = 'http://localhost:5048/api/ClientRegistrations';

  constructor(private http: HttpClient) { }

  changeEmail(clientId: number, newEmail: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-email`, { clientId, newEmail });
  }

  changeMobile(clientId: number, newMobile: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-mobile`, { clientId, newMobile });
  }
}


