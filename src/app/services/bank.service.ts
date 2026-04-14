
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BankBranch {
  branchID: number;   
  branchName: string;
  cityID: number;
}

@Injectable({
  providedIn: 'root'
})
export class BankService {
  private apiUrl = 'http://localhost:5048/api/ClientRegistrations'; 

  constructor(private http: HttpClient) { }

  getBankBranches(cityId: number): Observable<BankBranch[]> {
    return this.http.get<BankBranch[]>(`${this.apiUrl}/bankBranch/${cityId}`);
  }
}
