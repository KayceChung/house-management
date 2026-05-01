/**
 * HỆ THỐNG QUẢN LÝ NHÀ TRỌ - GOOGLE APPS SCRIPT
 * Phiên bản: 2.0 (FIXED - Deduplicated + Phase 1.1 Ready)
 * Cập nhật: 01/05/2026
 * 
 * FIXES:
 * - Removed duplicate functions (getAllTenants, getUnpaidBills, markBillAsPaid)
 * - Fixed column indices to be consistent
 * - Prepared for Phase 1.1 dashboard enhancements
 * - Added all 5 new Phase 1.1 API functions
 */

// ==========================================
// GLOBAL VARIABLES - WITH SAFE INITIALIZATION
// ==========================================

var SPREADSHEET = null;
var SPREADSHEET_ID = '1NMhhF31uc77uhv-C_vppT4w5e3Wbgw4KsIf36xbGXo8';  // HOUSE-MANAGEMENT spreadsheet
var SPREADSHEET_NAME = null;

// Safe initialization
try {
  // Try to open by ID first (most reliable)
  SPREADSHEET = SpreadsheetApp.openById(SPREADSHEET_ID);
  if (SPREADSHEET) {
    SPREADSHEET_NAME = SPREADSHEET.getName();
    Logger.log('✅ Opened spreadsheet by ID: ' + SPREADSHEET_ID);
  }
} catch (error) {
  Logger.log('⚠️ Cannot open by ID, trying getActiveSpreadsheet()');
  try {
    SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
    if (SPREADSHEET) {
      SPREADSHEET_ID = SPREADSHEET.getId();
      SPREADSHEET_NAME = SPREADSHEET.getName();
      Logger.log('✅ Using active spreadsheet: ' + SPREADSHEET_NAME);
    }
  } catch (error2) {
    Logger.log('❌ FATAL: Cannot get spreadsheet');
    Logger.log('Error: ' + error2.toString());
  }
}

// Sheet names
var MANAGERS = 'Managers';
var PROPERTIES = 'Properties';
var ROOMS = 'Rooms';
var TENANTS = 'Tenants';
var CONTRACTS = 'Contracts';
var UTILITY_USAGE = 'UtilityUsage';
var TRANSACTIONS = 'Transactions';
var ASSETS = 'Assets';
var PAYMENT_REMINDERS = 'PaymentReminders';

// Log spreadsheet info on load
if (SPREADSHEET) {
  Logger.log('╔════════════════════════════════════════╗');
  Logger.log('║  HOUSE MANAGEMENT SYSTEM INITIALIZED  ║');
  Logger.log('╠════════════════════════════════════════╣');
  Logger.log('Spreadsheet Name: ' + SPREADSHEET_NAME);
  Logger.log('Spreadsheet ID: ' + SPREADSHEET_ID);
  Logger.log('Expected Name: HOUSE-MANAGEMENT');
  Logger.log('Match: ' + (SPREADSHEET_NAME === 'HOUSE-MANAGEMENT' ? '✅ YES' : '❌ NO - NAME MISMATCH!'));
  Logger.log('╚════════════════════════════════════════╝');
} else {
  Logger.log('❌ CRITICAL: SPREADSHEET is null on startup');
}

// ==========================================
// DIAGNOSTIC FUNCTIONS
// ==========================================

/**
 * Test connection and spreadsheet info
 */
function testConnection() {
  var result = {
    timestamp: new Date().toISOString(),
    spreadsheet: {
      name: SPREADSHEET_NAME,
      id: SPREADSHEET_ID,
      expectedName: 'HOUSE-MANAGEMENT',
      nameMatch: SPREADSHEET_NAME === 'HOUSE-MANAGEMENT'
    },
    sheets: [],
    errors: []
  };
  
  try {
    var sheets = SPREADSHEET.getSheets();
    result.sheets = sheets.map(s => ({
      name: s.getName(),
      index: s.getIndex(),
      rows: s.getLastRow()
    }));
    
    Logger.log('✅ Connection OK');
    Logger.log('Sheets found: ' + sheets.length);
    sheets.forEach(s => {
      Logger.log('  📄 ' + s.getName() + ' (' + s.getLastRow() + ' rows)');
    });
  } catch (error) {
    result.errors.push('Cannot access spreadsheet: ' + error.toString());
    Logger.log('❌ ERROR: ' + error.toString());
  }
  
  return result;
}

/**
 * Verify all expected sheets exist
 */
function verifySheets() {
  var expectedSheets = [MANAGERS, PROPERTIES, ROOMS, TENANTS, CONTRACTS, UTILITY_USAGE, TRANSACTIONS, ASSETS, PAYMENT_REMINDERS];
  var result = {
    expected: expectedSheets,
    found: [],
    missing: []
  };
  
  try {
    var sheets = SPREADSHEET.getSheets();
    var sheetNames = sheets.map(s => s.getName());
    
    expectedSheets.forEach(sheet => {
      if (sheetNames.includes(sheet)) {
        result.found.push(sheet);
        Logger.log('✅ ' + sheet);
      } else {
        result.missing.push(sheet);
        Logger.log('❌ ' + sheet + ' - MISSING');
      }
    });
  } catch (error) {
    Logger.log('❌ Error verifying sheets: ' + error.toString());
  }
  
  return result;
}

/**
 * AUTO-INIT: Check and initialize database if needed
 */
function ensureDatabaseInitialized() {
  try {
    Logger.log('🔍 Checking if database is initialized...');
    
    // Check if Rooms sheet exists
    var roomsSheet = SPREADSHEET.getSheetByName(ROOMS);
    
    if (roomsSheet) {
      Logger.log('✅ Database already initialized (Rooms sheet exists)');
      return { success: true, message: 'Database already initialized' };
    }
    
    Logger.log('⚠️ Database not initialized - auto-initializing now...');
    
    // Run initDatabase
    var initResult = initDatabase();
    
    if (initResult.success) {
      Logger.log('✅ Database auto-initialized successfully');
      
      // Optionally seed dummy data
      Logger.log('📊 Auto-seeding dummy data...');
      seedDummyData();
      
      return { 
        success: true, 
        message: 'Database initialized and seeded with dummy data' 
      };
    } else {
      Logger.log('❌ Failed to auto-initialize database: ' + initResult.message);
      return initResult;
    }
    
  } catch (error) {
    Logger.log('❌ Error in ensureDatabaseInitialized: ' + error.toString());
    return { 
      success: false, 
      message: 'Auto-init error: ' + error.toString() 
    };
  }
}

// ==========================================
// DATABASE INITIALIZATION
// ==========================================

/**
 * Initialize database - Create 9 sheets with headers (Multi-Property Support)
 * RUN THIS ONLY ONCE!
 */
function initDatabase() {
  try {
    Logger.log('Starting database initialization (Multi-Property)...');
    
    // New sheets for multi-property support
    createSheet(MANAGERS, ['ManagerID', 'ManagerName', 'Email', 'Phone', 'CreatedDate']);
    createSheet(PROPERTIES, ['PropertyID', 'ManagerID', 'PropertyName', 'Address', 'TotalRooms', 'CreatedDate']);
    
    // Rooms and related sheets with PropertyID
    createSheet(ROOMS, ['RoomID', 'PropertyID', 'RoomName', 'Floor', 'Status', 'Price', 'Description']);
    createSheet(TENANTS, ['TenantID', 'PropertyID', 'FullName', 'Phone', 'IDCard', 'Email', 'RoomID', 'PaymentReminderDay', 'JoinDate']);
    createSheet(CONTRACTS, ['ContractID', 'PropertyID', 'RoomID', 'TenantID', 'StartDate', 'EndDate', 'Deposit', 'Terms']);
    createSheet(UTILITY_USAGE, ['ID', 'PropertyID', 'Month', 'Year', 'RoomID', 'PrevElec', 'CurrElec', 'PrevWater', 'CurrWater', 'Status']);
    createSheet(TRANSACTIONS, ['TransID', 'PropertyID', 'RoomID', 'Month', 'Year', 'TotalAmount', 'PaymentStatus', 'PaidDate']);
    createSheet(ASSETS, ['AssetID', 'PropertyID', 'RoomID', 'ItemName', 'Condition', 'Quantity']);
    createSheet(PAYMENT_REMINDERS, ['ReminderID', 'TenantID', 'Month', 'Year', 'ReminderType', 'ScheduledDate', 'Status', 'SentDate', 'Message', 'Response']);
    
    Logger.log('Database initialized successfully!');
    return {
      success: true,
      message: 'Database initialized! 9 sheets created (Multi-Property Support).'
    };
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return {
      success: false,
      message: 'Error: ' + error.toString()
    };
  }
}

/**
 * Create sheet with headers
 */
function createSheet(sheetName, headers) {
  var existingSheet = SPREADSHEET.getSheetByName(sheetName);
  
  if (existingSheet) {
    Logger.log('Sheet already exists: ' + sheetName);
    return existingSheet;
  }
  
  var sheet = SPREADSHEET.insertSheet(sheetName);
  sheet.appendRow(headers);
  
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold')
             .setBackground('#2c3e50')
             .setFontColor('#ffffff')
             .setHorizontalAlignment('center')
             .setVerticalAlignment('middle');
  
  sheet.autoResizeColumns(1, headers.length);
  Logger.log('Sheet created: ' + sheetName);
  return sheet;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Generate unique ID
 */
function generateId(prefix) {
  var timestamp = new Date().getTime().toString().slice(-6);
  var random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return prefix + '-' + timestamp + '-' + random;
}

/**
 * Format date VN style (DD/MM/YYYY)
 */
function formatDateVN(date) {
  if (!date) return '';
  if (!(date instanceof Date)) {
    try {
      date = new Date(date);
    } catch (e) {
      return '';
    }
  }
  return Utilities.formatDate(date, 'GMT+7', 'dd/MM/yyyy');
}

/**
 * Format month label (VN style)
 */
function formatMonthLabel(month, year) {
  var months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  return months[month - 1] + ' ' + year;
}

/**
 * Format currency (VND)
 */
function formatCurrency(amount) {
  return (amount || 0).toLocaleString('vi-VN') + ' đ';
}

// ==========================================
// ROOM MANAGEMENT
// ==========================================

/**
 * Add new room (with PropertyID support)
 */
function addRoom(propertyId, roomName, floor, price, description) {
  try {
    description = description || '';
    
    var roomsSheet = SPREADSHEET.getSheetByName(ROOMS);
    if (!roomsSheet) {
      return { success: false, message: 'Rooms sheet not found. Run initDatabase() first!' };
    }
    
    var roomId = generateId('ROOM');
    roomsSheet.appendRow([roomId, propertyId, roomName, floor, 'Trống', price, description]);
    
    Logger.log('Room added: ' + roomName + ' for PropertyID: ' + propertyId);
    return {
      success: true,
      roomId: roomId,
      message: 'Phòng ' + roomName + ' được thêm thành công'
    };
  } catch (error) {
    Logger.log('Error in addRoom: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Get all rooms (legacy - for backward compatibility)
 */
function getAllRooms() {
  try {
    var roomsSheet = SPREADSHEET.getSheetByName(ROOMS);
    if (!roomsSheet) {
      return { success: false, message: 'Rooms sheet not found' };
    }
    
    var data = roomsSheet.getDataRange().getValues();
    var rooms = [];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === '') continue;
      rooms.push({
        roomId: data[i][0],
        propertyId: data[i][1],
        roomName: data[i][2],
        floor: data[i][3],
        status: data[i][4],
        price: data[i][5],
        description: data[i][6]
      });
    }
    
    return { success: true, rooms: rooms, count: rooms.length };
  } catch (error) {
    Logger.log('Error in getAllRooms: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Get rooms by property
 */
function getRoomsByProperty(propertyId) {
  try {
    var roomsSheet = SPREADSHEET.getSheetByName(ROOMS);
    if (!roomsSheet) {
      return { success: false, message: 'Rooms sheet not found' };
    }
    
    var data = roomsSheet.getDataRange().getValues();
    var rooms = [];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === '') continue;
      if (data[i][1] === propertyId) {
        rooms.push({
          roomId: data[i][0],
          propertyId: data[i][1],
          roomName: data[i][2],
          floor: data[i][3],
          status: data[i][4],
          price: data[i][5],
          description: data[i][6]
        });
      }
    }
    
    return { success: true, rooms: rooms, count: rooms.length };
  } catch (error) {
    Logger.log('Error in getRoomsByProperty: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

// ==========================================
// DASHBOARD STATISTICS (EXISTING)
// ==========================================

/**
 * Get dashboard statistics (Legacy - still used for simple dashboard)
 */
function getDashboardStats() {
  try {
    var roomsSheet = SPREADSHEET.getSheetByName(ROOMS);
    var transSheet = SPREADSHEET.getSheetByName(TRANSACTIONS);
    var tenantSheet = SPREADSHEET.getSheetByName(TENANTS);
    
    if (!roomsSheet || !transSheet || !tenantSheet) {
      return { success: false, message: 'Sheets not found' };
    }
    
    var roomsData = roomsSheet.getDataRange().getValues().slice(1);
    var transData = transSheet.getDataRange().getValues().slice(1);
    var tenantData = tenantSheet.getDataRange().getValues().slice(1);
    
    var totalRooms = roomsData.length;
    var emptyRooms = 0;
    for (var i = 0; i < roomsData.length; i++) {
      if (roomsData[i][4] === 'Trống') emptyRooms++;
    }
    var occupiedRooms = totalRooms - emptyRooms;
    
    var today = new Date();
    var currentMonth = today.getMonth() + 1;
    var currentYear = today.getFullYear();
    
    var monthlyRevenue = 0;
    var unpaidAmount = 0;
    var unpaidCount = 0;
    
    for (var i = 0; i < transData.length; i++) {
      if (transData[i][3] == currentMonth && transData[i][4] == currentYear) {
        if (transData[i][6] === 'Đã thu') {
          monthlyRevenue += (transData[i][5] || 0);
        } else {
          unpaidAmount += (transData[i][5] || 0);
          unpaidCount++;
        }
      }
    }
    
    return {
      success: true,
      stats: {
        totalRooms: totalRooms,
        emptyRooms: emptyRooms,
        occupiedRooms: occupiedRooms,
        occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
        totalTenants: tenantData.length,
        monthlyRevenue: monthlyRevenue,
        unpaidAmount: unpaidAmount,
        unpaidCount: unpaidCount,
        currentMonth: currentMonth,
        currentYear: currentYear
      }
    };
  } catch (error) {
    Logger.log('Error in getDashboardStats: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

// ==========================================
// PHASE 1.1: ENHANCED DASHBOARD APIS
// ==========================================

/**
 * Get unified dashboard data with all metrics
 * Returns: { kpis, monthlyRevenue, roomStatus, overdueInvoices, totalDebt }
 */
function getDashboardWithCharts() {
  try {
    var kpis = getDashboardStats();
    if (!kpis.success) {
      return { success: false, message: 'Failed to get KPIs' };
    }
    
    var monthlyRevData = getMonthlyRevenue(12);
    var roomStatusData = getRoomStatusStats();
    var overdueData = getOverdueInvoices(30);
    var totalDebtData = getTotalDebt();
    
    return {
      success: true,
      data: {
        kpis: kpis.stats,
        monthlyRevenue: monthlyRevData,
        roomStatus: roomStatusData,
        overdueInvoices: overdueData,
        totalDebt: totalDebtData.totalDebt || 0
      }
    };
  } catch (error) {
    Logger.log('Error in getDashboardWithCharts: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Get monthly revenue for last N months
 * Returns: [{ month, year, revenue }, ...]
 */
function getMonthlyRevenue(months) {
  try {
    months = months || 12;
    var transSheet = SPREADSHEET.getSheetByName(TRANSACTIONS);
    if (!transSheet) return [];
    
    var data = transSheet.getDataRange().getValues().slice(1);
    var revenueMap = {};
    
    // Calculate revenue for each month
    for (var i = 0; i < data.length; i++) {
      var month = data[i][3];
      var year = data[i][4];
      var amount = data[i][5] || 0;
      var status = data[i][6];
      
      if (status === 'Đã thu') {
        var key = year + '-' + month;
        revenueMap[key] = (revenueMap[key] || 0) + amount;
      }
    }
    
    // Generate array for last N months
    var today = new Date();
    var result = [];
    
    for (var i = months - 1; i >= 0; i--) {
      var date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      var month = date.getMonth() + 1;
      var year = date.getFullYear();
      var key = year + '-' + month;
      
      result.push({
        month: month,
        year: year,
        monthLabel: formatMonthLabel(month, year),
        revenue: revenueMap[key] || 0
      });
    }
    
    return result;
  } catch (error) {
    Logger.log('Error in getMonthlyRevenue: ' + error.toString());
    return [];
  }
}

/**
 * Get room status statistics
 * Returns: { occupied, vacant, maintenance }
 */
function getRoomStatusStats() {
  try {
    var roomsSheet = SPREADSHEET.getSheetByName(ROOMS);
    if (!roomsSheet) return { occupied: 0, vacant: 0, maintenance: 0 };
    
    var data = roomsSheet.getDataRange().getValues().slice(1);
    var stats = { occupied: 0, vacant: 0, maintenance: 0 };
    
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] === '') continue;
      var status = data[i][4];
      if (status === 'Đã Cho Thuê') stats.occupied++;
      else if (status === 'Trống') stats.vacant++;
      else if (status === 'Bảo Trì') stats.maintenance++;
    }
    
    return stats;
  } catch (error) {
    Logger.log('Error in getRoomStatusStats: ' + error.toString());
    return { occupied: 0, vacant: 0, maintenance: 0 };
  }
}

/**
 * Get overdue invoices (unpaid bills)
 * Returns: [{ transId, roomId, tenantName, amount, daysOverdue }, ...]
 */
function getOverdueInvoices(daysThreshold) {
  try {
    daysThreshold = daysThreshold || 30;
    var transSheet = SPREADSHEET.getSheetByName(TRANSACTIONS);
    var tenantSheet = SPREADSHEET.getSheetByName(TENANTS);
    
    if (!transSheet || !tenantSheet) return [];
    
    var transData = transSheet.getDataRange().getValues().slice(1);
    var tenantData = tenantSheet.getDataRange().getValues().slice(1);
    var today = new Date();
    var overdueList = [];
    
    for (var i = 0; i < transData.length; i++) {
      if (transData[i][6] === 'Chưa thu') {
        // Calculate transaction date (assume it's month/year based)
        var month = transData[i][3];
        var year = transData[i][4];
        var transDate = new Date(year, month, 1);
        var daysOverdue = Math.floor((today - transDate) / (1000 * 60 * 60 * 24));
        
        if (daysOverdue >= daysThreshold) {
          var roomId = transData[i][2];
          var tenantName = 'N/A';
          
          // Find tenant by room
          for (var j = 0; j < tenantData.length; j++) {
            if (tenantData[j][6] === roomId) {
              tenantName = tenantData[j][2];
              break;
            }
          }
          
          overdueList.push({
            transId: transData[i][0],
            roomId: roomId,
            tenantName: tenantName,
            amount: transData[i][5] || 0,
            month: month,
            year: year,
            daysOverdue: daysOverdue
          });
        }
      }
    }
    
    // Sort by days overdue (descending)
    overdueList.sort((a, b) => b.daysOverdue - a.daysOverdue);
    
    return overdueList.slice(0, 5); // Return top 5
  } catch (error) {
    Logger.log('Error in getOverdueInvoices: ' + error.toString());
    return [];
  }
}

/**
 * Get total unpaid debt
 * Returns: { totalDebt, unpaidCount }
 */
function getTotalDebt() {
  try {
    var transSheet = SPREADSHEET.getSheetByName(TRANSACTIONS);
    if (!transSheet) return { totalDebt: 0, unpaidCount: 0 };
    
    var data = transSheet.getDataRange().getValues().slice(1);
    var totalDebt = 0;
    var unpaidCount = 0;
    
    for (var i = 0; i < data.length; i++) {
      if (data[i][6] === 'Chưa thu') {
        totalDebt += (data[i][5] || 0);
        unpaidCount++;
      }
    }
    
    return { totalDebt: totalDebt, unpaidCount: unpaidCount };
  } catch (error) {
    Logger.log('Error in getTotalDebt: ' + error.toString());
    return { totalDebt: 0, unpaidCount: 0 };
  }
}

// ==========================================
// UTILITY MANAGEMENT
// ==========================================

/**
 * Calculate utility bill
 */
function calculateUtilityBill(roomId, currentElec, currentWater) {
  try {
    var electricPrice = 3500;
    var waterPrice = 10000;
    
    var utilitySheet = SPREADSHEET.getSheetByName(UTILITY_USAGE);
    var roomsSheet = SPREADSHEET.getSheetByName(ROOMS);
    var transSheet = SPREADSHEET.getSheetByName(TRANSACTIONS);
    
    if (!utilitySheet || !roomsSheet || !transSheet) {
      return { success: false, message: 'Sheets not found' };
    }
    
    var today = new Date();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();
    
    var utilityData = utilitySheet.getDataRange().getValues();
    var utilityRow = null;
    var utilityRowIndex = -1;
    
    for (var i = 1; i < utilityData.length; i++) {
      if (utilityData[i][4] == roomId && utilityData[i][2] == month && utilityData[i][3] == year) {
        utilityRow = utilityData[i];
        utilityRowIndex = i;
        break;
      }
    }
    
    if (!utilityRow) {
      return { success: false, message: 'Utility data not found for room ' + roomId };
    }
    
    var roomsData = roomsSheet.getDataRange().getValues();
    var roomPrice = 0;
    for (var i = 1; i < roomsData.length; i++) {
      if (roomsData[i][0] == roomId) {
        roomPrice = roomsData[i][5] || 0;
        break;
      }
    }
    
    var prevElec = utilityRow[5] || 0;
    var prevWater = utilityRow[7] || 0;
    
    var elecUsage = Math.max(0, currentElec - prevElec);
    var waterUsage = Math.max(0, currentWater - prevWater);
    
    var elecCost = elecUsage * electricPrice;
    var waterCost = waterUsage * waterPrice;
    var totalAmount = roomPrice + elecCost + waterCost;
    
    var transId = generateId('TRANS');
    var propertyId = '';
    
    // Get PropertyID from room
    for (var i = 1; i < roomsData.length; i++) {
      if (roomsData[i][0] === roomId) {
        propertyId = roomsData[i][1];
        break;
      }
    }
    
    transSheet.appendRow([transId, propertyId, roomId, month, year, totalAmount, 'Chưa thu', '']);
    
    Logger.log('Bill calculated for room ' + roomId);
    return {
      success: true,
      transId: transId,
      totalAmount: totalAmount,
      elecCost: elecCost,
      waterCost: waterCost,
      message: 'Bill created: ' + totalAmount
    };
  } catch (error) {
    Logger.log('Error in calculateUtilityBill: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Submit utility reading from tenant
 */
function submitUtilityReading(roomId, currentElec, currentWater, phone) {
  try {
    phone = phone || '';
    
    var utilitySheet = SPREADSHEET.getSheetByName(UTILITY_USAGE);
    if (!utilitySheet) {
      return { success: false, message: 'Utility sheet not found' };
    }
    
    var today = new Date();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();
    
    var existingData = utilitySheet.getDataRange().getValues();
    var found = false;
    
    for (var i = 1; i < existingData.length; i++) {
      if (existingData[i][4] == roomId && existingData[i][2] == month && existingData[i][3] == year) {
        utilitySheet.getRange(i + 1, 7).setValue(currentElec);
        utilitySheet.getRange(i + 1, 9).setValue(currentWater);
        utilitySheet.getRange(i + 1, 10).setValue('Đã báo cáo');
        found = true;
        break;
      }
    }
    
    if (!found) {
      var newId = generateId('UTIL');
      utilitySheet.appendRow([newId, '', month, year, roomId, 0, currentElec, 0, currentWater, 'Đã báo cáo']);
    }
    
    Logger.log('Utility reading submitted for room ' + roomId);
    return {
      success: true,
      message: 'Utility reading submitted',
      roomId: roomId,
      currentElec: currentElec,
      currentWater: currentWater
    };
  } catch (error) {
    Logger.log('Error in submitUtilityReading: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

// ==========================================
// BILL & TRANSACTION MANAGEMENT
// ==========================================

/**
 * Get unpaid bills
 */
function getUnpaidBills() {
  try {
    var transSheet = SPREADSHEET.getSheetByName(TRANSACTIONS);
    var tenantSheet = SPREADSHEET.getSheetByName(TENANTS);
    
    if (!transSheet || !tenantSheet) {
      return { success: false, message: 'Sheets not found' };
    }
    
    var transData = transSheet.getDataRange().getValues();
    var tenantData = tenantSheet.getDataRange().getValues();
    
    var unpaidBills = [];
    for (var i = 1; i < transData.length; i++) {
      if (transData[i][6] === 'Chưa thu') {
        var roomId = transData[i][2];
        var tenant = null;
        for (var j = 1; j < tenantData.length; j++) {
          if (tenantData[j][6] == roomId) {
            tenant = tenantData[j];
            break;
          }
        }
        
        unpaidBills.push({
          transId: transData[i][0],
          roomId: roomId,
          amount: transData[i][5],
          month: transData[i][3],
          year: transData[i][4],
          tenantName: tenant ? tenant[2] : 'Unknown',
          tenantPhone: tenant ? tenant[3] : 'N/A',
          tenantEmail: tenant ? tenant[5] : 'N/A'
        });
      }
    }
    
    return {
      success: true,
      unpaidCount: unpaidBills.length,
      reminders: unpaidBills,
      message: 'Found ' + unpaidBills.length + ' unpaid bills'
    };
  } catch (error) {
    Logger.log('Error in getUnpaidBills: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Mark bill as paid
 */
function markBillAsPaid(transId) {
  try {
    var transSheet = SPREADSHEET.getSheetByName(TRANSACTIONS);
    if (!transSheet) {
      return { success: false, message: 'Transactions sheet not found' };
    }
    
    var data = transSheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === transId) {
        transSheet.getRange(i + 1, 7).setValue('Đã thu');
        transSheet.getRange(i + 1, 8).setValue(formatDateVN(new Date()));
        return { success: true, message: 'Bill marked as paid' };
      }
    }
    
    return { success: false, message: 'Bill not found' };
  } catch (error) {
    Logger.log('Error in markBillAsPaid: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

// ==========================================
// TENANT MANAGEMENT
// ==========================================

/**
 * Get all tenants from database
 * IMPORTANT: Column structure:
 * 0=TenantID, 1=PropertyID, 2=FullName, 3=Phone, 4=IDCard, 5=Email, 6=RoomID, 7=PaymentReminderDay, 8=JoinDate
 */
function getAllTenants() {
  try {
    var sheet = SPREADSHEET.getSheetByName(TENANTS);
    if (!sheet) {
      return { success: false, message: 'Tenants sheet not found' };
    }
    
    var values = sheet.getDataRange().getValues();
    if (values.length === 0) {
      return { success: true, tenants: [] };
    }
    
    // Skip header row
    var tenants = [];
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      if (row[0] === '' || row[0] === undefined) continue; // Skip empty rows
      
      tenants.push({
        tenantId: row[0],
        propertyId: row[1],
        fullName: row[2],
        phone: row[3],
        idCard: row[4],
        email: row[5],
        roomId: row[6],
        paymentReminderDay: row[7] || 25,
        joinDate: row[8] instanceof Date ? formatDateVN(row[8]) : formatDateVN(new Date(row[8]))
      });
    }
    
    return { 
      success: true, 
      tenants: tenants,
      count: tenants.length
    };
  } catch (error) {
    Logger.log('Error in getAllTenants: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Add new tenant to database
 */
function addTenant(fullName, phone, idCard, email, roomId) {
  try {
    var sheet = SPREADSHEET.getSheetByName(TENANTS);
    var roomsSheet = SPREADSHEET.getSheetByName(ROOMS);
    
    if (!sheet) {
      return { success: false, message: 'Tenants sheet not found' };
    }
    
    var tenantId = generateId('TENANT');
    var joinDate = formatDateVN(new Date());
    
    // Find PropertyID from RoomID
    var propertyId = 'DEFAULT';
    var roomsData = roomsSheet.getDataRange().getValues();
    for (var k = 1; k < roomsData.length; k++) {
      if (roomsData[k][0] === roomId) {
        propertyId = roomsData[k][1];
        break;
      }
    }
    
    // Add tenant data: TenantID, PropertyID, FullName, Phone, IDCard, Email, RoomID, PaymentReminderDay, JoinDate
    sheet.appendRow([tenantId, propertyId, fullName, phone, idCard, email, roomId, 25, joinDate]);
    
    // Update room status to "Đã Cho Thuê" (Occupied)
    for (var i = 1; i < roomsData.length; i++) {
      if (roomsData[i][0] === roomId) {
        roomsSheet.getRange(i + 1, 5).setValue('Đã Cho Thuê');
        break;
      }
    }
    
    return {
      success: true,
      tenantId: tenantId,
      message: 'Khách hàng ' + fullName + ' được thêm thành công'
    };
  } catch (error) {
    Logger.log('Error in addTenant: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

// ==========================================
// MANAGER & PROPERTY FUNCTIONS
// ==========================================

/**
 * Add new manager
 */
function addManager(managerName, email, phone) {
  try {
    var managersSheet = SPREADSHEET.getSheetByName(MANAGERS);
    if (!managersSheet) {
      return { success: false, message: 'Managers sheet not found. Run initDatabase() first!' };
    }
    
    var managerId = generateId('MGR');
    var createdDate = formatDateVN(new Date());
    managersSheet.appendRow([managerId, managerName, email, phone, createdDate]);
    
    Logger.log('Manager added: ' + managerName);
    return {
      success: true,
      managerId: managerId,
      message: 'Người quản lý ' + managerName + ' được thêm thành công'
    };
  } catch (error) {
    Logger.log('Error in addManager: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Get all managers
 */
function getAllManagers() {
  try {
    var managersSheet = SPREADSHEET.getSheetByName(MANAGERS);
    if (!managersSheet) {
      return { success: false, message: 'Managers sheet not found' };
    }
    
    var data = managersSheet.getDataRange().getValues();
    var managers = [];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === '') continue;
      managers.push({
        managerId: data[i][0],
        managerName: data[i][1],
        email: data[i][2],
        phone: data[i][3],
        createdDate: data[i][4]
      });
    }
    
    return { success: true, managers: managers, count: managers.length };
  } catch (error) {
    Logger.log('Error in getAllManagers: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Add new property
 */
function addProperty(managerId, propertyName, address, totalRooms) {
  try {
    var propertiesSheet = SPREADSHEET.getSheetByName(PROPERTIES);
    if (!propertiesSheet) {
      return { success: false, message: 'Properties sheet not found. Run initDatabase() first!' };
    }
    
    var propertyId = generateId('PROP');
    var createdDate = formatDateVN(new Date());
    propertiesSheet.appendRow([propertyId, managerId, propertyName, address, totalRooms, createdDate]);
    
    Logger.log('Property added: ' + propertyName);
    return {
      success: true,
      propertyId: propertyId,
      message: 'Bất động sản ' + propertyName + ' được thêm thành công'
    };
  } catch (error) {
    Logger.log('Error in addProperty: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Get all properties
 */
function getAllProperties() {
  try {
    var propertiesSheet = SPREADSHEET.getSheetByName(PROPERTIES);
    if (!propertiesSheet) {
      return { success: false, message: 'Properties sheet not found' };
    }
    
    var data = propertiesSheet.getDataRange().getValues();
    var properties = [];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === '') continue;
      properties.push({
        propertyId: data[i][0],
        managerId: data[i][1],
        propertyName: data[i][2],
        address: data[i][3],
        totalRooms: data[i][4],
        createdDate: data[i][5]
      });
    }
    
    return { success: true, properties: properties, count: properties.length };
  } catch (error) {
    Logger.log('Error in getAllProperties: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

// ==========================================
// PAYMENT REMINDER SYSTEM
// ==========================================

/**
 * Setup automatic payment reminder trigger
 */
function setupPaymentReminderTrigger() {
  try {
    // Remove existing triggers first
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() == 'checkAndSendPaymentReminders') {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }
    
    // Create new time-based trigger (every day at 8 AM)
    ScriptApp.newTrigger('checkAndSendPaymentReminders')
      .timeBased()
      .atHour(8)
      .everyDays(1)
      .create();
    
    Logger.log('Payment reminder trigger setup successfully!');
    return {
      success: true,
      message: 'Trigger setup successfully! Reminders will be sent daily at 8 AM.'
    };
  } catch (error) {
    Logger.log('Error in setupPaymentReminderTrigger: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Check and send payment reminders (Main function - runs daily)
 */
function checkAndSendPaymentReminders() {
  try {
    var today = new Date();
    var currentDay = today.getDate();
    var currentMonth = today.getMonth() + 1;
    var currentYear = today.getFullYear();
    
    Logger.log('=== Payment Reminder Check: ' + formatDateVN(today) + ' ===');
    
    var tenantsSheet = SPREADSHEET.getSheetByName(TENANTS);
    var transSheet = SPREADSHEET.getSheetByName(TRANSACTIONS);
    
    if (!tenantsSheet || !transSheet) {
      Logger.log('ERROR: Required sheets not found');
      return;
    }
    
    var tenantsData = tenantsSheet.getDataRange().getValues();
    var transData = transSheet.getDataRange().getValues();
    
    var remindersSent = 0;
    
    // Loop through all tenants
    for (var i = 1; i < tenantsData.length; i++) {
      if (tenantsData[i][0] === '') continue; // Skip empty rows
      
      var tenantId = tenantsData[i][0];
      var fullName = tenantsData[i][2];
      var email = tenantsData[i][5];
      var reminderDay = tenantsData[i][7] || 25; // Default to 25th
      
      // Check if today is the reminder day
      if (currentDay === reminderDay && email) {
        // Find unpaid bills for this tenant
        var unpaidBills = [];
        for (var j = 1; j < transData.length; j++) {
          var transRoomId = transData[j][2];
          var transTenantMonth = transData[j][3];
          var transTenantYear = transData[j][4];
          var paymentStatus = transData[j][6];
          var amount = transData[j][5];
          
          // Find if this room belongs to this tenant
          for (var k = 1; k < tenantsData.length; k++) {
            if (tenantsData[k][0] === tenantId && tenantsData[k][6] === transRoomId) {
              if (paymentStatus === 'Chưa thu') {
                unpaidBills.push({
                  month: transTenantMonth,
                  year: transTenantYear,
                  amount: amount,
                  transId: transData[j][0]
                });
              }
              break;
            }
          }
        }
        
        // Send email if there are unpaid bills
        if (unpaidBills.length > 0) {
          var result = sendPaymentReminderEmail(tenantId, fullName, email, unpaidBills);
          if (result.success) {
            remindersSent++;
          }
        }
      }
    }
    
    Logger.log('Total reminders sent: ' + remindersSent);
    return {
      success: true,
      remindersSent: remindersSent,
      message: 'Checked and sent ' + remindersSent + ' reminders'
    };
  } catch (error) {
    Logger.log('Error in checkAndSendPaymentReminders: ' + error.toString());
  }
}

/**
 * Send payment reminder email to tenant
 */
function sendPaymentReminderEmail(tenantId, fullName, email, unpaidBills) {
  try {
    if (!email) {
      return { success: false, message: 'Email address not provided' };
    }
    
    var subject = '💰 Nhắc nhở: Thanh toán tiền phòng tháng này';
    var message = buildReminderEmailContent(fullName, unpaidBills);
    
    // Send email
    GmailApp.sendEmail(email, subject, message, {
      htmlBody: message
    });
    
    // Log to PaymentReminders sheet
    var remindersSheet = SPREADSHEET.getSheetByName(PAYMENT_REMINDERS);
    var reminderId = generateId('REM');
    var today = new Date();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();
    
    remindersSheet.appendRow([
      reminderId,
      tenantId,
      month,
      year,
      'Email',
      formatDateVN(today),
      'Sent',
      formatDateVN(today),
      message,
      'Success'
    ]);
    
    Logger.log('Payment reminder email sent to: ' + email);
    return {
      success: true,
      reminderId: reminderId,
      message: 'Email sent successfully to ' + fullName
    };
  } catch (error) {
    Logger.log('Error in sendPaymentReminderEmail: ' + error.toString());
    
    // Log failed attempt
    var remindersSheet = SPREADSHEET.getSheetByName(PAYMENT_REMINDERS);
    var reminderId = generateId('REM');
    var today = new Date();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();
    
    remindersSheet.appendRow([
      reminderId,
      tenantId,
      month,
      year,
      'Email',
      formatDateVN(today),
      'Failed',
      formatDateVN(today),
      '',
      error.toString()
    ]);
    
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Build HTML email content for payment reminder
 */
function buildReminderEmailContent(fullName, unpaidBills) {
  var html = '<html><body style="font-family: Arial, sans-serif; color: #333;">';
  html += '<div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">';
  html += '<h2 style="color: #d9534f;">💰 Nhắc Nhở Thanh Toán</h2>';
  html += '<p>Xin chào <strong>' + fullName + '</strong>,</p>';
  html += '<p>Chúng tôi nhắc nhở bạn rằng bạn có <strong style="color: #d9534f;">' + unpaidBills.length + ' hóa đơn chưa thanh toán</strong>:</p>';
  
  html += '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">';
  html += '<tr style="background-color: #2c3e50; color: white;">';
  html += '<th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Tháng</th>';
  html += '<th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Năm</th>';
  html += '<th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Số Tiền</th>';
  html += '</tr>';
  
  var totalAmount = 0;
  for (var i = 0; i < unpaidBills.length; i++) {
    var bill = unpaidBills[i];
    totalAmount += bill.amount;
    html += '<tr>';
    html += '<td style="padding: 10px; border: 1px solid #ddd;">' + bill.month + '</td>';
    html += '<td style="padding: 10px; border: 1px solid #ddd;">' + bill.year + '</td>';
    html += '<td style="padding: 10px; text-align: right; border: 1px solid #ddd;">' + formatCurrency(bill.amount) + '</td>';
    html += '</tr>';
  }
  
  html += '<tr style="background-color: #ecf0f1; font-weight: bold;">';
  html += '<td colspan="2" style="padding: 10px; border: 1px solid #ddd;">Tổng Cộng:</td>';
  html += '<td style="padding: 10px; text-align: right; border: 1px solid #ddd; color: #d9534f;">' + formatCurrency(totalAmount) + '</td>';
  html += '</tr>';
  html += '</table>';
  
  html += '<p style="margin-top: 20px;">⏰ <strong>Vui lòng thanh toán trước cuối tháng</strong> để tránh các phí phạt.</p>';
  html += '<p>Nếu bạn đã thanh toán, vui lòng bỏ qua thông báo này.</p>';
  html += '<p>Liên hệ quản lý nếu có bất kỳ thắc mắc nào.</p>';
  html += '<p style="margin-top: 30px; font-size: 12px; color: #999;">---<br/>Hệ thống quản lý nhà trọ tự động</p>';
  html += '</div></body></html>';
  
  return html;
}

/**
 * Send test email to verify email system works
 */
function sendTestEmail(recipientEmail) {
  try {
    var subject = '🧪 Test Email - Hệ Thống Quản Lý Nhà Trọ';
    var htmlBody = '<html><body style="font-family: Arial, sans-serif; color: #333;">';
    htmlBody += '<div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">';
    htmlBody += '<h2 style="color: #27ae60;">✅ Email System Đang Hoạt Động!</h2>';
    htmlBody += '<p>Xin chào,</p>';
    htmlBody += '<p>Đây là email kiểm tra từ hệ thống quản lý nhà trọ.</p>';
    htmlBody += '<hr/>';
    htmlBody += '<p><strong>Thông tin kiểm tra:</strong></p>';
    htmlBody += '<ul>';
    htmlBody += '<li>Email: ' + recipientEmail + '</li>';
    htmlBody += '<li>Thời gian gửi: ' + formatDateVN(new Date()) + '</li>';
    htmlBody += '<li>Spreadsheet ID: ' + SPREADSHEET_ID + '</li>';
    htmlBody += '</ul>';
    htmlBody += '<hr/>';
    htmlBody += '<p style="color: #27ae60;"><strong>✓ Hệ thống email đã sẵn sàng để gửi nhắc nhở thanh toán!</strong></p>';
    htmlBody += '<p style="margin-top: 30px; font-size: 12px; color: #999;">---<br/>Hệ thống quản lý nhà trọ tự động</p>';
    htmlBody += '</div></body></html>';
    
    GmailApp.sendEmail(recipientEmail, subject, 'Test email', {
      htmlBody: htmlBody
    });
    
    Logger.log('Test email sent to: ' + recipientEmail);
    return {
      success: true,
      message: 'Test email sent successfully to ' + recipientEmail + '! Check your inbox.',
      email: recipientEmail,
      sentTime: formatDateVN(new Date())
    };
  } catch (error) {
    Logger.log('Error in sendTestEmail: ' + error.toString());
    return {
      success: false,
      message: 'Error: ' + error.toString(),
      error: error.toString()
    };
  }
}

// ==========================================
// DUMMY DATA FOR TESTING
// ==========================================

/**
 * Seed dummy data for testing
 * Run this after initDatabase() to populate with sample data
 */
function seedDummyData() {
  try {
    Logger.log('📊 Starting to seed dummy data...');
    
    var managersSheet = SPREADSHEET.getSheetByName(MANAGERS);
    var propertiesSheet = SPREADSHEET.getSheetByName(PROPERTIES);
    var roomsSheet = SPREADSHEET.getSheetByName(ROOMS);
    var tenantsSheet = SPREADSHEET.getSheetByName(TENANTS);
    var transSheet = SPREADSHEET.getSheetByName(TRANSACTIONS);
    var utilitySheet = SPREADSHEET.getSheetByName(UTILITY_USAGE);
    
    if (!managersSheet || !propertiesSheet || !roomsSheet) {
      return {
        success: false,
        message: 'Sheets not found. Run initDatabase() first!'
      };
    }
    
    // 1. Add Manager
    var managerId = 'MGR001';
    managersSheet.appendRow([managerId, 'Nguyễn Văn A', 'manager@email.com', '0123456789', formatDateVN(new Date())]);
    
    // 2. Add Property
    var propertyId = 'PROP001';
    propertiesSheet.appendRow([propertyId, managerId, 'Nhà Trọ Trung Tâm', '123 Đường ABC, TP.HCM', 10, formatDateVN(new Date())]);
    
    // 3. Add Rooms (10 rooms: 7 occupied, 3 empty)
    var rooms = [
      ['ROOM001', propertyId, 'Phòng 101', 1, 'Đã Cho Thuê', 3000000, 'Phòng đơn, có WC riêng'],
      ['ROOM002', propertyId, 'Phòng 102', 1, 'Đã Cho Thuê', 3000000, 'Phòng đơn, có WC riêng'],
      ['ROOM003', propertyId, 'Phòng 103', 1, 'Trống', 3000000, 'Phòng đơn, có WC riêng'],
      ['ROOM004', propertyId, 'Phòng 201', 2, 'Đã Cho Thuê', 3500000, 'Phòng đôi, view đường phố'],
      ['ROOM005', propertyId, 'Phòng 202', 2, 'Đã Cho Thuê', 3500000, 'Phòng đôi, view đường phố'],
      ['ROOM006', propertyId, 'Phòng 203', 2, 'Trống', 3500000, 'Phòng đôi, view đường phố'],
      ['ROOM007', propertyId, 'Phòng 301', 3, 'Đã Cho Thuê', 4000000, 'Phòng VIP, ban công rộng'],
      ['ROOM008', propertyId, 'Phòng 302', 3, 'Đã Cho Thuê', 4000000, 'Phòng VIP, ban công rộng'],
      ['ROOM009', propertyId, 'Phòng 303', 3, 'Đã Cho Thuê', 4000000, 'Phòng VIP, ban công rộng'],
      ['ROOM010', propertyId, 'Phòng 304', 3, 'Trống', 4000000, 'Phòng VIP, ban công rộng']
    ];
    
    for (var i = 0; i < rooms.length; i++) {
      roomsSheet.appendRow(rooms[i]);
    }
    
    // 4. Add Tenants (for occupied rooms)
    var tenants = [
      ['TENANT001', propertyId, 'Trần Thị B', '0912345678', '0123456789', 'thib@email.com', 'ROOM001', 15, formatDateVN(new Date(2025, 6, 1))],
      ['TENANT002', propertyId, 'Lê Văn C', '0923456789', '0234567890', 'levanc@email.com', 'ROOM002', 20, formatDateVN(new Date(2025, 7, 15))],
      ['TENANT003', propertyId, 'Phạm Thị D', '0934567890', '0345678901', 'phamthid@email.com', 'ROOM004', 25, formatDateVN(new Date(2025, 8, 1))],
      ['TENANT004', propertyId, 'Hoàng Văn E', '0945678901', '0456789012', 'hoangvane@email.com', 'ROOM005', 10, formatDateVN(new Date(2026, 0, 10))],
      ['TENANT005', propertyId, 'Vũ Thị F', '0956789012', '0567890123', 'vuthif@email.com', 'ROOM007', 30, formatDateVN(new Date(2025, 5, 20))],
      ['TENANT006', propertyId, 'Đặng Văn G', '0967890123', '0678901234', 'dangvang@email.com', 'ROOM008', 5, formatDateVN(new Date(2026, 0, 25))],
      ['TENANT007', propertyId, 'Bùi Thị H', '0978901234', '0789012345', 'buithih@email.com', 'ROOM009', 15, formatDateVN(new Date(2025, 11, 1))]
    ];
    
    for (var i = 0; i < tenants.length; i++) {
      tenantsSheet.appendRow(tenants[i]);
    }
    
    // 5. Add Transactions (Monthly bills - Mix of paid and unpaid for current month)
    var currentMonth = new Date().getMonth() + 1;
    var currentYear = new Date().getFullYear();
    var transactions = [
      // Current month - Mix of paid and unpaid
      ['TRANS001', propertyId, 'ROOM001', currentMonth, currentYear, 3000000, 'Đã thu', formatDateVN(new Date())],
      ['TRANS002', propertyId, 'ROOM002', currentMonth, currentYear, 3000000, 'Chưa thu', ''],
      ['TRANS003', propertyId, 'ROOM004', currentMonth, currentYear, 3500000, 'Đã thu', formatDateVN(new Date())],
      ['TRANS004', propertyId, 'ROOM005', currentMonth, currentYear, 3500000, 'Chưa thu', ''],
      ['TRANS005', propertyId, 'ROOM007', currentMonth, currentYear, 4000000, 'Đã thu', formatDateVN(new Date())],
      ['TRANS006', propertyId, 'ROOM008', currentMonth, currentYear, 4000000, 'Chưa thu', ''],
      ['TRANS007', propertyId, 'ROOM009', currentMonth, currentYear, 4000000, 'Đã thu', formatDateVN(new Date())],
      
      // Previous months - All paid
      ['TRANS101', propertyId, 'ROOM001', currentMonth - 1, currentYear, 3000000, 'Đã thu', formatDateVN(new Date(currentYear, currentMonth - 2, 15))],
      ['TRANS102', propertyId, 'ROOM002', currentMonth - 1, currentYear, 3000000, 'Đã thu', formatDateVN(new Date(currentYear, currentMonth - 2, 20))]
    ];
    
    for (var i = 0; i < transactions.length; i++) {
      transSheet.appendRow(transactions[i]);
    }
    
    // 6. Add Utility Usage (Current month readings)
    var utilityData = [
      ['UTL001', propertyId, currentMonth, currentYear, 'ROOM001', 100, 125, 5, 8, 'Đã báo cáo'],
      ['UTL002', propertyId, currentMonth, currentYear, 'ROOM002', 95, 112, 4, 7, 'Đã báo cáo'],
      ['UTL003', propertyId, currentMonth, currentYear, 'ROOM004', 120, 145, 6, 10, 'Đã báo cáo'],
      ['UTL004', propertyId, currentMonth, currentYear, 'ROOM005', 110, 138, 5, 9, 'Đã báo cáo'],
      ['UTL005', propertyId, currentMonth, currentYear, 'ROOM007', 150, 180, 8, 12, 'Đã báo cáo'],
      ['UTL006', propertyId, currentMonth, currentYear, 'ROOM008', 145, 175, 7, 11, 'Đã báo cáo'],
      ['UTL007', propertyId, currentMonth, currentYear, 'ROOM009', 155, 185, 8, 13, 'Đã báo cáo']
    ];
    
    for (var i = 0; i < utilityData.length; i++) {
      utilitySheet.appendRow(utilityData[i]);
    }
    
    Logger.log('✅ Dummy data seeded successfully!');
    return {
      success: true,
      message: '✅ Dummy data created! System now has:\n- 1 Manager\n- 1 Property\n- 10 Rooms (7 occupied, 3 empty)\n- 7 Tenants\n- Monthly transactions & utilities'
    };
    
  } catch (error) {
    Logger.log('❌ Error seeding data: ' + error.toString());
    return {
      success: false,
      message: 'Error: ' + error.toString()
    };
  }
}

// ==========================================
// API ENDPOINTS - HANDLE POST REQUESTS
// ==========================================

/**
 * Handle OPTIONS requests (CORS preflight)
 */
function doOptions(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.TEXT);
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  output.setHeader('Access-Control-Max-Age', '86400');
  return output;
}

/**
 * Handle GET requests
 */
function doGet(e) {
  // If request has ?type=api parameter, return JSON instead of HTML
  if (e.parameter.type === 'api') {
    try {
      var stats = getDashboardStats();
      return ContentService.createTextOutput(JSON.stringify(stats))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*')
        .setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    } catch (error) {
      var errorResponse = {
        success: false,
        message: 'Lỗi Server: ' + error.toString(),
        timestamp: new Date().toISOString()
      };
      return ContentService.createTextOutput(JSON.stringify(errorResponse))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }
  }

  // Default: return test page
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>House Management API</title></head>';
  html += '<body><h1>✅ Google Apps Script is running</h1>';
  html += '<p>Backend API is active. Use Vercel frontend to interact.</p>';
  html += '<p>Spreadsheet: ' + SPREADSHEET_NAME + '</p></body></html>';
  
  return HtmlService.createHtmlOutput(html);
}

/**
 * Handle POST requests from frontend
 * Endpoint: POST /exec
 * Body: form-urlencoded with action and params
 */
function doPost(e) {
  var result;
  try {
    var action, params;

    // 1. Parse data from Frontend
    if (e.postData && e.postData.contents) {
      var rawContent = e.postData.contents;
      try {
        // Try to read as JSON
        var jsonData = JSON.parse(rawContent);
        action = jsonData.action;
        params = jsonData.params || {};
      } catch (jsonError) {
        // If not JSON, read as Form Parameters (action=xxx&params=yyy)
        action = e.parameter.action;
        if (e.parameter.params) {
          try { 
            params = JSON.parse(e.parameter.params); 
          } catch (pErr) { 
            params = {}; 
          }
        }
      }
    }

    // 2. ROUTE ACTIONS (DISPATCHER)
    result = apiRouter(action, params);

  } catch (error) {
    result = { success: false, message: 'Lỗi thực thi: ' + error.toString() };
  }

  // 3. Return JSON response with CORS headers
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * API Router - Route requests to appropriate functions
 * This is the main dispatcher for all API actions
 */
function apiRouter(action, params) {
  params = params || {};
  
  switch(action) {
    // Manager functions
    case 'addManager':
      return addManager(params.managerName, params.email, params.phone);
    
    case 'getAllManagers':
      return getAllManagers();
    
    // Property functions
    case 'addProperty':
      return addProperty(params.managerId, params.propertyName, params.address, params.totalRooms);
    
    case 'getAllProperties':
      return getAllProperties();
    
    // Dashboard functions (LEGACY)
    case 'getDashboardStats':
      return getDashboardStats();
    
    // Dashboard functions (PHASE 1.1 - ENHANCED)
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
    
    // Room functions
    case 'getAllRooms':
      return getAllRooms();
    
    case 'getRoomsByProperty':
      return getRoomsByProperty(params.propertyId);
    
    case 'addRoom':
      return addRoom(params.propertyId || 'DEFAULT', params.roomName, params.floor, params.price, params.description);
    
    case 'submitUtilityReading':
      return submitUtilityReading(params.roomId, params.currentElec, params.currentWater, params.phone);
    
    // Bill functions
    case 'getUnpaidBills':
      return getUnpaidBills();
    
    case 'markBillAsPaid':
      return markBillAsPaid(params.transId);
    
    // Tenant functions
    case 'getAllTenants':
      return getAllTenants();
    
    case 'addTenant':
      return addTenant(params.fullName, params.phone, params.idCard, params.email, params.roomId);
    
    // Payment Reminder functions
    case 'setupPaymentReminderTrigger':
      return setupPaymentReminderTrigger();
    
    case 'checkAndSendPaymentReminders':
      return checkAndSendPaymentReminders();
    
    case 'sendTestEmail':
      return sendTestEmail(params.email);
    
    // Utility functions (testing/debugging)
    case 'testConnection':
      return testConnection();
    
    case 'verifySheets':
      return verifySheets();
    
    case 'ensureDatabaseInitialized':
      return ensureDatabaseInitialized();
    
    case 'seedDummyData':
      return seedDummyData();
    
    default:
      return { 
        success: false, 
        message: 'Action not found: ' + action,
        hint: 'Valid actions: getDashboardStats, getDashboardWithCharts, getAllRooms, getAllTenants, addTenant, getUnpaidBills, markBillAsPaid, etc.'
      };
  }
}

// ==========================================
// END OF CODE
// ==========================================

Logger.log('✅ Code.gs FIXED version loaded successfully!');
Logger.log('Version: 2.0 (Deduplicated + Phase 1.1 Ready)');
Logger.log('All functions are optimized and ready for production.');
