// registration-data.service.ts
import { ClientRegistration } from '../models/client-registration.model';
import { Injectable } from '@angular/core';

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
}
