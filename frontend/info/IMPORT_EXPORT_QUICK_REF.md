# ⚡ Import/Export Quick Reference

## 🎯 3-Step Import Process

### 1️⃣ DOWNLOAD TEMPLATE
```
Navigate to: Import/Export page
Click: "📥 Download Template"
Choose: Members or Check-ins
```

### 2️⃣ FILL WITH YOUR DATA
```
Open template in Excel
Add your real data
Save as CSV or XLSX
```

### 3️⃣ UPLOAD & IMPORT
```
Click upload area
Select your file
Choose mode: Append or Replace
Click: "✓ Import Data"
```

---

## 📤 One-Click Exports

| Report | What It Contains | Use For |
|--------|------------------|---------|
| **📊 Overview** | All metrics & members | Executive summary |
| **⚠️ At-Risk** | Members needing attention | Outreach campaigns |
| **📉 Churn** | Cancellation patterns | Retention strategy |
| **💰 Revenue** | Financial performance | Financial reports |

---

## 🎯 Quick Commands

### Import Members:
```
1. Select "Members" type
2. Choose "Append" mode
3. Upload file
4. Import
```

### Import Check-ins:
```
1. Select "Check-ins" type  
2. Choose "Append" mode
3. Upload file
4. Import
```

### Export Any Report:
```
1. Scroll to Export section
2. Click report card
3. File auto-downloads
```

---

## ⚠️ Remember

- ✅ Use templates for correct format
- ✅ Preview before importing
- ✅ Append = safe, Replace = deletes all
- ✅ Export anytime, no limits
- ✅ Files download as Excel (.xlsx)

---

## 🔑 Required Columns

**Members:**
- member_id
- membership_type
- location  
- join_date

**Check-ins:**
- checkin_id
- member_id
- checkin_date
- location

---

## 💡 Common Tasks

### Task: Import new members
```
Template → Fill data → Upload → Append → Import
```

### Task: Export at-risk list
```
Navigate to Import/Export → Click "At-Risk Members" → Done
```

### Task: Replace all data
```
Download template → Fill → Upload → Replace → Import
⚠️ This deletes existing data!
```

---

## 📱 Where to Find It

**In Dashboard:**
```
Sidebar → "Import/Export" (Database icon)
```

**Direct URL:**
```
http://localhost:3000/data
```

---

**Need details? Read IMPORT_EXPORT_GUIDE.md**