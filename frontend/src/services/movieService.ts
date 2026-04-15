// services/movieService.ts
import axios from 'axios';

const API = 'http://localhost:5000';

export const getMovies = () =>
    axios.get(`${API}/movies`).then(r => r.data);

export const rentMovie = (movieId: number, days: number, token: string) =>
    axios.post(`${API}/rentals`, { movie_id: movieId, days }, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data);

export const getMyRentals = (token: string) =>
    axios.get(`${API}/rentals/me`, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data);

export const returnMovie = (rentalId: number, token: string) =>
    axios.put(`${API}/rentals/${rentalId}/return`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data);