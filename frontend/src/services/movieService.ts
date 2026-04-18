import api from './api';
import { Movie, MoviesResponse } from '../rental-v2/types/index';

// GET /movies/?page=&per_page=&search=
export const getMovies = async (
    page = 1,
    per_page = 20,
    search?: string
): Promise<MoviesResponse> => {
    const params: Record<string, string | number> = { page, per_page };
    if (search?.trim()) params.search = search.trim();
    const response = await api.get('/movies/', { params });
    return response.data;
};

// GET /movies/<movie_id>
export const getMovieById = async (movieId: number): Promise<Movie> => {
    const response = await api.get(`/movies/${movieId}`);
    return response.data;
};

// POST /movies/ (staff/admin)
export const createMovie = async (data: {
    title: string;
    release_date: string;
    description?: string;
    duration_minutes?: number;
    country?: string;
    poster_url?: string;
    trailer_url?: string;
}): Promise<{ message: string; movie: Movie }> => {
    const response = await api.post('/movies/', data);
    return response.data;
};

// PUT /movies/<movie_id> (staff/admin)
export const updateMovie = async (
    movieId: number,
    data: Partial<Movie>
): Promise<{ message: string; movie: Movie }> => {
    const response = await api.put(`/movies/${movieId}`, data);
    return response.data;
};

// DELETE /movies/<movie_id> (staff/admin)
export const deleteMovie = async (movieId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/movies/${movieId}`);
    return response.data;
};
