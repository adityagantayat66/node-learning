import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private _http: HttpClient) {}

  register(regFormData: FormData): Observable<any> {
    return this._http.post(
      'http://localhost:8080/api/auth/signup',
      regFormData,
    );
  }
  login(loginFormData: FormData): Observable<any> {
    return this._http.post(
      'http://localhost:8080/api/auth/signin',
      loginFormData,
    );
  }
  storeToken(data: any): void {
    localStorage.setItem('access_id', data.token);
    localStorage.setItem('role', data.role === 'user' ? '0' : '1');
  }
  logout(): void {
    localStorage.clear();
  }
}
