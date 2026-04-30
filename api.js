// ========== API CONFIGURATION ==========
// Use Vercel proxy endpoint (Vercel forwards to Google Apps Script with CORS headers)
const API_URL = window.CONFIG?.API_URL || '/api/proxy';
const FALLBACK_API_URL = window.CONFIG?.DIRECT_API_URL || 'https://script.google.com/macros/s/AKfycbyt_N5TNEiCZ5VAxaP0wegFOWsEg46ePhrScpifqFjAhUnd7fR_GqVlx3vl--lYBBDy/exec';

// ========== API HELPER FUNCTION ==========
async function callApi(functionName, params = {}) {
    if (!API_URL) {
        console.error('❌ API URL not configured. Please set it in config.js');
        alert('❌ Lỗi: Vui lòng cấu hình API URL\n\nHướng dẫn:\n1. Mở file config.js\n2. Thay GAS_API_URL bằng URL của Google Apps Script Web App của bạn');
        return { success: false, message: 'API không được cấu hình' };
    }

    try {
        console.log(`📡 [Frontend] Calling API: ${functionName}`);
        console.log(`📡 [Frontend] Parameters:`, params);
        
        // Validate params are not undefined
        for (const [key, value] of Object.entries(params)) {
            if (value === undefined) {
                console.warn(`⚠️ [Frontend] Parameter '${key}' is undefined!`);
            }
        }
        
        // Use form-urlencoded to avoid CORS preflight OPTIONS request
        const body = new URLSearchParams();
        body.append('action', functionName);
        body.append('params', JSON.stringify(params));
        
        console.log(`📡 [Frontend] Sending to: ${API_URL}`);
        console.log(`📡 [Frontend] Body preview: ${body.toString().substring(0, 100)}...`);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            body: body,
            headers: {
                // Content-Type will be auto-set by URLSearchParams
            }
        });

        console.log(`📡 [Frontend] Response status: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ [Frontend] HTTP Error ${response.status}:`, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
        }

        // Handle both JSON and text responses
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('❌ Response is not JSON:', text);
                throw new Error('Server returned non-JSON response: ' + text.substring(0, 200));
            }
        }

        console.log(`✅ [Frontend] API Response:`, data);
        return data;
    } catch (error) {
        console.error('❌ [Frontend] API Error:', error.message);
        console.error('❌ [Frontend] Error Stack:', error.stack);
        return { success: false, message: 'Lỗi kết nối API: ' + error.message };
    }
}

// ========== TAB MANAGEMENT ==========
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = link.getAttribute('data-tab');
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Update nav active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-tab') === tabName) {
            link.classList.add('active');
        }
    });
    
    // Load data for tab
    if (tabName === 'dashboard') loadDashboard();
    else if (tabName === 'rooms') loadRooms();
    else if (tabName === 'bills') loadBills();
    else if (tabName === 'utilities') loadUtilityRooms();
}

// ========== DASHBOARD ==========
async function loadDashboard() {
    try {
        console.log('📊 Loading dashboard...');
        const data = await callApi('getDashboardStats');
        
        // Enhanced error checking with detailed logging
        if (!data) {
            console.error('❌ Failed to load dashboard: No data returned from API');
            return;
        }
        
        console.log('📊 API Response structure:', {
            success: data?.success,
            hasStats: !!data?.stats,
            statsKeys: Object.keys(data?.stats || {})
        });
        
        if (data.success && data.stats) {
            // Use optional chaining (?.) to safely access nested properties
            const stats = data.stats;
            const totalRooms = stats?.totalRooms ?? 0;
            const occupiedRooms = stats?.occupiedRooms ?? 0;
            const unpaidCount = stats?.unpaidCount ?? 0;
            const monthlyRevenue = stats?.monthlyRevenue ?? 0;
            
            // Update UI with data (with fallback values)
            document.getElementById('totalRooms').textContent = totalRooms;
            document.getElementById('occupiedRooms').textContent = occupiedRooms;
            document.getElementById('unpaidCount').textContent = unpaidCount;
            
            // Format revenue: 1000000+ shows as "M", others as "K"
            const formattedRevenue = monthlyRevenue >= 1000000 
                ? (monthlyRevenue / 1000000).toFixed(1) + 'M' 
                : (monthlyRevenue / 1000).toFixed(0) + 'K';
            document.getElementById('monthlyRevenue').textContent = formattedRevenue;
            
            console.log(`✅ Dashboard loaded successfully - Rooms: ${totalRooms}, Occupied: ${occupiedRooms}, Unpaid: ${unpaidCount}, Revenue: ${formattedRevenue}`);
        } else {
            const errorMsg = data?.message || 'Unknown error';
            console.error(`❌ Failed to load dashboard: ${errorMsg}`);
            console.error('❌ Response data:', data);
            
            // Set default values on error
            document.getElementById('totalRooms').textContent = '-';
            document.getElementById('occupiedRooms').textContent = '-';
            document.getElementById('unpaidCount').textContent = '-';
            document.getElementById('monthlyRevenue').textContent = '-';
        }
    } catch (error) {
        console.error('❌ Dashboard loading error:', error);
        console.error('❌ Error stack:', error.stack);
        
        // Set default values on exception
        document.getElementById('totalRooms').textContent = '-';
        document.getElementById('occupiedRooms').textContent = '-';
        document.getElementById('unpaidCount').textContent = '-';
        document.getElementById('monthlyRevenue').textContent = '-';
    }
}

// ========== ROOMS ==========
async function loadRooms() {
    console.log('🚪 Loading rooms...');
    const data = await callApi('getAllRooms');
    
    if (data.success && data.rooms) {
        let html = '';
        if (data.rooms.length === 0) {
            html = '<tr><td colspan="6" class="text-center py-3 text-muted">Không có dữ liệu</td></tr>';
        } else {
            data.rooms.forEach(room => {
                const statusBadge = room.status === 'Trống' 
                    ? '<span class="badge bg-success">Trống</span>' 
                    : '<span class="badge bg-warning">Đã Cho Thuê</span>';
                html += `
                    <tr>
                        <td><small class="text-muted">${room.roomId || '-'}</small></td>
                        <td><strong>${room.roomName || '-'}</strong></td>
                        <td>${room.floor || '-'}</td>
                        <td>${statusBadge}</td>
                        <td>${(room.price || 0).toLocaleString('vi-VN')}</td>
                        <td>${room.description || '-'}</td>
                    </tr>
                `;
            });
        }
        document.getElementById('roomsTable').innerHTML = html;
    }
}

function openAddRoomModal() {
    const modal = new bootstrap.Modal(document.getElementById('addRoomModal'));
    modal.show();
}

async function addNewRoom() {
    const name = document.getElementById('roomName').value?.trim();
    const floor = document.getElementById('roomFloor').value;
    const price = document.getElementById('roomPrice').value;
    const desc = document.getElementById('roomDescription').value?.trim();

    if (!name || !floor || !price) {
        alert('⚠️ Vui lòng điền đầy đủ thông tin (Tên, Tầng, Giá)');
        return;
    }

    const data = await callApi('addRoom', {
        propertyId: 'DEFAULT',  // Single property mode
        roomName: name,
        floor: parseInt(floor),
        price: parseFloat(price),
        description: desc
    });

    if (data.success) {
        alert('✅ Phòng được thêm thành công: ' + data.roomId);
        bootstrap.Modal.getInstance(document.getElementById('addRoomModal')).hide();
        
        // Clear form
        document.getElementById('roomName').value = '';
        document.getElementById('roomFloor').value = '';
        document.getElementById('roomPrice').value = '';
        document.getElementById('roomDescription').value = '';
        
        loadRooms();
    } else {
        alert('❌ Lỗi: ' + (data.message || 'Không thể thêm phòng'));
    }
}

// ========== UTILITIES ==========
async function loadUtilityRooms() {
    console.log('⚡ Loading utility rooms...');
    const data = await callApi('getAllRooms');
    
    if (data.success && data.rooms) {
        let options = '<option value="">-- Chọn Phòng --</option>';
        data.rooms.forEach(room => {
            options += `<option value="${room.roomId}">${room.roomName} (${(room.price || 0).toLocaleString('vi-VN')} đ)</option>`;
        });
        document.getElementById('utilityRoomId').innerHTML = options;
    }
}

async function submitUtilityReading() {
    const roomId = document.getElementById('utilityRoomId').value?.trim();
    const elec = document.getElementById('currentElec').value;
    const water = document.getElementById('currentWater').value;

    if (!roomId || !elec || !water) {
        alert('⚠️ Vui lòng điền đầy đủ thông tin');
        return;
    }

    const data = await callApi('submitUtilityReading', {
        roomId: roomId,
        currentElec: parseInt(elec),
        currentWater: parseInt(water),
        phone: ''
    });

    if (data.success) {
        alert('✅ Báo cáo được lưu thành công');
        document.getElementById('currentElec').value = '';
        document.getElementById('currentWater').value = '';
        document.getElementById('utilityRoomId').value = '';
    } else {
        alert('❌ Lỗi: ' + (data.message || 'Không thể lưu báo cáo'));
    }
}

// ========== BILLS ==========
async function loadBills() {
    console.log('💰 Loading bills...');
    const data = await callApi('getUnpaidBills');
    
    if (data.success && data.bills && data.bills.reminders) {
        let html = '';
        if (data.bills.reminders.length === 0) {
            html = '<tr><td colspan="7" class="text-center py-3 text-muted">Tất cả hóa đơn đã được thanh toán ✅</td></tr>';
        } else {
            data.bills.reminders.forEach(bill => {
                html += `
                    <tr>
                        <td><small class="text-muted">${bill.transId || '-'}</small></td>
                        <td>${bill.roomId || '-'}</td>
                        <td><strong>${bill.tenantName || '-'}</strong></td>
                        <td><strong class="text-danger">${(bill.amount || 0).toLocaleString('vi-VN')} đ</strong></td>
                        <td>${bill.month}/${bill.year}</td>
                        <td><span class="badge bg-warning">Chưa Thu</span></td>
                        <td>
                            <button class="btn btn-sm btn-success" onclick="markBillPaid('${bill.transId}')">
                                <i class="fas fa-check"></i> Thu
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
        document.getElementById('billsTable').innerHTML = html;
    }
}

async function markBillPaid(transId) {
    if (confirm('✓ Xác nhận hóa đơn này đã được thanh toán?')) {
        const data = await callApi('markBillAsPaid', { transId: transId });
        
        if (data.success) {
            alert('✅ Hóa đơn đã được cập nhật');
            loadBills();
        } else {
            alert('❌ Lỗi: ' + (data.message || 'Không thể cập nhật hóa đơn'));
        }
    }
}

// ========== TENANTS ==========
async function loadTenants() {
    console.log('👥 Loading tenants...');
    const data = await callApi('getAllTenants');
    
    if (data.success && data.tenants) {
        let html = '';
        if (data.tenants.length === 0) {
            html = '<tr><td colspan="7" class="text-center py-3 text-muted">Không có dữ liệu</td></tr>';
        } else {
            data.tenants.forEach(tenant => {
                html += `
                    <tr>
                        <td><small class="text-muted">${tenant.tenantId || '-'}</small></td>
                        <td><strong>${tenant.fullName || '-'}</strong></td>
                        <td>${tenant.phone || '-'}</td>
                        <td><small>${tenant.idCard || '-'}</small></td>
                        <td><small>${tenant.email || '-'}</small></td>
                        <td>${tenant.roomId || '-'}</td>
                        <td><small>${tenant.joinDate || '-'}</small></td>
                    </tr>
                `;
            });
        }
        document.getElementById('tenantsTable').innerHTML = html;
    }
}

async function loadTenantRooms() {
    const data = await callApi('getAllRooms');
    if (data.success && data.rooms) {
        let options = '<option value="">-- Chọn Phòng --</option>';
        data.rooms.forEach(room => {
            options += `<option value="${room.roomId}">${room.roomName}</option>`;
        });
        document.getElementById('tenantRoomId').innerHTML = options;
    }
}

function openAddTenantModal() {
    loadTenantRooms();
    const modal = new bootstrap.Modal(document.getElementById('addTenantModal'));
    modal.show();
}

async function addNewTenant() {
    const name = document.getElementById('tenantName').value?.trim();
    const phone = document.getElementById('tenantPhone').value?.trim();
    const idCard = document.getElementById('tenantIdCard').value?.trim();
    const email = document.getElementById('tenantEmail').value?.trim();
    const roomId = document.getElementById('tenantRoomId').value?.trim();

    if (!name || !phone || !roomId) {
        alert('⚠️ Vui lòng điền đầy đủ thông tin (Tên, Số điện thoại, Phòng)');
        return;
    }

    const data = await callApi('addTenant', {
        fullName: name,
        phone: phone,
        idCard: idCard,
        email: email,
        roomId: roomId
    });

    if (data.success) {
        alert('✅ Khách hàng được thêm thành công');
        bootstrap.Modal.getInstance(document.getElementById('addTenantModal')).hide();
        
        document.getElementById('tenantName').value = '';
        document.getElementById('tenantPhone').value = '';
        document.getElementById('tenantIdCard').value = '';
        document.getElementById('tenantEmail').value = '';
        document.getElementById('tenantRoomId').value = '';
        
        loadTenants();
    } else {
        alert('❌ Lỗi: ' + (data.message || 'Không thể thêm khách hàng'));
    }
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏠 House Management System - Vercel Edition initialized');
    console.log('📡 API URL:', API_URL || '⚠️ NOT CONFIGURED - See config.js');
    
    if (!API_URL) {
        console.warn('⚠️ WARNING: API_URL is not set. Frontend will not work until configured.');
        console.warn('📍 Please update config.js with your Google Apps Script Web App URL');
    }
    
    loadDashboard();
});
