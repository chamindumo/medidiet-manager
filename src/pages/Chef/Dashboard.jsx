import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Utensils, Database, Plus, Trash2, Check, Activity, HeartPulse } from 'lucide-react';
import { subscribeToCollection, addItem, updateItem, deleteItem, seedDatabase } from '../../services/firebaseService';

const ChefDashboard = () => {
    const [stock, setStock] = useState([]);
    const [menu, setMenu] = useState([]);
    const [orders, setOrders] = useState([]);
    const [newDish, setNewDish] = useState({ name: '', price: '', ingredients: '', status: 'Available', dietary: 'General' });
    const [newIngredient, setNewIngredient] = useState({ name: '', quantity: '', unit: 'kg', status: 'In Stock' });
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showAddStock, setShowAddStock] = useState(false);
    const [activeTab, setActiveTab] = useState('Preparation');

    useEffect(() => {
        const unsubscribeMenu = subscribeToCollection('menu', setMenu);
        const unsubscribeStock = subscribeToCollection('stock', setStock);
        const unsubscribeOrders = subscribeToCollection('orders', setOrders);
        return () => {
            unsubscribeMenu();
            unsubscribeStock();
            unsubscribeOrders();
        };
    }, []);

    const handleAddDish = async (e) => {
        e.preventDefault();
        try {
            await addItem('menu', { ...newDish, price: parseFloat(newDish.price) || 0 });
            setNewDish({ name: '', price: '', ingredients: '', status: 'Available', dietary: 'General' });
            setShowAddMenu(false);
        } catch (error) {
            console.error("Error adding meal:", error);
        }
    };

    const handleAddIngredient = async (e) => {
        e.preventDefault();
        try {
            await addItem('stock', {
                ...newIngredient,
                quantity: parseFloat(newIngredient.quantity) || 0
            });
            setNewIngredient({ name: '', quantity: '', unit: 'kg', status: 'In Stock' });
            setShowAddStock(false);
        } catch (error) {
            console.error("Error adding supply:", error);
        }
    };

    const toggleStockStatus = async (item) => {
        const statuses = ['In Stock', 'Low Stock', 'Out of Stock'];
        const nextStatus = statuses[(statuses.indexOf(item.status) + 1) % statuses.length];
        await updateItem('stock', item.id, { status: nextStatus });
    };

    const links = [
        { label: 'Preparation', icon: Activity, active: activeTab === 'Preparation' },
        { label: 'Nutritional Menu', icon: HeartPulse, active: activeTab === 'Nutritional Menu' },
        { label: 'Medical Supplies', icon: Database, active: activeTab === 'Medical Supplies' },
    ];

    return (
        <DashboardLayout title="Hospital Dietary Kitchen" links={links} onLinkClick={setActiveTab}>
            <div className="grid" style={{ gridTemplateColumns: (activeTab === 'Preparation') ? '1fr 1fr' : '1fr' }}>

                {activeTab === 'Preparation' && (
                    <section className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Active Meal Preparations</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {orders.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No pending meal preparations.</p>}
                            {orders.map(order => (
                                <div key={order.id} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', background: 'rgba(30, 41, 59, 0.4)' }}>
                                    <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                        <div>
                                            <div>
                                                <h4 style={{ color: 'var(--primary)' }}>{order.ward} - Patient: {typeof order.patientName === 'object' ? (order.patientName.productName || JSON.stringify(order.patientName)) : (order.patientName || 'Untitled')}</h4>
                                                {order.dietaryNotes && <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 'bold' }}>⚠️ {order.dietaryNotes}</span>}
                                            </div>
                                        </div>
                                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }} onClick={() => updateItem('orders', order.id, { status: 'Delivered' })}>
                                            Mark Prepared
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        {
                                            typeof order.items === 'object' ?
                                                (Array.isArray(order.items) ? order.items.map(it => typeof it === 'object' ? (it.productName || JSON.stringify(it)) : it).join(', ') : (order.items.productName || JSON.stringify(order.items))) :
                                                order.items
                                        }
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {(activeTab === 'Preparation' || activeTab === 'Nutritional Menu') && (
                    <section className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2>Nutritional Menu Management</h2>
                            <div className="flex" style={{ gap: '1rem' }}>
                                {menu.length === 0 && (
                                    <button className="btn btn-secondary" onClick={seedDatabase}>Seed Medical Menu</button>
                                )}
                                <button className="btn btn-primary" onClick={() => setShowAddMenu(!showAddMenu)}>
                                    <Plus size={18} /> {showAddMenu ? 'Close' : 'Add Meal'}
                                </button>
                            </div>
                        </div>

                        {showAddMenu && (
                            <form onSubmit={handleAddDish} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                    <input placeholder="Meal Name" value={newDish.name} onChange={e => setNewDish({ ...newDish, name: e.target.value })} required />
                                    <select value={newDish.dietary} onChange={e => setNewDish({ ...newDish, dietary: e.target.value })}>
                                        <option value="General">General Diet</option>
                                        <option value="Diabetic">Diabetic Friendly</option>
                                        <option value="Low Sodium">Low Sodium</option>
                                        <option value="Soft Diet">Soft Diet</option>
                                        <option value="High Protein">High Protein</option>
                                    </select>
                                </div>
                                <input placeholder="Key Ingredients" value={newDish.ingredients} onChange={e => setNewDish({ ...newDish, ingredients: e.target.value })} required />
                                <button type="submit" className="btn btn-primary">Save to Menu</button>
                            </form>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {menu.map((item) => (
                                <div key={item.id} className="flex" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border)', justifyContent: 'space-between' }}>
                                    <div>
                                        <h4 style={{ marginBottom: '0.25rem' }}>
                                            {typeof item.name === 'object' ? (item.name.productName || JSON.stringify(item.name)) : item.name}
                                        </h4>
                                        <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', marginBottom: '0.5rem', display: 'inline-block' }}>{item.dietary || 'General'}</span>
                                    </div>
                                    <button onClick={() => deleteItem('menu', item.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'Medical Supplies' && (
                    <section className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2>Dietary Supplies Inventory</h2>
                            <button className="btn btn-secondary" onClick={() => setShowAddStock(!showAddStock)}>
                                <Plus size={18} /> {showAddStock ? 'Cancel' : 'New Supply'}
                            </button>
                        </div>

                        {showAddStock && (
                            <form onSubmit={handleAddIngredient} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.8rem', alignItems: 'center' }}>
                                <input placeholder="Supply Name" value={newIngredient.name} onChange={e => setNewIngredient({ ...newIngredient, name: e.target.value })} required />
                                <input type="number" placeholder="Qty" value={newIngredient.quantity} onChange={e => setNewIngredient({ ...newIngredient, quantity: e.target.value })} required />
                                <select value={newIngredient.unit} onChange={e => setNewIngredient({ ...newIngredient, unit: e.target.value })}>
                                    <option value="kg">kg</option>
                                    <option value="L">L</option>
                                    <option value="units">units</option>
                                    <option value="tabs">tabs</option>
                                </select>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem' }}><Check size={18} /></button>
                            </form>
                        )}

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>ITEM</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>QTY</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>STATUS</th>
                                    <th style={{ padding: '1rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {stock.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                        <td style={{ padding: '1.2rem', fontWeight: '500' }}>
                                            {typeof item.name === 'object' ? (item.name.productName || JSON.stringify(item.name)) : item.name}
                                        </td>
                                        <td style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>
                                            {item.quantity || 0} {item.unit || 'units'}
                                        </td>
                                        <td style={{ padding: '1.2rem' }}>
                                            <span onClick={() => toggleStockStatus(item)} style={{ cursor: 'pointer' }} className={`badge ${item.status === 'In Stock' ? 'badge-success' : item.status === 'Low Stock' ? 'badge-warning' : 'badge-danger'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                            <button onClick={() => deleteItem('stock', item.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

            </div>
        </DashboardLayout>
    );
};

export default ChefDashboard;
