/**
 * Configuration for House Management System
 * 
 * ⚠️ IMPORTANT: Two deployment modes supported:
 * 1. GAS Web App (frontend served by GAS): Use './exec'
 * 2. Vercel + Proxy (separate frontend): Use '/api/proxy'
 */

window.CONFIG = {
    // 🎯 VERCEL MODE: Use /api/proxy to forward requests through Vercel serverless function
    // 🎯 GAS MODE: Use './exec' if frontend is served from Google Apps Script domain
    API_URL: '/api/proxy',  // ✅ CORRECT for Vercel deployment
    
    // Fallback: Direct GAS URL (if you want to bypass proxy)
    DIRECT_API_URL: 'https://script.google.com/macros/s/AKfycbyt_N5TNEiCZ5VAxaP0wegFOWsEg46ePhrScpifqFjAhUnd7fR_GqVlx3vl--lYBBDy/exec',
    
    // Spreadsheet name
    SPREADSHEET_NAME: 'HOUSE-MANAGEMENT',
    
    // Utility prices
    ELECTRIC_PRICE: 3000,  // VNĐ per kWh
    WATER_PRICE: 5000,     // VNĐ per m³
};

console.log('⚙️ Config loaded');
console.log('API URL:', window.CONFIG.API_URL);
console.log('📍 Environment: Vercel + Proxy mode');
