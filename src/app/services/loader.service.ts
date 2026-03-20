// src/app/services/loader.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private loader = document.getElementById('globalLoader');

  show() {
    this.loader?.classList.add('active');
  }

  hide() {
    this.loader?.classList.remove('active');
  }
}
