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
var MANAGERS = 'Managers';
var PROPERTIES = 'Properties';
var ROOMS = 'Rooms';
var TENANTS = 'Tenants';
var CONTRACTS = 'Contracts';
var UTILITY_USAGE = 'UtilityUsage';
var TRANSACTIONS = 'Transactions';
var ASSETS = 'Assets';
var PAYMENT_REMINDERS = 'PaymentReminders';

// ==========================================
// DATABASE INITIALIZATION
// ==========================================

/**
 * Initialize database - Create 8 sheets with headers (Multi-Property Support)
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
      message: 'Database initialized! 8 sheets created (Multi-Property Support).'
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
 * Get all rooms for a property
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
      if (roomsData[i][4] === 'Trống') emptyRooms++;
    }
    var occupiedRooms = totalRooms - emptyRooms;
    
    var today = new Date();
    var currentMonth = today.getMonth() + 1;
    var currentYear = today.getFullYear();
    
    var monthlyRevenue = 0;
    var unpaidAmount = 0;
    
    for (var i = 0; i < transData.length; i++) {
      if (transData[i][3] == currentMonth && transData[i][4] == currentYear) {
        if (transData[i][6] === 'Đã thu') {
          monthlyRevenue += (transData[i][5] || 0);
        } else {
          unpaidAmount += (transData[i][5] || 0);
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
      if (utilityData[i][4] == roomId && utilityData[i][2] == month && utilityData[i][3] == year) {
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
        roomPrice = roomsData[i][5] || 0;
        break;
      }
    }
    
    var prevElec = utilityRow[5] || 0;
    var currElec = utilityRow[6] || 0;
    var prevWater = utilityRow[7] || 0;
    var currWater = utilityRow[8] || 0;
    
    var elecUsage = Math.max(0, currElec - prevElec);
    var waterUsage = Math.max(0, currWater - prevWater);
    
    var elecCost = elecUsage * electricPrice;
    var waterCost = waterUsage * waterPrice;
    var totalAmount = roomPrice + elecCost + waterCost;
    
    var transId = generateId('TRANS');
    transSheet.appendRow([transId, '', roomId, month, year, totalAmount, 'Chưa thu', formatDateVN(new Date())]);
    
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

// ==========================================
// MANAGER FUNCTIONS (MULTI-PROPERTY)
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
    var createdDate = Utilities.formatDate(new Date(), 'GMT+7', 'dd/MM/yyyy');
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

// ==========================================
// PROPERTY FUNCTIONS (MULTI-PROPERTY)
// ==========================================

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
    var createdDate = Utilities.formatDate(new Date(), 'GMT+7', 'dd/MM/yyyy');
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
 * Get all properties for a manager
 */
function getPropertiesByManager(managerId) {
  try {
    var propertiesSheet = SPREADSHEET.getSheetByName(PROPERTIES);
    if (!propertiesSheet) {
      return { success: false, message: 'Properties sheet not found' };
    }
    
    var data = propertiesSheet.getDataRange().getValues();
    var properties = [];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === '') continue;
      if (data[i][1] === managerId) {
        properties.push({
          propertyId: data[i][0],
          managerId: data[i][1],
          propertyName: data[i][2],
          address: data[i][3],
          totalRooms: data[i][4],
          createdDate: data[i][5]
        });
      }
    }
    
    return { success: true, properties: properties, count: properties.length };
  } catch (error) {
    Logger.log('Error in getPropertiesByManager: ' + error.toString());
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
// PAYMENT REMINDER SYSTEM (EMAIL)
// ==========================================

/**
 * Setup automatic payment reminder trigger
 * RUN THIS ONCE to enable automatic emails
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
 * Format currency (VND)
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

/**
 * Manually send payment reminder to specific tenant (for testing)
 */
function sendManualPaymentReminder(tenantId) {
  try {
    var tenantsSheet = SPREADSHEET.getSheetByName(TENANTS);
    var transSheet = SPREADSHEET.getSheetByName(TRANSACTIONS);
    
    if (!tenantsSheet || !transSheet) {
      return { success: false, message: 'Sheets not found' };
    }
    
    var tenantsData = tenantsSheet.getDataRange().getValues();
    var transData = transSheet.getDataRange().getValues();
    
    var tenantInfo = null;
    
    // Find tenant
    for (var i = 1; i < tenantsData.length; i++) {
      if (tenantsData[i][0] === tenantId) {
        tenantInfo = {
          id: tenantsData[i][0],
          name: tenantsData[i][2],
          email: tenantsData[i][5],
          roomId: tenantsData[i][6]
        };
        break;
      }
    }
    
    if (!tenantInfo) {
      return { success: false, message: 'Tenant not found' };
    }
    
    // Find unpaid bills
    var unpaidBills = [];
    for (var j = 1; j < transData.length; j++) {
      if (transData[j][2] === tenantInfo.roomId && transData[j][6] === 'Chưa thu') {
        unpaidBills.push({
          month: transData[j][3],
          year: transData[j][4],
          amount: transData[j][5],
          transId: transData[j][0]
        });
      }
    }
    
    if (unpaidBills.length === 0) {
      return { success: false, message: 'No unpaid bills found for this tenant' };
    }
    
    return sendPaymentReminderEmail(tenantInfo.id, tenantInfo.name, tenantInfo.email, unpaidBills);
  } catch (error) {
    Logger.log('Error in sendManualPaymentReminder: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

/**
 * Get payment reminder history
 */
function getPaymentReminderHistory(tenantId) {
  try {
    var remindersSheet = SPREADSHEET.getSheetByName(PAYMENT_REMINDERS);
    if (!remindersSheet) {
      return { success: false, message: 'PaymentReminders sheet not found' };
    }
    
    var data = remindersSheet.getDataRange().getValues();
    var history = [];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === '') continue;
      if (data[i][1] === tenantId) {
        history.push({
          reminderId: data[i][0],
          tenantId: data[i][1],
          month: data[i][2],
          year: data[i][3],
          reminderType: data[i][4],
          scheduledDate: data[i][5],
          status: data[i][6],
          sentDate: data[i][7],
          response: data[i][9]
        });
      }
    }
    
    return { success: true, history: history, count: history.length };
  } catch (error) {
    Logger.log('Error in getPaymentReminderHistory: ' + error.toString());
    return { success: false, message: 'Error: ' + error.toString() };
  }
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

/**
 * Handle CORS preflight requests (OPTIONS)
 * Required for browser CORS policy
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
 * Handle POST requests from frontend
 * Endpoint: POST /exec
 * Body: form-urlencoded with action and params
 */
function doPost(e) {
  try {
    // Parse form-urlencoded data instead of JSON
    var action = e.parameter.action;
    var params = {};
    
    if (e.parameter.params) {
      params = JSON.parse(e.parameter.params);
    }
    
    var result = apiRouter(action, params);
    
    var output = ContentService.createTextOutput(JSON.stringify(result));
    output.setMimeType(ContentService.MimeType.JSON);
    
    // Add CORS headers to response
    output.setHeader('Access-Control-Allow-Origin', '*');
    output.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    output.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return output;
  } catch (error) {
    var output = ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error: ' + error.toString()
    }));
    output.setMimeType(ContentService.MimeType.JSON);
    
    // Add CORS headers to error response
    output.setHeader('Access-Control-Allow-Origin', '*');
    output.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    output.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return output;
  }
}

/**
 * API Router - Route requests to appropriate functions
 */
function apiRouter(action, params) {
  switch(action) {
    // Manager functions
    case 'addManager':
      return addManager(params.managerName, params.email, params.phone);
    
    case 'getAllManagers':
      return getAllManagers();
    
    // Property functions
    case 'addProperty':
      return addProperty(params.managerId, params.propertyName, params.address, params.totalRooms);
    
    case 'getPropertiesByManager':
      return getPropertiesByManager(params.managerId);
    
    case 'getAllProperties':
      return getAllProperties();
    
    // Dashboard
    case 'getDashboardStats':
      var stats = getDashboardStats();
      return stats;
    
    // Room functions
    case 'getAllRooms':
      return getAllRooms();
    
    case 'getRoomsByProperty':
      return getRoomsByProperty(params.propertyId);
    
    case 'addRoom':
      return addRoom(params.propertyId, params.roomName, params.floor, params.price, params.description);
    
    case 'submitUtilityReading':
      submitUtilityReading(params.roomId, params.currentElec, params.currentWater, params.phone);
      return { success: true, message: 'Báo cáo được lưu thành công' };
    
    case 'getUnpaidBills':
      return { success: true, bills: getUnpaidBills() };
    
    case 'markBillAsPaid':
      markBillAsPaid(params.transId);
      return { success: true, message: 'Hóa đơn đã được cập nhật' };
    
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
    
    case 'sendManualPaymentReminder':
      return sendManualPaymentReminder(params.tenantId);
    
    case 'getPaymentReminderHistory':
      return getPaymentReminderHistory(params.tenantId);
    
    case 'sendTestEmail':
      return sendTestEmail(params.email);
    
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
      propertyId: data[i][1],
      fullName: data[i][2],
      phone: data[i][3],
      idCard: data[i][4],
      email: data[i][5],
      roomId: data[i][6],
      paymentReminderDay: data[i][7] || 25,
      joinDate: data[i][8]
    });
  }
  
  return { success: true, tenants: tenants, count: tenants.length };
}

/**
 * Add new tenant to database
 */
function addTenant(fullName, phone, idCard, email, roomId) {
  var sheet = SPREADSHEET.getSheetByName(TENANTS);
  var roomsSheet = SPREADSHEET.getSheetByName(ROOMS);
  
  var tenantId = generateId('TENANT');
  var joinDate = Utilities.formatDate(new Date(), 'GMT+7', 'dd/MM/yyyy');
  
  // Find PropertyID from RoomID
  var propertyId = '';
  var roomsData = roomsSheet.getDataRange().getValues();
  for (var k = 1; k < roomsData.length; k++) {
    if (roomsData[k][0] === roomId) {
      propertyId = roomsData[k][1];
      break;
    }
  }
  
  // Add tenant data with PropertyID and PaymentReminderDay (default 25)
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
}
