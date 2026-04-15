import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { Rental } from '../../types';
import { MOCK_MOVIES } from '../../data/movies';
import styles from './MyRentalsPage.module.css';

// Mock rental data for demo
const MOCK_RENTALS: Rental[] = [
    {
        id: 1,
        movie: MOCK_MOVIES[1],
        rentedAt: '2025-04-10',
        dueDate: '2025-04-13',
        totalCost: 20.97,
        daysRented: 3,
    },
    {
        id: 2,
        movie: MOCK_MOVIES[4],
        rentedAt: '2025-04-08',
        dueDate: '2025-04-15',
        totalCost: 38.43,
        daysRented: 7,
        returnedAt: '2025-04-14',
    },
    {
        id: 3,
        movie: MOCK_MOVIES[6],
        rentedAt: '2025-03-28',
        dueDate: '2025-04-01',
        totalCost: 23.96,
        daysRented: 4,
        returnedAt: '2025-04-01',
    },
];

const MyRentalsPage: React.FC = () => {
    const navigate = useNavigate();
    const [rentals, setRentals] = useState<Rental[]>(MOCK_RENTALS);
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

    const activeRentals = rentals.filter(r => !r.returnedAt);
    const historyRentals = rentals.filter(r => r.returnedAt);

    const handleReturn = (rentalId: number) => {
        setRentals(prev =>
            prev.map(r =>
                r.id === rentalId
                    ? { ...r, returnedAt: new Date().toISOString().split('T')[0] }
                    : r
            )
        );
    };

    const getDaysLeft = (dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

    const displayed = activeTab === 'active' ? activeRentals : historyRentals;

    return (
        <div className={styles.page}>
            <Navbar onCartClick={() => {}} cartCount={activeRentals.length} />

            <div className={styles.container}>
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div>
                        <h1 className={styles.title}>Moje wypożyczenia</h1>
                        <p className={styles.subtitle}>Zarządzaj swoją filmoteką</p>
                    </div>

                    <button className={styles.browseBtn} onClick={() => navigate('/')}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                        Przeglądaj filmy
                    </button>
                </motion.div>

                <div className={styles.stats}>
                    {[
                        { label: 'Aktywne', value: activeRentals.length, accent: true },
                        { label: 'Łącznie wypożyczonych', value: rentals.length },
                        { label: 'Wydane', value: rentals.reduce((s, r) => s + r.totalCost, 0).toFixed(2) + ' zł' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            className={`${styles.statCard} ${stat.accent ? styles.statCardAccent : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <span className={styles.statValue}>{stat.value}</span>
                            <span className={styles.statLabel}>{stat.label}</span>
                        </motion.div>
                    ))}
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'active' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Aktywne
                        {activeRentals.length > 0 && (
                            <span className={styles.tabBadge}>{activeRentals.length}</span>
                        )}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Historia
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {displayed.length === 0 ? (
                            <div className={styles.empty}>
                                <span className={styles.emptyIcon}>🎬</span>
                                <p className={styles.emptyText}>
                                    {activeTab === 'active'
                                        ? 'Brak aktywnych wypożyczeń'
                                        : 'Brak historii wypożyczeń'}
                                </p>
                                <button className={styles.emptyBtn} onClick={() => navigate('/')}>
                                    Wypożycz swój pierwszy film
                                </button>
                            </div>
                        ) : (
                            <div className={styles.rentalsList}>
                                {displayed.map((rental, i) => {
                                    const daysLeft = getDaysLeft(rental.dueDate);
                                    const isOverdue = !rental.returnedAt && daysLeft < 0;
                                    const isDueSoon = !rental.returnedAt && daysLeft >= 0 && daysLeft <= 2;

                                    return (
                                        <motion.div
                                            key={rental.id}
                                            className={`${styles.rentalCard} ${isOverdue ? styles.overdue : ''}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, delay: i * 0.08 }}
                                        >
                                            <div className={styles.rentalPoster}>
                                                {!imgErrors[rental.id] ? (
                                                    <img
                                                        src={rental.movie.posterUrl}
                                                        alt={rental.movie.title}
                                                        className={styles.posterImg}
                                                        onError={() => setImgErrors(prev => ({ ...prev, [rental.id]: true }))}
                                                    />
                                                ) : (
                                                    <div className={styles.posterImgFallback}>🎬</div>
                                                )}
                                            </div>

                                            <div className={styles.rentalInfo}>
                                                <div className={styles.rentalGenres}>
                                                    {rental.movie.genre.slice(0, 2).map(g => (
                                                        <span key={g} className={styles.rentalGenre}>{g}</span>
                                                    ))}
                                                </div>
                                                <h3 className={styles.rentalTitle}>{rental.movie.title}</h3>
                                                <p className={styles.rentalMeta}>
                                                    {rental.movie.year} · reż. {rental.movie.director}
                                                </p>

                                                <div className={styles.rentalDates}>
                                                    <div className={styles.rentalDate}>
                                                        <span className={styles.dateLabel}>Wypożyczono</span>
                                                        <span className={styles.dateValue}>{formatDate(rental.rentedAt)}</span>
                                                    </div>
                                                    <div className={styles.rentalDate}>
                                                        <span className={styles.dateLabel}>
                                                            {rental.returnedAt ? 'Zwrócono' : 'Termin zwrotu'}
                                                        </span>
                                                        <span className={`${styles.dateValue} ${isOverdue ? styles.overdueText : ''} ${isDueSoon ? styles.dueSoonText : ''}`}>
                                                            {formatDate(rental.returnedAt || rental.dueDate)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.rentalRight}>
                                                <div className={styles.rentalCost}>
                                                    <span className={styles.costAmount}>{rental.totalCost.toFixed(2)} zł</span>
                                                    <span className={styles.costDays}>{rental.daysRented} dni</span>
                                                </div>

                                                {rental.returnedAt ? (
                                                    <span className={styles.returnedBadge}>✓ Zwrócono</span>
                                                ) : isOverdue ? (
                                                    <div className={styles.overdueBadge}>
                                                        Przetrzymany {Math.abs(daysLeft)} dni
                                                    </div>
                                                ) : (
                                                    <div className={styles.rentalActions}>
                                                        {isDueSoon && (
                                                            <span className={styles.dueSoonBadge}>
                                                                Zostało {daysLeft}d
                                                            </span>
                                                        )}
                                                        <button
                                                            className={styles.returnBtn}
                                                            onClick={() => handleReturn(rental.id)}
                                                        >
                                                            Zwróć film
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
            </div>
        </div>
    );
};

export default MyRentalsPage;
