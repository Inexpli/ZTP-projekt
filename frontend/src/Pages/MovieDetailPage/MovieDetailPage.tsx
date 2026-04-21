import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import RentalModal from '../../components/RentalModal/RentalModal';
import VideoModal from '../../components/VideoModal/VideoModal'; // Import VideoModal
import { Movie, Actor, Director } from '../../rental-v2/types/index';
import * as movieService from '../../services/movieService';
import * as rentalService from '../../services/rentalService';
import styles from './MovieDetailPage.module.css';

const MovieDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVideoOpen, setIsVideoOpen] = useState(false); // Stan dla VideoModal
    const [rentingLoading, setRentingLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [activeTab, setActiveTab] = useState<'cast' | 'directors'>('cast');
    const [selectedPerson, setSelectedPerson] = useState<Actor | Director | null>(null);
    const [posterError, setPosterError] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchMovie = async () => {
            setLoading(true);
            try {
                const data = await movieService.getMovieById(Number(id));
                try {
                    const check = await rentalService.checkMovieAvailability(data.movie_id);
                    setMovie({ ...data, available: check.available });
                } catch {
                    setMovie(data);
                }
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setError('Film nie został znaleziony.');
                } else {
                    setError('Nie udało się załadować danych.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchMovie();
    }, [id]);

    const handleConfirmRental = async (m: Movie) => {
        setRentingLoading(true);
        try {
            await rentalService.rentMovie(m.movie_id);
            setMovie(prev => prev ? { ...prev, available: false } : prev);
            setIsModalOpen(false);
            showToast(`„${m.title}" wypożyczony na 14 dni!`, 'success');
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Nie udało się wypożyczyć.';
            showToast(msg, 'error');
            if (err.response?.status === 401) navigate('/login');
        } finally {
            setRentingLoading(false);
        }
    };

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString('pl-PL', {
            day: 'numeric', month: 'long', year: 'numeric',
        });
    };

    const releaseYear = movie?.release_date?.split('-')[0];

    if (loading) {
        return (
            <div className={styles.page}>
                <Navbar />
                <div className={styles.skeletonHero}>
                    <div className={styles.skeletonPoster} />
                    <div className={styles.skeletonInfo}>
                        {[80, 50, 60, 90, 40].map((w, i) => (
                            <div key={i} className={styles.skeletonLine}
                                style={{ width: `${w}%`, height: i === 0 ? 40 : 16 }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className={styles.page}>
                <Navbar />
                <div className={styles.errorState}>
                    <span>🎬</span>
                    <p>{error || 'Film nie istnieje'}</p>
                    <button onClick={() => navigate('/')}>Wróć do katalogu</button>
                </div>
            </div>
        );
    }

    const hasCast = movie.actors && movie.actors.length > 0;
    const hasDirectors = movie.directors && movie.directors.length > 0;

    return (
        <div className={styles.page}>
            <Navbar onCartClick={() => navigate('/rentals')} />

            <AnimatePresence>
                {toast && (
                    <motion.div
                        className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}
                        initial={{ opacity: 0, y: -60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -60 }}
                    >
                        <span className={styles.toastIcon}>{toast.type === 'success' ? '✓' : '✕'}</span>
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={styles.hero}>
                {movie.poster_url && !posterError && (
                    <img
                        src={movie.poster_url}
                        alt=""
                        className={styles.heroBg}
                        onError={() => setPosterError(true)}
                    />
                )}
                <div className={styles.heroOverlay} />
            </div>

            <div className={styles.container}>
                <motion.div
                    className={styles.mainSection}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className={styles.posterCol}>
                        <div className={styles.posterWrapper}>
                            {movie.poster_url && !posterError ? (
                                <img
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    className={styles.poster}
                                    onError={() => setPosterError(true)}
                                />
                            ) : (
                                <div className={styles.posterFallback}>
                                    <span>🎬</span>
                                </div>
                            )}
                        </div>

                        <button
                            className={`${styles.rentBtn} ${movie.available === false ? styles.rentBtnDisabled : ''}`}
                            onClick={() => movie.available !== false && setIsModalOpen(true)}
                            disabled={movie.available === false}
                        >
                            {movie.available === false ? (
                                <>
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                    </svg>
                                    Niedostępny
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                        <polygon points="5,3 19,12 5,21" />
                                    </svg>
                                    Wypożycz · 14 dni
                                </>
                            )}
                        </button>

                        {/* Poprawiony przycisk zwiastuna otwierający VideoModal */}
                        {movie.trailer_url && (
                            <button
                                type="button"
                                className={styles.trailerBtn}
                                onClick={() => setIsVideoOpen(true)}
                                style={{ width: '100%', marginTop: '12px' }}
                            >
                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                    <polygon points="5,3 19,12 5,21" />
                                </svg>
                                Zwiastun
                            </button>
                        )}
                    </div>

                    <div className={styles.infoCol}>
                        <button className={styles.backBtn} onClick={() => navigate(-1)}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <polyline points="15,18 9,12 15,6" />
                            </svg>
                            Wróć
                        </button>

                        {movie.genres.length > 0 && (
                            <div className={styles.genres}>
                                {movie.genres.map(g => (
                                    <span key={g.id} className={styles.genre}>{g.name}</span>
                                ))}
                            </div>
                        )}

                        <h1 className={styles.title}>{movie.title}</h1>

                        <div className={styles.meta}>
                            {releaseYear && <span>{releaseYear}</span>}
                            {movie.duration_minutes && (
                                <>
                                    <span className={styles.dot}>·</span>
                                    <span>
                                        {Math.floor(movie.duration_minutes / 60)}h{' '}
                                        {movie.duration_minutes % 60}m
                                    </span>
                                </>
                            )}
                            {movie.country && (
                                <>
                                    <span className={styles.dot}>·</span>
                                    <span>{movie.country}</span>
                                </>
                            )}
                        </div>

                        {hasDirectors && (
                            <div className={styles.directorsRow}>
                                <span className={styles.metaLabel}>Reżyseria</span>
                                <span className={styles.metaValue}>
                                    {movie.directors.map(d => d.name).join(', ')}
                                </span>
                            </div>
                        )}

                        {movie.description && (
                            <p className={styles.description}>{movie.description}</p>
                        )}

                        {movie.release_date && (
                            <div className={styles.detailRow}>
                                <span className={styles.metaLabel}>Premiera</span>
                                <span className={styles.metaValue}>{formatDate(movie.release_date)}</span>
                            </div>
                        )}

                        <div className={styles.availabilityRow}>
                            <span className={`${styles.availDot} ${movie.available === false ? styles.availDotNo : styles.availDotYes}`} />
                            <span className={styles.metaValue}>
                                {movie.available === false ? 'Aktualnie wypożyczony' : 'Dostępny'}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {(hasCast || hasDirectors) && (
                    <motion.section
                        className={styles.castSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className={styles.castTabs}>
                            {hasCast && (
                                <button
                                    className={`${styles.castTab} ${activeTab === 'cast' ? styles.castTabActive : ''}`}
                                    onClick={() => setActiveTab('cast')}
                                >
                                    Obsada
                                    <span className={styles.castTabCount}>{movie.actors.length}</span>
                                </button>
                            )}
                            {hasDirectors && (
                                <button
                                    className={`${styles.castTab} ${activeTab === 'directors' ? styles.castTabActive : ''}`}
                                    onClick={() => setActiveTab('directors')}
                                >
                                    Reżyseria
                                    <span className={styles.castTabCount}>{movie.directors.length}</span>
                                </button>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                            >
                                {activeTab === 'cast' && hasCast && (
                                    <div className={styles.personGrid}>
                                        {movie.actors.map(actor => (
                                            <PersonCard
                                                key={actor.id}
                                                person={actor}
                                                subtitle={actor.role}
                                                onClick={() => setSelectedPerson(actor)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'directors' && hasDirectors && (
                                    <div className={styles.personGrid}>
                                        {movie.directors.map(director => (
                                            <PersonCard
                                                key={director.id}
                                                person={director}
                                                subtitle="Reżyseria"
                                                onClick={() => setSelectedPerson(director)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </motion.section>
                )}
            </div>

            <AnimatePresence>
                {selectedPerson && (
                    <PersonBioModal
                        person={selectedPerson}
                        onClose={() => setSelectedPerson(null)}
                    />
                )}
            </AnimatePresence>

            {/* Modal wypożyczenia */}
            <RentalModal
                movie={movie}
                isOpen={isModalOpen}
                onClose={() => !rentingLoading && setIsModalOpen(false)}
                onConfirm={handleConfirmRental}
                loading={rentingLoading}
            />

            {/* Dodany VideoModal */}
            <VideoModal
                isOpen={isVideoOpen}
                onClose={() => setIsVideoOpen(false)}
                trailerUrl={movie.trailer_url || ''}
                movieTitle={movie.title}
            />
        </div>
    );
};

// ─── PersonCard ──────────────────────────────────────────────────────────────
interface PersonCardProps {
    person: Actor | Director;
    subtitle?: string | null;
    onClick: () => void;
}

const PersonCard: React.FC<PersonCardProps> = ({ person, subtitle, onClick }) => {
    const [imgErr, setImgErr] = useState(false);
    const hasBio = !!(person.biography || person.birth_place || person.birth_date);

    return (
        <motion.button
            className={`${styles.personCard} ${hasBio ? styles.personCardClickable : ''}`}
            onClick={hasBio ? onClick : undefined}
            whileHover={hasBio ? { y: -4 } : {}}
            transition={{ duration: 0.2 }}
        >
            <div className={styles.personPhoto}>
                {person.photo_url && !imgErr ? (
                    <img
                        src={person.photo_url}
                        alt={person.name}
                        onError={() => setImgErr(true)}
                    />
                ) : (
                    <div className={styles.personPhotoFallback}>
                        {person.name.charAt(0)}
                    </div>
                )}
            </div>
            <div className={styles.personInfo}>
                <span className={styles.personName}>{person.name}</span>
                {subtitle && (
                    <span className={styles.personRole}>{subtitle}</span>
                )}
            </div>
            {hasBio && (
                <div className={styles.personArrow}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="9,18 15,12 9,6" />
                    </svg>
                </div>
            )}
        </motion.button>
    );
};

// ─── PersonBioModal ───────────────────────────────────────────────────────────
interface PersonBioModalProps {
    person: Actor | Director;
    onClose: () => void;
}

const PersonBioModal: React.FC<PersonBioModalProps> = ({ person, onClose }) => {
    const [imgErr, setImgErr] = useState(false);

    const formatDate = (d?: string) => d
        ? new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    const isActor = (p: Actor | Director): p is Actor => 'role' in p;

    return (
        <>
            <motion.div
                className={styles.bioBackdrop}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />
            <motion.div
                className={styles.bioModal}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
                <button className={styles.bioClose} onClick={onClose}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className={styles.bioHeader}>
                    <div className={styles.bioPhoto}>
                        {person.photo_url && !imgErr ? (
                            <img
                                src={person.photo_url}
                                alt={person.name}
                                onError={() => setImgErr(true)}
                            />
                        ) : (
                            <div className={styles.bioPhotoFallback}>
                                {person.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className={styles.bioName}>{person.name}</h2>
                        {isActor(person) && person.role && (
                            <p className={styles.bioRole}>jako {person.role}</p>
                        )}
                        {!isActor(person) && (
                            <p className={styles.bioRole}>Reżyseria</p>
                        )}
                    </div>
                </div>

                <div className={styles.bioMeta}>
                    {person.birth_date && (
                        <div className={styles.bioMetaRow}>
                            <span className={styles.bioMetaLabel}>Data urodzenia</span>
                            <span className={styles.bioMetaValue}>{formatDate(person.birth_date)}</span>
                        </div>
                    )}
                    {person.birth_place && (
                        <div className={styles.bioMetaRow}>
                            <span className={styles.bioMetaLabel}>Miejsce urodzenia</span>
                            <span className={styles.bioMetaValue}>{person.birth_place}</span>
                        </div>
                    )}
                    {person.gender && (
                        <div className={styles.bioMetaRow}>
                            <span className={styles.bioMetaLabel}>Płeć</span>
                            <span className={styles.bioMetaValue}>{person.gender === 'M' ? 'Mężczyzna' : 'Kobieta'}</span>
                        </div>
                    )}
                </div>

                {person.biography && (
                    <div className={styles.bioBio}>
                        <h3 className={styles.bioBioTitle}>Biografia</h3>
                        <p className={styles.bioBioText}>{person.biography}</p>
                    </div>
                )}
            </motion.div>
        </>
    );
};

export default MovieDetailPage;