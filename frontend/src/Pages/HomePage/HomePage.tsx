import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import MovieCard from '../../components/MovieCard/MovieCard';
import RentalModal from '../../components/RentalModal/RentalModal';
import { Movie, PaginationMeta, Genre } from '../../rental-v2/types/index';
import * as movieService from '../../services/movieService';
import * as rentalService from '../../services/rentalService';
import * as genreService from '../../services/genreService';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    const [movies, setMovies] = useState<Movie[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loadingMovies, setLoadingMovies] = useState(true);
    const [moviesError, setMoviesError] = useState('');

    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
    const [page, setPage] = useState(1);

    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rentingLoading, setRentingLoading] = useState(false);
    const [activeRentalCount, setActiveRentalCount] = useState(0);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // ─── 1. Pobierz gatunki z API (raz przy starcie) ───────────────────────
    useEffect(() => {
        genreService.getGenres()
            .then(res => setGenres(res.genres))
            .catch(() => { }); // cicho — filtry opcjonalne
    }, []);

    // ─── 2. Pobierz aktywne wypożyczenia (badge w Navbar) ────────────────────
    useEffect(() => {
        rentalService.getMyActiveRentals()
            .then(res => setActiveRentalCount(res.rentals.length))
            .catch(() => { });
    }, []);

    // ─── 3. Debounce wyszukiwania (opóźnienie zapytania) ──────────────────────
    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    // ─── 4. Definicja funkcji pobierającej filmy ─────────────────────────────
    const fetchMovies = useCallback(async () => {
        setLoadingMovies(true);
        setMoviesError('');
        try {
            const result = await movieService.getMovies(
                page, 20, search || undefined, selectedGenreId || undefined
            );

            // Sprawdzanie dostępności dla każdego filmu (Uwaga: N+1 requests!)
            const withAvailability = await Promise.all(
                result.movies.map(async (movie: Movie) => {
                    try {
                        const check = await rentalService.checkMovieAvailability(movie.movie_id);
                        return { ...movie, available: check.available };
                    } catch {
                        return { ...movie, available: true };
                    }
                })
            );

            setMovies(withAvailability);
            setPagination(result.pagination);
        } catch (err) {
            setMoviesError('Nie udało się załadować filmów. Spróbuj ponownie.');
        } finally {
            setLoadingMovies(false);
        }
    }, [page, search, selectedGenreId]);

    // ─── 5. KLUCZOWA POPRAWKA: Wywołanie fetchMovies ────────────────────────
    // Bez tego useEffecta funkcja fetchMovies nigdy by się nie odpaliła!
    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    // ─── Obsługa wypożyczeń ──────────────────────────────────────────────────
    const handleRent = (movie: Movie) => {
        setSelectedMovie(movie);
        setIsModalOpen(true);
    };

    const handleConfirmRental = async (movie: Movie) => {
        setRentingLoading(true);
        try {
            await rentalService.rentMovie(movie.movie_id);
            setMovies(prev =>
                prev.map(m => m.movie_id === movie.movie_id ? { ...m, available: false } : m)
            );
            setActiveRentalCount(c => c + 1);
            setIsModalOpen(false);
            showToast(`„${movie.title}" wypożyczony na 14 dni!`, 'success');
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Nie udało się wypożyczyć.';
            showToast(msg, 'error');
            if (err.response?.status === 401) navigate('/login');
        } finally {
            setRentingLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleGenreSelect = (genreId: number | null) => {
        setSelectedGenreId(genreId);
        setPage(1);
    };

    const featuredMovie = movies.find(m => m.available !== false) ?? movies[0];

    return (
        <div className={styles.page}>
            <Navbar
                cartCount={activeRentalCount}
                onCartClick={() => navigate('/rentals')}
            />

            {/* ─── Hero ─── */}
            {!loadingMovies && featuredMovie && (
                <section className={styles.hero}>
                    <div className={styles.heroBackground}>
                        {featuredMovie.poster_url && (
                            <img src={featuredMovie.poster_url} alt="" className={styles.heroBgImage} />
                        )}
                        <div className={styles.heroGradient} />
                    </div>
                    <div className={styles.heroContent}>
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className={styles.heroLabel}>
                                <span className={styles.heroDot} />
                                Polecany film
                            </div>

                            <h1 className={styles.heroTitle}>{featuredMovie.title}</h1>

                            {featuredMovie.genres && featuredMovie.genres.length > 0 && (
                                <div className={styles.heroGenres}>
                                    {featuredMovie.genres.map(g => (
                                        <span key={g.id} className={styles.heroGenre}>{g.name}</span>
                                    ))}
                                </div>
                            )}

                            <div className={styles.heroMeta}>
                                {featuredMovie.release_date && (
                                    <span>{featuredMovie.release_date.split('-')[0]}</span>
                                )}
                                {featuredMovie.duration_minutes && (
                                    <>
                                        <span className={styles.heroDivider}>·</span>
                                        <span>{Math.floor(featuredMovie.duration_minutes / 60)}h {featuredMovie.duration_minutes % 60}m</span>
                                    </>
                                )}
                                {featuredMovie.directors && featuredMovie.directors.length > 0 && (
                                    <>
                                        <span className={styles.heroDivider}>·</span>
                                        <span>reż. {featuredMovie.directors[0].name}</span>
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
                                <button
                                    className={styles.heroDetailsBtn}
                                    onClick={() => navigate(`/movie/${featuredMovie.movie_id}`)}
                                >
                                    Więcej informacji
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* ─── Toast ─── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}
                        initial={{ opacity: 0, y: -60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -60 }}
                    >
                        <span className={styles.toastIcon}>{toast.type === 'success' ? '✓' : '✕'}</span>
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Catalog ─── */}
            <section className={styles.catalog}>
                <div className={styles.catalogInner}>
                    <div className={styles.catalogHeader}>
                        <div>
                            <h2 className={styles.catalogTitle}>Katalog filmów</h2>
                            {pagination && (
                                <p className={styles.catalogCount}>{pagination.total} filmów</p>
                            )}
                        </div>
                        <div className={styles.searchWrapper}>
                            <svg className={styles.searchIcon} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Szukaj..."
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                className={styles.searchInput}
                            />
                            {searchInput && (
                                <button className={styles.searchClear} onClick={() => setSearchInput('')}>×</button>
                            )}
                        </div>
                    </div>

                    {genres.length > 0 && (
                        <div className={styles.genreFilters}>
                            <button
                                className={`${styles.genreFilter} ${!selectedGenreId ? styles.genreFilterActive : ''}`}
                                onClick={() => handleGenreSelect(null)}
                            >
                                Wszystkie
                            </button>
                            {genres.map(g => (
                                <button
                                    key={g.id}
                                    className={`${styles.genreFilter} ${selectedGenreId === g.id ? styles.genreFilterActive : ''}`}
                                    onClick={() => handleGenreSelect(g.id)}
                                >
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    )}

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
                            <button className={styles.retryBtn} onClick={fetchMovies}>Spróbuj ponownie</button>
                        </div>
                    ) : movies.length === 0 ? (
                        <div className={styles.emptyState}>
                            <span>🎬</span>
                            <p>Nie znaleziono filmów{search ? ` dla „${search}"` : ''}</p>
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

                    {pagination && pagination.total_pages > 1 && !loadingMovies && (
                        <div className={styles.pagination}>
                            <button className={styles.pageBtn} onClick={() => setPage(p => p - 1)} disabled={!pagination.has_prev}>← Poprzednia</button>
                            <span className={styles.pageInfo}>Strona {pagination.page} / {pagination.total_pages}</span>
                            <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)} disabled={!pagination.has_next}>Następna →</button>
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