import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse, Role, UserResponse } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  list(page: number, size: number): Observable<PageResponse<UserResponse>> {
    const params = new HttpParams().set('page', page).set('size', size).set('sort', 'fechaCreacion,desc');
    return this.http.get<PageResponse<UserResponse>>('/api/users', { params });
  }

  updateRole(id: number, role: Role): Observable<UserResponse> {
    return this.http.put<UserResponse>(`/api/users/${id}/role`, { role });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`/api/users/${id}`);
  }
}
