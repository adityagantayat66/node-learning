import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private _http: HttpClient) { }

  getDashboardData(): Observable<any> {
    return this._http.get('http://localhost:3000/api/dashboard/getUserDetails');
  }

  updateRole(id: string, role: number): Observable<any> {
    return this._http.patch('http://localhost:3000/api/dashboard/updateRole', { id, role });
  }

  deleteUser(id: string): Observable<any> {
    return this._http.delete(`http://localhost:3000/api/dashboard/delete/${id}`);
  }
}
