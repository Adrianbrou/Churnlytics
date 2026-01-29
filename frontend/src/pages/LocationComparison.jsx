import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = 'http://localhost:5000/api';

function LocationComparison() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/location-comparison`)
            .then(res => res.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-container"><motion.div className="spinner" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /></div>;

    const locA = data?.key_metrics?.find(l => l.location === 'Location A');
    const locB = data?.key_metrics?.find(l => l.location === 'Location B');

    const radarData = [
        { metric: 'Members', 'Location A': locA?.active_members || 0, 'Location B': locB?.active_members || 0 },
        { metric: 'Retention %', 'Location A': locA?.retention_rate || 0, 'Location B': locB?.retention_rate || 0 },
        { metric: 'PT Attach %', 'Location A': locA?.pt_attachment_rate || 0, 'Location B': locB?.pt_attachment_rate || 0 },
        { metric: 'MRR/100', 'Location A': (locA?.mrr || 0) / 100, 'Location B': (locB?.mrr || 0) / 100 }
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Location Comparison</h1>

            <motion.div className="card" initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>🏆 Performance Leader</h3>
                <p>Location A outperforms Location B in retention ({locA?.retention_rate}% vs {locB?.retention_rate}%) and PT attachment rate ({locA?.pt_attachment_rate}% vs {locB?.pt_attachment_rate}%)</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <motion.div className="card" whileHover={{ y: -4 }}>
                    <h3 style={{ textAlign: 'center', color: '#667eea', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Location A</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                            <div className="kpi-label">Active Members</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{locA?.active_members}</div>
                        </div>
                        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                            <div className="kpi-label">Retention Rate</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{locA?.retention_rate}%</div>
                        </div>
                        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                            <div className="kpi-label">Monthly Revenue</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>${locA?.mrr?.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="kpi-label">PT Members</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{locA?.pt_members}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{locA?.pt_attachment_rate}% rate</div>
                        </div>
                    </div>
                </motion.div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700' }}>
                        VS
                    </motion.div>
                </div>

                <motion.div className="card" whileHover={{ y: -4 }}>
                    <h3 style={{ textAlign: 'center', color: '#764ba2', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Location B</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                            <div className="kpi-label">Active Members</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{locB?.active_members}</div>
                        </div>
                        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                            <div className="kpi-label">Retention Rate</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>{locB?.retention_rate}%</div>
                        </div>
                        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                            <div className="kpi-label">Monthly Revenue</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>${locB?.mrr?.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="kpi-label">PT Members</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{locB?.pt_members}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{locB?.pt_attachment_rate}% rate</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div className="card" initial={{ y: 20 }} animate={{ y: 0 }} style={{ marginBottom: '2rem' }}>
                <h3 className="card-title">Multi-Metric Comparison</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                        <PolarGrid stroke="var(--border-color)" />
                        <PolarAngleAxis dataKey="metric" stroke="var(--text-secondary)" />
                        <PolarRadiusAxis stroke="var(--text-secondary)" />
                        <Radar name="Location A" dataKey="Location A" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
                        <Radar name="Location B" dataKey="Location B" stroke="#764ba2" fill="#764ba2" fillOpacity={0.6} />
                        <Legend />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </motion.div>

            <motion.div className="card" initial={{ y: 20 }} animate={{ y: 0 }}>
                <h3 className="card-title">Comprehensive Comparison</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr><th>Metric</th><th>Location A</th><th>Location B</th><th>Winner</th></tr>
                        </thead>
                        <tbody>
                            <motion.tr whileHover={{ backgroundColor: 'var(--bg-hover)' }}>
                                <td><strong>Total Members</strong></td>
                                <td>{locA?.total_members}</td>
                                <td>{locB?.total_members}</td>
                                <td>{(locA?.total_members || 0) > (locB?.total_members || 0) ? '🏆 A' : '🏆 B'}</td>
                            </motion.tr>
                            <motion.tr whileHover={{ backgroundColor: 'var(--bg-hover)' }}>
                                <td><strong>Retention Rate</strong></td>
                                <td><span className="badge badge-success">{locA?.retention_rate}%</span></td>
                                <td><span className="badge badge-warning">{locB?.retention_rate}%</span></td>
                                <td>🏆 A</td>
                            </motion.tr>
                            <motion.tr whileHover={{ backgroundColor: 'var(--bg-hover)' }}>
                                <td><strong>Monthly Revenue</strong></td>
                                <td>${locA?.mrr?.toLocaleString()}</td>
                                <td>${locB?.mrr?.toLocaleString()}</td>
                                <td>{(locA?.mrr || 0) > (locB?.mrr || 0) ? '🏆 A' : '🏆 B'}</td>
                            </motion.tr>
                            <motion.tr whileHover={{ backgroundColor: 'var(--bg-hover)' }}>
                                <td><strong>PT Attachment</strong></td>
                                <td>{locA?.pt_attachment_rate}%</td>
                                <td>{locB?.pt_attachment_rate}%</td>
                                <td>🏆 A</td>
                            </motion.tr>
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default LocationComparison;