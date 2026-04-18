import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Movie } from '../../rental-v2/types/index';
import styles from './MovieCard.module.css';

interface MovieCardProps {
    movie: Movie;
    onRent: (movie: Movie) => void;
    onDetails: (movie: Movie) => void;
    index?: number;
}

const getReleaseYear = (release_date: string): string => {
    if (!release_date) return '';
    return release_date.split('-')[0];
};

const formatDuration = (minutes?: number): string => {
    if (!minutes) return '';
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const MovieCard: React.FC<MovieCardProps> = ({ movie, onRent, onDetails, index = 0 }) => {
    const [imgError, setImgError] = useState(false);

    return (
        <motion.div
            className={`${styles.card} ${!movie.available ? styles.cardUnavailable : ''}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.06, ease: 'easeOut' }}
            whileHover={{ y: -5 }}
        >
            <div className={styles.posterWrapper} onClick={() => onDetails(movie)}>
                {movie.poster_url && !imgError ? (
                    <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className={styles.poster}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className={styles.posterFallback}>
                        <span className={styles.posterIcon}>🎬</span>
                        <span className={styles.posterFallbackTitle}>{movie.title}</span>
                    </div>
                )}

                <div className={styles.overlay}>
                    <button
                        className={styles.detailsBtn}
                        onClick={e => { e.stopPropagation(); onDetails(movie); }}
                    >
                        Szczegóły
                    </button>
                </div>

                {!movie.available && (
                    <div className={styles.unavailableBadge}>Niedostępny</div>
                )}

                {movie.country && (
                    <div className={styles.countryBadge}>{movie.country}</div>
                )}
            </div>

            <div className={styles.info}>
                <h3 className={styles.title} onClick={() => onDetails(movie)}>
                    {movie.title}
                </h3>

                <p className={styles.meta}>
                    {[getReleaseYear(movie.release_date), formatDuration(movie.duration_minutes)]
                        .filter(Boolean)
                        .join(' · ')}
                </p>

                {movie.description && (
                    <p className={styles.desc}>{movie.description}</p>
                )}

                <button
                    className={`${styles.rentBtn} ${!movie.available ? styles.rentBtnDisabled : ''}`}
                    onClick={() => movie.available !== false && onRent(movie)}
                    disabled={movie.available === false}
                >
                    {movie.available === false ? 'Niedostępny' : 'Wypożycz — 14 dni'}
                </button>
            </div>
        </motion.div>
    );
};

export default MovieCard;
