# 🏗️ HOUSE MANAGEMENT SYSTEM - TIER 1 DEVELOPMENT PLAN

**Status**: Ready to implement  
**Estimated Time**: 7-10 days (Tier 1)  
**Tech Stack**: Vanilla JS + Apex Charts + Google Sheets + AppScript  
**Start Date**: 01/05/2026

---

## 📊 CURRENT DATABASE STRUCTURE

### ✅ Existing Tables (Google Sheets)
```
1. Managers          - ID, Tên, Email, Phone
2. Properties       - ID, Manager_ID, Tên, Địa chỉ, Tổng phòng
3. Rooms            - ID, Property_ID, Tên, Tầng, Status, Giá, Mô tả
4. Tenants          - ID, Property_ID, Tên, Phone, CCCD, Email, Room_ID, Ngày vào
5. Contracts        - ID, Tenant_ID, Room_ID, Ngày vào, Ngày ra dự kiến, Status
6. Invoices/Transactions - ID, Room_ID, Tenant_ID, Tiền, Tháng/Năm, Status
7. UtilityUsage     - ID, Room_ID, Tháng/Năm, Chỉ số điện, Chỉ số nước
8. Assets           - (Hiện tại chưa dùng, có thể mở rộng)
9. PaymentReminders - Cảnh báo thanh toán
```

### 🔄 Relationships
```
Manager 1 ──────> Many Properties
Property 1 ──────> Many Rooms
Room 1 ──────> Many Tenants (1 tenant/time)
Room 1 ──────> Many Invoices
Room 1 ──────> Many UtilityUsage
Tenant 1 ──────> Many Contracts
Tenant 1 ──────> Many Invoices
```

---

## 📋 TIER 1 IMPLEMENTATION ROADMAP

### PHASE 1.1: Enhanced Dashboard (Days 1-2)
**Deliverables**:
- ✅ Dynamic KPI cards (from Sheets data)
- ✅ Revenue Chart (12 months)
- ✅ Room Status Chart (Pie chart)
- ✅ Overdue Invoices Widget
- ✅ Total Debt Widget

**Files to Create/Modify**:
```
Frontend:
├── api.js                          (add new API calls)
├── components/
│   ├── DashboardCharts.js          (NEW - Chart components)
│   ├── OverdueInvoices.js          (NEW - Widget)
│   └── DebtSummary.js              (NEW - Widget)
└── index.html                       (update dashboard section)

Backend:
└── Code.gs                          (add new endpoints)
    ├── getDashboardWithCharts()    (NEW)
    ├── getMonthlyRevenue()         (NEW)
    ├── getRoomStatusStats()        (NEW)
    └── getOverdueInvoices()        (NEW)
```

---

### PHASE 1.2: Room Detail Page (Days 2-4)
**URL**: `/rooms/:roomId`  
**Deliverables**:
- ✅ Room info card
- ✅ Current tenant section
- ✅ Invoice table with filters
- ✅ Utility history chart (line chart)
- ✅ Action buttons (update status, manage tenant, create invoice)

**Files to Create**:
```
Frontend:
├── pages/RoomDetail.js             (NEW - Main page)
├── components/RoomInfo.js          (NEW)
├── components/CurrentTenant.js     (NEW)
├── components/RoomInvoices.js      (NEW)
├── components/UtilityHistory.js    (NEW)
├── pages/room-detail.html          (NEW - If using vanilla JS)
└── router.js                       (NEW - Simple router)

Backend:
└── Code.gs
    ├── getRoomDetail(roomId)       (NEW)
    ├── getRoomInvoices(roomId)     (NEW)
    ├── getUtilityHistory(roomId)   (NEW)
    └── updateRoomStatus()          (NEW)
```

---

### PHASE 1.3: Customer Detail Page (Days 4-5)
**URL**: `/customers/:customerId`  
**Deliverables**:
- ✅ Customer info card
- ✅ Current contract section
- ✅ Financial overview (total debt, warning if overdue)
- ✅ Payment history chart
- ✅ Invoice list with filters
- ✅ Action buttons (create invoice, record payment)

**Files to Create**:
```
Frontend:
├── pages/CustomerDetail.js         (NEW - Main page)
├── components/CustomerInfo.js      (NEW)
├── components/ContractInfo.js      (NEW)
├── components/FinancialOverview.js (NEW)
├── components/PaymentHistory.js    (NEW)
├── components/CustomerInvoices.js  (NEW)
├── pages/customer-detail.html      (NEW)
└── router.js                       (update with customer routes)

Backend:
└── Code.gs
    ├── getCustomerDetail(id)       (NEW)
    ├── getCustomerInvoices(id)     (NEW)
    ├── getCustomerDebt(id)         (NEW)
    ├── getPaymentHistory(id)       (NEW)
    └── recordPayment()             (NEW - refactor existing)
```

---

### PHASE 1.4: Navigation & Routing (Days 5-6)
**Deliverables**:
- ✅ Simple router (vanilla JS or framework)
- ✅ Breadcrumb navigation
- ✅ Link room/customer names to detail pages
- ✅ Back button navigation

**Files to Create/Modify**:
```
Frontend:
├── router.js                       (NEW - routing system)
├── utils/navigation.js             (NEW - helper functions)
├── api.js                          (update links generation)
└── index.html                      (add router script)
```

---

## 🔌 NEW API ENDPOINTS (AppScript)

### Dashboard APIs
```javascript
// Get enhanced dashboard stats
GET /api/dashboard/stats
Response: {
  success: true,
  kpis: {
    totalRooms: 10,
    occupiedRooms: 7,
    unpaidCount: 3,
    monthlyRevenue: 35000000
  },
  monthlyRevenue: [         // Last 12 months
    { month: 'May 2025', revenue: 30000000 },
    ...
  ],
  roomStatus: {
    occupied: 7,
    vacant: 3,
    maintenance: 0
  },
  overdueInvoices: [
    { transId, roomId, tenantName, amount, daysOverdue },
    ...
  ],
  totalDebt: 5000000
}

// Monthly revenue for chart
GET /api/dashboard/revenue?months=12
Response: [
  { month: 'Jun 2025', revenue: 32000000 },
  ...
]

// Room status stats
GET /api/dashboard/room-status
Response: {
  occupied: 7,
  vacant: 3,
  maintenance: 0
}

// Overdue invoices list
GET /api/dashboard/overdue-invoices?daysOverdue=30
Response: [
  { transId, roomId, tenantName, amount, daysOverdue },
  ...
]
```

### Room Detail APIs
```javascript
// Get single room details
GET /api/rooms/:roomId/detail
Response: {
  success: true,
  room: {
    roomId, propertyId, roomName, floor, status, price, description,
    currentTenant: { tenantId, fullName, phone, idCard, joinDate }
  }
}

// Get room invoices with filters
GET /api/rooms/:roomId/invoices?month=5&year=2025
Response: [
  { transId, amount, month, year, status, dueDate, paidDate },
  ...
]

// Get utility history
GET /api/rooms/:roomId/utilities?months=12
Response: [
  { month: 'Jun 2025', elec: 100, water: 20, cost: 500000 },
  ...
]

// Update room status
POST /api/rooms/:roomId/status
Body: { status: 'Occupied|Vacant|Maintenance' }
```

### Customer Detail APIs
```javascript
// Get customer details
GET /api/customers/:customerId/detail
Response: {
  success: true,
  customer: {
    tenantId, fullName, phone, idCard, email,
    currentContract: { roomId, roomName, joinDate, expectedEndDate, status }
  }
}

// Get customer debt info
GET /api/customers/:customerId/debt
Response: {
  totalDebt: 5000000,
  isOverdue: true,
  daysOverdue: 45,
  invoices: [
    { transId, amount, dueDate, paidDate, status },
    ...
  ]
}

// Get customer payment history
GET /api/customers/:customerId/payment-history?months=12
Response: [
  { month: 'Jun 2025', invoices: 4000000, paid: 4000000 },
  ...
]

// Get customer invoices
GET /api/customers/:customerId/invoices?status=all|paid|unpaid
Response: [
  { transId, amount, month, year, status, dueDate, paidDate },
  ...
]

// Record payment
POST /api/customers/:customerId/invoices/:transId/pay
Body: { amount, paidDate }
Response: { success: true, transId, newBalance }
```

---

## 🎨 UI COMPONENT STRUCTURE

### React/Component Architecture (If migrating)
```
components/
├── Layout/
│   ├── Header.js                   (navbar + logo)
│   ├── Sidebar.js                  (navigation)
│   └── PageContainer.js            (wrapper)
│
├── Dashboard/
│   ├── KPICard.js                  (4 stat cards)
│   ├── RevenueChart.js             (line chart - Apex)
│   ├── RoomStatusChart.js          (pie chart - Apex)
│   ├── OverdueInvoices.js          (table widget)
│   └── DebtSummary.js              (info card)
│
├── RoomDetail/
│   ├── RoomInfo.js                 (header section)
│   ├── CurrentTenant.js            (tenant card)
│   ├── RoomInvoices.js             (table)
│   ├── UtilityHistory.js           (chart)
│   └── ActionButtons.js            (CTA buttons)
│
├── CustomerDetail/
│   ├── CustomerInfo.js             (header)
│   ├── ContractInfo.js             (contract card)
│   ├── FinancialOverview.js        (debt + warning)
│   ├── PaymentHistoryChart.js      (chart)
│   ├── CustomerInvoices.js         (table)
│   └── ActionButtons.js            (CTA buttons)
│
├── Common/
│   ├── StatusBadge.js              (colored status)
│   ├── Table.js                    (filterable table)
│   ├── Modal.js                    (modals)
│   ├── Loading.js                  (spinner)
│   └── ErrorBoundary.js            (error handling)
│
└── Charts/
    ├── LineChart.js                (wrapper for Apex)
    ├── PieChart.js                 (wrapper for Apex)
    ├── ColumnChart.js              (wrapper for Apex)
    └── ChartTooltip.js             (custom tooltip)
```

### Vanilla JS Structure (Current Approach)
```
js/
├── api.js                          (API calls)
├── pages/
│   ├── dashboard.js
│   ├── room-detail.js
│   ├── customer-detail.js
│   └── rooms.js (existing)
├── components/
│   ├── charts.js                   (Apex Chart wrappers)
│   ├── tables.js                   (table rendering)
│   └── widgets.js                  (card components)
├── router.js                       (SPA routing)
├── utils.js                        (helpers)
└── config.js                       (settings)
```

---

## 📦 DEPENDENCIES TO ADD

### Frontend
```json
{
  "dependencies": {
    "apexcharts": "^3.45.0"        // Chart library
  }
}
```

### Include in HTML
```html
<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
```

---

## 🎯 IMPLEMENTATION CHECKLIST - PHASE 1.1 (Dashboard)

### Backend Tasks
- [ ] Create `getDashboardWithCharts()` function
- [ ] Create `getMonthlyRevenue()` - returns last 12 months
- [ ] Create `getRoomStatusStats()` - occupied/vacant/maintenance counts
- [ ] Create `getOverdueInvoices()` - filters by days overdue
- [ ] Create `getTotalDebt()` - sum of all unpaid invoices
- [ ] Add to apiRouter() and expose via POST
- [ ] Test all endpoints with Google Apps Script editor

### Frontend Tasks
- [ ] Install/include Apex Charts library
- [ ] Create `components/DashboardCharts.js` with chart configs
- [ ] Create `loadEnhancedDashboard()` function
- [ ] Create chart for "Monthly Revenue (12 months)" - Line Chart
- [ ] Create chart for "Room Status" - Pie/Donut Chart
- [ ] Create widget for "Top 5 Overdue Invoices"
- [ ] Create card for "Total Tenant Debt"
- [ ] Update `index.html` dashboard section layout
- [ ] Style components with Bootstrap 5 classes
- [ ] Add loading states while charts render
- [ ] Add responsive design for mobile
- [ ] Test all charts with real data

### Testing
- [ ] Verify API returns correct data structure
- [ ] Charts render without errors
- [ ] Charts update when data changes
- [ ] Responsive on mobile/tablet
- [ ] Performance: Page load < 2s
- [ ] Error handling if API fails

---

## 📐 APEX CHARTS EXAMPLES

### Monthly Revenue Chart
```javascript
const options = {
  chart: { type: 'line', height: 350 },
  series: [{
    name: 'Doanh thu',
    data: monthlyData.map(m => m.revenue)
  }],
  xaxis: { categories: monthlyData.map(m => m.month) },
  yaxis: { labels: { formatter: v => formatCurrency(v) } },
  stroke: { curve: 'smooth' },
  dataLabels: { enabled: false }
};
```

### Room Status Chart
```javascript
const options = {
  chart: { type: 'donut', height: 350 },
  series: [roomStatus.occupied, roomStatus.vacant, roomStatus.maintenance],
  labels: ['Đã cho thuê', 'Trống', 'Sửa chữa'],
  colors: ['#27ae60', '#95a5a6', '#f39c12']
};
```

---

## 🔗 ROUTING PLAN (For Detail Pages)

### URL Structure
```
/                      → Dashboard
/rooms                 → Room List
/rooms/:roomId         → Room Detail
/customers             → Customer List
/customers/:customerId → Customer Detail
/bills                 → Invoice List
/utilities             → Utility Usage
```

### Simple Vanilla JS Router
```javascript
const routes = {
  '/': loadDashboard,
  '/rooms/:roomId': loadRoomDetail,
  '/customers/:customerId': loadCustomerDetail
};

function router(path) {
  const route = matchRoute(path);
  if (route) route.handler(...route.params);
}
```

---

## 📝 NEXT STEPS

### Immediate (Today)
1. ✅ Create Architecture Document (this file)
2. [ ] Create Backend API endpoints (Phase 1.1)
3. [ ] Add Apex Charts library

### Day 1-2
4. [ ] Implement Dashboard Charts
5. [ ] Test with real data

### Day 3-4
6. [ ] Create Room Detail page structure
7. [ ] Implement Room Detail APIs

### Day 5-6
8. [ ] Create Customer Detail page
9. [ ] Implement Customer Detail APIs

### Day 7+
10. [ ] Implement routing & navigation
11. [ ] Full integration testing
12. [ ] Performance optimization
13. [ ] Deploy to Vercel

---

## ⚠️ IMPORTANT NOTES

### Data Formatting
- **Currency**: Format as VND (e.g., "5.000.000 đ")
- **Dates**: Format as dd/MM/yyyy
- **Charts**: Labels in Vietnamese
- **Status Badges**: Use color codes (green/yellow/red)

### Performance Considerations
1. **Cache Dashboard** - Update every 5-10 minutes
2. **Lazy Load Charts** - Load only when visible
3. **Pagination** - 50 items per page in tables
4. **API Optimization** - Only fetch needed fields

### Error Handling
- Try/catch for all API calls
- Show user-friendly error messages
- Log errors to console for debugging
- Fallback UI if data unavailable

### Browser Compatibility
- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile browsers

---

## 📊 ESTIMATED METRICS

| Component | Time | Complexity |
|-----------|------|-----------|
| Enhanced Dashboard | 2 days | Medium |
| Room Detail Page | 2 days | Medium |
| Customer Detail Page | 1.5 days | Medium |
| Routing & Navigation | 1 day | Low |
| Testing & Deployment | 2 days | Low |
| **TOTAL TIER 1** | **8.5 days** | **Medium** |

---

## 🎬 READY TO START?

**Next Action**: 👉 Begin Phase 1.1 - Enhanced Dashboard
- Start with AppScript backend API endpoints
- Then implement frontend charts
- Then connect to UI

Let me know when you're ready to start coding! 🚀
