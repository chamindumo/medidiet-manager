import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Utensils, ClipboardList, Database, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardLayout = ({ children, title, links, onLinkClick }) => {
    const { user, logout } = useAuth();

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <div className="glass" style={{ width: '280px', padding: '2rem', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>MediDiet Manager</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hospital Dietary Solutions</p>
                </div>

                <nav style={{ flex: 1 }}>
                    <ul style={{ listStyle: 'none' }}>
                        {links.map((link, idx) => (
                            <li key={idx} style={{ marginBottom: '0.5rem' }}>
                                <a href="#"
                                    onClick={(e) => { e.preventDefault(); onLinkClick?.(link.label); }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        color: link.active ? 'white' : 'var(--text-muted)',
                                        background: link.active ? 'rgba(255,255,255,0.05)' : 'transparent',
                                        textDecoration: 'none',
                                        transition: '0.3s'
                                    }}
                                >
                                    <link.icon size={20} />
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), #f9ca24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {user?.name[0]}
                        </div>
                        <div>
                            <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user?.name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem' }}>{title}</h1>
                            <p style={{ color: 'var(--text-muted)' }}>Welcome back to your workspace.</p>
                        </div>
                        <div className="flex" style={{ gap: '1rem' }}>
                            <div className="glass" style={{ padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Current Time:</span> {new Date().toLocaleTimeString()}
                            </div>
                        </div>
                    </header>

                    {children}
                </motion.div>
            </main>
        </div>
    );
};

export default DashboardLayout;
