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

const MovieCard: React.FC<MovieCardProps> = ({ movie, onRent, onDetails, index = 0 }) => {
    const [imgError, setImgError] = useState(false);
    const releaseYear = movie.release_date?.split('-')[0];

    const isUnavailable = movie.available === false || movie.is_rented === true;

    return (
        <motion.div
            className={`${styles.card} ${isUnavailable ? styles.cardUnavailable : ''}`}
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
                        <span className={styles.posterIcon}>đźŽ¬</span>
                        <span className={styles.posterFallbackTitle}>{movie.title}</span>
                    </div>
                )}

                <div className={styles.overlay}>
                    <button
                        className={styles.detailsBtn}
                        onClick={e => { e.stopPropagation(); onDetails(movie); }}
                    >
                        SzczegĂłĹ‚y
                    </button>
                </div>

                {isUnavailable && (
                    <div className={styles.unavailableBadge}>
                        {movie.is_rented ? 'WypoĹĽyczone' : 'NiedostÄ™pny'}
                    </div>
                )}

                {movie.country && (
                    <div className={styles.countryBadge}>{movie.country}</div>
                )}
            </div>

            <div className={styles.info}>
                {movie.genres && movie.genres.length > 0 && (
                    <div className={styles.genres}>
                        {movie.genres.slice(0, 2).map(g => (
                            <span key={g.id} className={styles.genre}>{g.name}</span>
                        ))}
                    </div>
                )}

                <h3 className={styles.title} onClick={() => onDetails(movie)}>
                    {movie.title}
                </h3>

                <p className={styles.meta}>
                    {[
                        releaseYear,
                        movie.duration_minutes
                            ? `${Math.floor(movie.duration_minutes / 60)}h ${movie.duration_minutes % 60}m`
                            : null,
                        movie.directors?.[0]?.name
                            ? `reĹĽ. ${movie.directors[0].name}`
                            : null,
                    ].filter(Boolean).join(' Â· ')}
                </p>

                {movie.description && (
                    <p className={styles.desc}>{movie.description}</p>
                )}

                <button
                    className={`${styles.rentBtn} ${isUnavailable ? styles.rentBtnDisabled : ''}`}
                    onClick={() => !isUnavailable && onRent(movie)}
                    disabled={isUnavailable}
                >
                    {movie.is_rented
                        ? 'JuĹĽ wypoĹĽyczasz'
                        : movie.available === false
                            ? 'NiedostÄ™pny'
                            : 'WypoĹĽycz â€” 14 dni'}
                </button>
            </div>
        </motion.div>
    );
};

export default MovieCard;
