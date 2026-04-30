/**
 * Configuration for House Management System
 * 
 * ⚠️ IMPORTANT: You must set your Google Apps Script Web App URL below
 */

window.CONFIG = {
    // 🔗 Your Google Apps Script Web App deployment URL
    // Format: https://script.google.com/macros/s/{SCRIPT_ID}/usercodeapp
    // 
    // How to get this URL:
    // 1. Open Google Apps Script editor (Extensions → Apps Script)
    // 2. Click Deploy → New deployment
    // 3. Select type: Web app
    // 4. Execute as: Your email
    // 5. Allow access to: Anyone
    // 6. Deploy and copy the URL
    API_URL: 'https://script.google.com/macros/s/AKfycbzHZ543AvL4jHzodlun3qbc8qa2RoBAFvVL_9laGZUqNmI_a32pIN6iPjPsA2MHoyeeiw/exec',
    
    // 🏢 Spreadsheet name (should be "HOUSE-MANAGEMENT")
    SPREADSHEET_NAME: 'HOUSE-MANAGEMENT',
    
    // 💱 Utility prices (edit these to match your rates)
    ELECTRIC_PRICE: 3000,  // VNĐ per kWh
    WATER_PRICE: 5000,     // VNĐ per m³
};

console.log('⚙️ Config loaded');
