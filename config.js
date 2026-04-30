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
    // 2. Click Deploy button
    // 3. If already deployed: Click "Manage deployments" → Click latest → Click "Deploy new version"
    // 4. If not deployed: Click "Deploy" → New deployment
    //    - Select type: Web app
    //    - Execute as: Your email
    //    - Allow access to: Anyone
    //    - Click Deploy and copy the URL
    // 5. Replace the URL below with your deployment URL
    API_URL: 'https://script.google.com/macros/s/AKfycbyh5yA8JF_SNK6ncaAXEyhD5AhXMObU9dI4tm8DrDhyvOBKsJcozS5FajXUZj8ML2_YAg/usercodeapp',
    
    // 🏢 Spreadsheet name (should be "HOUSE-MANAGEMENT")
    SPREADSHEET_NAME: 'HOUSE-MANAGEMENT',
    
    // 💱 Utility prices (edit these to match your rates)
    ELECTRIC_PRICE: 3000,  // VNĐ per kWh
    WATER_PRICE: 5000,     // VNĐ per m³
};

console.log('⚙️ Config loaded');
console.log('API URL:', window.CONFIG.API_URL);
