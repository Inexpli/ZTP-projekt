// ─── types/index.ts ─────────────────────────────────────────────────────────

// ─── User ───────────────────────────────────────────────────────────────────
export interface User {
    user_id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    is_active: boolean;
    created_at?: string;
}

// ─── Movie ──────────────────────────────────────────────────────────────────
// Pola zgodne z Movie.serialize() z backendu + przydatne pola dodatkowe
export interface Movie {
    movie_id: number;                    // główny identyfikator z bazy
    title: string;
    description?: string;
    release_date: string;                // "YYYY-MM-DD"
    duration_minutes?: number;
    country?: string;
    poster_url?: string;
    trailer_url?: string;
    created_at?: string;

    // Pola dodatkowe używane w mockach i aplikacji frontendowej
    id?: number;                         // czasem frontend używa prostego id
    year?: number;
    genre?: string[];
    director?: string;
    rating?: number;
    pricePerDay?: number;
    available?: boolean;                 // czy film jest dostępny do wypożyczenia
    language?: string;
}

// ─── Rental ─────────────────────────────────────────────────────────────────
export interface Rental {
    rental_id: number;
    user_id: number;
    movie_id: number;

    // DODANO: Te pola wysyła teraz backend w Rental.serialize()
    movie_title: string;
    poster_url: string | null;

    rental_date: string;
    due_date: string;
    return_date?: string | null;

    // DODANO: Te pola też są w Twoim modelu w Pythonie
    is_returned: boolean;
    is_overdue: boolean;

    movie?: Movie; // Opcjonalnie, jeśli używasz joinedload
}

// ─── API Responses ──────────────────────────────────────────────────────────
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