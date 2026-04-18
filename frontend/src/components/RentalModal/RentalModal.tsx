import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie } from '../../rental-v2/types/index';
import styles from './RentalModal.module.css';

interface RentalModalProps {
    movie: Movie | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (movie: Movie) => Promise<void>;
    loading?: boolean;
}

const RENTAL_DAYS = 14; // hardcoded w backendzie (create_rental)

const RentalModal: React.FC<RentalModalProps> = ({
    movie,
    isOpen,
    onClose,
    onConfirm,
    loading = false,
}) => {
    const [imgError, setImgError] = useState(false);

    if (!movie) return null;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + RENTAL_DAYS);
    const dueDateStr = dueDate.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const releaseYear = movie.release_date?.split('-')[0];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!loading ? onClose : undefined}
                    />
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0, scale: 0.93, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <button
                            className={styles.closeBtn}
                            onClick={onClose}
                            disabled={loading}
                        >
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        <div className={styles.content}>
                            {/* Plakat */}
                            <div className={styles.posterSection}>
                                {movie.poster_url && !imgError ? (
                                    <img
                                        src={movie.poster_url}
                                        alt={movie.title}
                                        className={styles.poster}
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    <div className={styles.posterFallback}>🎬</div>
                                )}
                            </div>

                            {/* Szczegóły */}
                            <div className={styles.details}>
                                <h2 className={styles.title}>{movie.title}</h2>

                                <p className={styles.meta}>
                                    {[
                                        releaseYear,
                                        movie.duration_minutes
                                            ? `${Math.floor(movie.duration_minutes / 60)}h ${movie.duration_minutes % 60}m`
                                            : null,
                                        movie.country,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </p>

                                {movie.description && (
                                    <p className={styles.description}>{movie.description}</p>
                                )}

                                <div className={styles.divider} />

                                {/* Informacja o okresie wypożyczenia */}
                                <div className={styles.rentalInfo}>
                                    <div className={styles.rentalInfoIcon}>
                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12,6 12,12 16,14" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className={styles.rentalInfoLabel}>Okres wypożyczenia</p>
                                        <p className={styles.rentalInfoValue}>14 dni</p>
                                    </div>
                                </div>

                                {/* Podsumowanie */}
                                <div className={styles.summary}>
                                    <div className={styles.summaryRow}>
                                        <span>Liczba dni</span>
                                        <span>{RENTAL_DAYS} dni</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>Termin zwrotu</span>
                                        <span className={styles.dueDate}>{dueDateStr}</span>
                                    </div>
                                </div>

                                {/* Przycisk potwierdzenia */}
                                <button
                                    className={styles.confirmBtn}
                                    onClick={() => onConfirm(movie)}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className={styles.spinner} />
                                    ) : (
                                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <polyline points="20,6 9,17 4,12" />
                                        </svg>
                                    )}
                                    {loading ? 'Przetwarzanie...' : 'Potwierdź wypożyczenie'}
                                </button>

                                {movie.trailer_url && (
                                    <a
                                        href={movie.trailer_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.trailerLink}
                                    >
                                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                            <polygon points="5,3 19,12 5,21" />
                                        </svg>
                                        Obejrzyj zwiastun
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default RentalModal;
