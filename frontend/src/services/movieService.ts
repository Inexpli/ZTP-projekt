import api from './api';
import { Movie, MoviesResponse } from '../rental-v2/types/index';

export const getMovies = async (
    page = 1,
    per_page = 20,
    search?: string,
    genre_id?: number
): Promise<MoviesResponse> => {
    const params: Record<string, string | number> = { page, per_page };
    if (search?.trim()) params.search = search.trim();
    if (genre_id) params.genre_id = genre_id;
    const response = await api.get('/movies/', { params });
    return response.data;
};

export const getMovieById = async (movieId: number): Promise<Movie> => {
    const response = await api.get(`/movies/${movieId}`);
    return response.data;
};

export const createMovie = async (data: Partial<Movie>): Promise<{ message: string; movie: Movie }> => {
    const response = await api.post('/movies/', data);
    return response.data;
};

export const updateMovie = async (movieId: number, data: Partial<Movie>): Promise<{ message: string; movie: Movie }> => {
    const response = await api.put(`/movies/${movieId}`, data);
    return response.data;
};

export const deleteMovie = async (movieId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/movies/${movieId}`);
    return response.data;
};
