import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { Rental } from '../../rental-v2/types/index';
import * as rentalService from '../../services/rentalService';
import styles from './MyRentalsPage.module.css';

type Tab = 'active' | 'history';

const MyRentalsPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeRentals, setActiveRentals] = useState<Rental[]>([]);
    const [historyRentals, setHistoryRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('active');
    const [returningId, setReturningId] = useState<number | null>(null);
    const [toast, setToast] = useState('');
    const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

    // ─── Ładuj wypożyczenia ────────────────────────────────────────────────
    const fetchRentals = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [activeRes, historyRes] = await Promise.all([
                rentalService.getMyActiveRentals(),
                rentalService.getMyRentalHistory(),
            ]);

            setActiveRentals(activeRes.rentals);

            // Filtrujemy historię, aby nie pokazywać tych, które są jeszcze aktywne
            const activeIds = new Set(activeRes.rentals.map(r => r.rental_id));
            const pureHistory = historyRes.rentals.filter(r => !activeIds.has(r.rental_id));
            setHistoryRentals(pureHistory);
        } catch (err: any) {
            if (err.response?.status === 401) {
                navigate('/login');
            } else {
                setError('Nie udało się załadować listy wypożyczeń. Spróbuj ponownie później.');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchRentals();
    }, [fetchRentals]);

    // ─── Zwrot filmu ───────────────────────────────────────────────────────
    const handleReturn = async (rental: Rental) => {
        setReturningId(rental.rental_id);
        try {
            await rentalService.returnRental(rental.rental_id);

            // Sukces: Przenieś lokalnie z aktywnych do historii, aby uniknąć zbędnego zapytania GET
            const now = new Date().toISOString();
            const returnedRental = {
                ...rental,
                return_date: now,
                is_returned: true
            };

            setActiveRentals(prev => prev.filter(r => r.rental_id !== rental.rental_id));
            setHistoryRentals(prev => [returnedRental, ...prev]);

            showToast(`„${rental.movie_title}" został zwrócony pomyślnie.`);
        } catch (err: any) {
            const serverError = err.response?.data?.error || 'Błąd podczas zwrotu filmu.';
            showToast(serverError);
        } finally {
            setReturningId(null);
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 4000);
    };

    // ─── Helpers ───────────────────────────────────────────────────────────
    const getDaysLeft = (dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Porównujemy tylko daty bez godzin
        return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const displayed = activeTab === 'active' ? activeRentals : historyRentals;

    return (
        <div className={styles.page}>
            <Navbar cartCount={0} onCartClick={() => { }} />

            {/* Powiadomienia (Toast) */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className={styles.toast}
                        initial={{ opacity: 0, y: -60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -60 }}
                    >
                        <span className={styles.toastIcon}>✓</span>
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={styles.container}>
                {/* Nagłówek sekcji */}
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className={styles.title}>Moje wypożyczenia</h1>
                        <p className={styles.subtitle}>Przeglądaj swoje aktywne filmy i historię</p>
                    </div>
                    <button className={styles.browseBtn} onClick={() => navigate('/')}>
                        Przeglądaj katalog
                    </button>
                </motion.div>

                {/* Statystyki górne */}
                {!loading && (
                    <div className={styles.stats}>
                        <div className={`${styles.statCard} ${styles.statCardAccent}`}>
                            <span className={styles.statValue}>{activeRentals.length}</span>
                            <span className={styles.statLabel}>Aktywne</span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statValue}>{historyRentals.length}</span>
                            <span className={styles.statLabel}>W historii</span>
                        </div>
                    </div>
                )}

                {/* Przełącznik zakładek */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'active' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Do obejrzenia
                        {activeRentals.length > 0 && (
                            <span className={styles.tabBadge}>{activeRentals.length}</span>
                        )}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Historia zwrotów
                    </button>
                </div>

                {/* Główna lista */}
                {loading ? (
                    <div className={styles.skeletonList}>
                        {[1, 2, 3].map(i => <div key={i} className={styles.skeletonCard} />)}
                    </div>
                ) : error ? (
                    <div className={styles.errorState}>
                        <p>{error}</p>
                        <button className={styles.retryBtn} onClick={fetchRentals}>Odśwież</button>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {displayed.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <span className={styles.emptyIcon}>🍿</span>
                                    <p>{activeTab === 'active' ? 'Nie masz obecnie żadnych wypożyczonych filmów.' : 'Twoja historia jest pusta.'}</p>
                                    <button className={styles.emptyBtn} onClick={() => navigate('/')}>Wypożycz coś teraz</button>
                                </div>
                            ) : (
                                <div className={styles.rentalsList}>
                                    {displayed.map((rental, i) => {
                                        const daysLeft = getDaysLeft(rental.due_date);
                                        const isOverdue = !rental.return_date && daysLeft < 0;
                                        const isDueSoon = !rental.return_date && daysLeft >= 0 && daysLeft <= 2;

                                        return (
                                            <motion.div
                                                key={rental.rental_id}
                                                className={`${styles.rentalCard} ${isOverdue ? styles.overdueCard : ''}`}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                            >
                                                {/* Plakat filmu */}
                                                <div className={styles.rentalPoster} onClick={() => navigate(`/movie/${rental.movie_id}`)}>
                                                    {rental.poster_url && !imgErrors[rental.rental_id] ? (
                                                        <img
                                                            src={rental.poster_url}
                                                            alt={rental.movie_title}
                                                            className={styles.posterImg}
                                                            onError={() => setImgErrors(p => ({ ...p, [rental.rental_id]: true }))}
                                                        />
                                                    ) : (
                                                        <div className={styles.posterFallback}>🎬</div>
                                                    )}
                                                </div>

                                                {/* Detale wypożyczenia */}
                                                <div className={styles.rentalInfo}>
                                                    <h3 className={styles.rentalTitle} onClick={() => navigate(`/movie/${rental.movie_id}`)}>
                                                        {rental.movie_title}
                                                    </h3>

                                                    <div className={styles.rentalDates}>
                                                        <div className={styles.dateBlock}>
                                                            <span className={styles.dateLabel}>Data wypożyczenia</span>
                                                            <span className={styles.dateValue}>{formatDate(rental.rental_date)}</span>
                                                        </div>
                                                        <div className={styles.dateBlock}>
                                                            <span className={styles.dateLabel}>
                                                                {rental.return_date ? 'Data zwrotu' : 'Termin zwrotu'}
                                                            </span>
                                                            <span className={`${styles.dateValue} ${isOverdue ? styles.overdueText : ''} ${isDueSoon ? styles.dueSoonText : ''}`}>
                                                                {formatDate(rental.return_date || rental.due_date)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status i akcja zwrotu */}
                                                <div className={styles.rentalRight}>
                                                    {rental.return_date ? (
                                                        <span className={styles.returnedBadge}>✓ Zwrócony</span>
                                                    ) : (
                                                        <div className={styles.activeActions}>
                                                            {isOverdue && <span className={styles.overdueBadge}>Po terminie!</span>}
                                                            <button
                                                                className={styles.returnBtn}
                                                                onClick={() => handleReturn(rental)}
                                                                disabled={returningId === rental.rental_id}
                                                            >
                                                                {returningId === rental.rental_id ? 'Przetwarzanie...' : 'Zwróć teraz'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default MyRentalsPage;