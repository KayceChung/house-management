/**
 * PHASE 1.1: ENHANCED DASHBOARD APIS
 * Các hàm mới cần thêm vào Code.gs
 * 
 * Thêm những hàm này vào Code.gs, sau đó thêm cases vào apiRouter()
 */

// ==========================================
// 1. GET DASHBOARD WITH CHARTS (Dashboard KPI + Data)
// ==========================================
function getDashboardWithCharts() {
  try {
    Logger.log('📊 getDashboardWithCharts() called');
    
    // Get basic stats
    var stats = getDashboardStats();
    
    // Get monthly revenue
    var monthlyRevenue = getMonthlyRevenue(12);
    
    // Get room status breakdown
    var roomStatus = getRoomStatusStats();
    
    // Get overdue invoices
    var overdueInvoices = getOverdueInvoices(30);
    
    // Get total tenant debt
    var totalDebt = getTotalDebt();
    
    var result = {
      success: true,
      timestamp: new Date().toISOString(),
      kpis: stats.stats || {},
      monthlyRevenue: monthlyRevenue,
      roomStatus: roomStatus,
      overdueInvoices: overdueInvoices,
      totalDebt: totalDebt,
      message: 'Dashboard data retrieved successfully'
    };
    
    Logger.log('✅ Dashboard data prepared: ' + JSON.stringify(result).substring(0, 200));
    return result;
  } catch (error) {
    Logger.log('❌ Error in getDashboardWithCharts: ' + error.toString());
    return {
      success: false,
      message: 'Error: ' + error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

// ==========================================
// 2. GET MONTHLY REVENUE (Last N months)
// ==========================================
function getMonthlyRevenue(months) {
  try {
    if (!months) months = 12;
    
    var transactionsSheet = SPREADSHEET.getSheetByName(TRANSACTIONS);
    if (!transactionsSheet) {
      return [];
    }
    
    var data = transactionsSheet.getDataRange().getValues();
    var monthlyMap = {};
    
    // Initialize last N months
    for (var i = months - 1; i >= 0; i--) {
      var date = new Date();
      date.setMonth(date.getMonth() - i);
      var monthKey = (date.getMonth() + 1) + '/' + date.getFullYear();
      var monthLabel = formatMonthLabel(date);
      monthlyMap[monthKey] = { month: monthLabel, revenue: 0 };
    }
    
    // Sum revenue from transactions (skip header)
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === '') continue;
      
      // Assuming: [0]=ID, [1]=RoomID, [2]=TenantID, [3]=Amount, [4]=Month, [5]=Year, [6]=Status, [7]=Date, [8]=PaidDate
      var month = data[i][4];
      var year = data[i][5];
      var amount = parseFloat(data[i][3]) || 0;
      var status = data[i][6];
      
      // Only count paid transactions
      if (status === 'Paid' || status === 'Đã Thu') {
        var monthKey = month + '/' + year;
        if (monthlyMap[monthKey]) {
          monthlyMap[monthKey].revenue += amount;
        }
      }
    }
    
    // Convert to array
    var result = [];
    for (var key in monthlyMap) {
      result.push(monthlyMap[key]);
    }
    
    Logger.log('✅ Monthly revenue calculated: ' + result.length + ' months');
    return result;
  } catch (error) {
    Logger.log('❌ Error in getMonthlyRevenue: ' + error.toString());
    return [];
  }
}

// ==========================================
// 3. GET ROOM STATUS STATS
// ==========================================
function getRoomStatusStats() {
  try {
    var roomsSheet = SPREADSHEET.getSheetByName(ROOMS);
    if (!roomsSheet) {
      return { occupied: 0, vacant: 0, maintenance: 0 };
    }
    
    var data = roomsSheet.getDataRange().getValues();
    var stats = { occupied: 0, vacant: 0, maintenance: 0 };
    
    // Count rooms by status (column 4 = status)
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === '') continue;
      
      var status = data[i][4];
      if (status === 'Đã Cho Thuê' || status === 'Occupied') {
        stats.occupied++;
      } else if (status === 'Trống' || status === 'Vacant') {
        stats.vacant++;
      } else if (status === 'Sửa Chữa' || status === 'Maintenance') {
        stats.maintenance++;
      }
    }
    
    Logger.log('✅ Room status: Occupied=' + stats.occupied + ', Vacant=' + stats.vacant);
    return stats;
  } catch (error) {
    Logger.log('❌ Error in getRoomStatusStats: ' + error.toString());
    return { occupied: 0, vacant: 0, maintenance: 0 };
  }
}

// ==========================================
// 4. GET OVERDUE INVOICES
// ==========================================
function getOverdueInvoices(daysThreshold) {
  try {
    if (!daysThreshold) daysThreshold = 30;
    
    var transactionsSheet = SPREADSHEET.getSheetByName(TRANSACTIONS);
    var tenantsSheet = SPREADSHEET.getSheetByName(TENANTS);
    var roomsSheet = SPREADSHEET.getSheetByName(ROOMS);
    
    if (!transactionsSheet || !tenantsSheet || !roomsSheet) {
      return [];
    }
    
    var transData = transactionsSheet.getDataRange().getValues();
    var tenantData = tenantsSheet.getDataRange().getValues();
    var roomData = roomsSheet.getDataRange().getValues();
    
    // Build lookup maps
    var tenantMap = {};
    for (var i = 1; i < tenantData.length; i++) {
      if (tenantData[i][0]) {
        tenantMap[tenantData[i][0]] = tenantData[i][2]; // TenantID -> Name
      }
    }
    
    var roomMap = {};
    for (var i = 1; i < roomData.length; i++) {
      if (roomData[i][0]) {
        roomMap[roomData[i][0]] = roomData[i][2]; // RoomID -> Name
      }
    }
    
    var overdue = [];
    var today = new Date();
    
    // Check transactions
    for (var i = 1; i < transData.length; i++) {
      if (transData[i][0] === '') continue;
      
      var status = transData[i][6];
      if (status === 'Paid' || status === 'Đã Thu') continue; // Skip paid
      
      // Assuming: [7]=Date (due date)
      var dueDate = transData[i][7];
      if (!dueDate) continue;
      
      var dueDateObj = new Date(dueDate);
      var daysOverdue = Math.floor((today - dueDateObj) / (1000 * 60 * 60 * 24));
      
      if (daysOverdue >= daysThreshold) {
        overdue.push({
          transId: transData[i][0],
          roomId: transData[i][1],
          roomName: roomMap[transData[i][1]] || transData[i][1],
          tenantId: transData[i][2],
          tenantName: tenantMap[transData[i][2]] || transData[i][2],
          amount: parseFloat(transData[i][3]) || 0,
          month: transData[i][4],
          year: transData[i][5],
          dueDate: formatDate(dueDateObj),
          daysOverdue: daysOverdue,
          status: status
        });
      }
    }
    
    // Sort by daysOverdue descending, limit to 5
    overdue.sort((a, b) => b.daysOverdue - a.daysOverdue);
    overdue = overdue.slice(0, 5);
    
    Logger.log('✅ Found ' + overdue.length + ' overdue invoices');
    return overdue;
  } catch (error) {
    Logger.log('❌ Error in getOverdueInvoices: ' + error.toString());
    return [];
  }
}

// ==========================================
// 5. GET TOTAL TENANT DEBT
// ==========================================
function getTotalDebt() {
  try {
    var transactionsSheet = SPREADSHEET.getSheetByName(TRANSACTIONS);
    if (!transactionsSheet) {
      return 0;
    }
    
    var data = transactionsSheet.getDataRange().getValues();
    var totalDebt = 0;
    
    // Sum unpaid invoices
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === '') continue;
      
      var status = data[i][6];
      if (status !== 'Paid' && status !== 'Đã Thu') {
        var amount = parseFloat(data[i][3]) || 0;
        totalDebt += amount;
      }
    }
    
    Logger.log('✅ Total debt calculated: ' + totalDebt);
    return totalDebt;
  } catch (error) {
    Logger.log('❌ Error in getTotalDebt: ' + error.toString());
    return 0;
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function formatMonthLabel(date) {
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[date.getMonth()] + ' ' + date.getFullYear();
}

function formatDate(date) {
  if (!(date instanceof Date)) {
    return String(date);
  }
  return Utilities.formatDate(date, 'GMT+7', 'dd/MM/yyyy');
}

// ==========================================
// ADD TO apiRouter() IN doPost():
// ==========================================
/*
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
*/
