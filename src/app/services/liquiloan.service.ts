// liquiloan.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Liquiloan {
  liquiloan_id: number;
  clientId: number;
  activationStatus: string;
  Timest?: string;
  Mobile?: string;
  Email?: string;
  StateID?: number;
  CityID?: number;
  Pincode?: string;
}

@Injectable({ providedIn: 'root' })
export class LiquiloanService {
  [x: string]: any;
  private apiUrl = 'http://localhost:5048/api/liquiloan';

  constructor(private http: HttpClient) { }

  getByClient(clientId: number): Observable<Liquiloan> {
    return this.http.get<Liquiloan>(`http://localhost:5048/api/Liquiloan/${clientId}`);
  }
}
