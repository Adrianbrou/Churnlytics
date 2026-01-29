import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = 'http://localhost:5000/api';

function SalesFunnel() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/sales-funnel`)
            .then(res => res.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-container"><motion.div className="spinner" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /></div>;

    const funnel = data?.funnel_overview;
    const funnelStages = [
        { stage: 'Leads', value: funnel?.total_leads || 0, color: '#667eea' },
        { stage: 'Tours Scheduled', value: funnel?.tours_scheduled || 0, color: '#764ba2' },
        { stage: 'Tours Completed', value: funnel?.tours_completed || 0, color: '#f59e0b' },
        { stage: 'Conversions', value: funnel?.conversions || 0, color: '#10b981' }
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Sales Funnel</h1>

            <div className="kpi-grid">
                <motion.div className="kpi-card" whileHover={{ y: -8 }}>
                    <div className="kpi-label">Total Leads</div>
                    <div className="kpi-value">{funnel?.total_leads?.toLocaleString()}</div>
                    <div className="kpi-change">All time</div>
                </motion.div>
                <motion.div className="kpi-card" whileHover={{ y: -8 }}>
                    <div className="kpi-label">Tour Schedule Rate</div>
                    <div className="kpi-value">{funnel?.tour_schedule_rate}%</div>
                    <div className="kpi-change positive">{funnel?.tours_scheduled} scheduled</div>
                </motion.div>
                <motion.div className="kpi-card" whileHover={{ y: -8 }}>
                    <div className="kpi-label">Tour Completion</div>
                    <div className="kpi-value">{funnel?.tour_completion_rate}%</div>
                    <div className="kpi-change">{funnel?.tours_completed} showed up</div>
                </motion.div>
                <motion.div className="kpi-card" whileHover={{ y: -8 }}>
                    <div className="kpi-label">Overall Conversion</div>
                    <div className="kpi-value">{funnel?.overall_conversion}%</div>
                    <div className="kpi-change positive">{funnel?.conversions} members</div>
                </motion.div>
            </div>

            <motion.div className="card" initial={{ y: 20 }} animate={{ y: 0 }} style={{ marginBottom: '2rem' }}>
                <h3 className="card-title">Conversion Funnel</h3>
                <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px' }}>
                    {funnelStages.map((stage, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.2 }}
                            style={{
                                background: stage.color,
                                color: 'white',
                                padding: '1.5rem',
                                marginBottom: i < funnelStages.length - 1 ? '1rem' : 0,
                                borderRadius: '8px',
                                width: `${100 - (i * 15)}%`,
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                textAlign: 'center',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                        >
                            {stage.stage}: {stage.value.toLocaleString()}
                            {i > 0 && (
                                <span style={{ marginLeft: '1rem', fontSize: '0.9rem', opacity: 0.9 }}>
                                    ({((stage.value / funnelStages[i - 1].value) * 100).toFixed(1)}%)
                                </span>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <motion.div className="card" initial={{ y: 20 }} animate={{ y: 0 }} style={{ marginBottom: '2rem' }}>
                <h3 className="card-title">Performance by Lead Source</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data?.by_source || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="lead_source" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                        <Legend />
                        <Bar dataKey="leads" fill="#667eea" name="Leads" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="conversions" fill="#10b981" name="Conversions" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            <motion.div className="card" initial={{ y: 20 }} animate={{ y: 0 }}>
                <h3 className="card-title">Lead Source Performance</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr><th>Source</th><th>Leads</th><th>Conversions</th><th>Rate</th><th>Performance</th></tr>
                        </thead>
                        <tbody>
                            {data?.by_source?.map((row, i) => (
                                <motion.tr key={i} whileHover={{ backgroundColor: 'var(--bg-hover)' }}>
                                    <td><strong>{row.lead_source}</strong></td>
                                    <td>{row.leads}</td>
                                    <td>{row.conversions}</td>
                                    <td><span className={`badge ${row.conversion_rate > 50 ? 'badge-success' : row.conversion_rate > 35 ? 'badge-warning' : 'badge-danger'}`}>{row.conversion_rate}%</span></td>
                                    <td>{row.conversion_rate > funnel.overall_conversion ? <span style={{ color: '#10b981' }}>✓ Above Avg</span> : <span style={{ color: '#ef4444' }}>✗ Below Avg</span>}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default SalesFunnel;