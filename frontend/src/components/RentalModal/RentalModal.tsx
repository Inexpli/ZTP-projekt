import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie } from '../../types';
import styles from './RentalModal.module.css';

interface RentalModalProps {
    movie: Movie | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (movie: Movie, days: number) => void;
}

const RentalModal: React.FC<RentalModalProps> = ({ movie, isOpen, onClose, onConfirm }) => {
    const [days, setDays] = useState(3);
    const [imgError, setImgError] = useState(false);

    if (!movie) return null;

    const totalCost = (movie.pricePerDay * days).toFixed(2);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    const dueDateStr = dueDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

    const handleConfirm = () => {
        onConfirm(movie, days);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <button className={styles.closeBtn} onClick={onClose}>
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        <div className={styles.content}>
                            <div className={styles.posterSection}>
                                {!imgError ? (
                                    <img
                                        src={movie.posterUrl}
                                        alt={movie.title}
                                        className={styles.poster}
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    <div className={styles.posterFallback}>
                                        <span>🎬</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.details}>
                                <div className={styles.genres}>
                                    {movie.genre.slice(0, 2).map(g => (
                                        <span key={g} className={styles.genre}>{g}</span>
                                    ))}
                                </div>

                                <h2 className={styles.title}>{movie.title}</h2>
                                <p className={styles.meta}>
                                    {movie.year} · reż. {movie.director} · {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                                </p>

                                <p className={styles.description}>{movie.description}</p>

                                <div className={styles.divider} />

                                <div className={styles.rentalConfig}>
                                    <label className={styles.daysLabel}>Liczba dni wypożyczenia</label>
                                    <div className={styles.daysControl}>
                                        <button
                                            className={styles.dayBtn}
                                            onClick={() => setDays(d => Math.max(1, d - 1))}
                                        >−</button>
                                        <span className={styles.daysValue}>{days}</span>
                                        <button
                                            className={styles.dayBtn}
                                            onClick={() => setDays(d => Math.min(14, d + 1))}
                                        >+</button>
                                    </div>
                                </div>

                                <div className={styles.summary}>
                                    <div className={styles.summaryRow}>
                                        <span>Cena za dzień</span>
                                        <span>{movie.pricePerDay.toFixed(2)} zł</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>Termin zwrotu</span>
                                        <span>{dueDateStr}</span>
                                    </div>
                                    <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                                        <span>Razem</span>
                                        <span className={styles.totalPrice}>{totalCost} zł</span>
                                    </div>
                                </div>

                                <button className={styles.confirmBtn} onClick={handleConfirm}>
                                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                                    </svg>
                                    Potwierdź wypożyczenie · {totalCost} zł
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default RentalModal;
