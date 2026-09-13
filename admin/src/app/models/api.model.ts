/**
 * Tipos espejo de los DTOs del backend (dev.deveps.rastrix.dto.*).
 * Long y BigDecimal -> number; LocalDate/LocalTime/LocalDateTime -> string ISO.
 */

export type Role = 'USER' | 'ADMIN' | 'SCRAPER';
export type MarketFrequency = 'diario' | 'semanal' | 'quincenal' | 'mensual' | 'puntual';
export type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
export type SuggestionStatus = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
export type SuggestionOrigin = 'USUARIO' | 'SCRAPER';

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  type: string;
  userId: number;
  uuid: string;
  name: string;
  email: string;
}

export interface UserResponse {
  id: number;
  uuid: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  active: boolean;
  role: Role;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface MarketRequest {
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  frequency: MarketFrequency;
  dayOfWeek: DayOfWeek | null;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  mainImage: string | null;
  organizer: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  website: string | null;
  active: boolean;
}

export interface MarketResponse extends MarketRequest {
  id: number;
  uuid: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CategoryRequest {
  name: string;
  description: string | null;
  icon: string | null;
}

export interface CategoryResponse extends CategoryRequest {
  id: number;
  uuid: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface MarketCategoryResponse {
  id: number;
  uuid: string;
  marketId: number;
  categoryId: number;
  fechaCreacion: string;
}

export interface MarketImageResponse {
  id: number;
  uuid: string;
  marketId: number;
  imageUrl: string;
  order: number | null;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface SuggestionResponse {
  id: number;
  uuid: string;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  origin: SuggestionOrigin;
  /** Página de la que salió; solo en las sugerencias del scraper. */
  sourceUrl: string | null;
  name: string;
  city: string;
  province: string | null;
  address: string | null;
  frequency: MarketFrequency | null;
  dayOfWeek: DayOfWeek | null;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  description: string | null;
  contact: string | null;
  comment: string | null;
  status: SuggestionStatus;
  marketId: number | null;
  rejectionReason: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface StatsResponse {
  totalUsers: number;
  totalAdmins: number;
  totalMarkets: number;
  activeMarkets: number;
  totalCategories: number;
  totalExhibitors: number;
  totalMarketImages: number;
  totalFavorites: number;
  totalRatings: number;
  averageRating: number | null;
  totalNotifications: number;
  unreadNotifications: number;
  pendingSuggestions: number;
}
