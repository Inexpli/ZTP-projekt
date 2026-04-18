import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService';
import styles from './LoginPage.module.css';

// Jeśli masz PasswordStrengthMeter — podepnij tutaj
// import PasswordStrengthMeter from './components/PasswordStrengthMeter/PasswordStrengthMeter';

const LoginPage: React.FC = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) navigate('/', { replace: true });
    }, [user, navigate]);

    if (user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setConfirmPasswordError('');

        if (!isLoginMode && password !== confirmPassword) {
            setConfirmPasswordError('Hasła nie są takie same');
            return;
        }

        setLoading(true);
        try {
            if (isLoginMode) {
                // Logowanie — POST /auth/login
                const data = await authService.login(username, password);
                const success = login(data.user, data.access_token);
                if (success) navigate('/', { replace: true });
            } else {
                // Rejestracja — POST /auth/register
                // Backend zwraca {message, user} bez tokenu — trzeba od razu zalogować
                await authService.register(username, email, password);
                const data = await authService.login(username, password);
                const success = login(data.user, data.access_token);
                if (success) navigate('/', { replace: true });
            }
        } catch (err: any) {
            const status = err.response?.status;
            if (status === 401) {
                setError('Niepoprawny login lub hasło.');
            } else if (status === 403) {
                setError('Twoje konto zostało zawieszone lub dezaktywowane.');
            } else if (status === 400) {
                setError(err.response?.data?.error || 'Błąd walidacji danych.');
            } else if (status === 409 || err.response?.data?.error?.includes('zajęta') || err.response?.data?.error?.includes('używany')) {
                setError('Email albo nazwa użytkownika jest już zajęta.');
            } else {
                setError(err.response?.data?.error || err.message || 'Wystąpił nieznany błąd.');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError('');
        setConfirmPasswordError('');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Lewa strona */}
                <div className={`${styles.leftSide} ${!isLoginMode ? styles.logoSide : styles.formSide}`}>
                    <AnimatePresence mode="wait">
                        {isLoginMode ? (
                            <motion.div
                                key="login-form"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5 }}
                                className={styles.formContainer}
                            >
                                <h1>Zaloguj się</h1>
                                <p className={styles.subtitle}>Witaj ponownie! Zaloguj się do swojego konta</p>
                                {error && <div className={styles.errorMessage}>{error}</div>}

                                <form onSubmit={handleSubmit} className={styles.form}>
                                    <div className={styles.formGroup}>
                                        <label>Nazwa użytkownika</label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            required
                                            className={styles.input}
                                            autoComplete="username"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Hasło</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            className={styles.input}
                                            autoComplete="current-password"
                                        />
                                    </div>
                                    <button type="submit" className={styles.submitButton} disabled={loading}>
                                        {loading ? 'Logowanie...' : 'Zaloguj się'}
                                    </button>
                                </form>

                                <p className={styles.toggleText}>
                                    Nie masz konta?{' '}
                                    <button type="button" className={styles.toggleButton} onClick={toggleMode}>
                                        Zarejestruj się
                                    </button>
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="logo-left"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className={styles.logoContainer}
                            >
                                <div className={styles.logo}>
                                    <span className={styles.logoIcon}>🎬</span>
                                    <h2 className={styles.serviceName}>CineRent</h2>
                                    <p className={styles.logoTagline}>Twoja cyfrowa wypożyczalnia filmów</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Prawa strona */}
                <div className={`${styles.rightSide} ${isLoginMode ? styles.logoSide : styles.formSide}`}>
                    <AnimatePresence mode="wait">
                        {isLoginMode ? (
                            <motion.div
                                key="logo-right"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className={styles.logoContainer}
                            >
                                <div className={styles.logo}>
                                    <span className={styles.logoIcon}>🎬</span>
                                    <h2 className={styles.serviceName}>CineRent</h2>
                                    <p className={styles.logoTagline}>Twoja cyfrowa wypożyczalnia filmów</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="register-form"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.5 }}
                                className={styles.formContainer}
                            >
                                <h1>Zarejestruj się</h1>
                                <p className={styles.subtitle}>Utwórz konto i zacznij wypożyczać filmy</p>
                                {error && <div className={styles.errorMessage}>{error}</div>}

                                <form onSubmit={handleSubmit} className={styles.form}>
                                    <div className={styles.formGroup}>
                                        <label>Nazwa użytkownika</label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            required
                                            className={styles.input}
                                            autoComplete="username"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                            className={styles.input}
                                            autoComplete="email"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Hasło</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            className={styles.input}
                                            autoComplete="new-password"
                                        />
                                        {/* <PasswordStrengthMeter password={password} /> */}
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Potwierdź hasło</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required
                                            className={styles.input}
                                            autoComplete="new-password"
                                        />
                                        {confirmPasswordError && (
                                            <div className={styles.errorMessage}>{confirmPasswordError}</div>
                                        )}
                                    </div>
                                    <button type="submit" className={styles.submitButton} disabled={loading}>
                                        {loading ? 'Rejestracja...' : 'Zarejestruj się'}
                                    </button>
                                </form>

                                <p className={styles.toggleText}>
                                    Masz już konto?{' '}
                                    <button type="button" className={styles.toggleButton} onClick={toggleMode}>
                                        Zaloguj się
                                    </button>
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
