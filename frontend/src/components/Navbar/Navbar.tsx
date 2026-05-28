import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Navbar.module.css';

interface NavbarProps {
    cartCount?: number;
    onCartClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount = 0, onCartClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.nav
            className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className={styles.inner}>
                <button className={styles.logo} onClick={() => navigate('/')}>
                    <span className={styles.logoIcon}>đźŽ¬</span>
                    <span className={styles.logoText}>CineRent</span>
                </button>

                <div className={styles.links}>
                    <button
                        className={`${styles.link} ${location.pathname === '/' ? styles.active : ''}`}
                        onClick={() => navigate('/')}
                    >
                        Filmy
                    </button>
                    <button
                        className={`${styles.link} ${location.pathname === '/rentals' ? styles.active : ''}`}
                        onClick={() => navigate('/rentals')}
                    >
                        Moje wypoĹĽyczenia
                    </button>
                </div>

                <div className={styles.actions}>
                    <button className={styles.iconBtn} onClick={onCartClick} title="Moje wypoĹĽyczenia">
                        <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                        {cartCount > 0 && (
                            <motion.span
                                className={styles.badge}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                key={cartCount}
                            >
                                {cartCount}
                            </motion.span>
                        )}
                    </button>

                    <div className={styles.userMenu}>
                        <button
                            className={styles.iconBtn}
                            onClick={() => setMenuOpen(v => !v)}
                            title={user?.username ?? 'Profil'}
                        >
                            <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </button>

                        {menuOpen && (
                            <motion.div
                                className={styles.dropdown}
                                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {user && (
                                    <div className={styles.dropdownUser}>
                                        <span className={styles.dropdownUsername}>{user.username}</span>
                                        <span className={styles.dropdownEmail}>{user.email}</span>
                                    </div>
                                )}
                                <div className={styles.dropdownDivider} />
                                <button
                                    className={styles.dropdownItem}
                                    onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                                >
                                    Ustawienia profilu
                                </button>
                                <button
                                    className={styles.dropdownItem}
                                    onClick={() => { setMenuOpen(false); navigate('/rentals'); }}
                                >
                                    Moje wypoĹĽyczenia
                                </button>
                                <button
                                    className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                                    onClick={handleLogout}
                                >
                                    Wyloguj siÄ™
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
