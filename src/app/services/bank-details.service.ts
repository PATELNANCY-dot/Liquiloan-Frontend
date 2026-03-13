import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BankDetails {
  id?: number;
  bankName: string;
  accountNumber: bigint;
  branchName: string;
  ifscCode: string;
  micrCode: string;
  branchAddress: string;
  clientId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BankDetailsService {

  private apiUrl = 'http://localhost:5048/api/BankDetails';

  constructor(private http: HttpClient) { }

  getBankDetails(clientId: number): Observable<BankDetails[]> {
    return this.http.get<BankDetails[]>(`${this.apiUrl}/${clientId}`);
  }

  saveBankDetails(clientId: number, bankDetails: BankDetails[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${clientId}`, bankDetails);
  }
}
