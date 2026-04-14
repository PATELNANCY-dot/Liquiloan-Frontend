import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AccountDetails {
  clientId: number;
  name: string;
  email: string;
  mobile: string;
  pan: string;
  dob: string;
  gender: string;
  nationality: string;
  permanentAddress: string;
  bankName: string;
  accountNumber: string;
  stateName: string;
  cityName: string;
  correspondingStateName: string;
  correspondingCityName: string;
  guardianName: string;
  guardianRelation: string;
  guardianDob: string;
  guardianPan: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountDetailsService {

  private apiUrl = 'http://localhost:5048/api/ClientRegistrations';

  constructor(private http: HttpClient) { }

  getAccount(clientId: number): Observable<AccountDetails> {
    return this.http.get<AccountDetails>(`${this.apiUrl}/account/${clientId}`);
  }

}
