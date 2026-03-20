import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from './services/loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(private loaderService: LoaderService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    try {
      this.loaderService.show();
    } catch (e) {
      console.error('Loader show error', e);
    }

    return next.handle(req).pipe(
      finalize(() => {
        try {
          this.loaderService.hide();
        } catch (e) {
          console.error('Loader hide error', e);
        }
      })
    );
  }
}
