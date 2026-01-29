// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Upload, Download, FileText, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
// import { useData } from '.context/DataContext';

// const API_URL = 'http://localhost:5000/api';

// const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//         opacity: 1,
//         transition: { staggerChildren: 0.1 }
//     }
// };

// const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: {
//         y: 0,
//         opacity: 1,
//         transition: { type: 'spring', stiffness: 100 }
//     }
// };

// function DataManagement() {
//     const [importFile, setImportFile] = useState(null);
//     const [importType, setImportType] = useState('members');
//     const [importMode, setImportMode] = useState('append');
//     const [preview, setPreview] = useState(null);
//     const [uploading, setUploading] = useState(false);
//     const [uploadStatus, setUploadStatus] = useState(null);
//     const [exporting, setExporting] = useState(false);
//     const { refreshData } = useData();

//     // Handle file selection
//     const handleFileSelect = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setImportFile(file);
//             setPreview(null);
//             setUploadStatus(null);
//         }
//     };

//     // Preview file before import
//     const handlePreview = async () => {
//         if (!importFile) return;

//         setUploading(true);
//         const formData = new FormData();
//         formData.append('file', importFile);

//         try {
//             const response = await fetch(`${API_URL}/import/preview`, {
//                 method: 'POST',
//                 body: formData
//             });
//             const data = await response.json();

//             if (response.ok) {
//                 setPreview(data);
//                 setUploadStatus({ type: 'success', message: 'Preview loaded successfully' });
//             } else {
//                 setUploadStatus({ type: 'error', message: data.error || 'Preview failed' });
//             }
//         } catch (err) {
//             setUploadStatus({ type: 'error', message: 'Failed to preview file' });
//         } finally {
//             setUploading(false);
//         }
//     };

//     // Import data
//     const handleImport = async () => {
//         if (!importFile) return;

//         setUploading(true);
//         const formData = new FormData();
//         formData.append('file', importFile);
//         formData.append('mode', importMode);

//         try {
//             const response = await fetch(`${API_URL}/import/${importType}`, {
//                 method: 'POST',
//                 body: formData
//             });
//             const data = await response.json();

//             if (response.ok) {
//                 setUploadStatus({
//                     type: 'success',
//                     message: `✓ ${data.message}. Imported ${data.rows_imported} rows. Refreshing dashboard...`
//                 });
//                 setImportFile(null);
//                 setPreview(null);

//                 // Trigger data refresh across all pages
//                 refreshData();
//             } else {
//                 setUploadStatus({ type: 'error', message: data.error || 'Import failed' });
//             }
//         } catch (err) {
//             setUploadStatus({ type: 'error', message: 'Failed to import data' });
//         } finally {
//             setUploading(false);
//         }
//     };

//     // Export data
//     const handleExport = async (endpoint, filename) => {
//         setExporting(true);
//         try {
//             const response = await fetch(`${API_URL}/export/${endpoint}`);

//             if (response.ok) {
//                 const blob = await response.blob();
//                 const url = window.URL.createObjectURL(blob);
//                 const a = document.createElement('a');
//                 a.href = url;
//                 a.download = filename || 'export.xlsx';
//                 document.body.appendChild(a);
//                 a.click();
//                 window.URL.revokeObjectURL(url);
//                 document.body.removeChild(a);

//                 setUploadStatus({ type: 'success', message: '✓ Export downloaded successfully' });
//             } else {
//                 setUploadStatus({ type: 'error', message: 'Export failed' });
//             }
//         } catch (err) {
//             setUploadStatus({ type: 'error', message: 'Failed to export data' });
//         } finally {
//             setExporting(false);
//         }
//     };

//     // Download template
//     const handleDownloadTemplate = async (type) => {
//         try {
//             const response = await fetch(`${API_URL}/template/${type}`);
//             if (response.ok) {
//                 const blob = await response.blob();
//                 const url = window.URL.createObjectURL(blob);
//                 const a = document.createElement('a');
//                 a.href = url;
//                 a.download = `${type}_import_template.xlsx`;
//                 document.body.appendChild(a);
//                 a.click();
//                 window.URL.revokeObjectURL(url);
//                 document.body.removeChild(a);
//             }
//         } catch (err) {
//             setUploadStatus({ type: 'error', message: 'Failed to download template' });
//         }
//     };

//     return (
//         <motion.div variants={containerVariants} initial="hidden" animate="visible">
//             {/* Page Header */}
//             <motion.div variants={itemVariants} style={{ marginBottom: '2rem' }}>
//                 <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
//                     Data Management
//                 </h1>
//                 <p style={{ color: 'var(--text-secondary)' }}>
//                     Import real data and export analysis results
//                 </p>
//             </motion.div>

//             {/* Status Alert */}
//             {uploadStatus && (
//                 <motion.div
//                     className={`alert alert-${uploadStatus.type === 'success' ? 'success' : 'danger'}`}
//                     initial={{ opacity: 0, y: -20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     style={{ marginBottom: '2rem', position: 'relative' }}
//                 >
//                     {uploadStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
//                     <div>{uploadStatus.message}</div>
//                     <button
//                         onClick={() => setUploadStatus(null)}
//                         style={{
//                             position: 'absolute',
//                             right: '1rem',
//                             top: '50%',
//                             transform: 'translateY(-50%)',
//                             background: 'none',
//                             border: 'none',
//                             cursor: 'pointer',
//                             color: 'inherit'
//                         }}
//                     >
//                         <X size={18} />
//                     </button>
//                 </motion.div>
//             )}

//             <div style={{ display: 'grid', gap: '2rem' }}>
//                 {/* IMPORT SECTION */}
//                 <motion.div variants={itemVariants} className="card">
//                     <div className="card-header">
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//                             <Upload size={24} style={{ color: '#667eea' }} />
//                             <div>
//                                 <h3 className="card-title">Import Data</h3>
//                                 <p className="card-subtitle">Upload CSV or Excel files with your real data</p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Import Type Selection */}
//                     <div style={{ marginBottom: '1.5rem' }}>
//                         <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
//                             Data Type:
//                         </label>
//                         <div style={{ display: 'flex', gap: '0.5rem' }}>
//                             <motion.button
//                                 onClick={() => setImportType('members')}
//                                 className={importType === 'members' ? 'btn-primary' : 'btn-secondary'}
//                                 whileHover={{ scale: 1.05 }}
//                                 whileTap={{ scale: 0.95 }}
//                             >
//                                 👥 Members
//                             </motion.button>
//                             <motion.button
//                                 onClick={() => setImportType('checkins')}
//                                 className={importType === 'checkins' ? 'btn-primary' : 'btn-secondary'}
//                                 whileHover={{ scale: 1.05 }}
//                                 whileTap={{ scale: 0.95 }}
//                             >
//                                 📊 Check-ins
//                             </motion.button>
//                         </div>
//                     </div>

//                     {/* Import Mode */}
//                     <div style={{ marginBottom: '1.5rem' }}>
//                         <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
//                             Import Mode:
//                         </label>
//                         <div style={{ display: 'flex', gap: '0.5rem' }}>
//                             <motion.button
//                                 onClick={() => setImportMode('append')}
//                                 className={importMode === 'append' ? 'btn-primary' : 'btn-secondary'}
//                                 whileHover={{ scale: 1.05 }}
//                                 whileTap={{ scale: 0.95 }}
//                             >
//                                 ➕ Append (Add to existing)
//                             </motion.button>
//                             <motion.button
//                                 onClick={() => setImportMode('replace')}
//                                 className={importMode === 'replace' ? 'btn-primary' : 'btn-secondary'}
//                                 whileHover={{ scale: 1.05 }}
//                                 whileTap={{ scale: 0.95 }}
//                             >
//                                 🔄 Replace (Clear and import)
//                             </motion.button>
//                         </div>
//                     </div>

//                     {/* File Upload */}
//                     <div style={{ marginBottom: '1.5rem' }}>
//                         <label
//                             htmlFor="file-upload"
//                             style={{
//                                 display: 'block',
//                                 padding: '2rem',
//                                 border: '2px dashed var(--border-color)',
//                                 borderRadius: '8px',
//                                 textAlign: 'center',
//                                 cursor: 'pointer',
//                                 background: 'var(--bg-secondary)',
//                                 transition: 'all 0.2s'
//                             }}
//                             onMouseEnter={(e) => e.currentTarget.style.borderColor = '#667eea'}
//                             onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
//                         >
//                             <FileText size={48} style={{ margin: '0 auto 1rem', color: '#667eea' }} />
//                             <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
//                                 {importFile ? importFile.name : 'Click to upload or drag and drop'}
//                             </div>
//                             <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
//                                 CSV, XLSX, or XLS files only
//                             </div>
//                         </label>
//                         <input
//                             id="file-upload"
//                             type="file"
//                             accept=".csv,.xlsx,.xls"
//                             onChange={handleFileSelect}
//                             style={{ display: 'none' }}
//                         />
//                     </div>

//                     {/* Action Buttons */}
//                     <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
//                         <motion.button
//                             onClick={handlePreview}
//                             disabled={!importFile || uploading}
//                             className="btn-secondary"
//                             whileHover={{ scale: 1.05 }}
//                             whileTap={{ scale: 0.95 }}
//                             style={{ opacity: !importFile || uploading ? 0.5 : 1 }}
//                         >
//                             👁️ Preview
//                         </motion.button>
//                         <motion.button
//                             onClick={handleImport}
//                             disabled={!importFile || uploading}
//                             className="btn-primary"
//                             whileHover={{ scale: 1.05 }}
//                             whileTap={{ scale: 0.95 }}
//                             style={{ opacity: !importFile || uploading ? 0.5 : 1 }}
//                         >
//                             {uploading ? '⏳ Importing...' : '✓ Import Data'}
//                         </motion.button>
//                         <motion.button
//                             onClick={() => handleDownloadTemplate(importType)}
//                             className="btn-secondary"
//                             whileHover={{ scale: 1.05 }}
//                             whileTap={{ scale: 0.95 }}
//                         >
//                             📥 Download Template
//                         </motion.button>
//                     </div>

//                     {/* Preview Table */}
//                     {preview && (
//                         <motion.div
//                             initial={{ opacity: 0, height: 0 }}
//                             animate={{ opacity: 1, height: 'auto' }}
//                             style={{ marginTop: '1.5rem' }}
//                         >
//                             <div className="alert alert-info">
//                                 <Info size={20} />
//                                 <div>
//                                     <strong>Preview:</strong> {preview.rows} rows × {preview.columns} columns
//                                 </div>
//                             </div>
//                             <div className="table-container" style={{ maxHeight: '400px', overflow: 'auto' }}>
//                                 <table>
//                                     <thead>
//                                         <tr>
//                                             {preview.column_names.map((col, i) => (
//                                                 <th key={i}>{col}</th>
//                                             ))}
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {preview.sample_data.slice(0, 5).map((row, i) => (
//                                             <tr key={i}>
//                                                 {preview.column_names.map((col, j) => (
//                                                     <td key={j}>{row[col]}</td>
//                                                 ))}
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </motion.div>
//                     )}
//                 </motion.div>

//                 {/* EXPORT SECTION */}
//                 <motion.div variants={itemVariants} className="card">
//                     <div className="card-header">
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//                             <Download size={24} style={{ color: '#10b981' }} />
//                             <div>
//                                 <h3 className="card-title">Export Results</h3>
//                                 <p className="card-subtitle">Download analysis results as Excel files</p>
//                             </div>
//                         </div>
//                     </div>

//                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
//                         {[
//                             { id: 'overview', label: 'Overview Report', icon: '📊', desc: 'Complete dashboard summary' },
//                             { id: 'at-risk', label: 'At-Risk Members', icon: '⚠️', desc: 'Members needing attention' },
//                             { id: 'churn-analysis', label: 'Churn Analysis', icon: '📉', desc: 'Cancellation patterns' },
//                             { id: 'revenue', label: 'Revenue Report', icon: '💰', desc: 'Financial performance' }
//                         ].map((item) => (
//                             <motion.button
//                                 key={item.id}
//                                 onClick={() => handleExport(item.id, `${item.id}_report.xlsx`)}
//                                 disabled={exporting}
//                                 className="card"
//                                 whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
//                                 whileTap={{ scale: 0.98 }}
//                                 style={{
//                                     cursor: 'pointer',
//                                     border: '1px solid var(--border-color)',
//                                     padding: '1.5rem',
//                                     textAlign: 'left',
//                                     opacity: exporting ? 0.5 : 1
//                                 }}
//                             >
//                                 <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
//                                 <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>
//                                     {item.label}
//                                 </div>
//                                 <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
//                                     {item.desc}
//                                 </div>
//                             </motion.button>
//                         ))}
//                     </div>
//                 </motion.div>

//                 {/* HELP SECTION */}
//                 <motion.div variants={itemVariants} className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
//                     <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
//                         📚 Quick Guide
//                     </h3>
//                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
//                         <div>
//                             <strong style={{ display: 'block', marginBottom: '0.5rem' }}>1. Import Data</strong>
//                             <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
//                                 <li>Download template first</li>
//                                 <li>Fill with your real data</li>
//                                 <li>Upload CSV or Excel file</li>
//                                 <li>Preview before importing</li>
//                             </ul>
//                         </div>
//                         <div>
//                             <strong style={{ display: 'block', marginBottom: '0.5rem' }}>2. Analyze</strong>
//                             <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
//                                 <li>Navigate to dashboard pages</li>
//                                 <li>View insights and patterns</li>
//                                 <li>Apply filters as needed</li>
//                                 <li>Identify actionable insights</li>
//                             </ul>
//                         </div>
//                         <div>
//                             <strong style={{ display: 'block', marginBottom: '0.5rem' }}>3. Export Results</strong>
//                             <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
//                                 <li>Click export button</li>
//                                 <li>Choose report type</li>
//                                 <li>Download Excel file</li>
//                                 <li>Share with stakeholders</li>
//                             </ul>
//                         </div>
//                     </div>
//                 </motion.div>
//             </div>
//         </motion.div>
//     );
// }

// export default DataManagement;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

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

function DataManagement() {
    const [importFile, setImportFile] = useState(null);
    const [importType, setImportType] = useState('members');
    const [importMode, setImportMode] = useState('append');
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [exporting, setExporting] = useState(false);

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImportFile(file);
            setPreview(null);
            setUploadStatus(null);
        }
    };

    // Preview file before import
    const handlePreview = async () => {
        if (!importFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', importFile);

        try {
            const response = await fetch(`${API_URL}/import/preview`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (response.ok) {
                setPreview(data);
                setUploadStatus({ type: 'success', message: 'Preview loaded successfully' });
            } else {
                setUploadStatus({ type: 'error', message: data.error || 'Preview failed' });
            }
        } catch (err) {
            setUploadStatus({ type: 'error', message: 'Failed to preview file' });
        } finally {
            setUploading(false);
        }
    };

    // Import data
    const handleImport = async () => {
        if (!importFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', importFile);
        formData.append('mode', importMode);

        try {
            const response = await fetch(`${API_URL}/import/${importType}`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (response.ok) {
                setUploadStatus({
                    type: 'success',
                    message: `✓ ${data.message}. Imported ${data.rows_imported} rows. Go to Overview and click Refresh Data to see changes.`
                });
                setImportFile(null);
                setPreview(null);
            } else {
                setUploadStatus({ type: 'error', message: data.error || 'Import failed' });
            }
        } catch (err) {
            setUploadStatus({ type: 'error', message: 'Failed to import data' });
        } finally {
            setUploading(false);
        }
    };

    // Export data
    const handleExport = async (endpoint, filename) => {
        setExporting(true);
        try {
            const response = await fetch(`${API_URL}/export/${endpoint}`);

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename || 'export.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                setUploadStatus({ type: 'success', message: '✓ Export downloaded successfully' });
            } else {
                setUploadStatus({ type: 'error', message: 'Export failed' });
            }
        } catch (err) {
            setUploadStatus({ type: 'error', message: 'Failed to export data' });
        } finally {
            setExporting(false);
        }
    };

    // Download template
    const handleDownloadTemplate = async (type) => {
        try {
            const response = await fetch(`${API_URL}/template/${type}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${type}_import_template.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (err) {
            setUploadStatus({ type: 'error', message: 'Failed to download template' });
        }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Page Header */}
            <motion.div variants={itemVariants} style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    Data Management
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Import real data and export analysis results
                </p>
            </motion.div>

            {/* Status Alert */}
            {uploadStatus && (
                <motion.div
                    className={`alert alert-${uploadStatus.type === 'success' ? 'success' : 'danger'}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2rem', position: 'relative' }}
                >
                    {uploadStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <div>{uploadStatus.message}</div>
                    <button
                        onClick={() => setUploadStatus(null)}
                        style={{
                            position: 'absolute',
                            right: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'inherit'
                        }}
                    >
                        <X size={18} />
                    </button>
                </motion.div>
            )}

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* IMPORT SECTION */}
                <motion.div variants={itemVariants} className="card">
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Upload size={24} style={{ color: '#667eea' }} />
                            <div>
                                <h3 className="card-title">Import Data</h3>
                                <p className="card-subtitle">Upload CSV or Excel files with your real data</p>
                            </div>
                        </div>
                    </div>

                    {/* Import Type Selection */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                            Data Type:
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <motion.button
                                onClick={() => setImportType('members')}
                                className={importType === 'members' ? 'btn-primary' : 'btn-secondary'}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                👥 Members
                            </motion.button>
                            <motion.button
                                onClick={() => setImportType('checkins')}
                                className={importType === 'checkins' ? 'btn-primary' : 'btn-secondary'}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                📊 Check-ins
                            </motion.button>
                        </div>
                    </div>

                    {/* Import Mode */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                            Import Mode:
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <motion.button
                                onClick={() => setImportMode('append')}
                                className={importMode === 'append' ? 'btn-primary' : 'btn-secondary'}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                ➕ Append (Add to existing)
                            </motion.button>
                            <motion.button
                                onClick={() => setImportMode('replace')}
                                className={importMode === 'replace' ? 'btn-primary' : 'btn-secondary'}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                🔄 Replace (Clear and import)
                            </motion.button>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label
                            htmlFor="file-upload"
                            style={{
                                display: 'block',
                                padding: '2rem',
                                border: '2px dashed var(--border-color)',
                                borderRadius: '8px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: 'var(--bg-secondary)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#667eea'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                        >
                            <FileText size={48} style={{ margin: '0 auto 1rem', color: '#667eea' }} />
                            <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                {importFile ? importFile.name : 'Click to upload or drag and drop'}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                CSV, XLSX, or XLS files only
                            </div>
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <motion.button
                            onClick={handlePreview}
                            disabled={!importFile || uploading}
                            className="btn-secondary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ opacity: !importFile || uploading ? 0.5 : 1 }}
                        >
                            👁️ Preview
                        </motion.button>
                        <motion.button
                            onClick={handleImport}
                            disabled={!importFile || uploading}
                            className="btn-primary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ opacity: !importFile || uploading ? 0.5 : 1 }}
                        >
                            {uploading ? '⏳ Importing...' : '✓ Import Data'}
                        </motion.button>
                        <motion.button
                            onClick={() => handleDownloadTemplate(importType)}
                            className="btn-secondary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            📥 Download Template
                        </motion.button>
                    </div>

                    {/* Preview Table */}
                    {preview && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{ marginTop: '1.5rem' }}
                        >
                            <div className="alert alert-info">
                                <Info size={20} />
                                <div>
                                    <strong>Preview:</strong> {preview.rows} rows × {preview.columns} columns
                                </div>
                            </div>
                            <div className="table-container" style={{ maxHeight: '400px', overflow: 'auto' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            {preview.column_names.map((col, i) => (
                                                <th key={i}>{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.sample_data.slice(0, 5).map((row, i) => (
                                            <tr key={i}>
                                                {preview.column_names.map((col, j) => (
                                                    <td key={j}>{row[col]}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* EXPORT SECTION */}
                <motion.div variants={itemVariants} className="card">
                    <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Download size={24} style={{ color: '#10b981' }} />
                            <div>
                                <h3 className="card-title">Export Results</h3>
                                <p className="card-subtitle">Download analysis results as Excel files</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        {[
                            { id: 'overview', label: 'Overview Report', icon: '📊', desc: 'Complete dashboard summary' },
                            { id: 'at-risk', label: 'At-Risk Members', icon: '⚠️', desc: 'Members needing attention' },
                            { id: 'churn-analysis', label: 'Churn Analysis', icon: '📉', desc: 'Cancellation patterns' },
                            { id: 'revenue', label: 'Revenue Report', icon: '💰', desc: 'Financial performance' }
                        ].map((item) => (
                            <motion.button
                                key={item.id}
                                onClick={() => handleExport(item.id, `${item.id}_report.xlsx`)}
                                disabled={exporting}
                                className="card"
                                whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    cursor: 'pointer',
                                    border: '1px solid var(--border-color)',
                                    padding: '1.5rem',
                                    textAlign: 'left',
                                    opacity: exporting ? 0.5 : 1
                                }}
                            >
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                                <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>
                                    {item.label}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {item.desc}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* HELP SECTION */}
                <motion.div variants={itemVariants} className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                        📚 Quick Guide
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>1. Import Data</strong>
                            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                                <li>Download template first</li>
                                <li>Fill with your real data</li>
                                <li>Upload CSV or Excel file</li>
                                <li>Preview before importing</li>
                            </ul>
                        </div>
                        <div>
                            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>2. Refresh Dashboard</strong>
                            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                                <li>After import, go to Overview</li>
                                <li>Click "Refresh Data" button</li>
                                <li>See your new data instantly</li>
                                <li>Repeat for other pages</li>
                            </ul>
                        </div>
                        <div>
                            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>3. Export Results</strong>
                            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                                <li>Click export button</li>
                                <li>Choose report type</li>
                                <li>Download Excel file</li>
                                <li>Share with stakeholders</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default DataManagement;