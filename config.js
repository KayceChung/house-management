/**
 * Configuration for House Management System
 * 
 * ⚠️ IMPORTANT: You must set your Google Apps Script Web App URL below
 */

window.CONFIG = {
    // 🎯 Deploy on Google Apps Script = NO CORS!
    // Use relative URL './exec' to call doPost() on same domain
    API_URL: './exec',
    
    // Spreadsheet name
    SPREADSHEET_NAME: 'HOUSE-MANAGEMENT',
    
    // Utility prices
    ELECTRIC_PRICE: 3000,  // VNĐ per kWh
    WATER_PRICE: 5000,     // VNĐ per m³
};

console.log('⚙️ Config loaded');
console.log('API URL:', window.CONFIG.API_URL);
