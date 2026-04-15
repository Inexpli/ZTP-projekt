import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import MovieCard from '../../components/MovieCard/MovieCard';
import RentalModal from '../../components/RentalModal/RentalModal';
import { Movie } from '../../types';
import { MOCK_MOVIES, FEATURED_MOVIE } from '../../data/movies';
import styles from './HomePage.module.css';

const GENRES = ['Wszystkie', 'Dramat', 'Akcja', 'Sci-Fi', 'Kryminał', 'Romans', 'Thriller', 'Historia', 'Biograficzny'];

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState('Wszystkie');
    const [searchQuery, setSearchQuery] = useState('');
    const [rentedMovies, setRentedMovies] = useState<number[]>([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [featuredImgError, setFeaturedImgError] = useState(false);

    const filteredMovies = useMemo(() => {
        return MOCK_MOVIES.filter(movie => {
            const matchesGenre = selectedGenre === 'Wszystkie' || movie.genre.includes(selectedGenre);
            const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                movie.director.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesGenre && matchesSearch;
        });
    }, [selectedGenre, searchQuery]);

    const handleRent = (movie: Movie) => {
        setSelectedMovie(movie);
        setIsModalOpen(true);
    };

    const handleConfirmRental = (movie: Movie, days: number) => {
        setRentedMovies(prev => [...prev, movie.id]);
        setSuccessMessage(`„${movie.title}" zostało wypożyczone na ${days} dni!`);
        setTimeout(() => setSuccessMessage(''), 4000);
    };

    return (
        <div className={styles.page}>
            <Navbar
                cartCount={rentedMovies.length}
                onCartClick={() => navigate('/rentals')}
            />

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroBackground}>
                    {!featuredImgError ? (
                        <img
                            src={FEATURED_MOVIE.posterUrl}
                            alt=""
                            className={styles.heroBgImage}
                            onError={() => setFeaturedImgError(true)}
                        />
                    ) : (
                        <div className={styles.heroBgFallback} />
                    )}
                    <div className={styles.heroGradient} />
                </div>

                <div className={styles.heroContent}>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <div className={styles.heroLabel}>
                            <span className={styles.heroDot} />
                            Polecany film
                        </div>

                        <h1 className={styles.heroTitle}>{FEATURED_MOVIE.title}</h1>

                        <div className={styles.heroMeta}>
                            <span className={styles.heroRating}>★ {FEATURED_MOVIE.rating}</span>
                            <span className={styles.heroDivider}>·</span>
                            <span>{FEATURED_MOVIE.year}</span>
                            <span className={styles.heroDivider}>·</span>
                            <span>{Math.floor(FEATURED_MOVIE.duration / 60)}h {FEATURED_MOVIE.duration % 60}m</span>
                            <span className={styles.heroDivider}>·</span>
                            <span>reż. {FEATURED_MOVIE.director}</span>
                        </div>

                        <p className={styles.heroDescription}>{FEATURED_MOVIE.description}</p>

                        <div className={styles.heroActions}>
                            <button
                                className={styles.heroRentBtn}
                                onClick={() => handleRent(FEATURED_MOVIE)}
                            >
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <polygon points="5,3 19,12 5,21" fill="currentColor" stroke="none" />
                                </svg>
                                Wypożycz teraz · {FEATURED_MOVIE.pricePerDay.toFixed(2)} zł/dzień
                            </button>
                            <button
                                className={styles.heroDetailsBtn}
                                onClick={() => navigate(`/movie/${FEATURED_MOVIE.id}`)}
                            >
                                Więcej informacji
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Success Toast */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        className={styles.toast}
                        initial={{ opacity: 0, y: -60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -60 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                        <span className={styles.toastIcon}>✓</span>
                        {successMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Catalog Section */}
            <section className={styles.catalog}>
                <div className={styles.catalogInner}>
                    <div className={styles.catalogHeader}>
                        <h2 className={styles.catalogTitle}>Katalog filmów</h2>

                        <div className={styles.searchWrapper}>
                            <svg className={styles.searchIcon} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Szukaj tytułu lub reżysera..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                    </div>

                    <div className={styles.genreFilters}>
                        {GENRES.map(genre => (
                            <button
                                key={genre}
                                className={`${styles.genreFilter} ${selectedGenre === genre ? styles.genreFilterActive : ''}`}
                                onClick={() => setSelectedGenre(genre)}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>

                    {filteredMovies.length === 0 ? (
                        <motion.div
                            className={styles.emptyState}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <span className={styles.emptyIcon}>🎬</span>
                            <p>Nie znaleziono filmów pasujących do kryteriów</p>
                        </motion.div>
                    ) : (
                        <div className={styles.moviesGrid}>
                            {filteredMovies.map((movie, index) => (
                                <MovieCard
                                    key={movie.id}
                                    movie={movie}
                                    onRent={handleRent}
                                    onDetails={(m) => navigate(`/movie/${m.id}`)}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <RentalModal
                movie={selectedMovie}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmRental}
            />
        </div>
    );
};

export default HomePage;
