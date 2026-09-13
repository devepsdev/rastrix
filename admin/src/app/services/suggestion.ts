import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResponse, SuggestionResponse, SuggestionStatus } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class SuggestionService {
  private http = inject(HttpClient);

  list(status: SuggestionStatus | null, page: number, size: number): Observable<PageResponse<SuggestionResponse>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'fechaCreacion,desc');
    if (status) params = params.set('status', status);
    return this.http.get<PageResponse<SuggestionResponse>>('/api/admin/suggestions', { params });
  }

  get(id: number): Observable<SuggestionResponse> {
    return this.http.get<SuggestionResponse>(`/api/admin/suggestions/${id}`);
  }

  approve(id: number, marketId: number): Observable<SuggestionResponse> {
    return this.http.put<SuggestionResponse>(`/api/admin/suggestions/${id}/approve`, { marketId });
  }

  reject(id: number, reason: string): Observable<SuggestionResponse> {
    return this.http.put<SuggestionResponse>(`/api/admin/suggestions/${id}/reject`, { reason });
  }
}
