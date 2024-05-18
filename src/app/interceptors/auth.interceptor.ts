import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!request.url.includes("api.openrouteservice.org")) {
      const accessToken = localStorage.getItem("accessToken");
      
      const authRequest = request.clone({
        setHeaders: { 
          'Authorization': `Bearer ${accessToken}`,
        }
      });
      
    
      return next.handle(authRequest);
    }
    return next.handle(request);
  }
}