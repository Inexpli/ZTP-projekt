import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService';
import styles from './LoginPage.module.css';


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
            setConfirmPasswordError('HasĹ‚a nie sÄ… takie same');
            return;
        }

        setLoading(true);
        try {
            if (isLoginMode) {
                const data = await authService.login(username, password);
                const success = login(data.user, data.access_token);
                if (success) navigate('/', { replace: true });
            } else {
                await authService.register(username, email, password);
                const data = await authService.login(username, password);
                const success = login(data.user, data.access_token);
                if (success) navigate('/', { replace: true });
            }
        } catch (err: any) {
            const status = err.response?.status;
            if (status === 401) {
                setError('Niepoprawny login lub hasĹ‚o.');
            } else if (status === 403) {
                setError('Twoje konto zostaĹ‚o zawieszone lub dezaktywowane.');
            } else if (status === 400) {
                setError(err.response?.data?.error || 'BĹ‚Ä…d walidacji danych.');
            } else if (status === 409 || err.response?.data?.error?.includes('zajÄ™ta') || err.response?.data?.error?.includes('uĹĽywany')) {
                setError('Email albo nazwa uĹĽytkownika jest juĹĽ zajÄ™ta.');
            } else {
                setError(err.response?.data?.error || err.message || 'WystÄ…piĹ‚ nieznany bĹ‚Ä…d.');
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
                                <h1>Zaloguj siÄ™</h1>
                                <p className={styles.subtitle}>Witaj ponownie! Zaloguj siÄ™ do swojego konta</p>
                                {error && <div className={styles.errorMessage}>{error}</div>}

                                <form onSubmit={handleSubmit} className={styles.form}>
                                    <div className={styles.formGroup}>
                                        <label>Nazwa uĹĽytkownika</label>
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
                                        <label>HasĹ‚o</label>
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
                                        {loading ? 'Logowanie...' : 'Zaloguj siÄ™'}
                                    </button>
                                </form>

                                <p className={styles.toggleText}>
                                    Nie masz konta?{' '}
                                    <button type="button" className={styles.toggleButton} onClick={toggleMode}>
                                        Zarejestruj siÄ™
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
                                    <span className={styles.logoIcon}>đźŽ¬</span>
                                    <h2 className={styles.serviceName}>CineRent</h2>
                                    <p className={styles.logoTagline}>Twoja cyfrowa wypoĹĽyczalnia filmĂłw</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

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
                                    <span className={styles.logoIcon}>đźŽ¬</span>
                                    <h2 className={styles.serviceName}>CineRent</h2>
                                    <p className={styles.logoTagline}>Twoja cyfrowa wypoĹĽyczalnia filmĂłw</p>
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
                                <h1>Zarejestruj siÄ™</h1>
                                <p className={styles.subtitle}>UtwĂłrz konto i zacznij wypoĹĽyczaÄ‡ filmy</p>
                                {error && <div className={styles.errorMessage}>{error}</div>}

                                <form onSubmit={handleSubmit} className={styles.form}>
                                    <div className={styles.formGroup}>
                                        <label>Nazwa uĹĽytkownika</label>
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
                                        <label>HasĹ‚o</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            className={styles.input}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>PotwierdĹş hasĹ‚o</label>
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
                                        {loading ? 'Rejestracja...' : 'Zarejestruj siÄ™'}
                                    </button>
                                </form>

                                <p className={styles.toggleText}>
                                    Masz juĹĽ konto?{' '}
                                    <button type="button" className={styles.toggleButton} onClick={toggleMode}>
                                        Zaloguj siÄ™
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
