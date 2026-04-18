import api from './api';
import { LoginResponse, User } from '../rental-v2/types/index';

// POST /auth/register
export const register = async (
    username: string,
    email: string,
    password: string

): Promise<{ message: string; user: User }> => {
    const response = await api.post('/auth/register', {
        username,
        email,
        password
    });
    return response.data;
};

// POST /auth/login
export const login = async (
    username: string,
    password: string
): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
};

// GET /auth/me
export const getMe = async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
};

// PUT /auth/me
export const updateMe = async (data: {
    first_name?: string;
    last_name?: string;
    email?: string;
}): Promise<{ message: string; user: User }> => {
    const response = await api.put('/auth/me', data);
    return response.data;
};
