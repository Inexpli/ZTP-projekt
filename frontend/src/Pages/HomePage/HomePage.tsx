import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import MovieCard from '../../components/MovieCard/MovieCard';
import RentalModal from '../../components/RentalModal/RentalModal';
import { Movie, PaginationMeta } from '../../rental-v2/types/index';
import * as movieService from '../../services/movieService';
import * as rentalService from '../../services/rentalService';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    // Dane filmów
    const [movies, setMovies] = useState<Movie[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [loadingMovies, setLoadingMovies] = useState(true);
    const [moviesError, setMoviesError] = useState('');

    // Filtry
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState(''); // opóźnione wyszukiwanie
    const [page, setPage] = useState(1);

    // Modal wypożyczenia
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rentingLoading, setRentingLoading] = useState(false);

    // Toast
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Aktywne wypożyczenia (dla ikony koszyka w Navbar)
    const [activeRentalCount, setActiveRentalCount] = useState(0);

    // ─── Pobierz filmy ─────────────────────────────────────────────────────────
    const fetchMovies = useCallback(async () => {
        setLoadingMovies(true);
        setMoviesError('');
        try {
            const result = await movieService.getMovies(page, 20, search || undefined);

            // Dla każdego filmu sprawdź dostępność (batch — opcjonalne, można pominąć dla perf)
            const moviesWithAvailability = await Promise.all(
                result.movies.map(async (movie) => {
                    try {
                        const check = await rentalService.checkMovieAvailability(movie.movie_id);
                        return { ...movie, available: check.available };
                    } catch {
                        return { ...movie, available: true };
                    }
                })
            );

            setMovies(moviesWithAvailability);
            setPagination(result.pagination);
        } catch (err: any) {
            setMoviesError('Nie udało się załadować filmów. Spróbuj ponownie.');
        } finally {
            setLoadingMovies(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    // ─── Opóźnione wyszukiwanie (debounce) ────────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // ─── Pobierz liczbę aktywnych wypożyczeń ──────────────────────────────────
    useEffect(() => {
        rentalService.getMyActiveRentals()
            .then(res => setActiveRentalCount(res.rentals.length))
            .catch(() => { }); // cicho — może być niezalogowany
    }, []);

    // ─── Wypożyczenie ─────────────────────────────────────────────────────────
    const handleRent = (movie: Movie) => {
        setSelectedMovie(movie);
        setIsModalOpen(true);
    };

    const handleConfirmRental = async (movie: Movie) => {
        setRentingLoading(true);
        try {
            await rentalService.rentMovie(movie.movie_id);

            // Zaktualizuj dostępność w liście
            setMovies(prev =>
                prev.map(m => m.movie_id === movie.movie_id ? { ...m, available: false } : m)
            );
            setActiveRentalCount(c => c + 1);
            setIsModalOpen(false);
            showToast(`„${movie.title}" wypożyczony na 14 dni!`, 'success');
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Nie udało się wypożyczyć filmu.';
            showToast(msg, 'error');
            // Jeśli błąd 401 — przekieruj do logowania
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setRentingLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // ─── Featured (pierwszy dostępny film z listy) ────────────────────────────
    const featuredMovie = movies.find(m => m.available !== false) ?? movies[0];

    return (
        <div className={styles.page}>
            <Navbar
                cartCount={activeRentalCount}
                onCartClick={() => navigate('/rentals')}
            />

            {/* ─── Hero ──────────────────────────────────────────────────────── */}
            {!loadingMovies && featuredMovie && (
                <section className={styles.hero}>
                    <div className={styles.heroBackground}>
                        {featuredMovie.poster_url ? (
                            <img
                                src={featuredMovie.poster_url}
                                alt=""
                                className={styles.heroBgImage}
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

                            <h1 className={styles.heroTitle}>{featuredMovie.title}</h1>

                            <div className={styles.heroMeta}>
                                {featuredMovie.release_date && (
                                    <span>{featuredMovie.release_date.split('-')[0]}</span>
                                )}
                                {featuredMovie.duration_minutes && (
                                    <>
                                        <span className={styles.heroDivider}>·</span>
                                        <span>
                                            {Math.floor(featuredMovie.duration_minutes / 60)}h{' '}
                                            {featuredMovie.duration_minutes % 60}m
                                        </span>
                                    </>
                                )}
                                {featuredMovie.country && (
                                    <>
                                        <span className={styles.heroDivider}>·</span>
                                        <span>{featuredMovie.country}</span>
                                    </>
                                )}
                            </div>

                            {featuredMovie.description && (
                                <p className={styles.heroDescription}>{featuredMovie.description}</p>
                            )}

                            <div className={styles.heroActions}>
                                <button
                                    className={styles.heroRentBtn}
                                    onClick={() => handleRent(featuredMovie)}
                                    disabled={featuredMovie.available === false}
                                >
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                        <polygon points="5,3 19,12 5,21" />
                                    </svg>
                                    Wypożycz teraz · 14 dni
                                </button>

                                {featuredMovie.trailer_url && (
                                    <a
                                        href={featuredMovie.trailer_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.heroTrailerBtn}
                                    >
                                        Obejrzyj zwiastun
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* ─── Toast ─────────────────────────────────────────────────────── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}
                        initial={{ opacity: 0, y: -60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -60 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                        <span className={styles.toastIcon}>
                            {toast.type === 'success' ? '✓' : '✕'}
                        </span>
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Catalog ───────────────────────────────────────────────────── */}
            <section className={styles.catalog}>
                <div className={styles.catalogInner}>
                    <div className={styles.catalogHeader}>
                        <div>
                            <h2 className={styles.catalogTitle}>Katalog filmów</h2>
                            {pagination && (
                                <p className={styles.catalogCount}>
                                    {pagination.total} {pagination.total === 1 ? 'film' : 'filmów'}
                                </p>
                            )}
                        </div>

                        <div className={styles.searchWrapper}>
                            <svg className={styles.searchIcon} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Szukaj tytułu lub opisu..."
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                className={styles.searchInput}
                            />
                            {searchInput && (
                                <button
                                    className={styles.searchClear}
                                    onClick={() => setSearchInput('')}
                                >×</button>
                            )}
                        </div>
                    </div>

                    {/* Skeleton / Error / Grid */}
                    {loadingMovies ? (
                        <div className={styles.skeletonGrid}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className={styles.skeletonCard}>
                                    <div className={styles.skeletonPoster} />
                                    <div className={styles.skeletonInfo}>
                                        <div className={styles.skeletonLine} style={{ width: '75%' }} />
                                        <div className={styles.skeletonLine} style={{ width: '50%' }} />
                                        <div className={styles.skeletonBtn} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : moviesError ? (
                        <div className={styles.errorState}>
                            <span>⚠️</span>
                            <p>{moviesError}</p>
                            <button className={styles.retryBtn} onClick={fetchMovies}>
                                Spróbuj ponownie
                            </button>
                        </div>
                    ) : movies.length === 0 ? (
                        <div className={styles.emptyState}>
                            <span>🎬</span>
                            <p>Nie znaleziono filmów dla „{search}"</p>
                        </div>
                    ) : (
                        <div className={styles.moviesGrid}>
                            {movies.map((movie, index) => (
                                <MovieCard
                                    key={movie.movie_id}
                                    movie={movie}
                                    onRent={handleRent}
                                    onDetails={m => navigate(`/movie/${m.movie_id}`)}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}

                    {/* Paginacja */}
                    {pagination && pagination.total_pages > 1 && !loadingMovies && (
                        <div className={styles.pagination}>
                            <button
                                className={styles.pageBtn}
                                onClick={() => setPage(p => p - 1)}
                                disabled={!pagination.has_prev}
                            >
                                ← Poprzednia
                            </button>
                            <span className={styles.pageInfo}>
                                Strona {pagination.page} / {pagination.total_pages}
                            </span>
                            <button
                                className={styles.pageBtn}
                                onClick={() => setPage(p => p + 1)}
                                disabled={!pagination.has_next}
                            >
                                Następna →
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <RentalModal
                movie={selectedMovie}
                isOpen={isModalOpen}
                onClose={() => !rentingLoading && setIsModalOpen(false)}
                onConfirm={handleConfirmRental}
                loading={rentingLoading}
            />
        </div>
    );
};

export default HomePage;
