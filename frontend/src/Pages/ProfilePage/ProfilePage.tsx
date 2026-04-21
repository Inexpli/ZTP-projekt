import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar/Navbar';
import * as authService from '../../services/authService';
import styles from './ProfilePage.module.css';

const ProfilePage: React.FC = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', msg: 'Nowe hasła nie są identyczne' });
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword(oldPassword, newPassword);
            setStatus({ type: 'success', msg: 'Hasło zostało pomyślnie zmienione' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setStatus({
                type: 'error',
                msg: err.response?.data?.error || 'Wystąpił błąd podczas zmiany hasła'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Navbar />

            <main className={styles.content}>
                <motion.div
                    className={styles.profileCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className={styles.title}>Ustawienia Profilu</h1>

                    <section className={styles.section}>
                        <h2>Zmiana Hasła</h2>
                        <form onSubmit={handlePasswordChange} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label>Obecne hasło</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Nowe hasło</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Powtórz nowe hasło</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {status && (
                                <div className={`${styles.status} ${styles[status.type]}`}>
                                    {status.msg}
                                </div>
                            )}

                            <button
                                type="submit"
                                className={styles.saveBtn}
                                disabled={loading}
                            >
                                {loading ? 'Przetwarzanie...' : 'Zaktualizuj hasło'}
                            </button>
                        </form>
                    </section>
                </motion.div>
            </main>
        </div>
    );
};

export default ProfilePage;