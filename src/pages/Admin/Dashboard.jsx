import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { ShieldCheck, Users, BarChart3, Settings, Activity, ClipboardCheck, Upload } from 'lucide-react';
import { subscribeToCollection, addItem } from '../../services/firebaseService';
import * as XLSX from 'xlsx';
const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [stock, setStock] = useState([]);
    const [patients, setPatients] = useState([]);
    const [activeTab, setActiveTab] = useState('Overview');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const unsubscribeOrders = subscribeToCollection('orders', setOrders);
        const unsubscribeStock = subscribeToCollection('stock', setStock);
        const unsubscribePatients = subscribeToCollection('patients', setPatients);
        return () => {
            unsubscribeOrders();
            unsubscribeStock();
            unsubscribePatients();
        };
    }, []);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                let count = 0;
                for (const row of json) {
                    const nameKey = Object.keys(row).find(k => k.trim() === 'Name');
                    const dobKey = Object.keys(row).find(k => k.trim() === 'Birth Date');
                    const roomKey = Object.keys(row).find(k => k.trim() === 'Room');
                    const newNoKey = Object.keys(row).find(k => k.trim() === 'New No.');
                    const genderKey = Object.keys(row).find(k => k.trim() === 'Gender');

                    if (nameKey && row[nameKey]) {
                        await addItem('patients', {
                            name: row[nameKey],
                            birthDate: dobKey ? row[dobKey] : '',
                            room: roomKey ? row[roomKey] : '',
                            roomNo: newNoKey ? row[newNoKey] : '',
                            gender: genderKey ? row[genderKey] : ''
                        });
                        count++;
                    }
                }
                alert(`Successfully uploaded \${count} patients.`);
            } catch (error) {
                console.error("Error uploading excel:", error);
                alert("Failed to parse the file.");
            }
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsArrayBuffer(file);
    };

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
                                {['A-Wing', 'B-Wing', 'C-Wing', 'Care Center', 'St. Michels'].map((ward, i) => (
                                    <div key={i} className="flex" style={{ justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                        <span style={{ fontWeight: '500' }}>{ward}</span>
                                        <span style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>View Board</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {activeTab === 'Patient Database' && (
                    <section className="glass" style={{ padding: '2.5rem', borderRadius: '24px', gridColumn: '1 / -1' }}>
                        <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                            <h2 style={{ margin: 0 }}>Resident Database</h2>
                            <div>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    style={{ display: 'none' }}
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                />
                                <button className="btn btn-primary" onClick={() => fileInputRef.current.click()} disabled={isUploading}>
                                    <Upload size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', display: 'inline-block' }} /> 
                                    {isUploading ? 'Uploading...' : 'Upload Excel'}
                                </button>
                            </div>
                        </div>

                        {patients.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                <p>No patients in the database yet.</p>
                                <p style={{ fontSize: '0.9rem' }}>Upload a resident activity list to get started.</p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.9)', zIndex: 1, backdropFilter: 'blur(8px)' }}>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>NAME</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>ROOM</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>NEW NO.</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>BIRTH DATE</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>GENDER</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patients.map((patient, index) => (
                                            <tr key={patient.id || index} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                <td style={{ padding: '1.2rem', fontWeight: '500' }}>{patient.name}</td>
                                                <td style={{ padding: '1.2rem' }}>{patient.room}</td>
                                                <td style={{ padding: '1.2rem' }}>{patient.roomNo}</td>
                                                <td style={{ padding: '1.2rem' }}>{patient.birthDate}</td>
                                                <td style={{ padding: '1.2rem' }}>{patient.gender}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {activeTab !== 'Overview' && activeTab !== 'Patient Database' && (
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
