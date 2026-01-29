import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Users, Clock, DollarSign, Info, Search, Download, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const API_URL = 'http://localhost:5000/api';
const RISK_COLORS = {
    'High': '#ef4444',
    'Medium': '#f59e0b',
    'Low': '#10b981'
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
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

function AtRiskMembers() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterRisk, setFilterRisk] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('days_since_checkin');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/at-risk-members`);
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
                <p style={{ color: 'var(--text-secondary)' }}>Identifying at-risk members...</p>
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
                <AlertTriangle size={20} />
                <div><strong>Error:</strong> {error}</div>
            </motion.div>
        );
    }

    const highRisk = data?.risk_summary?.find(r => r.risk_level === 'High')?.count || 0;
    const mediumRisk = data?.risk_summary?.find(r => r.risk_level === 'Medium')?.count || 0;
    const lowRisk = data?.risk_summary?.find(r => r.risk_level === 'Low')?.count || 0;
    const totalAtRisk = highRisk + mediumRisk + lowRisk;

    // Filter members
    let filteredMembers = filterRisk === 'all'
        ? data?.at_risk_members
        : data?.at_risk_members?.filter(m => m.risk_level === filterRisk);

    // Search filter
    if (searchTerm) {
        filteredMembers = filteredMembers?.filter(m =>
            m.member_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Sort members
    if (filteredMembers) {
        filteredMembers = [...filteredMembers].sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    // Calculate potential revenue loss (top 50 at-risk members)
    const potentialLoss = data?.at_risk_members?.slice(0, 50).reduce((sum, m) => sum + m.monthly_fee, 0) || 0;

    // Calculate average days inactive
    const avgDaysInactive = data?.at_risk_members?.reduce((sum, m) => sum + m.days_since_checkin, 0) / data?.at_risk_members?.length || 0;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Page Header */}
            <motion.div variants={itemVariants} style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    At-Risk Members
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Members showing signs of disengagement who may cancel soon
                </p>
            </motion.div>

            {/* Critical Alert */}
            <motion.div
                variants={itemVariants}
                className="alert alert-warning"
                style={{ marginBottom: '2rem' }}
                initial={{ x: -50 }}
                animate={{ x: 0 }}
            >
                <AlertTriangle size={24} />
                <div>
                    <strong>⚠️ URGENT ACTION REQUIRED:</strong> {highRisk} members haven't visited in 30+ days and are at HIGH RISK of cancellation.
                    Potential revenue loss: <strong>${potentialLoss.toLocaleString()}/month</strong>. Immediate outreach recommended.
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
                        <div className="kpi-label">Total At-Risk</div>
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
                            <Users size={24} style={{ color: '#f59e0b' }} />
                        </motion.div>
                    </div>
                    <motion.div
                        className="kpi-value"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.1 }}
                    >
                        {totalAtRisk}
                    </motion.div>
                    <div className="kpi-change negative">
                        <ArrowDown size={16} />
                        Require attention
                    </div>
                </motion.div>

                <motion.div
                    className="kpi-card"
                    variants={itemVariants}
                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div className="kpi-label">High Risk</div>
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
                            <AlertTriangle size={24} style={{ color: '#ef4444' }} />
                        </motion.div>
                    </div>
                    <motion.div
                        className="kpi-value"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        style={{ color: '#ef4444' }}
                    >
                        {highRisk}
                    </motion.div>
                    <div className="kpi-change negative">
                        <ArrowDown size={16} />
                        30+ days inactive
                    </div>
                </motion.div>

                <motion.div
                    className="kpi-card"
                    variants={itemVariants}
                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div className="kpi-label">Avg Days Inactive</div>
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
                        transition={{ type: 'spring', delay: 0.3 }}
                    >
                        {avgDaysInactive.toFixed(0)}
                    </motion.div>
                    <div className="kpi-change negative">
                        <ArrowDown size={16} />
                        Days since visit
                    </div>
                </motion.div>

                <motion.div
                    className="kpi-card"
                    variants={itemVariants}
                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div className="kpi-label">Revenue at Risk</div>
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
                            <DollarSign size={24} style={{ color: '#10b981' }} />
                        </motion.div>
                    </div>
                    <motion.div
                        className="kpi-value"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.4 }}
                    >
                        ${potentialLoss.toLocaleString()}
                    </motion.div>
                    <div className="kpi-change negative">
                        <ArrowDown size={16} />
                        Top 50 members
                    </div>
                </motion.div>
            </motion.div>

            {/* Risk Distribution Chart */}
            <motion.div
                variants={itemVariants}
                className="card"
                style={{ marginBottom: '2rem' }}
                whileHover={{ boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
            >
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Risk Level Distribution</h3>
                        <p className="card-subtitle">Member count by risk category</p>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data?.risk_summary || []}
                                dataKey="count"
                                nameKey="risk_level"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={(entry) => `${entry.risk_level}: ${entry.count}`}
                                labelLine={false}
                            >
                                {data?.risk_summary?.map((entry, i) => (
                                    <Cell key={i} fill={RISK_COLORS[entry.risk_level]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
                        {data?.risk_summary?.map((risk, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    background: `${RISK_COLORS[risk.risk_level]}15`,
                                    borderLeft: `4px solid ${RISK_COLORS[risk.risk_level]}`
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '1.1rem', color: RISK_COLORS[risk.risk_level] }}>
                                            {risk.risk_level} Risk
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            {risk.risk_level === 'High' ? '30+ days inactive' :
                                                risk.risk_level === 'Medium' ? '14-30 days inactive' : '7-14 days inactive'}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: RISK_COLORS[risk.risk_level] }}>
                                        {risk.count}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Filters and Search */}
            <motion.div variants={itemVariants} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Risk Level Filters */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {['all', 'High', 'Medium', 'Low'].map(f => (
                            <motion.button
                                key={f}
                                onClick={() => setFilterRisk(f)}
                                className={filterRisk === f ? 'btn-primary' : 'btn-secondary'}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Filter size={16} />
                                {f === 'all' ? `All (${totalAtRisk})` : `${f} (${data?.risk_summary?.find(r => r.risk_level === f)?.count || 0})`}
                            </motion.button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                        <Search
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-secondary)'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search by Member ID or Location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.6rem 0.75rem 0.6rem 2.5rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem'
                            }}
                        />
                    </div>

                    {/* Export Button */}
                    <motion.button
                        className="btn-secondary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={() => alert('Export functionality coming soon!')}
                    >
                        <Download size={16} />
                        Export List
                    </motion.button>
                </div>
            </motion.div>

            {/* At-Risk Members Table */}
            <motion.div
                variants={itemVariants}
                className="card"
                whileHover={{ boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
            >
                <div className="card-header">
                    <div>
                        <h3 className="card-title">
                            At-Risk Member Details {filterRisk !== 'all' && `(${filterRisk} Risk Only)`}
                        </h3>
                        <p className="card-subtitle">
                            Showing {filteredMembers?.length || 0} members - sorted by {sortBy.replace('_', ' ')}
                        </p>
                    </div>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th
                                    onClick={() => {
                                        if (sortBy === 'member_id') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                        else setSortBy('member_id');
                                    }}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                >
                                    Member ID {sortBy === 'member_id' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Location</th>
                                <th>Membership</th>
                                <th
                                    onClick={() => {
                                        if (sortBy === 'days_since_checkin') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                        else setSortBy('days_since_checkin');
                                    }}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                >
                                    Days Inactive {sortBy === 'days_since_checkin' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Last Visit</th>
                                <th>Avg Visits/Month</th>
                                <th
                                    onClick={() => {
                                        if (sortBy === 'monthly_fee') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                        else setSortBy('monthly_fee');
                                    }}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                >
                                    Monthly Fee {sortBy === 'monthly_fee' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Risk Level</th>
                                <th>Has PT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers?.slice(0, 100).map((member, i) => (
                                <motion.tr
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: Math.min(i * 0.02, 1) }}
                                    whileHover={{
                                        backgroundColor: 'var(--bg-hover)',
                                        scale: 1.01,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <td><strong>{member.member_id}</strong></td>
                                    <td>{member.location}</td>
                                    <td style={{ fontSize: '0.85rem' }}>{member.membership_type}</td>
                                    <td>
                                        <span style={{
                                            fontWeight: '600',
                                            color: member.days_since_checkin > 30 ? '#ef4444' :
                                                member.days_since_checkin > 14 ? '#f59e0b' : '#10b981'
                                        }}>
                                            {member.days_since_checkin} days
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {member.last_checkin ? new Date(member.last_checkin).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td>{member.avg_checkins_per_month || 0}</td>
                                    <td><strong>${member.monthly_fee}</strong></td>
                                    <td>
                                        <span className={`badge badge-${member.risk_level === 'High' ? 'danger' :
                                            member.risk_level === 'Medium' ? 'warning' : 'success'
                                            }`}>
                                            {member.risk_level}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {member.has_personal_training ? '✅' : '❌'}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Intervention Strategy Card */}
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
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={24} />
                    Intervention Strategy & Action Plan
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '0.75rem' }}>
                            🚨 High Risk ({highRisk} members)
                        </strong>
                        <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                            <li>Personal phone call from manager within 24 hours</li>
                            <li>Offer free personal training session (value: $50)</li>
                            <li>Waive next month's membership fee if they return</li>
                            <li>Schedule wellness check-in appointment</li>
                        </ul>
                    </div>

                    <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '0.75rem' }}>
                            ⚠️ Medium Risk ({mediumRisk} members)
                        </strong>
                        <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                            <li>Automated "we miss you" email campaign</li>
                            <li>Invite to upcoming group class or event</li>
                            <li>Offer guest pass for a friend</li>
                            <li>Check for scheduling conflicts or barriers</li>
                        </ul>
                    </div>

                    <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '0.75rem' }}>
                            💚 Low Risk ({lowRisk} members)
                        </strong>
                        <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                            <li>Send motivational email with workout tips</li>
                            <li>Highlight new classes or equipment</li>
                            <li>Share success stories from other members</li>
                            <li>Gentle reminder about membership benefits</li>
                        </ul>
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                    <strong>📊 Expected Impact:</strong> Implementing this intervention strategy could save 30-50% of at-risk members,
                    preventing approximately <strong>${(potentialLoss * 0.4).toLocaleString()}/month</strong> in revenue loss.
                </div>
            </motion.div>
        </motion.div>
    );
}

export default AtRiskMembers;