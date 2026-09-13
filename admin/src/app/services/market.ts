import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  MarketCategoryResponse,
  MarketImageResponse,
  MarketRequest,
  MarketResponse,
  PageResponse,
} from '../models/api.model';

export interface MarketSearch {
  active: boolean | null;
  query: string;
  page: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class MarketService {
  private http = inject(HttpClient);

  /** Listado del panel: incluye los mercados ocultos. */
  search({ active, query, page, size }: MarketSearch): Observable<PageResponse<MarketResponse>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'fechaActualizacion,desc');
    if (active !== null) params = params.set('active', active);
    if (query.trim()) params = params.set('q', query.trim());
    return this.http.get<PageResponse<MarketResponse>>('/api/admin/markets', { params });
  }

  get(id: number): Observable<MarketResponse> {
    return this.http.get<MarketResponse>(`/api/admin/markets/${id}`);
  }

  create(request: MarketRequest): Observable<MarketResponse> {
    return this.http.post<MarketResponse>('/api/markets', request);
  }

  update(id: number, request: MarketRequest): Observable<MarketResponse> {
    return this.http.put<MarketResponse>(`/api/markets/${id}`, request);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`/api/markets/${id}`);
  }

  /** No hay endpoint parcial: se reenvía el mercado completo cambiando solo la publicación. */
  setActive(market: MarketResponse, active: boolean): Observable<MarketResponse> {
    return this.update(market.id, { ...toRequest(market), active });
  }

  categoryLinks(marketId: number): Observable<MarketCategoryResponse[]> {
    return this.http.get<MarketCategoryResponse[]>(`/api/market-categories/market/${marketId}`);
  }

  linkCategory(marketId: number, categoryId: number): Observable<MarketCategoryResponse> {
    return this.http.post<MarketCategoryResponse>('/api/market-categories', { marketId, categoryId });
  }

  unlinkCategory(linkId: number): Observable<void> {
    return this.http.delete<void>(`/api/market-categories/${linkId}`);
  }

  images(marketId: number): Observable<MarketImageResponse[]> {
    return this.http.get<MarketImageResponse[]>(`/api/market-images/market/${marketId}`);
  }

  addImage(marketId: number, imageUrl: string, order: number): Observable<MarketImageResponse> {
    return this.http.post<MarketImageResponse>('/api/market-images', { marketId, imageUrl, order });
  }

  removeImage(imageId: number): Observable<void> {
    return this.http.delete<void>(`/api/market-images/${imageId}`);
  }
}

export function toRequest(market: MarketResponse): MarketRequest {
  return {
    name: market.name,
    description: market.description,
    address: market.address,
    city: market.city,
    province: market.province,
    postalCode: market.postalCode,
    latitude: market.latitude,
    longitude: market.longitude,
    frequency: market.frequency,
    dayOfWeek: market.dayOfWeek,
    startDate: market.startDate,
    endDate: market.endDate,
    startTime: market.startTime,
    endTime: market.endTime,
    mainImage: market.mainImage,
    organizer: market.organizer,
    contactPhone: market.contactPhone,
    contactEmail: market.contactEmail,
    website: market.website,
    active: market.active,
  };
}
