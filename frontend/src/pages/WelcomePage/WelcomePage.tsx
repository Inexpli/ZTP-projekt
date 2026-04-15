// src/pages/WelcomePage/WelcomePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import styles from './WelcomePage.module.css';

const WelcomePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoginMode, setIsLoginMode] = useState(true);

    // Jeśli użytkownik jest już zalogowany → przekieruj na listę filmów
    useEffect(() => {
        if (user) {
            navigate('/movies', { replace: true });
        }
    }, [user, navigate]);

    const toggleMode = () => setIsLoginMode(!isLoginMode);

    return (
        <div className={styles.welcomeContainer}>
            {/* Tło z efektem */}
            <div className={styles.backgroundOverlay} />

            <div className={styles.content}>
                {/* Lewa strona - Hero / Opis wypożyczalni */}
                <motion.div
                    className={styles.heroSection}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className={styles.heroContent}>
                        <h1 className={styles.mainTitle}>
                            Wypożyczalnia <span>Filmova</span>
                        </h1>
                        <p className={styles.subtitle}>
                            Odkryj tysiące filmów i ciesz się kinem w domu.<br />
                            Proste wypożyczenia, szybki zwrot, świetne ceny.
                        </p>

                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <span>📽️</span>
                                <p>Najnowsze premiery</p>
                            </div>
                            <div className={styles.feature}>
                                <span>🏠</span>
                                <p>Wypożycz do domu</p>
                            </div>
                            <div className={styles.feature}>
                                <span>⭐</span>
                                <p>Oceny i rekomendacje</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Prawa strona - Formularz logowania/rejestracji */}
                <motion.div
                    className={styles.authSection}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className={styles.authCard}>
                        <div className={styles.logo}>
                            <h2>Filmova</h2>
                            <p>Wypożyczalnia filmów</p>
                        </div>

                        <div className={styles.toggleButtons}>
                            <button
                                className={`${styles.toggleBtn} ${isLoginMode ? styles.active : ''}`}
                                onClick={() => setIsLoginMode(true)}
                            >
                                Zaloguj się
                            </button>
                            <button
                                className={`${styles.toggleBtn} ${!isLoginMode ? styles.active : ''}`}
                                onClick={() => setIsLoginMode(false)}
                            >
                                Zarejestruj się
                            </button>
                        </div>

                        {isLoginMode ? (
                            <LoginForm onToggle={toggleMode} />
                        ) : (
                            <RegisterForm onToggle={toggleMode} />
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default WelcomePage;