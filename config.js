/**
 * Configuration for House Management System
 * 
 * ⚠️ IMPORTANT: You must set your Google Apps Script Web App URL below
 */

window.CONFIG = {
    // 🔗 API URL: Use Vercel proxy to avoid CORS issues
    // Proxy forwards requests to Google Apps Script backend
    API_URL: '/api/proxy',
    
    // Fallback to direct Google Apps Script (for local testing without Vercel)
    DIRECT_API_URL: 'https://script.google.com/macros/s/AKfycbyt_N5TNEiCZ5VAxaP0wegFOWsEg46ePhrScpifqFjAhUnd7fR_GqVlx3vl--lYBBDy/exec',
    
    // 🏢 Spreadsheet name (should be "HOUSE-MANAGEMENT")
    SPREADSHEET_NAME: 'HOUSE-MANAGEMENT',
    
    // 💱 Utility prices (edit these to match your rates)
    ELECTRIC_PRICE: 3000,  // VNĐ per kWh
    WATER_PRICE: 5000,     // VNĐ per m³
};

console.log('⚙️ Config loaded');
console.log('API URL:', window.CONFIG.API_URL);
