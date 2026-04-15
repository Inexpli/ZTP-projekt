import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Movie } from '../../types';
import styles from './MovieCard.module.css';

interface MovieCardProps {
    movie: Movie;
    onRent: (movie: Movie) => void;
    onDetails: (movie: Movie) => void;
    index?: number;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onRent, onDetails, index = 0 }) => {
    const [imgError, setImgError] = useState(false);

    const fallbackColors = ['#1a1020', '#0d1a20', '#1a1a10', '#0d1520'];
    const fallbackColor = fallbackColors[movie.id % fallbackColors.length];

    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
            whileHover={{ y: -6 }}
        >
            <div className={styles.posterWrapper} onClick={() => onDetails(movie)}>
                {!imgError ? (
                    <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className={styles.poster}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className={styles.posterFallback} style={{ background: fallbackColor }}>
                        <span className={styles.posterFallbackIcon}>🎬</span>
                        <span className={styles.posterFallbackTitle}>{movie.title}</span>
                    </div>
                )}

                <div className={styles.overlay}>
                    <button className={styles.detailsBtn} onClick={(e) => { e.stopPropagation(); onDetails(movie); }}>
                        Szczegóły
                    </button>
                </div>

                <div className={styles.ratingBadge}>
                    <span className={styles.ratingIcon}>★</span>
                    <span>{movie.rating.toFixed(1)}</span>
                </div>

                {!movie.available && (
                    <div className={styles.unavailableBadge}>Niedostępny</div>
                )}
            </div>

            <div className={styles.info}>
                <div className={styles.genres}>
                    {movie.genre.slice(0, 2).map(g => (
                        <span key={g} className={styles.genre}>{g}</span>
                    ))}
                </div>

                <h3 className={styles.title} onClick={() => onDetails(movie)}>
                    {movie.title}
                </h3>

                <p className={styles.meta}>
                    {movie.year} · {Math.floor(movie.duration / 60)}h {movie.duration % 60}m · {movie.director}
                </p>

                <div className={styles.footer}>
                    <div className={styles.price}>
                        <span className={styles.priceAmount}>{movie.pricePerDay.toFixed(2)} zł</span>
                        <span className={styles.priceUnit}> / dzień</span>
                    </div>

                    <button
                        className={`${styles.rentBtn} ${!movie.available ? styles.rentBtnDisabled : ''}`}
                        onClick={() => movie.available && onRent(movie)}
                        disabled={!movie.available}
                    >
                        {movie.available ? 'Wypożycz' : 'Zajęty'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default MovieCard;
