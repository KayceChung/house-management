/**
 * HỆ THỐNG QUẢN LÝ NHÀ TRỌ - GOOGLE APPS SCRIPT
 * Phiên bản: 1.0 (Fixed)
 * Cập nhật: 30/04/2026
 */

// ==========================================
// GLOBAL VARIABLES
// ==========================================

var SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
var SPREADSHEET_ID = SPREADSHEET.getId();

// Sheet names
var ROOMS = 'Rooms';
var TENANTS = 'Tenants';
var CONTRACTS = 'Contracts';
var UTILITY_USAGE = 'UtilityUsage';
var TRANSACTIONS = 'Transactions';
var ASSETS = 'Assets';

// ==========================================
// DATABASE INITIALIZATION
// ==========================================

/**
 * Initialize database - Create 6 sheets with headers
 * RUN THIS ONLY ONCE!
 */
function initDatabase() {
  try {
    Logger.log('Starting database initialization...');
    
    createSheet(ROOMS, ['RoomID', 'RoomName', 'Floor', 'Status', 'Price', 'Description']);
    createSheet(TENANTS, ['TenantID', 'FullName', 'Phone', 'IDCard', 'Email', 'RoomID', 'JoinDate']);
    createSheet(CONTRACTS, ['ContractID', 'RoomID', 'TenantID', 'StartDate', 'EndDate', 'Deposit', 'Terms']);
    createSheet(UTILITY_USAGE, ['ID', 'Month', 'Year', 'RoomID', 'PrevElec', 'CurrElec', 'PrevWater', 'CurrWater', 'Status']);
    createSheet(TRANSACTIONS, ['TransID', 'RoomID', 'Month', 'Year', 'TotalAmount', 'PaymentStatus', 'PaidDate']);
    createSheet(ASSETS, ['AssetID', 'RoomID', 'ItemName', 'Condition', 'Quantity']);
    
    Logger.log('Database initialized successfully!');
    return {
      success: true,
      message: 'Database initialized! 6 sheets created.'
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
// ROOM MANAGEMENT
// ==========================================

/**
 * Add new room
 */
function addRoom(roomName, floor, price, description) {
  try {
    description = description || '';
    
    var roomsSheet = SPREADSHEET.getSheetByName(ROOMS);
    if (!roomsSheet) {
      return { success: false, message: 'Rooms sheet not found. Run initDatabase() first!' };
    }
    
    var roomId = generateId('ROOM');
    roomsSheet.appendRow([roomId, roomName, floor, 'Trống', price, description]);
    
    Logger.log('Room added: ' + roomName);
    return {
      success: true,
      roomId: roomId,
      message: 'Room ' + roomName + ' added successfully'
    };
  } catch (error) {
    Logger.log('Error in addRoom: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Get all rooms
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
      rooms.push({
        roomId: data[i][0],
        roomName: data[i][1],
        floor: data[i][2],
        status: data[i][3],
        price: data[i][4],
        description: data[i][5]
      });
    }
    
    return { success: true, rooms: rooms, count: rooms.length };
  } catch (error) {
    Logger.log('Error in getAllRooms: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Get dashboard statistics
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
      if (roomsData[i][3] === 'Trống') emptyRooms++;
    }
    var occupiedRooms = totalRooms - emptyRooms;
    
    var today = new Date();
    var currentMonth = today.getMonth() + 1;
    var currentYear = today.getFullYear();
    
    var monthlyRevenue = 0;
    var unpaidAmount = 0;
    
    for (var i = 0; i < transData.length; i++) {
      if (transData[i][2] == currentMonth && transData[i][3] == currentYear) {
        if (transData[i][5] === 'Đã thu') {
          monthlyRevenue += (transData[i][4] || 0);
        } else {
          unpaidAmount += (transData[i][4] || 0);
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
// UTILITY MANAGEMENT
// ==========================================

/**
 * Calculate utility bill
 */
function calculateUtilityBill(roomId, month, year, electricPrice, waterPrice) {
  try {
    electricPrice = electricPrice || 3500;
    waterPrice = waterPrice || 10000;
    
    var utilitySheet = SPREADSHEET.getSheetByName(UTILITY_USAGE);
    var roomsSheet = SPREADSHEET.getSheetByName(ROOMS);
    var transSheet = SPREADSHEET.getSheetByName(TRANSACTIONS);
    
    if (!utilitySheet || !roomsSheet || !transSheet) {
      return { success: false, message: 'Sheets not found' };
    }
    
    var utilityData = utilitySheet.getDataRange().getValues();
    var utilityRow = null;
    
    for (var i = 1; i < utilityData.length; i++) {
      if (utilityData[i][3] == roomId && utilityData[i][1] == month && utilityData[i][2] == year) {
        utilityRow = utilityData[i];
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
        roomPrice = roomsData[i][4] || 0;
        break;
      }
    }
    
    var prevElec = utilityRow[4] || 0;
    var currElec = utilityRow[5] || 0;
    var prevWater = utilityRow[6] || 0;
    var currWater = utilityRow[7] || 0;
    
    var elecUsage = Math.max(0, currElec - prevElec);
    var waterUsage = Math.max(0, currWater - prevWater);
    
    var elecCost = elecUsage * electricPrice;
    var waterCost = waterUsage * waterPrice;
    var totalAmount = roomPrice + elecCost + waterCost;
    
    var transId = generateId('TRANS');
    transSheet.appendRow([transId, roomId, month, year, totalAmount, 'Chưa thu', formatDateVN(new Date())]);
    
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
      if (existingData[i][3] == roomId && existingData[i][1] == month && existingData[i][2] == year) {
        utilitySheet.getRange(i + 1, 6).setValue(currentElec);
        utilitySheet.getRange(i + 1, 8).setValue(currentWater);
        utilitySheet.getRange(i + 1, 9).setValue('Đã báo cáo');
        found = true;
        break;
      }
    }
    
    if (!found) {
      var newId = generateId('UTIL');
      utilitySheet.appendRow([newId, month, year, roomId, 0, currentElec, 0, currentWater, 'Đã báo cáo']);
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
      if (transData[i][5] === 'Chưa thu') {
        var roomId = transData[i][1];
        var tenant = null;
        for (var j = 1; j < tenantData.length; j++) {
          if (tenantData[j][5] == roomId) {
            tenant = tenantData[j];
            break;
          }
        }
        
        unpaidBills.push({
          transId: transData[i][0],
          roomId: roomId,
          amount: transData[i][4],
          month: transData[i][2],
          year: transData[i][3],
          tenantName: tenant ? tenant[1] : 'Unknown',
          tenantPhone: tenant ? tenant[2] : 'N/A'
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
        transSheet.getRange(i + 1, 6).setValue('Đã thu');
        transSheet.getRange(i + 1, 7).setValue(formatDateVN(new Date()));
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
  return date.toLocaleDateString('vi-VN');
}

// ==========================================
// WEB APP
// ==========================================

function doGet(e) {
  return HtmlService.createHtmlOutput(getIndexHtmlContent())
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getIndexHtmlContent() {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Quan Ly Nha Tro</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"><style>body{background-color:#f8f9fa}.navbar{background-color:#2c3e50}.navbar-brand{font-weight:bold;color:#fff}</style></head><body><nav class="navbar navbar-dark"><div class="container-fluid"><span class="navbar-brand">Quan Ly Nha Tro</span></div></nav><div class="container mt-4"><div class="alert alert-info"><strong>System initialized successfully!</strong><br>Check Google Sheets to verify all 6 sheets are created.</div></div></body></html>';
}

// ==========================================
// API ENDPOINT (FOR VERCEL FRONTEND)
// ==========================================

/**
 * Handle POST requests from frontend
 * Endpoint: POST /usercodeapp
 * Body: { action: "functionName", params: { ... } }
 */
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var params = payload.params || {};
    
    var result = apiRouter(action, params);
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * API Router - Route requests to appropriate functions
 */
function apiRouter(action, params) {
  switch(action) {
    case 'getDashboardStats':
      return { success: true, stats: getDashboardStats() };
    
    case 'getAllRooms':
      return { success: true, rooms: getAllRooms() };
    
    case 'addRoom':
      var roomId = addRoom(params.roomName, params.floor, params.price, params.description);
      return { 
        success: true, 
        message: 'Phòng được thêm thành công',
        roomId: roomId 
      };
    
    case 'submitUtilityReading':
      submitUtilityReading(params.roomId, params.currentElec, params.currentWater, params.phone);
      return { success: true, message: 'Báo cáo được lưu thành công' };
    
    case 'getUnpaidBills':
      return { success: true, bills: getUnpaidBills() };
    
    case 'markBillAsPaid':
      markBillAsPaid(params.transId);
      return { success: true, message: 'Hóa đơn đã được cập nhật' };
    
    case 'getAllTenants':
      return { success: true, tenants: getAllTenants() };
    
    case 'addTenant':
      var tenantId = addTenant(params.fullName, params.phone, params.idCard, params.email, params.roomId);
      return { 
        success: true, 
        message: 'Khách hàng được thêm thành công',
        tenantId: tenantId 
      };
    
    default:
      return { success: false, message: 'Action not found: ' + action };
  }
}

// ==========================================
// TENANT FUNCTIONS
// ==========================================

/**
 * Get all tenants from database
 */
function getAllTenants() {
  var sheet = SPREADSHEET.getSheetByName(TENANTS);
  var data = sheet.getDataRange().getValues();
  
  var tenants = [];
  // Skip header row
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === '') continue; // Skip empty rows
    
    tenants.push({
      tenantId: data[i][0],
      fullName: data[i][1],
      phone: data[i][2],
      idCard: data[i][3],
      email: data[i][4],
      roomId: data[i][5],
      joinDate: data[i][6]
    });
  }
  
  return tenants;
}

/**
 * Add new tenant to database
 */
function addTenant(fullName, phone, idCard, email, roomId) {
  var sheet = SPREADSHEET.getSheetByName(TENANTS);
  var tenantId = generateId('TENANT');
  var joinDate = Utilities.formatDate(new Date(), 'GMT+7', 'dd/MM/yyyy');
  
  // Add tenant data
  sheet.appendRow([tenantId, fullName, phone, idCard, email, roomId, joinDate]);
  
  // Update room status to "Đã Cho Thuê" (Occupied)
  var roomsSheet = SPREADSHEET.getSheetByName(ROOMS);
  var roomsData = roomsSheet.getDataRange().getValues();
  
  for (var i = 1; i < roomsData.length; i++) {
    if (roomsData[i][0] === roomId) {
      roomsSheet.getRange(i + 1, 4).setValue('Đã Cho Thuê');
      break;
    }
  }
  
  return tenantId;
}
