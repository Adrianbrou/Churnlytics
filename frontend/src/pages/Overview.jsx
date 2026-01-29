import ChurnLogo from '../assets/churn_logo.png';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, AlertCircle, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const DASHBOARD_CONFIG = {
    gymName: "Anytime Fitness Analytics",
    subtitle: "Member Retention Dashboard"
};


const API_URL = 'http://localhost:5000/api';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100
        }
    }
};

function Overview() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const response = await fetch(`${API_URL}/overview`);
            if (!response.ok) throw new Error('Failed to fetch data');
            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleManualRefresh = () => {
        setLoading(true);
        fetchData();
    };

    if (loading) {
        return (
            <div className="loading-container">
                <motion.div
                    className="spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <p style={{ color: 'var(--text-secondary)' }}>Loading analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="alert alert-danger"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <AlertCircle size={20} />
                <div>
                    <strong>Error loading data</strong>
                    <p>{error}</p>
                </div>
            </motion.div>
        );
    }

    const kpiCards = [
        {
            label: 'Total Members',
            value: data?.total_members?.toLocaleString() || '0',
            change: `${data?.active_members || 0} Active`,
            changeType: 'positive',
            icon: Users,
            color: '#667eea'
        },
        {
            label: 'Retention Rate',
            value: `${data?.retention_rate || 0}%`,
            change: 'Industry Avg: 70%',
            changeType: data?.retention_rate > 70 ? 'positive' : 'negative',
            icon: TrendingUp,
            color: '#10b981'
        },
        {
            label: 'Monthly Revenue',
            value: `$${(data?.mrr || 0).toLocaleString()}`,
            change: 'Active memberships',
            changeType: 'positive',
            icon: DollarSign,
            color: '#f59e0b'
        },
        {
            label: 'Churn Rate',
            value: `${data?.churn_rate || 0}%`,
            change: 'Target: < 5%',
            changeType: data?.churn_rate < 5 ? 'positive' : 'negative',
            icon: AlertCircle,
            color: '#ef4444'
        }
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Page Header */}
            <motion.div variants={itemVariants} style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <img
                            src={ChurnLogo}
                            alt="Churn Logo"
                            style={{ width: '50px', height: '50px', borderRadius: '8px' }}
                        />
                        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {DASHBOARD_CONFIG.gymName}
                        </h1>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        {DASHBOARD_CONFIG.subtitle}
                    </p>
                </div>

                <motion.button
                    onClick={handleManualRefresh}
                    className="btn-secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={refreshing}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <motion.div
                        animate={refreshing ? { rotate: 360 } : {}}
                        transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: 'linear' }}
                    >
                        <RefreshCw size={18} />
                    </motion.div>
                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </motion.button>
            </motion.div>

            {/* Insight Card */}
            <motion.div
                variants={itemVariants}
                className="card"
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    marginBottom: '2rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                whileHover={{ scale: 1.02 }}
            >
                <motion.div
                    style={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-10%',
                        width: '300px',
                        height: '300px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        filter: 'blur(40px)'
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                        💡 Key Insights
                    </h3>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6', opacity: 0.95 }}>
                        With {data?.active_members} active members and a {data?.retention_rate}% retention rate,
                        Location A is performing 3% better than Location B in member retention.
                        Current monthly recurring revenue is ${data?.mrr?.toLocaleString()}.
                    </p>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <motion.div className="kpi-grid" variants={containerVariants}>
                {kpiCards.map((kpi, index) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="kpi-card"
                            whileHover={{
                                y: -8,
                                boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div className="kpi-label">{kpi.label}</div>
                                <motion.div
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: `linear-gradient(135deg, ${kpi.color}20, ${kpi.color}40)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Icon size={24} style={{ color: kpi.color }} />
                                </motion.div>
                            </div>
                            <motion.div
                                className="kpi-value"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1, type: 'spring' }}
                            >
                                {kpi.value}
                            </motion.div>
                            <div className={`kpi-change ${kpi.changeType}`}>
                                {kpi.changeType === 'positive' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                                {kpi.change}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Signup Trend Chart */}
            <motion.div variants={itemVariants} className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Member Sign-ups (Last 6 Months)</h3>
                        <p className="card-subtitle">Monthly new member acquisitions</p>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data?.signup_trend?.reverse() || []}>
                        <defs>
                            <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="month" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="signups"
                            stroke="#667eea"
                            strokeWidth={3}
                            name="New Sign-ups"
                            dot={{ fill: '#667eea', r: 5 }}
                            activeDot={{ r: 8 }}
                            fill="url(#colorSignups)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Location Comparison */}
            <motion.div variants={itemVariants} className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Performance by Location</h3>
                        <p className="card-subtitle">Member count and revenue comparison</p>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data?.location_stats || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="location" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend />
                        <Bar dataKey="total_members" fill="#667eea" name="Total Members" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="active_members" fill="#10b981" name="Active Members" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Location Stats Table */}
            <motion.div variants={itemVariants} className="card">
                <div className="card-header">
                    <h3 className="card-title">Detailed Location Statistics</h3>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Location</th>
                                <th>Total Members</th>
                                <th>Active</th>
                                <th>Churned</th>
                                <th>Avg Monthly Fee</th>
                                <th>Retention</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.location_stats?.map((loc, idx) => (
                                <motion.tr
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ backgroundColor: 'var(--bg-hover)' }}
                                >
                                    <td><strong>{loc.location}</strong></td>
                                    <td>{loc.total_members}</td>
                                    <td>
                                        <span className="badge badge-success">{loc.active_members}</span>
                                    </td>
                                    <td>
                                        <span className="badge badge-danger">{loc.churned_members}</span>
                                    </td>
                                    <td>${loc.avg_monthly_fee}</td>
                                    <td>
                                        <strong style={{ color: 'var(--color-success)' }}>
                                            {((loc.active_members / loc.total_members) * 100).toFixed(1)}%
                                        </strong>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default Overview;