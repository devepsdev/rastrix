import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryRequest, CategoryResponse } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);

  list(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>('/api/categories');
  }

  create(request: CategoryRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>('/api/categories', request);
  }

  update(id: number, request: CategoryRequest): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(`/api/categories/${id}`, request);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`/api/categories/${id}`);
  }
}
