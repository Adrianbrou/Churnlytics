import pdb
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sqlite3
import json
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import os
from io import BytesIO
from werkzeug.utils import secure_filename

"""
Churnlytics API
Flask backend serving analytics data and insights
"""

app = Flask(__name__)
CORS(app)

# just replace the db

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = os.path.join(BASE_DIR, "..", "data")
DB_PATH = os.path.join(DATA_DIR, "gym_analytics.db")

# # Database path
# DB_PATH = '../data/gym_analytics.db'
# DATA_DIR = '../data'

# Import/Export Configuration
UPLOAD_FOLDER = '../data/uploads'
EXPORT_FOLDER = '../data/exports'
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls'}

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EXPORT_FOLDER, exist_ok=True)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ============================================================================
# DATABASE INITIALIZATION
# ============================================================================


def init_database():
    """Initialize SQLite database and load CSV data"""
    print("Initializing database...")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Load CSV files
    members_df = pd.read_csv(os.path.join(DATA_DIR, "members.csv"))
    checkins_df = pd.read_csv(f'{DATA_DIR}/checkins.csv')

    if 'cancellation_date' not in members_df.columns:
        members_df['cancellation_date'] = None

    # Handle both column name formats
    if 'checkin_datetime' in checkins_df.columns:
        checkins_df.rename(
            columns={'checkin_datetime': 'checkin_date'}, inplace=True)

    sales_df = pd.read_csv(f'{DATA_DIR}/sales.csv')
    leads_df = pd.read_csv(f'{DATA_DIR}/leads.csv')

    # Create tables and load data
    members_df.to_sql('members', conn, if_exists='replace', index=False)
    checkins_df.to_sql('checkins', conn, if_exists='replace', index=False)
    sales_df.to_sql('sales', conn, if_exists='replace', index=False)
    leads_df.to_sql('leads', conn, if_exists='replace', index=False)

    conn.close()
    print("✓ Database initialized successfully")


# Initialize database on startup if it doesn't exist
if not os.path.exists(DB_PATH):
    init_database()

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================


def query_db(query, params=()):
    """Execute SQL query and return results as list of dicts"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(query, params)
    results = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return results


def query_to_df(query, params=()):
    """Execute SQL query and return as DataFrame"""
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query(query, conn, params=params)
    conn.close()
    return df

# ============================================================================
# API ENDPOINTS
# ============================================================================


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/overview', methods=['GET'])
def get_overview():
    """Get high-level overview metrics"""

    # chechkins

    checkins_query = """
    SELECT
        COUNT(*) as total_checkins,
        COUNT(DISTINCT member_id) as unique_members_checked_in
    FROM checkins
"""
    chechkins = query_db(checkins_query)

    # Get active member counts
    members_query = """
    SELECT
        COUNT(*) as total_members,
        SUM(is_active) as active_members,
        COUNT(CASE WHEN is_active = 0 THEN 1 END) as churned_members,
        COUNT(CASE WHEN tour_scheduled = 1 THEN 1 END) as tours_scheduled,
        COUNT(DISTINCT location) as total_locations
    FROM members
"""

    location_stats = query_db(members_query)

    # Total stats
    total_query = """
        SELECT 
            COUNT(*) as total_members,
            SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_members,
            ROUND(SUM(CASE WHEN is_active = 1 THEN COALESCE(monthly_fee, 39.99) ELSE 0 END), 2) as mrr
        FROM members
    """
    totals = query_db(total_query)[0]

    # Calculate retention rate
    retention_rate = (totals['active_members'] / totals['total_members']
                      ) * 100 if totals['total_members'] > 0 else 0

    # Recent month trends - handle both signup_date and join_date
    monthly_signups = """
        SELECT 
            strftime('%Y-%m', COALESCE(signup_date, join_date)) as month,
            COUNT(*) as signups
        FROM members
        WHERE COALESCE(signup_date, join_date) >= date('now', '-6 months')
        GROUP BY month
        ORDER BY month DESC
        LIMIT 6
    """
    signups_trend = query_db(monthly_signups)

    # Calculate churn rate
    churn_query = """
        SELECT 
            COUNT(*) as recent_churns
        FROM members
        WHERE cancellation_date >= date('now', '-30 days')
    """
    churn_result = query_db(churn_query)
    recent_churns = churn_result[0]['recent_churns'] if churn_result else 0

    churn_rate = (recent_churns / totals['active_members']) * \
        100 if totals['active_members'] > 0 else 0

    return jsonify({
        'total_members': totals['total_members'],
        'active_members': totals['active_members'],
        'mrr': totals['mrr'],
        'retention_rate': round(retention_rate, 1),
        'churn_rate': round(churn_rate, 2),
        'location_stats': location_stats,
        'signup_trend': signups_trend
    })


@app.route('/api/churn-analysis', methods=['GET'])
def get_churn_analysis():
    """Get detailed churn analysis"""

    # Churn by membership type
    churn_by_type = """
        SELECT 
            membership_type,
            COUNT(*) as total,
            SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as churned,
            ROUND(100.0 * SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) / COUNT(*), 1) as churn_rate
        FROM members
        GROUP BY membership_type
        ORDER BY churn_rate DESC
    """
    churn_by_membership = query_db(churn_by_type)

    # Churn by location
    churn_by_location = """
    SELECT 
        location,
        COUNT(*) as total_members,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as churned,
        ROUND(100.0 * SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) / COUNT(*), 1) as churn_rate
    FROM members
    GROUP BY location
    ORDER BY total_members DESC
    """
    churn_by_loc = query_db(churn_by_location)

    # Churn by tenure - handle both signup_date and join_date

    churn_by_tenure = """
    SELECT 
        CASE 
            WHEN CAST((julianday('now') - julianday(join_date)) / 30 AS INTEGER) < 3 THEN '0-3 months'
            WHEN CAST((julianday('now') - julianday(join_date)) / 30 AS INTEGER) < 6 THEN '3-6 months'
            WHEN CAST((julianday('now') - julianday(join_date)) / 30 AS INTEGER) < 12 THEN '6-12 months'
            ELSE '12+ months'
        END as tenure_group,
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as churned,
        ROUND(100.0 * SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) / COUNT(*), 1) as churn_rate
    FROM members
    GROUP BY tenure_group
    ORDER BY 
        CASE tenure_group
            WHEN '0-3 months' THEN 1
            WHEN '3-6 months' THEN 2
            WHEN '6-12 months' THEN 3
            ELSE 4
        END
"""

    churn_by_ten = query_db(churn_by_tenure)

    # PT impact on retention
    pt_impact = """
        SELECT 
            has_personal_training as has_pt,
            COUNT(*) as total,
            SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as churned,
            ROUND(100.0 * SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) / COUNT(*), 1) as churn_rate
        FROM members
        GROUP BY has_personal_training
    """
    pt_stats = query_db(pt_impact)

    # Monthly churn trend
    monthly_churn = """
        SELECT 
            strftime('%Y-%m', cancellation_date) as month,
            COUNT(*) as churned_count
        FROM members
        WHERE cancellation_date IS NOT NULL
            AND cancellation_date >= date('now', '-12 months')
        GROUP BY month
        ORDER BY month
    """
    churn_trend = query_db(monthly_churn)

    return jsonify({
        'churn_by_membership': churn_by_membership,
        'churn_by_location': churn_by_loc,
        'churn_by_tenure': churn_by_ten,
        'pt_impact': pt_stats,
        'monthly_trend': churn_trend
    })


@app.route('/api/at-risk-members', methods=['GET'])
def get_at_risk_members():
    """Identify members at high risk of churning"""

    # Get members with low recent engagement
    query = """
        WITH member_checkins AS (
            SELECT
                m.member_id,
                m.location,
                m.membership_type,
                m.has_personal_training,
                m.monthly_fee,
                CAST((julianday('now') - julianday(COALESCE(m.signup_date, m.join_date))) / 30 AS REAL) as months_member,
                COUNT(c.checkin_id) as total_checkins,
                MAX(c.checkin_date) as last_checkin,
                CAST((julianday('now') - julianday(MAX(c.checkin_date))) AS INTEGER) as days_since_checkin
            FROM members m
            LEFT JOIN checkins c ON m.member_id = c.member_id
            WHERE m.is_active = 1
            GROUP BY m.member_id
        )
        SELECT
            member_id,
            location,
            membership_type,
            has_personal_training,
            COALESCE(monthly_fee, 39.99) as monthly_fee,
            months_member,
            total_checkins,
            last_checkin,
            days_since_checkin,
            CASE
                WHEN days_since_checkin > 30 OR days_since_checkin IS NULL THEN 'High'
                WHEN days_since_checkin > 14 THEN 'Medium'
                ELSE 'Low'
            END as risk_level,
            ROUND(total_checkins * 1.0 / NULLIF(months_member, 0), 1) as avg_checkins_per_month
        FROM member_checkins
        WHERE days_since_checkin > 7 OR days_since_checkin IS NULL
        ORDER BY days_since_checkin DESC
        LIMIT 100
    """

    at_risk = query_db(query)

    # Risk level summary
    risk_summary = """
        WITH member_checkins AS (
            SELECT 
                m.member_id,
                MAX(c.checkin_date) as last_checkin,
                CAST((julianday('now') - julianday(MAX(c.checkin_date))) AS INTEGER) as days_since_checkin
            FROM members m
            LEFT JOIN checkins c ON m.member_id = c.member_id
            WHERE m.is_active = 1
            GROUP BY m.member_id
        )
        SELECT 
            CASE 
                WHEN days_since_checkin > 30 OR days_since_checkin IS NULL THEN 'High'
                WHEN days_since_checkin > 14 THEN 'Medium'
                ELSE 'Low'
            END as risk_level,
            COUNT(*) as count
        FROM member_checkins
        GROUP BY risk_level
    """
    summary = query_db(risk_summary)

    return jsonify({
        'at_risk_members': at_risk,
        'risk_summary': summary
    })


@app.route('/api/engagement', methods=['GET'])
def get_engagement_metrics():
    """Get member engagement statistics"""

    # Check-in patterns by hour
    hourly_pattern = """
        SELECT 
            CAST(strftime('%H', checkin_date) AS INTEGER) as hour,
            COUNT(*) as checkin_count
        FROM checkins
        WHERE checkin_date >= date('now', '-30 days')
        GROUP BY hour
        ORDER BY hour
    """
    hourly = query_db(hourly_pattern)

    # Check-in patterns by day of week
    daily_pattern = """
        SELECT 
            CASE CAST(strftime('%w', checkin_date) AS INTEGER)
                WHEN 0 THEN 'Sunday'
                WHEN 1 THEN 'Monday'
                WHEN 2 THEN 'Tuesday'
                WHEN 3 THEN 'Wednesday'
                WHEN 4 THEN 'Thursday'
                WHEN 5 THEN 'Friday'
                WHEN 6 THEN 'Saturday'
            END as day_of_week,
            COUNT(*) as checkin_count
        FROM checkins
        WHERE checkin_date >= date('now', '-30 days')
        GROUP BY day_of_week
        ORDER BY CAST(strftime('%w', checkin_date) AS INTEGER)
    """
    daily = query_db(daily_pattern)

    # Average visits per member by location
    avg_visits = """
        SELECT 
            m.location,
            COUNT(DISTINCT m.member_id) as active_members,
            COUNT(c.checkin_id) as total_checkins,
            ROUND(COUNT(c.checkin_id) * 1.0 / NULLIF(COUNT(DISTINCT m.member_id), 0), 1) as avg_visits_per_member
        FROM members m
        LEFT JOIN checkins c ON m.member_id = c.member_id 
            AND c.checkin_date >= date('now', '-30 days')
        WHERE m.is_active = 1
        GROUP BY m.location
    """
    location_engagement = query_db(avg_visits)

    # Engagement distribution
    engagement_dist = """
        WITH member_visits AS (
            SELECT 
                m.member_id,
                COUNT(c.checkin_id) as visits_last_30d
            FROM members m
            LEFT JOIN checkins c ON m.member_id = c.member_id 
                AND c.checkin_date >= date('now', '-30 days')
            WHERE m.is_active = 1
            GROUP BY m.member_id
        )
        SELECT 
            CASE 
                WHEN visits_last_30d = 0 THEN 'Inactive (0 visits)'
                WHEN visits_last_30d < 5 THEN 'Low (1-4 visits)'
                WHEN visits_last_30d < 12 THEN 'Medium (5-11 visits)'
                ELSE 'High (12+ visits)'
            END as engagement_level,
            COUNT(*) as member_count
        FROM member_visits
        GROUP BY engagement_level
        ORDER BY 
            CASE engagement_level
                WHEN 'Inactive (0 visits)' THEN 1
                WHEN 'Low (1-4 visits)' THEN 2
                WHEN 'Medium (5-11 visits)' THEN 3
                ELSE 4
            END
    """
    distribution = query_db(engagement_dist)

    return jsonify({
        'hourly_pattern': hourly,
        'daily_pattern': daily,
        'location_engagement': location_engagement,
        'engagement_distribution': distribution
    })


@app.route('/api/revenue', methods=['GET'])
def get_revenue_metrics():
    """Get revenue and financial metrics"""

    # Monthly revenue trend
    monthly_revenue = """
        SELECT 
            strftime('%Y-%m', date) as month,
            SUM(amount) as revenue,
            COUNT(*) as transaction_count
        FROM sales
        WHERE date >= date('now', '-12 months')
        GROUP BY month
        ORDER BY month
    """
    revenue_trend = query_db(monthly_revenue)

    # Revenue by type
    revenue_by_type = """
        SELECT 
            type,
            SUM(amount) as total_revenue,
            COUNT(*) as transaction_count,
            ROUND(AVG(amount), 2) as avg_transaction
        FROM sales
        GROUP BY type
    """
    by_type = query_db(revenue_by_type)

    # Revenue by location
    revenue_by_location = """
        SELECT 
            location,
            SUM(amount) as total_revenue,
            COUNT(*) as transaction_count
        FROM sales
        GROUP BY location
    """
    by_location = query_db(revenue_by_location)

    # Member Lifetime Value by membership type
    ltv_query = """
        SELECT 
            m.membership_type,
            COUNT(DISTINCT m.member_id) as member_count,
            ROUND(AVG(
                CASE 
                    WHEN m.is_active = 1 THEN 
                        m.monthly_fee * CAST((julianday('now') - julianday(COALESCE(m.signup_date, m.join_date))) / 30 AS REAL)
                    ELSE 
                        m.monthly_fee * CAST((julianday(m.cancellation_date) - julianday(COALESCE(m.signup_date, m.join_date))) / 30 AS REAL)
                END
            ), 2) as avg_ltv
        FROM members m
        GROUP BY m.membership_type
        ORDER BY avg_ltv DESC
    """
    ltv_stats = query_db(ltv_query)

    # Current MRR and growth
    mrr_query = """
        SELECT 
            SUM(COALESCE(m.monthly_fee, 39.99)) as current_mrr,
            COUNT(*) as active_count
        FROM members
        WHERE is_active = 1
    """
    mrr_data = query_db(mrr_query)[0]

    return jsonify({
        'monthly_revenue_trend': revenue_trend,
        'revenue_by_type': by_type,
        'revenue_by_location': by_location,
        'ltv_by_membership': ltv_stats,
        'current_mrr': mrr_data['current_mrr'],
        'active_paying_members': mrr_data['active_count']
    })


@app.route('/api/sales-funnel', methods=['GET'])
def get_sales_funnel():
    """Get sales funnel and conversion metrics"""

    # sales
    sales_query = """
    SELECT
        COUNT(*) as total_sales,
        SUM(amount) as total_revenue,
        COUNT(DISTINCT product) as total_products
    FROM sales
"""
    sales = query_db(sales_query)

    # Overall conversion funnel
    funnel_query = """
        SELECT 
            COUNT(*) as total_leads,
            SUM(CASE WHEN tour_scheduled = 1 THEN 1 ELSE 0 END) as tours_scheduled,
            SUM(CASE WHEN tour_completed = 1 THEN 1 ELSE 0 END) as tours_completed,
            SUM(CASE WHEN converted_to_member = 1 THEN 1 ELSE 0 END) as conversions
        FROM leads
    """
    funnel = query_db(funnel_query)[0]

    # Calculate conversion rates
    funnel['tour_schedule_rate'] = round(
        (funnel['tours_scheduled'] / funnel['total_leads']) * 100, 1) if funnel['total_leads'] > 0 else 0
    funnel['tour_completion_rate'] = round(
        (funnel['tours_completed'] / funnel['tours_scheduled']) * 100, 1) if funnel['tours_scheduled'] > 0 else 0
    funnel['conversion_rate'] = round(
        (funnel['conversions'] / funnel['tours_completed']) * 100, 1) if funnel['tours_completed'] > 0 else 0
    funnel['overall_conversion'] = round(
        (funnel['conversions'] / funnel['total_leads']) * 100, 1) if funnel['total_leads'] > 0 else 0

    # By lead source
    source_performance = """
        SELECT 
            lead_source,
            COUNT(*) as leads,
            SUM(CASE WHEN converted_to_member = 1 THEN 1 ELSE 0 END) as conversions,
            ROUND(100.0 * SUM(CASE WHEN converted_to_member = 1 THEN 1 ELSE 0 END) / COUNT(*), 1) as conversion_rate
        FROM leads
        GROUP BY lead_source
        ORDER BY conversion_rate DESC
    """
    by_source = query_db(source_performance)

    # By location
    location_performance = """
        SELECT 
            location,
            COUNT(*) as leads,
            SUM(CASE WHEN converted_to_member = 1 THEN 1 ELSE 0 END) as conversions,
            ROUND(100.0 * SUM(CASE WHEN converted_to_member = 1 THEN 1 ELSE 0 END) / COUNT(*), 1) as conversion_rate
        FROM leads
        GROUP BY location
    """
    by_location = query_db(location_performance)

    # Monthly trend
    monthly_trend = """
        SELECT 
            strftime('%Y-%m', date) as month,
            COUNT(*) as leads,
            SUM(CASE WHEN converted_to_member = 1 THEN 1 ELSE 0 END) as conversions,
            ROUND(100.0 * SUM(CASE WHEN converted_to_member = 1 THEN 1 ELSE 0 END) / COUNT(*), 1) as conversion_rate
        FROM leads
        WHERE date >= date('now', '-6 months')
        GROUP BY month
        ORDER BY month
    """
    trend = query_db(monthly_trend)

    return jsonify({
        'funnel_overview': funnel,
        'by_source': by_source,
        'by_location': by_location,
        'monthly_trend': trend
    })


@app.route('/api/location-comparison', methods=['GET'])
def get_location_comparison():
    """Compare performance between locations"""

    # Key metrics by location
    comparison_query = """
        SELECT 
            location,
            COUNT(DISTINCT m.member_id) as total_members,
            SUM(CASE WHEN m.is_active = 1 THEN 1 ELSE 0 END) as active_members,
            ROUND(100.0 * SUM(CASE WHEN m.is_active = 1 THEN 1 ELSE 0 END) / COUNT(*), 1) as retention_rate,
            SUM(CASE WHEN m.is_active = 1 THEN COALESCE(m.monthly_fee, 39.99) ELSE 0 END) as mrr,
            COUNT(DISTINCT CASE WHEN m.has_personal_training = 1 THEN m.member_id END) as pt_members,
            ROUND(100.0 * COUNT(DISTINCT CASE WHEN m.has_personal_training = 1 THEN m.member_id END) / COUNT(*), 1) as pt_attachment_rate
        FROM members m
        GROUP BY location
    """
    metrics = query_db(comparison_query)

    # Check-ins comparison
    checkins_comparison = """
        SELECT 
            m.location,
            COUNT(c.checkin_id) as total_checkins,
            COUNT(DISTINCT c.member_id) as unique_visitors,
            ROUND(COUNT(c.checkin_id) * 1.0 / NULLIF(COUNT(DISTINCT m.member_id), 0), 1) as avg_visits_per_member
        FROM members m
        LEFT JOIN checkins c ON m.member_id = c.member_id 
            AND c.checkin_date >= date('now', '-30 days')
        WHERE m.is_active = 1
        GROUP BY m.location
    """
    checkins = query_db(checkins_comparison)

    # Sales comparison
    sales_comparison = """
        SELECT 
            location,
            SUM(amount) as total_revenue,
            COUNT(*) as transactions,
            ROUND(AVG(amount), 2) as avg_transaction
        FROM sales
        GROUP BY location
    """
    sales = query_db(sales_comparison)

    return jsonify({
        'key_metrics': metrics,
        'engagement': checkins,
        'revenue': sales
    })

# ============================================================================
# IMPORT/EXPORT ENDPOINTS
# ============================================================================


@app.route('/api/import/preview', methods=['POST'])
def import_preview():
    """Preview uploaded file before importing"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400

        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()

        if file_ext == 'csv':
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)

        preview = {
            'filename': filename,
            'rows': len(df),
            'columns': len(df.columns),
            'column_names': df.columns.tolist(),
            'sample_data': df.head(10).to_dict('records'),
            'data_types': df.dtypes.astype(str).to_dict(),
            'missing_values': df.isnull().sum().to_dict()
        }

        return jsonify(preview)

    except Exception as e:
        return jsonify({'error': f'Error reading file: {str(e)}'}), 500


@app.route('/api/import/members', methods=['POST'])
def import_members():
    """Import member data from CSV/Excel"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()

        if file_ext == 'csv':
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)

        # Handle flexible date column naming
        if 'join_date' in df.columns and 'signup_date' not in df.columns:
            df['signup_date'] = df['join_date']
        elif 'signup_date' in df.columns and 'join_date' not in df.columns:
            df['join_date'] = df['signup_date']

        # Validate required columns
        has_join_date = 'join_date' in df.columns
        has_signup_date = 'signup_date' in df.columns

        if not (has_join_date or has_signup_date):
            return jsonify({'error': 'Missing required column: join_date or signup_date'}), 400

        required_cols = ['member_id', 'membership_type', 'location']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            return jsonify({'error': f'Missing required columns: {missing_cols}'}), 400

        # Add defaults
        if 'has_personal_training' not in df.columns:
            df['has_personal_training'] = 0
        if 'is_active' not in df.columns:
            df['is_active'] = 1
        if 'monthly_fee' not in df.columns:
            df['monthly_fee'] = df['membership_type'].map({
                'Premium': 49.99,
                'Basic': 29.99,
                'Family': 79.99,
                'Monthly': 39.99,
                'Annual': 399.99
            }).fillna(39.99)

        conn = sqlite3.connect(DB_PATH)
        mode = request.form.get('mode', 'append')
        if_exists = 'append' if mode == 'append' else 'replace'

        df.to_sql('members', conn, if_exists=if_exists, index=False)
        conn.close()

        return jsonify({
            'success': True,
            'message': f'Imported {len(df)} members',
            'rows_imported': len(df),
            'mode': mode
        })

    except Exception as e:
        return jsonify({'error': f'Import failed: {str(e)}'}), 500


@app.route('/api/import/checkins', methods=['POST'])
def import_checkins():
    """Import check-in data from CSV/Excel"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()

        if file_ext == 'csv':
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)

        # Handle both column names
        if 'checkin_datetime' in df.columns and 'checkin_date' not in df.columns:
            df['checkin_date'] = df['checkin_datetime']

        required_cols = ['member_id', 'checkin_date', 'location']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            return jsonify({'error': f'Missing required columns: {missing_cols}'}), 400

        conn = sqlite3.connect(DB_PATH)
        mode = request.form.get('mode', 'append')
        if_exists = 'append' if mode == 'append' else 'replace'

        df.to_sql('checkins', conn, if_exists=if_exists, index=False)
        conn.close()

        return jsonify({
            'success': True,
            'message': f'Imported {len(df)} check-ins',
            'rows_imported': len(df),
            'mode': mode
        })

    except Exception as e:
        return jsonify({'error': f'Import failed: {str(e)}'}), 500


@app.route('/api/export/overview', methods=['GET'])
def export_overview():
    """Export overview data to Excel"""
    try:
        conn = sqlite3.connect(DB_PATH)
        members_df = pd.read_sql_query("SELECT * FROM members", conn)
        checkins_df = pd.read_sql_query("SELECT * FROM checkins", conn)

        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            members_df.to_excel(writer, sheet_name='Members', index=False)
            summary = pd.DataFrame({
                'Metric': ['Total Members', 'Active Members', 'Total Check-ins'],
                'Value': [len(members_df), len(members_df[members_df['is_active'] == 1]), len(checkins_df)]
            })
            summary.to_excel(writer, sheet_name='Summary', index=False)

        conn.close()
        output.seek(0)

        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'overview_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        )

    except Exception as e:
        return jsonify({'error': f'Export failed: {str(e)}'}), 500


@app.route('/api/export/at-risk', methods=['GET'])
def export_at_risk():
    """Export at-risk members to Excel"""
    try:
        conn = sqlite3.connect(DB_PATH)

        query = """
        SELECT 
            m.member_id,
            m.membership_type,
            m.location,
            COALESCE(m.join_date, m.signup_date) as join_date,
            COALESCE(m.monthly_fee, 39.99),
            MAX(c.checkin_date) as last_checkin,
            julianday('now') - julianday(MAX(c.checkin_date)) as days_since_checkin,
            COUNT(c.checkin_id) as total_checkins
        FROM members m
        LEFT JOIN checkins c ON m.member_id = c.member_id
        WHERE m.is_active = 1
        GROUP BY m.member_id
        HAVING days_since_checkin > 7 OR days_since_checkin IS NULL
        ORDER BY days_since_checkin DESC
        """

        df = pd.read_sql_query(query, conn)
        df['risk_level'] = df['days_since_checkin'].apply(
            lambda x: 'High' if pd.isna(x) or x > 30 else (
                'Medium' if x > 14 else 'Low')
        )

        conn.close()

        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='At-Risk Members', index=False)
            summary = df.groupby('risk_level').agg({
                'member_id': 'count',
                'monthly_fee': 'sum'
            }).reset_index()
            summary.columns = ['Risk Level', 'Member Count', 'Revenue at Risk']
            summary.to_excel(writer, sheet_name='Summary', index=False)

        output.seek(0)
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'at_risk_members_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        )

    except Exception as e:
        return jsonify({'error': f'Export failed: {str(e)}'}), 500


@app.route('/api/export/churn-analysis', methods=['GET'])
def export_churn_analysis():
    """Export churn analysis to Excel"""
    try:
        conn = sqlite3.connect(DB_PATH)

        query = """
        SELECT m.*, COUNT(c.checkin_id) as total_checkins,
               MAX(c.checkin_date) as last_checkin
        FROM members m
        LEFT JOIN checkins c ON m.member_id = c.member_id
        WHERE m.is_active = 0
        GROUP BY m.member_id
        """

        churned_df = pd.read_sql_query(query, conn)
        churn_by_type = churned_df.groupby(
            'membership_type').size().reset_index(name='churned_count')
        churn_by_location = churned_df.groupby(
            'location').size().reset_index(name='churned_count')

        conn.close()

        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            churned_df.to_excel(
                writer, sheet_name='Churned Members', index=False)
            churn_by_type.to_excel(
                writer, sheet_name='Churn by Type', index=False)
            churn_by_location.to_excel(
                writer, sheet_name='Churn by Location', index=False)

        output.seek(0)
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'churn_analysis_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        )

    except Exception as e:
        return jsonify({'error': f'Export failed: {str(e)}'}), 500


@app.route('/api/export/revenue', methods=['GET'])
def export_revenue():
    """Export revenue data to Excel"""
    try:
        conn = sqlite3.connect(DB_PATH)
        members_df = pd.read_sql_query(
            "SELECT * FROM members WHERE is_active = 1", conn)

        revenue_by_type = members_df.groupby('membership_type')['monthly_fee'].agg([
            'sum', 'mean', 'count']).reset_index()
        revenue_by_type.columns = ['Membership Type',
                                   'Total Revenue', 'Avg Revenue', 'Member Count']

        revenue_by_location = members_df.groupby('location')['monthly_fee'].agg([
            'sum', 'mean', 'count']).reset_index()
        revenue_by_location.columns = [
            'Location', 'Total Revenue', 'Avg Revenue', 'Member Count']

        conn.close()

        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            members_df.to_excel(
                writer, sheet_name='Active Members', index=False)
            revenue_by_type.to_excel(
                writer, sheet_name='Revenue by Type', index=False)
            revenue_by_location.to_excel(
                writer, sheet_name='Revenue by Location', index=False)
            summary = pd.DataFrame({
                'Metric': ['Total MRR', 'Active Members', 'Avg Revenue/Member'],
                'Value': [members_df['monthly_fee'].sum(), len(members_df), members_df['monthly_fee'].mean()]
            })
            summary.to_excel(writer, sheet_name='Summary', index=False)

        output.seek(0)
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'revenue_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        )

    except Exception as e:
        return jsonify({'error': f'Export failed: {str(e)}'}), 500


@app.route('/api/template/members', methods=['GET'])
def download_members_template():
    """Download member import template"""
    template_df = pd.DataFrame({
        'member_id': ['M00001', 'M00002'],
        'membership_type': ['Premium', 'Basic'],
        'location': ['Location A', 'Location B'],
        'join_date': ['2024-01-15', '2024-02-20'],
        'monthly_fee': [49.99, 29.99],
        'has_personal_training': [1, 0],
        'is_active': [1, 1]
    })

    output = BytesIO()
    template_df.to_excel(output, index=False, engine='openpyxl')
    output.seek(0)

    return send_file(
        output,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name='member_import_template.xlsx'
    )


@app.route('/api/template/checkins', methods=['GET'])
def download_checkins_template():
    """Download check-in import template"""
    template_df = pd.DataFrame({
        'checkin_id': ['C00001', 'C00002'],
        'member_id': ['M00001', 'M00002'],
        'checkin_date': ['2024-01-15 08:30:00', '2024-01-15 09:15:00'],
        'location': ['Location A', 'Location B'],
        'checkin_duration_minutes': [60, 45]
    })

    output = BytesIO()
    template_df.to_excel(output, index=False, engine='openpyxl')
    output.seek(0)

    return send_file(
        output,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name='checkin_import_template.xlsx'
    )


if __name__ == '__main__':

    print("\n" + "="*60)
    print("🏋️  Churnlytics API Server")
    print("="*60)
    print("\n📊 Analytics Endpoints (8):")
    print("  GET  /api/health")
    print("  GET  /api/overview")
    print("  GET  /api/churn-analysis")
    print("  GET  /api/at-risk-members")
    print("  GET  /api/engagement")
    print("  GET  /api/revenue")
    print("  GET  /api/sales-funnel")
    print("  GET  /api/location-comparison")
    print("\n📥 Import Endpoints (3):")
    print("  POST /api/import/preview")
    print("  POST /api/import/members")
    print("  POST /api/import/checkins")
    print("\n📤 Export Endpoints (4):")
    print("  GET  /api/export/overview")
    print("  GET  /api/export/at-risk")
    print("  GET  /api/export/churn-analysis")
    print("  GET  /api/export/revenue")
    print("\n📋 Template Downloads (2):")
    print("  GET  /api/template/members")
    print("  GET  /api/template/checkins")
    print("\n🌐 Server: http://localhost:5000")
    print("="*60 + "\n")

    app.run(debug=True, host='0.0.0.0', port=5000)
