
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


// faq.service.ts
@Injectable({ providedIn: 'root' })
export class FaqService {

  private apiUrl = 'http://localhost:5048/api/faq';

  constructor(private http: HttpClient) { }

  getFaqs() {
    return this.http.get<any[]>(this.apiUrl);
  }

  raiseQuery(data: any) {
    return this.http.post(`${this.apiUrl}/raise-query`, data);
  }
}
