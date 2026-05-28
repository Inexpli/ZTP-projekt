import api from './api';
import { LoginResponse, User } from '../rental-v2/types/index';

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

export const login = async (
    username: string,
    password: string
): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
};

export const getMe = async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const updateMe = async (data: {
    username?: string;
    email?: string;
}): Promise<{ message: string; user: User }> => {
    const response = await api.put('/auth/me', data);
    return response.data;
};

export const changePassword = async (
    oldPassword: string,
    newPassword: string
): Promise<{ message: string }> => {
    const response = await api.post('/auth/change-password', {
        oldPassword,
        newPassword
    });
    return response.data;
};
