import api from './api';
import { Genre, GenresResponse } from '../rental-v2/types/index';

// GET /genres/  — publiczny endpoint
export const getGenres = async (): Promise<GenresResponse> => {
    const response = await api.get('/genres/');
    return response.data;
};
