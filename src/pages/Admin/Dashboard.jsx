import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { ShieldCheck, Users, BarChart3, Settings, Activity, ClipboardCheck } from 'lucide-react';
import { subscribeToCollection } from '../../services/firebaseService';

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [stock, setStock] = useState([]);
    const [activeTab, setActiveTab] = useState('Overview');

    useEffect(() => {
        const unsubscribeOrders = subscribeToCollection('orders', setOrders);
        const unsubscribeStock = subscribeToCollection('stock', setStock);
        return () => {
            unsubscribeOrders();
            unsubscribeStock();
        };
    }, []);

    const totalMeals = orders.length;
    const criticalSupplies = stock.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock').length;

    const stats = [
        { label: 'Meals Served Today', value: totalMeals.toString(), icon: ClipboardCheck, color: '#10b981' },
        { label: 'Ward Compliance', value: '98%', icon: Activity, color: '#3b82f6' },
        { label: 'Supply Alerts', value: criticalSupplies.toString(), icon: ShieldCheck, color: '#ef4444' },
    ];

    const links = [
        { label: 'Overview', icon: BarChart3, active: activeTab === 'Overview' },
        { label: 'Patient Database', icon: Users, active: activeTab === 'Patient Database' },
        { label: 'Dietary Compliance', icon: ClipboardCheck, active: activeTab === 'Dietary Compliance' },
        { label: 'System Settings', icon: Settings, active: activeTab === 'System Settings' },
    ];

    return (
        <DashboardLayout title="Hospital Dietary Analytics" links={links} onLinkClick={setActiveTab}>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '2.5rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} className="glass" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ padding: '1rem', borderRadius: '16px', background: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={32} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.75rem' }}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid" style={{ gridTemplateColumns: activeTab === 'Overview' ? '2fr 1fr' : '1fr' }}>

                {activeTab === 'Overview' && (
                    <>
                        <section className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Real-time Dietary Activity</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                                {orders.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No dietary activity recorded.</p>}
                                {orders.slice(0, 8).map((order, i) => (
                                    <div key={i} className="flex" style={{ padding: '1.2rem', borderBottom: '1px solid var(--border)', justifyContent: 'space-between' }}>
                                        <div className="flex" style={{ gap: '1rem' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: order.dietaryNotes ? '#f59e0b' : 'var(--primary)', marginTop: '4px' }}></div>
                                            <div>
                                                <p><span style={{ fontWeight: 'bold' }}>{order.ward} - Patient {typeof order.patientName === 'object' ? (order.patientName.productName || JSON.stringify(order.patientName)) : (order.patientName || 'Untitled')}</span></p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    {
                                                        typeof order.items === 'object' ?
                                                            (Array.isArray(order.items) ? order.items.map(it => typeof it === 'object' ? (it.productName || JSON.stringify(it)) : it).join(', ') : (order.items.productName || JSON.stringify(order.items))) :
                                                            order.items
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <span className="badge" style={{ alignSelf: 'center' }}>{order.status}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Ward Monitoring</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {['Ward A', 'Ward B', 'Ward C', 'ICU'].map((ward, i) => (
                                    <div key={i} className="flex" style={{ justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                        <span style={{ fontWeight: '500' }}>{ward}</span>
                                        <span style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>View Board</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {activeTab !== 'Overview' && (
                    <section className="glass" style={{ padding: '4rem', borderRadius: '24px', textAlign: 'center' }}>
                        <h2>{activeTab} Management Portal</h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Hospital standards and protocols are active for this module.</p>
                    </section>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
