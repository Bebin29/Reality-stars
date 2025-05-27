// Enum Types
export type GenderEnum = 'männlich' | 'weiblich' | 'divers';
export type MediaTypeEnum = 'photo' | 'video' | 'clip' | 'other';

// Base interface for all entities with UUID
export interface BaseEntity {
  created_at?: Date;
  updated_at?: Date;
}

// Lookup Tables
export interface Genre {
  genre_id: string;
  name: string;
}

export interface Network {
  network_id: string;
  name: string;
  type: string; // 'TV', 'Streaming', 'Web'
}

export interface SocialMediaPlatform {
  platform_id: string;
  name: string;
  base_url?: string;
}

export interface RelationType {
  relation_type_id: string;
  name: string; // 'Ehepartner', 'Partner', etc.
}

// Core Tables
export interface Personality extends BaseEntity {
  personality_id: string;
  first_name: string;
  last_name: string;
  birth_date?: Date;
  birth_place?: string;
  nationality?: string;
  gender?: GenderEnum;
  bio?: string;
  profile_image?: string;
}

export interface TvShow extends BaseEntity {
  show_id: string;
  title: string;
  network_id: string;
  start_date?: Date;
  end_date?: Date;
  description?: string;
  // Relations
  network?: Network;
  genres?: Genre[];
}

export interface Season {
  season_id: string;
  show_id: string;
  season_number: number;
  start_date?: Date;
  end_date?: Date;
  description?: string;
  // Relations
  show?: TvShow;
}

export interface Episode {
  episode_id: string;
  season_id: string;
  episode_number: number;
  title?: string;
  air_date?: Date;
  description?: string;
  // Relations
  season?: Season;
}

// Junction Tables
export interface TvShowGenre {
  show_id: string;
  genre_id: string;
}

// Relationship Tables
export interface Appearance {
  appearance_id: string;
  personality_id: string;
  show_id: string;
  episode_id?: string;
  role?: string;
  appearance_date?: Date;
  notes?: string;
  // Relations
  personality?: Personality;
  show?: TvShow;
  episode?: Episode;
}

export interface SocialMediaAccount extends BaseEntity {
  account_id: string;
  personality_id: string;
  platform_id: string;
  handle: string;
  url: string;
  // Relations
  personality?: Personality;
  platform?: SocialMediaPlatform;
}

export interface SocialMediaMetric {
  metric_id: string;
  account_id: string;
  date: Date;
  followers_count: number;
  engagement_rate?: number;
  // Relations
  account?: SocialMediaAccount;
}

export interface Controversy {
  controversy_id: string;
  personality_id: string;
  title: string;
  description: string;
  date: Date;
  source_url?: string;
  // Relations
  personality?: Personality;
}

export interface Award {
  award_id: string;
  personality_id: string;
  award_name: string;
  category?: string;
  year: number;
  organization?: string;
  // Relations
  personality?: Personality;
}

export interface Relationship {
  relationship_id: string;
  personality1_id: string;
  personality2_id: string;
  relation_type_id: string;
  since_date?: Date;
  notes?: string;
  // Relations
  personality1?: Personality;
  personality2?: Personality;
  relation_type?: RelationType;
}

export interface ExternalLink {
  link_id: string;
  personality_id: string;
  type: string;
  url: string;
  // Relations
  personality?: Personality;
}

export interface Media extends BaseEntity {
  media_id: string;
  personality_id: string;
  type: MediaTypeEnum;
  url: string;
  caption?: string;
  // Relations
  personality?: Personality;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request Types
export interface CreatePersonalityRequest {
  first_name: string;
  last_name: string;
  birth_date?: string;
  birth_place?: string;
  nationality?: string;
  gender?: GenderEnum;
  bio?: string;
  profile_image?: string;
}

export interface UpdatePersonalityRequest extends Partial<CreatePersonalityRequest> {
  personality_id: string;
}

export interface CreateTvShowRequest {
  title: string;
  network_id: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  genre_ids?: string[];
}

export interface CreateAppearanceRequest {
  personality_id: string;
  show_id: string;
  episode_id?: string;
  role?: string;
  appearance_date?: string;
  notes?: string;
}

// Query Parameters
export interface PersonalityQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  gender?: GenderEnum;
  nationality?: string;
  sort_by?: 'first_name' | 'last_name' | 'birth_date' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface TvShowQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  network_id?: string;
  genre_id?: string;
  year?: number;
  sort_by?: 'title' | 'start_date' | 'created_at';
  sort_order?: 'asc' | 'desc';
} 