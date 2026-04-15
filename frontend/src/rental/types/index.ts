export interface Movie {
    id: number;
    title: string;
    year: number;
    genre: string[];
    director: string;
    duration: number; // minutes
    rating: number;
    description: string;
    posterUrl: string;
    pricePerDay: number;
    available: boolean;
    language: string;
}

export interface Rental {
    id: number;
    movie: Movie;
    rentedAt: string;
    dueDate: string;
    returnedAt?: string;
    totalCost: number;
    daysRented: number;
}

export interface CartItem {
    movie: Movie;
    days: number;
}
