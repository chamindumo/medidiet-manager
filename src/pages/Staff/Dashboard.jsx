import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { ClipboardList, Plus, ShoppingBag, User, Trash2, Bed } from 'lucide-react';
import { subscribeToCollection, addItem, deleteItem } from '../../services/firebaseService';

const StaffDashboard = () => {
    const [activeWard, setActiveWard] = useState('A-Wing');
    const [patientName, setPatientName] = useState('');
    const [dietaryNotes, setDietaryNotes] = useState('');
    const [orders, setOrders] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [patients, setPatients] = useState([]);
    const [currentOrder, setCurrentOrder] = useState([]);
    const [activeTab, setActiveTab] = useState('Patient Meals');

    useEffect(() => {
        const unsubscribeOrders = subscribeToCollection('orders', setOrders);
        const unsubscribeMenu = subscribeToCollection('menu', setMenuItems);
        const unsubscribePatients = subscribeToCollection('patients', setPatients);
        return () => {
            unsubscribeOrders();
            unsubscribeMenu();
            unsubscribePatients();
        };
    }, []);

    const addToOrder = (item) => {
        setCurrentOrder([...currentOrder, item]);
    };

    const placeOrder = async () => {
        if (currentOrder.length === 0 || !patientName) {
            alert("Please enter Patient Name and select items.");
            return;
        }
        const orderData = {
            ward: activeWard,
            patientName: patientName,
            dietaryNotes: dietaryNotes,
            items: currentOrder.map(i => i.name).join(', '),
            total: currentOrder.reduce((sum, i) => sum + (i.price || 0), 0),
            status: 'Ordered',
            type: 'Hospital Meal'
        };
        try {
            await addItem('orders', orderData);
            setCurrentOrder([]);
            setPatientName('');
            setDietaryNotes('');
            alert(`Meal plan submitted for ${patientName} in ${activeWard}!`);
        } catch (error) {
            console.error("Error submitting meal plan:", error);
        }
    };

    const links = [
        { label: 'Patient Meals', icon: ClipboardList, active: activeTab === 'Patient Meals' },
        { label: 'Ward Map', icon: Bed, active: activeTab === 'Ward Map' },
    ];

    return (
        <DashboardLayout title="Dietary Service Station" links={links} onLinkClick={setActiveTab}>
            <div className="grid" style={{ gridTemplateColumns: activeTab === 'Patient Meals' ? '1.5fr 1fr' : '1fr' }}>

                {activeTab === 'Patient Meals' && (
                    <>
                        {/* Meal Entry Section */}
                        <section className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{ marginBottom: '1rem' }}>Dietary Entry - {activeWard}</h2>
                                <div className="flex" style={{ gap: '0.8rem', marginBottom: '1.5rem' }}>
                                    {['A-Wing', 'B-Wing', 'C-Wing', 'Care Center', 'St. Michels'].map(w => (
                                        <button key={w} onClick={() => { setActiveWard(w); setPatientName(''); }} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: activeWard === w ? 'var(--primary)' : 'transparent', color: 'white', cursor: 'pointer' }}>{w}</button>
                                    ))}
                                </div>
                                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <select 
                                        value={patientName} 
                                        onChange={e => setPatientName(e.target.value)} 
                                        required 
                                        style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                                    >
                                        <option value="" disabled>Select Patient Name</option>
                                        {(() => {
                                            const getPrefix = (ward) => {
                                                if (ward === 'A-Wing') return 'A-';
                                                if (ward === 'B-Wing') return 'B-';
                                                if (ward === 'C-Wing') return 'C-';
                                                if (ward === 'Care Center') return 'NU-';
                                                return ward;
                                            };
                                            const prefix = getPrefix(activeWard);
                                            const filteredPatients = patients.filter(p => p.room && p.room.startsWith(prefix));
                                            
                                            if (filteredPatients.length === 0) {
                                                return <option value="" disabled>No patients in {activeWard}</option>;
                                            }
                                            
                                            return filteredPatients.map(p => (
                                                <option key={p.id || p.name} value={p.name}>{p.name} {p.roomNo ? `(#${p.roomNo})` : ''}</option>
                                            ));
                                        })()}
                                    </select>
                                    <input placeholder="Dietary Restrictions (e.g. No Salt)" value={dietaryNotes} onChange={e => setDietaryNotes(e.target.value)} />
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Select Prescribed Meals:</h3>
                            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                                {menuItems.map(item => (
                                    <div key={item.id} className="glass" style={{ padding: '1rem', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}>
                                        <p style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                            {typeof item.name === 'object' ? (item.name.productName || JSON.stringify(item.name)) : item.name}
                                        </p>
                                        <span className="badge" style={{ fontSize: '0.65rem', marginBottom: '0.5rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>{item.dietary || 'General'}</span>
                                        <button className="btn btn-secondary" onClick={() => addToOrder(item)} style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem' }}><Plus size={14} /> Add</button>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Current Meal Plan:</p>
                                    <p style={{ fontWeight: '500' }}>{currentOrder.map(i => typeof i.name === 'object' ? i.name.productName : i.name).join(', ') || 'None'}</p>
                                </div>
                                <button className="btn btn-primary" style={{ width: '100%' }} onClick={placeOrder} disabled={currentOrder.length === 0 || !patientName}>
                                    Submit to Hospital Kitchen
                                </button>
                            </div>
                        </section>

                        {/* Active Meals List */}
                        <section className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Live Diet Orders</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
                                {orders.map(order => (
                                    <div key={order.id} style={{ padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'rgba(30, 41, 59, 0.4)' }}>
                                        <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 'bold' }}>{order.ward} - {typeof order.patientName === 'object' ? JSON.stringify(order.patientName) : (order.patientName || 'Untitled')}</span>
                                            <span className={`badge ${order.status === 'Ordered' ? 'badge-warning' : 'badge-success'}`}>{order.status}</span>
                                        </div>
                                        {order.dietaryNotes && (
                                            <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginBottom: '0.5rem' }}>⚠️ {order.dietaryNotes}</p>
                                        )}
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                            {
                                                typeof order.items === 'object' ?
                                                    (Array.isArray(order.items) ? order.items.map(it => typeof it === 'object' ? (it.productName || JSON.stringify(it)) : it).join(', ') : (order.items.productName || JSON.stringify(order.items))) :
                                                    order.items
                                            }
                                        </p>
                                        <div className="flex" style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                            <button onClick={() => deleteItem('orders', order.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', opacity: 0.6 }}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {activeTab === 'Ward Map' && (
                    <section className="glass" style={{ padding: '3rem', borderRadius: '24px', textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '2rem' }}>Hospital Wards Overview</h2>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', maxWidth: '600px', margin: '0 auto' }}>
                            {['A-Wing', 'B-Wing', 'C-Wing', 'Care Center', 'St. Michels'].map(w => (
                                <div key={w} className="glass" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: activeWard === w ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
                                    <Bed size={32} style={{ marginBottom: '1rem', color: activeWard === w ? 'var(--primary)' : 'var(--text-muted)' }} />
                                    {w}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </DashboardLayout>
    );
};

export default StaffDashboard;
