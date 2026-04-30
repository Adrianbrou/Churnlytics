# Churnlytics

A full-stack retention analytics platform for gyms. It ingests member, check-in, sales, and lead data from two Anytime Fitness locations and turns it into a 7-page dashboard that surfaces who is about to cancel, why retention drops, and where revenue is leaking.

> **Show, don't tell:** add a screenshot or GIF of the Overview page here, plus a live demo URL once deployed. Suggested asset: `docs/assets/overview.png` rendered at full width.

```
[ screenshot placeholder: dashboard overview ]
```

**Live demo:** _coming soon_
**Stack:** React 18 + Vite 7 / Flask 3 / SQLite / scikit-learn / Recharts

## Motivation

Roughly half of new gym members cancel within their first six months, and most gym operators only find out once the credit card stops charging. I wanted a tool that flips that around: pull the operational data a gym already has (signups, swipes at the door, PT sales, lead forms), and answer the questions an owner actually asks on a Monday morning.

Which members haven't shown up in two weeks? Which membership tier churns hardest? Is location B underperforming because of staffing, pricing, or PT attachment? I built Churnlytics to answer those questions in one click instead of a stack of spreadsheets, and to demonstrate the full path from raw CSVs to a polished, opinionated analytics product.

## Stack

**Frontend**
- React 18.3 with Vite 7 (Rolldown)
- React Router v6 for the 8-page dashboard shell
- Recharts for charts, Framer Motion for transitions, Lucide for icons
- Axios for API calls

**Backend**
- Python 3.x + Flask 3.0 + Flask-CORS
- Pandas 2.1 and NumPy 1.26 for ETL and aggregation
- scikit-learn 1.3 (RandomForest) for churn risk scoring
- SQLite as the analytics store (SQLAlchemy compatible, swap to Postgres for production)
- openpyxl / xlrd for Excel import/export

## 🚀 Quick Start

**Prerequisites:** Node 18+, Python 3.8+, Git.

```bash
# 1. clone
git clone https://github.com/Adrianbrou/Churnlytics.git
cd Churnlytics

# 2. backend
cd backend
python -m venv venv
source venv/Scripts/activate   # Windows bash; use venv/bin/activate on macOS/Linux
pip install -r requirements.txt
python app.py                   # runs on http://localhost:5000

# 3. frontend (new terminal)
cd frontend
npm install
npm run dev                     # runs on http://localhost:5173
```

Open `http://localhost:5173` and the dashboard will hit the Flask API on port 5000.

The repo ships with seeded CSVs in `data/` (1,500 members, 210k+ check-ins, 1,800 sales, 2,700 leads). The Flask app loads them into `data/gym_analytics.db` on first boot.

## 📖 Usage

### Dashboard pages

| Page | What it shows |
|------|---------------|
| **Overview** | Active members, MRR, churn rate, monthly signups, location split |
| **Churn Analysis** | Churn by tier, tenure, location, and PT attachment |
| **At-Risk Members** | High / medium / low risk list with days since last visit and intervention prompts |
| **Engagement** | Peak hours, weekly patterns, visit-frequency distribution |
| **Revenue** | MRR trend, LTV by tier, membership vs PT split, 6-month forecast |
| **Sales Funnel** | Lead to tour to signup conversion, source performance |
| **Location Comparison** | A/B view across every metric with radar chart |
| **Data Management** | CSV / Excel import for members and check-ins, plus exports and templates |

### API reference

All endpoints return JSON. Base URL: `http://localhost:5000`.

**Analytics**
- `GET /api/health` - service health check
- `GET /api/overview` - executive KPIs
- `GET /api/churn-analysis` - churn breakdowns
- `GET /api/at-risk-members` - prioritized intervention list
- `GET /api/engagement` - usage patterns
- `GET /api/revenue` - financial metrics and forecast
- `GET /api/sales-funnel` - conversion analytics
- `GET /api/location-comparison` - side-by-side location metrics

**Import / export**
- `POST /api/import/preview` - preview a CSV/XLSX before committing
- `POST /api/import/members` - bulk import members
- `POST /api/import/checkins` - bulk import check-ins
- `GET /api/export/overview` - export overview as XLSX
- `GET /api/export/at-risk` - export at-risk list
- `GET /api/export/churn-analysis` - export churn data
- `GET /api/export/revenue` - export revenue data
- `GET /api/template/members` - download import template
- `GET /api/template/checkins` - download import template

Example:

```js
fetch('http://localhost:5000/api/at-risk-members')
  .then(r => r.json())
  .then(data => console.table(data.high_risk));
```

### Data model

```
members        member_id PK, location, signup_date, membership_type,
               monthly_fee, age, gender, has_personal_training,
               is_active, cancellation_date

checkins       checkin_id PK, member_id FK, location, checkin_date

sales          sale_id PK, date, location, type, amount,
               member_id FK, staff_member, lead_source

leads          lead_id PK, date, location, lead_source,
               tour_scheduled, tour_completed, converted_to_member
```

### Importing your own data

1. Open the **Data Management** page.
2. Download a template (`/api/template/members` or `/api/template/checkins`).
3. Fill it in, then upload via the preview endpoint to validate columns.
4. Commit the import. Existing rows match on `member_id` / `checkin_id`.

## 🤝 Contributing

Pull requests welcome. To get a dev environment going:

```bash
# fork and clone, then:
cd backend  && pip install -r requirements.txt && python app.py
cd frontend && npm install && npm run dev
```

Project layout:

```
Churnlytics/
├── backend/          # Flask API (app.py)
├── frontend/         # React + Vite SPA
│   └── src/pages/    # one file per dashboard page
├── data/             # seed CSVs + SQLite DB + uploads/exports
└── docs/             # extended docs
```

Conventions:
- Keep API responses flat and chart-ready; do shaping server-side.
- New pages live in `frontend/src/pages/` and register in `App.jsx`.
- New endpoints follow the `/api/<noun>` pattern in `backend/app.py`.

Open an issue first for anything bigger than a bug fix so we can align on scope.

## License

Synthetic data, portfolio project. Use the code freely for learning and reference.
