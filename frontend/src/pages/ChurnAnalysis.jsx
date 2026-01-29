import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Info } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = 'http://localhost:5000/api';

function ChurnAnalysis() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/churn-analysis`)
            .then(res => res.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-container"><motion.div className="spinner" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /></div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Churn Analysis</h1>

            <motion.div className="alert alert-info" initial={{ x: -50 }} animate={{ x: 0 }} style={{ marginBottom: '2rem' }}>
                <Info size={20} />
                <div><strong>💡 Key Finding:</strong> Members with personal training show 40% lower churn rates</div>
            </motion.div>

            <div className="kpi-grid">
                {data?.churn_by_membership?.slice(0, 4).map((item, i) => (
                    <motion.div key={i} className="kpi-card" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -8 }}>
                        <div className="kpi-label">{item.membership_type}</div>
                        <div className="kpi-value" style={{ color: item.churn_rate > 30 ? '#ef4444' : '#10b981' }}>{item.churn_rate}%</div>
                        <div className="kpi-change"><TrendingDown size={16} /> Churn Rate</div>
                    </motion.div>
                ))}
            </div>

            <motion.div className="card" initial={{ y: 20 }} animate={{ y: 0 }} style={{ marginBottom: '2rem' }}>
                <h3 className="card-title">Churn by Membership Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data?.churn_by_membership || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="membership_type" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                        <Bar dataKey="churn_rate" fill="#ef4444" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>s

            <motion.div className="card" initial={{ y: 20 }} animate={{ y: 0 }} style={{ marginBottom: '2rem' }}>
                <h3 className="card-title">Churn by Tenure</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data?.churn_by_tenure || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="tenure_group" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                        <Legend />
                        <Bar dataKey="total" fill="#667eea" name="Total" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="churned" fill="#ef4444" name="Churned" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            <motion.div className="card" initial={{ y: 20 }} animate={{ y: 0 }}>
                <h3 className="card-title">Personal Training Impact</h3>
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr><th>Has PT</th><th>Total</th><th>Churned</th><th>Rate</th></tr>
                    </thead>
                    <tbody>
                        {data?.pt_impact?.map((row, i) => (
                            <motion.tr key={i} whileHover={{ backgroundColor: 'var(--bg-hover)' }}>
                                <td>{row.has_pt ? '✅ Yes' : '❌ No'}</td>
                                <td>{row.total}</td>
                                <td>{row.churned}</td>
                                <td><span className={`badge ${row.churn_rate > 30 ? 'badge-danger' : 'badge-success'}`}>{row.churn_rate}%</span></td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
};

export default ChurnAnalysis;