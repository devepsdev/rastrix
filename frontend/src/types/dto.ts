/**
 * Tipos espejo de los DTOs del backend (dev.deveps.rastrix.dto.*).
 * Long -> number, BigDecimal -> number, LocalDate/LocalTime/LocalDateTime -> string (ISO-8601).
 */

export type Role = "USER" | "ADMIN";

export type MarketFrequency = "diario" | "semanal" | "quincenal" | "mensual" | "puntual";

export type DayOfWeek =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

// ---------- Requests ----------

export interface UserRequest {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string | null;
  active: boolean;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateRoleRequest {
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface CategoryRequest {
  name: string;
  description?: string | null;
  icon?: string | null;
}

export interface MarketRequest {
  name: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  frequency: MarketFrequency;
  dayOfWeek?: DayOfWeek | null;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  mainImage?: string | null;
  organizer?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  website?: string | null;
  active: boolean;
}

export interface MarketCategoryRequest {
  marketId: number;
  categoryId: number;
}

export interface MarketImageRequest {
  marketId: number;
  imageUrl: string;
  order?: number | null;
}

export interface ExhibitorRequest {
  marketId?: number | null;
  name: string;
  specialty?: string | null;
  description?: string | null;
  contact?: string | null;
}

export interface FavoriteRequest {
  userId: number;
  marketId: number;
}

export interface RatingRequest {
  userId: number;
  marketId: number;
  score: number;
  comment?: string | null;
}

export interface NotificationRequest {
  userId: number;
  marketId?: number | null;
  title: string;
  message?: string | null;
  read: boolean;
}

// ---------- Responses ----------

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

export interface CategoryResponse {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  icon: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface MarketResponse {
  id: number;
  uuid: string;
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

export interface ExhibitorResponse {
  id: number;
  uuid: string;
  marketId: number | null;
  name: string;
  specialty: string | null;
  description: string | null;
  contact: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface FavoriteResponse {
  id: number;
  uuid: string;
  userId: number;
  marketId: number;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface RatingResponse {
  id: number;
  uuid: string;
  userId: number;
  marketId: number;
  score: number;
  comment: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface NotificationResponse {
  id: number;
  uuid: string;
  userId: number;
  marketId: number | null;
  title: string;
  message: string | null;
  read: boolean;
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
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
  // Índice explícito para poder pasar este tipo donde se esperan query params genéricos.
  [key: string]: string | number | undefined;
}

// ---------- Errores ----------

/** Forma del cuerpo de error que devuelve GlobalExceptionHandler. */
export interface ApiErrorBody {
  timestamp: string;
  status: number;
  mensaje: string;
  errores?: Record<string, string>;
}
