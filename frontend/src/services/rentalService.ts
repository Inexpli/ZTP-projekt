import api from './api';
import { Rental, RentalCreateResponse, RentalsResponse } from '../rental-v2/types/index';

// POST /rentals/  — backend hardcoduje rental_days=14
export const rentMovie = async (
    movie_id: number
): Promise<RentalCreateResponse> => {
    const response = await api.post('/rentals/', { movie_id });
    return response.data;
};

// GET /rentals/my  — aktualne (nieoddane) wypożyczenia
export const getMyActiveRentals = async (): Promise<RentalsResponse> => {
    const response = await api.get('/rentals/my');
    return response.data;
};

// GET /rentals/history  — pełna historia
export const getMyRentalHistory = async (): Promise<RentalsResponse> => {
    const response = await api.get('/rentals/history');
    return response.data;
};

// POST /rentals/<rental_id>/return
export const returnRental = async (
    rentalId: number
): Promise<{ message: string }> => {
    const response = await api.post(`/rentals/${rentalId}/return`);
    return response.data;
};

// GET /rentals/check/<movie_id>  — brak JWT, publiczny
export const checkMovieAvailability = async (
    movieId: number
): Promise<{ movie_id: number; available: boolean }> => {
    const response = await api.get(`/rentals/check/${movieId}`);
    return response.data;
};
