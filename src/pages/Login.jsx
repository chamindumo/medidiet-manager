import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Utensils, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (role) => {
        login(role);
        navigate(`/${role}`);
    };

    const roles = [
        { id: 'admin', title: 'System Admin', icon: ShieldCheck, color: '#3b82f6', desc: 'Manage access & system' },
        { id: 'chef', title: 'Head Chef', icon: Utensils, color: '#f59e0b', desc: 'Menu & Stock management' },
        { id: 'staff', title: 'Service Staff', icon: Users, color: '#10b981', desc: 'Orders & Customer service' },
    ];

    return (
        <div className="login-container flex" style={{ justifyContent: 'center', height: '100vh', padding: '1rem' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass"
                style={{ width: '100%', maxWidth: '800px', padding: '3rem', borderRadius: '30px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Bistro Management
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back! Select your role to continue.</p>
                </div>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    {roles.map((role) => (
                        <motion.div
                            key={role.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleLogin(role.id)}
                            style={{
                                cursor: 'pointer',
                                padding: '2rem',
                                borderRadius: '20px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: `1px solid ${role.color}44`,
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '15px',
                                background: `${role.color}22`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                color: role.color
                            }}>
                                <role.icon size={32} />
                            </div>
                            <h3 style={{ marginBottom: '0.5rem' }}>{role.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{role.desc}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: role.color, fontWeight: '600' }}>
                                Enter Portal <ArrowRight size={16} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
