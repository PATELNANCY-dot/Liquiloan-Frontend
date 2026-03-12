// services/nominee.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UpdateNominee {

  id?: number | null;
  clientId: number;

  nomineeName?: string | null;
  nomineeRelation?: string | null;
  nomineeDob?: string | null;
  nomineePan?: string | null;

  nomineePersentage?: number | null;
  nomineeGender?: string | null;
  nomineeAddress?: string | null;
  nomineeCountry?: string | null;
  nomineeState?: string | null;
  nomineeCity?: string | null;
  nomineePincode?: string | null;
  nomineeDocumentType?: string | null;
  nomineeEmailId?: string | null;
  MobileNo?: string | null;

  guardianName?: string | null;
  guardianRelation?: string | null;
  guardianDob?: string | null;
  guardianPan?: string | null;

  guardianAddress?: string | null;
  guardianCity?: string | null;
  guardianState?: string | null;
  guardianCountry?: string | null;
  guardianPincode?: string | null;
  guardianEmailId?: string | null;
  guardianMobileNo?: string | null;   // add this
}

@Injectable({
  providedIn: 'root'
})
export class NomineeService {
  private apiUrl = 'http://localhost:5048/api/Nominee';

  constructor(private http: HttpClient) { }

  deleteNominee(id: number) {
    return this.http.delete(`${this.apiUrl}/DeleteNominee/${id}`);
  }

  getNominee(): Observable<UpdateNominee[]> {
    const clientId = Number(localStorage.getItem('userId'));
    return this.http.get<UpdateNominee[]>(`${this.apiUrl}/${clientId}`);
  }

  getNomineeById(id: any) {
    return this.http.get(`${this.apiUrl}/single/${id}`);
  }

  saveNominees(nominees: UpdateNominee[]) {
    return this.http.post('http://localhost:5048/api/Nominee/UpsertNominees', nominees, { responseType: 'text' });
  }

  // nominee.service.ts
  upsertNominees(nominees: UpdateNominee[]) {
    return this.http.post(`${this.apiUrl}/UpsertNominees`, nominees);
  }
}
