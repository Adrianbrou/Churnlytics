import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, Users, Clock, Calendar, Info, ArrowUp, ArrowDown } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const API_URL = 'http://localhost:5000/api';
const COLORS = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 100 }
    }
};

function Engagement() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedView, setSelectedView] = useState('hourly');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/engagement`);
            if (!response.ok) throw new Error('Failed to fetch data');
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <motion.div
                    className="spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <p style={{ color: 'var(--text-secondary)' }}>Loading engagement data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="alert alert-danger"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
            >
                <Info size={20} />
                <div><strong>Error:</strong> {error}</div>
            </motion.div>
        );
    }

    // Calculate peak hour
    const peakHour = data?.hourly_pattern?.reduce((max, curr) =>
        curr.checkin_count > max.checkin_count ? curr : max,
        { hour: 0, checkin_count: 0 }
    );

    // Calculate busiest day
    const busiestDay = data?.daily_pattern?.reduce((max, curr) =>
        curr.checkin_count > max.checkin_count ? curr : max,
        { day_of_week: '', checkin_count: 0 }
    );

    // Calculate engagement stats
    const totalEngaged = data?.engagement_distribution?.reduce((sum, item) =>
        sum + item.member_count, 0
    ) || 0;

    const highEngagement = data?.engagement_distribution?.find(item =>
        item.engagement_level.includes('High')
    )?.member_count || 0;

    const inactiveMembers = data?.engagement_distribution?.find(item =>
        item.engagement_level.includes('Inactive')
    )?.member_count || 0;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Page Header */}
            <motion.div variants={itemVariants} style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    Member Engagement
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Check-in patterns and usage analytics
                </p>
            </motion.div>

            {/* Key Insight Alert */}
            <motion.div
                variants={itemVariants}
                className="alert alert-info"
                style={{ marginBottom: '2rem' }}
            >
                <Activity size={20} />
                <div>
                    <strong>💪 Engagement Insight:</strong> Peak hours are {peakHour?.hour}:00 (highest traffic)
                    and {busiestDay?.day_of_week} is the busiest day.
                    {inactiveMembers > 0 && ` ${inactiveMembers} members are inactive and need re-engagement.`}
                </div>
            </motion.div>

            {/* KPI Cards */}
            <motion.div className="kpi-grid" variants={containerVariants}>
                <motion.div
                    className="kpi-card"
                    variants={itemVariants}
                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div className="kpi-label">Peak Hour</div>
                        <motion.div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #667eea20, #667eea40)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Clock size={24} style={{ color: '#667eea' }} />
                        </motion.div>
                    </div>
                    <motion.div
                        className="kpi-value"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.1 }}
                    >
                        {peakHour?.hour}:00
                    </motion.div>
                    <div className="kpi-change positive">
                        <ArrowUp size={16} />
                        {peakHour?.checkin_count} check-ins
                    </div>
                </motion.div>

                <motion.div
                    className="kpi-card"
                    variants={itemVariants}
                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div className="kpi-label">Busiest Day</div>
                        <motion.div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #10b98120, #10b98140)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Calendar size={24} style={{ color: '#10b981' }} />
                        </motion.div>
                    </div>
                    <motion.div
                        className="kpi-value"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        style={{ fontSize: '1.75rem' }}
                    >
                        {busiestDay?.day_of_week}
                    </motion.div>
                    <div className="kpi-change positive">
                        <ArrowUp size={16} />
                        {busiestDay?.checkin_count?.toLocaleString()} visits
                    </div>
                </motion.div>

                <motion.div
                    className="kpi-card"
                    variants={itemVariants}
                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div className="kpi-label">Highly Engaged</div>
                        <motion.div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #f59e0b20, #f59e0b40)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                        >
                            <TrendingUp size={24} style={{ color: '#f59e0b' }} />
                        </motion.div>
                    </div>
                    <motion.div
                        className="kpi-value"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.3 }}
                    >
                        {highEngagement}
                    </motion.div>
                    <div className="kpi-change positive">
                        <ArrowUp size={16} />
                        {((highEngagement / totalEngaged) * 100).toFixed(1)}% of members
                    </div>
                </motion.div>

                <motion.div
                    className="kpi-card"
                    variants={itemVariants}
                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div className="kpi-label">Inactive Members</div>
                        <motion.div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #ef444420, #ef444440)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Users size={24} style={{ color: '#ef4444' }} />
                        </motion.div>
                    </div>
                    <motion.div
                        className="kpi-value"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.4 }}
                        style={{ color: '#ef4444' }}
                    >
                        {inactiveMembers}
                    </motion.div>
                    <div className="kpi-change negative">
                        <ArrowDown size={16} />
                        Need intervention
                    </div>
                </motion.div>
            </motion.div>

            {/* Engagement Distribution */}
            <motion.div
                variants={itemVariants}
                className="card"
                style={{ marginBottom: '2rem' }}
                whileHover={{ boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
            >
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Engagement Level Distribution</h3>
                        <p className="card-subtitle">Members by visit frequency (last 30 days)</p>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data?.engagement_distribution || []}>
                        <defs>
                            <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#667eea" stopOpacity={0.2} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis
                            dataKey="engagement_level"
                            stroke="var(--text-secondary)"
                            angle={-15}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px'
                            }}
                        />
                        <Bar
                            dataKey="member_count"
                            fill="url(#colorEngagement)"
                            name="Members"
                            radius={[8, 8, 0, 0]}
                            animationDuration={800}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* View Toggle */}
            <motion.div
                variants={itemVariants}
                style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
            >
                {['hourly', 'daily'].map(view => (
                    <motion.button
                        key={view}
                        onClick={() => setSelectedView(view)}
                        className={selectedView === view ? 'btn-primary' : 'btn-secondary'}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {view === 'hourly' ? '⏰ Hourly Pattern' : '📅 Weekly Pattern'}
                    </motion.button>
                ))}
            </motion.div>

            {/* Peak Hours & Weekly Pattern */}
            <AnimatePresence mode="wait">
                {selectedView === 'hourly' ? (
                    <motion.div
                        key="hourly"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, y: -20 }}
                        className="card"
                        style={{ marginBottom: '2rem' }}
                        whileHover={{ boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                    >
                        <div className="card-header">
                            <div>
                                <h3 className="card-title">Peak Hours Analysis</h3>
                                <p className="card-subtitle">Check-ins by hour of day (last 30 days)</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={data?.hourly_pattern || []}>
                                <defs>
                                    <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#667eea" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis
                                    dataKey="hour"
                                    stroke="var(--text-secondary)"
                                    tickFormatter={(hour) => `${hour}:00`}
                                />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px'
                                    }}
                                    labelFormatter={(hour) => `${hour}:00`}
                                />
                                <Bar
                                    dataKey="checkin_count"
                                    fill="url(#colorHourly)"
                                    name="Check-ins"
                                    radius={[8, 8, 0, 0]}
                                    animationDuration={800}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                ) : (
                    <motion.div
                        key="daily"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, y: -20 }}
                        className="card"
                        style={{ marginBottom: '2rem' }}
                        whileHover={{ boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                    >
                        <div className="card-header">
                            <div>
                                <h3 className="card-title">Weekly Pattern Analysis</h3>
                                <p className="card-subtitle">Check-ins by day of week (last 30 days)</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={data?.daily_pattern || []}>
                                <defs>
                                    <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis
                                    dataKey="day_of_week"
                                    stroke="var(--text-secondary)"
                                    angle={-15}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar
                                    dataKey="checkin_count"
                                    fill="url(#colorDaily)"
                                    name="Check-ins"
                                    radius={[8, 8, 0, 0]}
                                    animationDuration={800}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Location Engagement Table */}
            <motion.div
                variants={itemVariants}
                className="card"
                whileHover={{ boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
            >
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Engagement by Location</h3>
                        <p className="card-subtitle">Comparative performance metrics (last 30 days)</p>
                    </div>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Location</th>
                                <th>Active Members</th>
                                <th>Total Check-ins</th>
                                <th>Avg Visits/Member</th>
                                <th>Performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.location_engagement?.map((loc, i) => {
                                const avgVisits = loc.avg_visits_per_member;
                                const isHigh = avgVisits > 10;
                                return (
                                    <motion.tr
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ backgroundColor: 'var(--bg-hover)' }}
                                    >
                                        <td><strong>{loc.location}</strong></td>
                                        <td>{loc.active_members}</td>
                                        <td>{loc.total_checkins?.toLocaleString()}</td>
                                        <td>
                                            <strong style={{ color: isHigh ? 'var(--color-success)' : 'var(--color-warning)' }}>
                                                {avgVisits} visits
                                            </strong>
                                        </td>
                                        <td>
                                            {isHigh ? (
                                                <span className="badge badge-success">✓ Excellent</span>
                                            ) : (
                                                <span className="badge badge-warning">⚠ Needs Improvement</span>
                                            )}
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Recommendations Card */}
            <motion.div
                variants={itemVariants}
                className="card"
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    marginTop: '2rem'
                }}
                whileHover={{ scale: 1.01 }}
            >
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                    📊 Engagement Optimization Recommendations
                </h3>
                <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8', listStyle: 'none' }}>
                    <li style={{ marginBottom: '0.75rem' }}>
                        <strong>⏰ Staffing:</strong> Peak hours are {peakHour?.hour}:00 - ensure adequate staff coverage during this time
                    </li>
                    <li style={{ marginBottom: '0.75rem' }}>
                        <strong>📅 Programming:</strong> {busiestDay?.day_of_week} is busiest - schedule special classes and events
                    </li>
                    <li style={{ marginBottom: '0.75rem' }}>
                        <strong>🎯 Re-engagement:</strong> {inactiveMembers} inactive members need outreach - implement automated check-in campaigns
                    </li>
                    <li>
                        <strong>💪 Motivation:</strong> {highEngagement} highly engaged members - leverage them as ambassadors and for referrals
                    </li>
                </ul>
            </motion.div>
        </motion.div>
    );
}

export default Engagement;