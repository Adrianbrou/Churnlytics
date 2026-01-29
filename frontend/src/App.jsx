
import ChurnLogo from './assets/churn_logo.png';

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingDown,
  AlertTriangle,
  Activity,
  DollarSign,
  Target,
  Building2,
  Database,
  Sun,
  Moon,
  Menu,
  X,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Overview from './pages/Overview';
import ChurnAnalysis from './pages/ChurnAnalysis';
import AtRiskMembers from './pages/AtRiskMembers';
import Engagement from './pages/Engagement';
import Revenue from './pages/Revenue';
import SalesFunnel from './pages/SalesFunnel';
import LocationComparison from './pages/LocationComparison';
import DataManagement from './pages/DataManagement';
import './styles/global.css';

const navigation = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/churn', label: 'Churn Analysis', icon: TrendingDown },
  { path: '/at-risk', label: 'At-Risk Members', icon: AlertTriangle },
  { path: '/engagement', label: 'Engagement', icon: Activity },
  { path: '/revenue', label: 'Revenue', icon: DollarSign },
  { path: '/funnel', label: 'Sales Funnel', icon: Target },
  { path: '/locations', label: 'Locations', icon: Building2 },
  { path: '/data', label: 'Import/Export', icon: Database }
];

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleExport = () => {
    alert('Export functionality coming soon!');
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app-container">
        {/* Header */}
        <motion.header
          className="app-header"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <div className="header-content">
            <motion.div
              className="logo"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="logo-icon"
                animate={{
                  rotate: [0, 10, 0, -10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                🏋️
              </motion.span>
              <div>
                <h1>Churnlytics</h1>
                <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.25rem' }}>
                  Member Retention Dashboard
                </p>
              </div>
            </motion.div>

            <div className="header-actions">
              <motion.button
                onClick={toggleTheme}
                className="theme-toggle"
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </motion.button>

              <motion.button
                className="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                whileTap={{ scale: 0.9 }}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>
        </motion.header>

        <div className="app-body">
          {/* Sidebar */}
          <motion.aside
            className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <nav className="nav-tabs">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon size={20} className="tab-icon" />
                      {!sidebarCollapsed && <span className="tab-label">{item.label}</span>}
                    </NavLink>
                  </motion.div>
                );
              })}
            </nav>

            <motion.button
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </motion.button>
          </motion.aside>

          {/* Main Content */}
          <main className="main-content">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={
                  <PageTransition>
                    <Overview />
                  </PageTransition>
                } />
                <Route path="/churn" element={
                  <PageTransition>
                    <ChurnAnalysis />
                  </PageTransition>
                } />
                <Route path="/at-risk" element={
                  <PageTransition>
                    <AtRiskMembers />
                  </PageTransition>
                } />
                <Route path="/engagement" element={
                  <PageTransition>
                    <Engagement />
                  </PageTransition>
                } />
                <Route path="/revenue" element={
                  <PageTransition>
                    <Revenue />
                  </PageTransition>
                } />
                <Route path="/funnel" element={
                  <PageTransition>
                    <SalesFunnel />
                  </PageTransition>
                } />
                <Route path="/locations" element={
                  <PageTransition>
                    <LocationComparison />
                  </PageTransition>
                } />
                <Route path="/data" element={
                  <PageTransition>
                    <DataManagement />
                  </PageTransition>
                } />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </Router>
  );
}

// Page Transition Wrapper
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="page-container"
    >
      {children}
    </motion.div>
  );
};

// Main App with Theme Provider
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;