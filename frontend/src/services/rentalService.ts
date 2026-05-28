import api from './api';
import { Rental, RentalCreateResponse, RentalsResponse } from '../rental-v2/types/index';

export const rentMovie = async (
    movie_id: number
): Promise<RentalCreateResponse> => {
    const response = await api.post('/rentals/', { movie_id });
    return response.data;
};

export const getMyActiveRentals = async (): Promise<RentalsResponse> => {
    const response = await api.get('/rentals/my');
    return response.data;
};

export const getMyRentalHistory = async (): Promise<RentalsResponse> => {
    const response = await api.get('/rentals/history');
    return response.data;
};

export const returnRental = async (
    rentalId: number
): Promise<{ message: string }> => {
    const response = await api.post(`/rentals/${rentalId}/return`);
    return response.data;
};

export const checkMovieAvailability = async (
    movieId: number
): Promise<{ movie_id: number; available: boolean }> => {
    const response = await api.get(`/rentals/check/${movieId}`);
    return response.data;
};
