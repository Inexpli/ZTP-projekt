export interface User {
    user_id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    is_active: boolean;
    created_at?: string;
}

export interface Genre {
    id: number;
    name: string;
}

export interface Actor {
    id: number;
    name: string;
    role?: string;
    photo_url?: string;
    biography?: string;
    birth_date?: string;
    birth_place?: string;
    gender?: string;
}

export interface Director {
    id: number;
    name: string;
    photo_url?: string;
    biography?: string;
    birth_date?: string;
    birth_place?: string;
    gender?: string;
}

export interface Movie {
    movie_id: number;
    title: string;
    description?: string;
    release_date?: string;
    duration_minutes?: number;
    country?: string;
    original_language?: string;
    poster_url?: string;
    trailer_url?: string;
    created_at?: string;
    available?: boolean;
    is_rented?: boolean;
    genres: Genre[];
    directors: Director[];
    actors: Actor[];

    id?: number;
}

export interface Rental {
    rental_id: number;
    user_id: number;
    movie_id: number;
    movie?: Movie;
    movie_title?: string;
    poster_url?: string | null;

    rental_date: string;
    due_date: string;
    return_date?: string | null;

    is_returned: boolean;
    is_overdue: boolean;
    status?: 'active' | 'returned' | 'overdue';
}

export interface PaginationMeta {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface MoviesResponse {
    movies: Movie[];
    pagination: PaginationMeta;
}

export interface GenresResponse {
    genres: Genre[];
}

export interface LoginResponse {
    access_token: string;
    user: User;
}

export interface RentalsResponse {
    rentals: Rental[];
}

export interface RentalCreateResponse {
    message: string;
    rental: Rental;
}
