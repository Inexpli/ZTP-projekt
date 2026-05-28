import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie } from '../../rental-v2/types/index';
import VideoModal from '../VideoModal/VideoModal';
import styles from './RentalModal.module.css';

interface RentalModalProps {
    movie: Movie | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (movie: Movie) => Promise<void>;
    loading?: boolean;
}

const RENTAL_DAYS = 14;

const RentalModal: React.FC<RentalModalProps> = ({
    movie,
    isOpen,
    onClose,
    onConfirm,
    loading = false,
}) => {
    const [imgError, setImgError] = useState(false);
    const [isVideoOpen, setIsVideoOpen] = useState(false);

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
        <>
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
                                <div className={styles.posterSection}>
                                    {movie.poster_url && !imgError ? (
                                        <img
                                            src={movie.poster_url}
                                            alt={movie.title}
                                            className={styles.poster}
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <div className={styles.posterFallback}>đźŽ¬</div>
                                    )}
                                </div>

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
                                            .join(' Â· ')}
                                    </p>

                                    {movie.description && (
                                        <p className={styles.description}>{movie.description}</p>
                                    )}

                                    <div className={styles.divider} />

                                    <div className={styles.rentalInfo}>
                                        <div className={styles.rentalInfoIcon}>
                                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12,6 12,12 16,14" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className={styles.rentalInfoLabel}>Okres wypoĹĽyczenia</p>
                                            <p className={styles.rentalInfoValue}>14 dni</p>
                                        </div>
                                    </div>

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
                                        {loading ? 'Przetwarzanie...' : 'PotwierdĹş wypoĹĽyczenie'}
                                    </button>

                                    {movie.trailer_url && (
                                        <button
                                            type="button"
                                            className={styles.trailerLink}
                                            onClick={() => setIsVideoOpen(true)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                                <polygon points="5,3 19,12 5,21" />
                                            </svg>
                                            Obejrzyj zwiastun
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <VideoModal
                isOpen={isVideoOpen}
                onClose={() => setIsVideoOpen(false)}
                trailerUrl={movie.trailer_url || ''}
                movieTitle={movie.title}
            />
        </>
    );
};

export default RentalModal;
