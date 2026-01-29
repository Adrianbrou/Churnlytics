import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = 'http://localhost:5000/api';
const COLORS = ['#667eea', '#10b981', '#f59e0b', '#ef4444'];

function Revenue() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/revenue`)
            .then(res => res.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-container"><motion.div className="spinner" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /></div>;

    const totalRevenue = data?.revenue_by_type?.reduce((sum, r) => sum + r.total_revenue, 0) || 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Revenue Analytics</h1>

            <div className="kpi-grid">
                <motion.div className="kpi-card" whileHover={{ y: -8 }}>
                    <div className="kpi-label">Total Revenue</div>
                    <div className="kpi-value">${totalRevenue.toLocaleString()}</div>
                    <div className="kpi-change positive">All time</div>
                </motion.div>
                <motion.div className="kpi-card" whileHover={{ y: -8 }}>
                    <div className="kpi-label">Monthly Recurring</div>
                    <div className="kpi-value">${(data?.current_mrr || 0).toLocaleString()}</div>
                    <div className="kpi-change positive">{data?.active_paying_members} members</div>
                </motion.div>
                <motion.div className="kpi-card" whileHover={{ y: -8 }}>
                    <div className="kpi-label">Membership Revenue</div>
                    <div className="kpi-value">${(data?.revenue_by_type?.find(r => r.type === 'Membership')?.total_revenue || 0).toLocaleString()}</div>
                    <div className="kpi-change">{((data?.revenue_by_type?.find(r => r.type === 'Membership')?.total_revenue / totalRevenue) * 100).toFixed(0)}% of total</div>
                </motion.div>
                <motion.div className="kpi-card" whileHover={{ y: -8 }}>
                    <div className="kpi-label">PT Revenue</div>
                    <div className="kpi-value">${(data?.revenue_by_type?.find(r => r.type === 'Personal Training')?.total_revenue || 0).toLocaleString()}</div>
                    <div className="kpi-change">{((data?.revenue_by_type?.find(r => r.type === 'Personal Training')?.total_revenue / totalRevenue) * 100).toFixed(0)}% of total</div>
                </motion.div>
            </div>

            <motion.div className="card" initial={{ y: 20 }} animate={{ y: 0 }} style={{ marginBottom: '2rem' }}>
                <h3 className="card-title">Monthly Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data?.monthly_revenue_trend || []}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="month" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={3} name="Revenue" dot={{ fill: '#667eea', r: 5 }} activeDot={{ r: 8 }} fill="url(#colorRevenue)" />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <motion.div className="card" initial={{ y: 20 }} animate={{ y: 0 }}>
                    <h3 className="card-title">Revenue by Type</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={data?.revenue_by_type || []} dataKey="total_revenue" nameKey="type" cx="50%" cy="50%" outerRadius={100} label={(entry) => `${entry.type}: $${entry.total_revenue.toLocaleString()}`}>
                                {data?.revenue_by_type?.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div className="card" initial={{ y: 20 }} animate={{ y: 0 }}>
                    <h3 className="card-title">Revenue by Location</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data?.revenue_by_location || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="location" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                            <Bar dataKey="total_revenue" fill="#667eea" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            <motion.div className="card" initial={{ y: 20 }} animate={{ y: 0 }}>
                <h3 className="card-title">Member Lifetime Value by Type</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr><th>Membership Type</th><th>Members</th><th>Avg LTV</th><th>Rank</th></tr>
                        </thead>
                        <tbody>
                            {data?.ltv_by_membership?.map((row, i) => (
                                <motion.tr key={i} whileHover={{ backgroundColor: 'var(--bg-hover)' }}>
                                    <td><strong>{row.membership_type}</strong></td>
                                    <td>{row.member_count}</td>
                                    <td><strong style={{ color: 'var(--color-success)' }}>${row.avg_ltv?.toLocaleString()}</strong></td>
                                    <td><span className="badge badge-success">#{i + 1}</span></td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default Revenue;