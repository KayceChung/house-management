# 🚀 PHASE 1.1 IMPLEMENTATION GUIDE - STEP BY STEP

**Objective**: Implement Enhanced Dashboard with Charts & Widgets  
**Estimated Time**: 2 hours  
**Complexity**: Medium  
**Status**: 🟢 Ready to implement

---

## 📋 FILES CREATED (Reference Files)

All files needed for Phase 1.1 implementation are already created:

1. ✅ **[TIER1_DEVELOPMENT_PLAN.md](TIER1_DEVELOPMENT_PLAN.md)** - Full architecture & roadmap
2. ✅ **[PHASE_1_1_BACKEND_API.gs](PHASE_1_1_BACKEND_API.gs)** - Backend API functions (copy to Code.gs)
3. ✅ **[PHASE_1_1_FRONTEND_CHARTS.js](PHASE_1_1_FRONTEND_CHARTS.js)** - Frontend chart functions (merge into api.js)
4. ✅ **[PHASE_1_1_HTML_TEMPLATE.html](PHASE_1_1_HTML_TEMPLATE.html)** - Updated HTML structure (merge into index.html)

---

## 🔧 IMPLEMENTATION STEPS

### STEP 1: Update Google Apps Script (Backend) - 15 minutes

#### 1.1 Open Code.gs & Add New Functions
- [ ] Open `Code.gs` in Google Apps Script Editor
- [ ] Scroll to the end of the file (after `seedDummyData()` function)
- [ ] Copy all functions from **PHASE_1_1_BACKEND_API.gs** and paste them at the end
- [ ] Functions to add:
  - `getDashboardWithCharts()`
  - `getMonthlyRevenue(months)`
  - `getRoomStatusStats()`
  - `getOverdueInvoices(daysThreshold)`
  - `getTotalDebt()`
  - Helper functions: `formatMonthLabel()`, `formatDate()`

#### 1.2 Update apiRouter() in doPost()
- [ ] Find `function apiRouter(action, params)` in Code.gs (around line 1935)
- [ ] Add these 5 cases inside the switch statement (before the default case):

```javascript
    case 'getDashboardWithCharts':
      return getDashboardWithCharts();
    
    case 'getMonthlyRevenue':
      return { success: true, data: getMonthlyRevenue(params.months || 12) };
    
    case 'getRoomStatusStats':
      return { success: true, data: getRoomStatusStats() };
    
    case 'getOverdueInvoices':
      return { success: true, data: getOverdueInvoices(params.daysThreshold || 30) };
    
    case 'getTotalDebt':
      return { success: true, data: getTotalDebt() };
```

#### 1.3 Save & Deploy
- [ ] Press **Ctrl+S** to save Code.gs
- [ ] Click **Deploy** button (top right)
- [ ] Select **Manage Deployments**
- [ ] Click **Edit** (pencil icon) on existing deployment
- [ ] Change **Version** dropdown to **"New version"**
- [ ] Click **Deploy** to save

✅ **Backend Complete!** New API endpoints are now live.

---

### STEP 2: Update HTML (index.html) - 15 minutes

#### 2.1 Find & Replace Dashboard Section
- [ ] Open `index.html` in VS Code
- [ ] Find the dashboard section: Search for `<div id="dashboard"` (around line 330)
- [ ] Find the closing tag: `</div>` that closes this dashboard div
- [ ] **Select & Delete** entire old dashboard section (from `<div id="dashboard"` to its closing `</div>`)
- [ ] Paste new dashboard HTML from **PHASE_1_1_HTML_TEMPLATE.html** (copy everything in the HTML comment block)

#### 2.2 Add ApexCharts Library
- [ ] Find the `<head>` section of index.html
- [ ] Add this line BEFORE the closing `</head>` tag:

```html
<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
```

#### 2.3 Add CSS Styles
- [ ] Find the `<style>` section in `<head>`
- [ ] Copy the CSS from **PHASE_1_1_HTML_TEMPLATE.html** (the `<style>` comment block)
- [ ] Paste it inside the existing `<style>` tag (at the end)

#### 2.4 Add Auto-refresh Script
- [ ] Find the very end of index.html (before closing `</body>` tag)
- [ ] Copy the `<script>` code from **PHASE_1_1_HTML_TEMPLATE.html**
- [ ] Paste it before `</body>` tag

✅ **HTML Complete!** Dashboard UI is ready.

---

### STEP 3: Update Frontend JS (api.js) - 15 minutes

#### 3.1 Add Enhanced Dashboard Functions
- [ ] Open `api.js` in VS Code
- [ ] Find the `// ========== DASHBOARD ==========` section (around line 110)
- [ ] Copy all functions from **PHASE_1_1_FRONTEND_CHARTS.js**
- [ ] Paste them in api.js, **REPLACING** the old `loadDashboard()` and `async function loadDashboard() {...}` function

#### 3.2 Replace loadDashboard() Function
- [ ] Find the old `async function loadDashboard()` (around line 114)
- [ ] **Delete it completely**
- [ ] From PHASE_1_1_FRONTEND_CHARTS.js, copy the new `async function loadDashboard()`:

```javascript
async function loadDashboard() {
    loadEnhancedDashboard();
}
```

✅ **Frontend Complete!** Charts functions are ready.

---

### STEP 4: Test Everything - 15 minutes

#### 4.1 Verify Backend Functions
- [ ] Go back to Google Apps Script Editor
- [ ] Open **Execution Log** (View > Logs)
- [ ] Run this test in the editor:
  ```javascript
  function testDashboardAPIs() {
    Logger.log('Testing getDashboardWithCharts...');
    Logger.log(getDashboardWithCharts());
  }
  ```
- [ ] Click **Run** button
- [ ] Check Logs for ✅ success message
- [ ] Expected: Should show all data without errors

#### 4.2 Test Frontend on Browser
- [ ] Open the live app in browser: https://house-management-henna.vercel.app/
- [ ] Open **Developer Console**: Press **F12**
- [ ] Go to **Console** tab
- [ ] Should see:
  ```
  ✅ ApexCharts loaded
  📊 Loading Enhanced Dashboard...
  ✅ Enhanced Dashboard loaded successfully
  ```

#### 4.3 Verify Dashboard Display
- [ ] Click on **Dashboard** tab (if not already selected)
- [ ] Check 4 KPI cards:
  - [ ] "Tổng Phòng" shows a number
  - [ ] "Phòng Đã Cho Thuê" shows a number
  - [ ] "Hóa Đơn Chưa Thu" shows a number
  - [ ] "Doanh Thu Tháng" shows formatted currency

#### 4.4 Verify Charts Render
- [ ] Check **Line Chart**: Should show 12 months of data
  - [ ] X-axis shows month names (Jun 2025, Jul 2025, etc.)
  - [ ] Y-axis shows formatted currency (1M đ, 2M đ, etc.)
  - [ ] Chart has smooth curve and data points

- [ ] Check **Pie Chart**: Should show room status
  - [ ] Shows 3 slices: Occupied (green), Vacant (gray), Maintenance (yellow)
  - [ ] Percentages shown in each slice
  - [ ] Legend at bottom

#### 4.5 Verify Widgets
- [ ] Check **Overdue Invoices Widget**:
  - [ ] Shows max 5 rows (if data exists)
  - [ ] Columns: Phòng, Khách, Số Tiền, Quá Hạn
  - [ ] "Quá Hạn" shows colored badge (red/yellow/orange)

- [ ] Check **Debt Summary Widget**:
  - [ ] Shows total debt amount
  - [ ] Shows status message below
  - [ ] Color changes based on debt amount (red if high, yellow if medium)

#### 4.6 Check Performance
- [ ] Refresh page: **F5**
- [ ] Check page load time (Network tab > XHR)
  - [ ] Dashboard data API should load < 1 second
  - [ ] Charts should render < 2 seconds total
  
- [ ] No console errors (red ❌ in console)
- [ ] Charts responsive on mobile (resize browser window)

✅ **Testing Complete!** Everything working as expected.

---

## 🐛 TROUBLESHOOTING

### Issue: Charts not showing (blank white space)
**Solution**:
```javascript
// In browser console, run:
console.log(ApexCharts); // Should print ApexCharts object
console.log(window.revenueChart); // Should print chart instance
```
- If ApexCharts is undefined: CDN failed to load
  - Add script tag again in HTML `<head>`
  - Check internet connection
  - Use different CDN: `https://unpkg.com/apexcharts`

### Issue: "Cannot read property 'getDashboardWithCharts'"
**Solution**:
- Backend API wasn't deployed with new version
- Steps:
  1. Go to Google Apps Script Editor
  2. Click **Deploy**
  3. Select **Manage Deployments**
  4. Click **Edit** (pencil icon)
  5. Change Version to **"New version"**
  6. Click **Deploy**

### Issue: API returns empty data or errors
**Solution**:
1. Check Google Sheets:
   - Verify sheets exist: Rooms, Tenants, Transactions, etc.
   - Verify data is populated (not empty)
   - Check header row is correct

2. Check AppScript Logs:
   - Google Apps Script Editor > View > Logs
   - Look for ❌ error messages
   - Check column indices match actual sheet structure

3. Test API directly:
   ```javascript
   // In AppScript editor console
   Logger.log(getDashboardWithCharts());
   ```

### Issue: Charts show but data is wrong
**Solution**:
1. Verify data in Google Sheets
2. Check column indices in functions:
   - Rooms sheet: Column 4 = status
   - Transactions sheet: Column 3 = amount, Column 6 = status
3. Test with sample data: Edit `seedDummyData()` function

### Issue: Mobile layout is broken
**Solution**:
- Add to CSS (in `<style>` tag):
```css
@media (max-width: 768px) {
    .row > [class*='col-'] {
        flex: 0 0 100% !important;
        max-width: 100% !important;
    }
    #revenueChart, #roomStatusChart {
        height: 250px !important;
    }
}
```

---

## ✅ FINAL CHECKLIST

Before marking Phase 1.1 complete:

### Backend
- [ ] 5 new functions added to Code.gs
- [ ] apiRouter() updated with 5 new cases
- [ ] Deployed with **New Version**
- [ ] Logs show no errors when functions run
- [ ] API endpoint returns valid JSON

### Frontend
- [ ] ApexCharts library loaded (check console)
- [ ] All 9 functions added to api.js
- [ ] loadDashboard() calls loadEnhancedDashboard()
- [ ] Console shows no errors

### HTML
- [ ] Old dashboard section replaced
- [ ] All div IDs exist: tenantsTable, revenueChart, roomStatusChart, etc.
- [ ] CSS styles added
- [ ] Script tags for ApexCharts and auto-refresh added

### Testing
- [ ] All 4 KPI cards show data
- [ ] Revenue line chart shows 12 months
- [ ] Room status pie chart shows percentages
- [ ] Overdue invoices widget shows data (if exists)
- [ ] Debt summary widget shows total
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Page loads < 2 seconds

---

## 🎉 WHAT'S NEXT?

Once Phase 1.1 is complete:
1. ✅ Phase 1.1: Enhanced Dashboard (DONE)
2. 📌 Phase 1.2: Room Detail Page
3. 📌 Phase 1.3: Customer Detail Page
4. 📌 Phase 1.4: Navigation & Routing

See [TIER1_DEVELOPMENT_PLAN.md](TIER1_DEVELOPMENT_PLAN.md) for Phase 1.2+ details.

---

## 📞 QUICK REFERENCE

### API Endpoints Added
```javascript
GET /api/dashboard/getDashboardWithCharts
  Returns: { kpis, monthlyRevenue, roomStatus, overdueInvoices, totalDebt }

GET /api/getMonthlyRevenue?months=12
  Returns: [{ month, revenue }, ...]

GET /api/getRoomStatusStats
  Returns: { occupied, vacant, maintenance }

GET /api/getOverdueInvoices?daysThreshold=30
  Returns: [{ transId, roomId, tenantName, amount, daysOverdue }, ...]

GET /api/getTotalDebt
  Returns: { success, data: totalAmount }
```

### Key Functions
- `loadEnhancedDashboard()` - Main loader
- `renderMonthlyRevenueChart()` - Line chart
- `renderRoomStatusChart()` - Pie chart
- `renderOverdueInvoicesWidget()` - Table widget
- `renderDebtSummaryWidget()` - Summary card
- `formatVND(value)` - Currency formatting

---

## 📊 PROGRESS TRACKING

```
[████████████████████░░░░░░░░░░░░░░░░░░░░] 47%

Phase 1.1: Enhanced Dashboard
✅ Architecture & Planning
✅ Backend API Design
✅ Frontend Components
✅ HTML Template
🔄 IMPLEMENTATION (Current)
📌 Testing
📌 Deployment

Phase 1.2: Room Detail Page
📌 Pending
```

---

**Ready to implement Phase 1.1?** Start with STEP 1! 🚀
