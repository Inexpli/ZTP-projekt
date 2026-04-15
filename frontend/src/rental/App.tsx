import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import MyRentalsPage from './pages/MyRentalsPage/MyRentalsPage';
// Import your existing LoginPage here:
// import LoginPage from './pages/LoginPage/LoginPage';

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Uncomment when integrating your LoginPage: */}
                {/* <Route path="/login" element={<LoginPage />} /> */}

                <Route path="/" element={<HomePage />} />
                <Route path="/rentals" element={<MyRentalsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
