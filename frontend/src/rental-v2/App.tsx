import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import LoginPage from '../Pages/LoginPage/LoginPage';
import HomePage from '../Pages/HomePage/HomePage';
import MyRentalsPage from '../Pages/MyRentalsPage/MyRentalsPage';
import MovieDetailPage from '../Pages/MovieDetailPage/MovieDetailPage';
import ProfilePage from '../Pages/ProfilePage/ProfilePage';
import './global.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#08080c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(235,225,205,0.25)',
                fontFamily: 'Karla, sans-serif',
                fontSize: '13px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
            }}>
                Ĺadowanie...
            </div>
        );
    }

    return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => (
    <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={
            <ProtectedRoute><HomePage /></ProtectedRoute>
        } />
        <Route path="/movie/:id" element={
            <ProtectedRoute><MovieDetailPage /></ProtectedRoute>
        } />
        <Route path="/rentals" element={
            <ProtectedRoute><MyRentalsPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
);

const App: React.FC = () => (
    <BrowserRouter>
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    </BrowserRouter>
);

export default App;
