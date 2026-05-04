// ========== API CONFIGURATION ==========
// Use Vercel proxy endpoint (Vercel forwards to Google Apps Script with CORS headers)
const API_URL = window.CONFIG?.API_URL || '/api/proxy';
const FALLBACK_API_URL = window.CONFIG?.DIRECT_API_URL || 'https://script.google.com/macros/s/AKfycbyGjeIv9o8ZquGLDoNuHIAhJnOiTrjCzng734KZMPfICBVOhJXUQhcwrKmu4WTF-pmFfA/exec';

// ========== PROPERTY STATE ==========
const DEFAULT_PROPERTY_ID = 'DEFAULT';
let cachedProperties = [];

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
    else if (tabName === 'tenants') loadTenants();
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
            
            // Load and render charts & widgets
            loadEnhancedDashboard();
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
    await loadPropertyOptions();

    const selectedPropertyId = document.getElementById('roomsPropertyFilter')?.value || 'ALL';
    const data = selectedPropertyId === 'ALL'
        ? await callApi('getAllRooms')
        : await callApi('getRoomsByProperty', { propertyId: selectedPropertyId });
    
    if (data.success && data.rooms) {
        const rooms = [...data.rooms].sort((a, b) => {
            const propertyA = (getPropertyNameById(a.propertyId) || '').toString();
            const propertyB = (getPropertyNameById(b.propertyId) || '').toString();
            const compareProperty = propertyA.localeCompare(propertyB, 'vi');
            if (compareProperty !== 0) return compareProperty;

            const roomNameA = (a.roomName || '').toString();
            const roomNameB = (b.roomName || '').toString();
            return roomNameA.localeCompare(roomNameB, 'vi');
        });

        let html = '';
        if (rooms.length === 0) {
            html = '<tr><td colspan="7" class="text-center py-3 text-muted">Không có dữ liệu</td></tr>';
        } else {
            rooms.forEach(room => {
                const propertyName = getPropertyNameById(room.propertyId);
                const statusBadge = room.status === 'Trống' 
                    ? '<span class="badge bg-success">Trống</span>' 
                    : '<span class="badge bg-warning">Đã Cho Thuê</span>';
                html += `
                    <tr>
                        <td><small class="text-muted">${room.roomId || '-'}</small></td>
                        <td>${propertyName}</td>
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
    loadPropertyOptions().then(() => {
        const modal = new bootstrap.Modal(document.getElementById('addRoomModal'));
        modal.show();
    });
}

async function loadPropertyOptions() {
    const data = await callApi('getAllProperties');

    if (data.success && Array.isArray(data.properties)) {
        cachedProperties = data.properties;
    } else {
        cachedProperties = [];
    }

    renderPropertyOptions('roomsPropertyFilter', { includeAll: true, keepCurrentSelection: true });
    renderPropertyOptions('roomPropertyId', { includeAll: false, keepCurrentSelection: true });
}

function getPropertyNameById(propertyId) {
    if (!propertyId || propertyId === DEFAULT_PROPERTY_ID) {
        return 'Mặc định';
    }

    const found = cachedProperties.find(property => property.propertyId === propertyId);
    return found ? (found.propertyName || propertyId) : propertyId;
}

function renderPropertyOptions(selectId, options = {}) {
    const { includeAll = false, keepCurrentSelection = false } = options;
    const select = document.getElementById(selectId);
    if (!select) return;

    const currentValue = keepCurrentSelection ? select.value : '';
    let html = '';

    if (includeAll) {
        html += '<option value="ALL">-- Tất cả tài sản --</option>';
    }

    if (cachedProperties.length > 0) {
        cachedProperties.forEach(property => {
            html += `<option value="${property.propertyId}">${property.propertyName || property.propertyId}</option>`;
        });
    }

    html += `<option value="${DEFAULT_PROPERTY_ID}">Mặc định</option>`;

    select.innerHTML = html;

    if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) {
        select.value = currentValue;
    } else {
        select.value = includeAll ? 'ALL' : DEFAULT_PROPERTY_ID;
    }
}

function handleRoomPropertyFilterChange() {
    loadRooms();
}

async function addNewRoom() {
    const propertyId = document.getElementById('roomPropertyId').value || DEFAULT_PROPERTY_ID;
    const name = document.getElementById('roomName').value?.trim();
    const floor = document.getElementById('roomFloor').value;
    const price = document.getElementById('roomPrice').value;
    const desc = document.getElementById('roomDescription').value?.trim();

    if (!name || !floor || !price) {
        alert('⚠️ Vui lòng điền đầy đủ thông tin (Tên, Tầng, Giá)');
        return;
    }

    const data = await callApi('addRoom', {
        propertyId: propertyId,
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
        document.getElementById('roomPropertyId').value = DEFAULT_PROPERTY_ID;
        
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
    
    // Show loading state
    const tenantsTable = document.getElementById('tenantsTable');
    if (tenantsTable) {
        tenantsTable.innerHTML = '<tr><td colspan="7" class="text-center py-3"><div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>';
    }
    
    try {
        const data = await callApi('getAllTenants');
        
        if (!data) {
            throw new Error('Không nhận được dữ liệu từ API');
        }
        
        if (data.success && data.tenants) {
            let html = '';
            if (data.tenants.length === 0) {
                html = '<tr><td colspan="7" class="text-center py-3 text-muted"><i class="fas fa-inbox"></i> Không có dữ liệu khách thuê</td></tr>';
                console.log('ℹ️ Danh sách khách hàng trống');
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
                console.log(`✅ Đã tải ${data.tenants.length} khách hàng`);
            }
            
            if (tenantsTable) {
                tenantsTable.innerHTML = html;
            }
        } else {
            const errorMsg = data?.message || 'Lỗi không xác định';
            console.error(`❌ Lỗi từ API: ${errorMsg}`);
            if (tenantsTable) {
                tenantsTable.innerHTML = `<tr><td colspan="7" class="text-center py-3 text-danger"><i class="fas fa-exclamation-circle"></i> Lỗi: ${errorMsg}</td></tr>`;
            }
        }
    } catch (error) {
        console.error('❌ Lỗi khi tải danh sách khách hàng:', error);
        if (tenantsTable) {
            tenantsTable.innerHTML = `<tr><td colspan="7" class="text-center py-3 text-danger"><i class="fas fa-exclamation-circle"></i> Lỗi: ${error.message}</td></tr>`;
        }
    }
}

async function loadTenantRooms() {
    console.log('🚪 Loading available rooms for tenant...');
    
    try {
        const data = await callApi('getAllRooms');
        
        if (!data) {
            throw new Error('Không nhận được dữ liệu phòng từ API');
        }
        
        if (data.success && data.rooms) {
            let options = '<option value="">-- Chọn Phòng Còn Trống --</option>';
            
            // Filter để chỉ hiển thị phòng "Trống"
            const availableRooms = data.rooms.filter(room => room.status === 'Trống');
            
            if (availableRooms.length === 0) {
                options = '<option value="">-- Không có phòng còn trống --</option>';
                console.warn('⚠️ Không có phòng nào còn trống');
            } else {
                availableRooms.forEach(room => {
                    const price = (room.price || 0).toLocaleString('vi-VN');
                    options += `<option value="${room.roomId}">${room.roomName} - ${price}đ</option>`;
                });
                console.log(`✅ Đã tải ${availableRooms.length} phòng còn trống`);
            }
            
            const roomSelect = document.getElementById('tenantRoomId');
            if (roomSelect) {
                roomSelect.innerHTML = options;
            }
        } else {
            const errorMsg = data?.message || 'Lỗi không xác định';
            console.error(`❌ Lỗi từ API: ${errorMsg}`);
            const roomSelect = document.getElementById('tenantRoomId');
            if (roomSelect) {
                roomSelect.innerHTML = '<option value="">-- Lỗi tải danh sách phòng --</option>';
            }
        }
    } catch (error) {
        console.error('❌ Lỗi khi tải danh sách phòng:', error);
        const roomSelect = document.getElementById('tenantRoomId');
        if (roomSelect) {
            roomSelect.innerHTML = '<option value="">-- Lỗi tải danh sách phòng --</option>';
        }
    }
}

function openAddTenantModal() {
    console.log('📝 Opening Add Tenant Modal...');
    
    // Xóa dữ liệu cũ trong form
    document.getElementById('tenantName').value = '';
    document.getElementById('tenantPhone').value = '';
    document.getElementById('tenantIdCard').value = '';
    document.getElementById('tenantEmail').value = '';
    document.getElementById('tenantRoomId').value = '';
    
    // Tải danh sách phòng còn trống
    loadTenantRooms();
    
    // Hiển thị modal
    const modalElement = document.getElementById('addTenantModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        console.log('✅ Modal opened');
    } else {
        console.error('❌ Modal element not found: #addTenantModal');
    }
}

async function addNewTenant() {
    console.log('➕ Adding new tenant...');
    
    const name = document.getElementById('tenantName').value?.trim();
    const phone = document.getElementById('tenantPhone').value?.trim();
    const idCard = document.getElementById('tenantIdCard').value?.trim();
    const email = document.getElementById('tenantEmail').value?.trim();
    const roomId = document.getElementById('tenantRoomId').value?.trim();

    // Kiểm tra dữ liệu bắt buộc
    if (!name || !phone || !roomId) {
        console.warn('⚠️ Dữ liệu không đầy đủ:', { name, phone, roomId });
        alert('⚠️ Vui lòng điền đầy đủ thông tin (Tên, Số điện thoại, Phòng)');
        return;
    }

    console.log('📡 Sending tenant data:', { fullName: name, phone, idCard, email, roomId });

    try {
        const data = await callApi('addTenant', {
            fullName: name,
            phone: phone,
            idCard: idCard,
            email: email,
            roomId: roomId
        });

        if (!data) {
            throw new Error('Không nhận được phản hồi từ API');
        }

        if (data.success) {
            console.log('✅ Khách hàng được thêm thành công:', data.tenantId);
            alert('✅ Khách hàng ' + name + ' được thêm thành công!');
            
            // Đóng modal
            const modalElement = document.getElementById('addTenantModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                }
            }
            
            // Xóa form
            document.getElementById('tenantName').value = '';
            document.getElementById('tenantPhone').value = '';
            document.getElementById('tenantIdCard').value = '';
            document.getElementById('tenantEmail').value = '';
            document.getElementById('tenantRoomId').value = '';
            
            // Tải lại danh sách
            loadTenants();
        } else {
            const errorMsg = data?.message || 'Lỗi không xác định';
            console.error('❌ Lỗi từ API:', errorMsg);
            alert('❌ Lỗi: ' + errorMsg);
        }
    } catch (error) {
        console.error('❌ Lỗi khi thêm khách hàng:', error);
        alert('❌ Lỗi: ' + error.message);
    }
}

// ========== ENHANCED DASHBOARD WITH CHARTS & WIDGETS ==========

/**
 * Load enhanced dashboard with all charts and widgets
 */
async function loadEnhancedDashboard() {
    try {
        console.log('📊 Loading enhanced dashboard with charts...');
        
        // Get monthly revenue data
        const revenueData = await callApi('getMonthlyRevenue', { months: 12 });
        if (revenueData.success && revenueData.data) {
            renderMonthlyRevenueChart(revenueData.data);
        }
        
        // Get room status
        const roomStatusData = await callApi('getRoomStatusStats');
        if (roomStatusData.success && roomStatusData.data) {
            renderRoomStatusChart(roomStatusData.data);
        }
        
        // Get overdue invoices
        const overdueData = await callApi('getOverdueInvoices', { daysThreshold: 30 });
        if (overdueData.success && overdueData.data) {
            renderOverdueInvoicesWidget(overdueData.data);
        }
        
        // Get total debt
        const debtData = await callApi('getTotalDebt');
        if (debtData.success && debtData.data) {
            renderDebtSummaryWidget(debtData.data);
        }
        
        console.log('✅ Enhanced dashboard loaded successfully');
    } catch (error) {
        console.error('❌ Error loading enhanced dashboard:', error);
    }
}

/**
 * Render monthly revenue chart (12 months)
 */
function renderMonthlyRevenueChart(data) {
    try {
        if (!data || data.length === 0) {
            document.getElementById('revenueChart').innerHTML = '<div class="text-center text-muted py-5">Chưa có dữ liệu doanh thu</div>';
            return;
        }
        
        const labels = data.map(item => item.monthLabel);
        const series = [{
            name: 'Doanh Thu (triệu đ)',
            data: data.map(item => (item.revenue / 1000000).toFixed(1))
        }];
        
        const options = {
            chart: {
                type: 'area',
                height: 300,
                toolbar: { show: false },
                animations: { enabled: true }
            },
            colors: ['#3498db'],
            dataLabels: { enabled: false },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.45,
                    opacityTo: 0.05,
                    stops: [20, 100, 100, 100]
                }
            },
            xaxis: { categories: labels },
            yaxis: {
                title: { text: 'Doanh Thu (triệu đồng)' },
                labels: {
                    formatter: function(value) {
                        return value.toFixed(1) + 'M';
                    }
                }
            },
            grid: {
                borderColor: '#e0e0e0'
            },
            tooltip: {
                y: {
                    formatter: function(value) {
                        return 'Tháng này: ' + value + ' triệu đ';
                    }
                }
            }
        };
        
        const chart = new ApexCharts(document.getElementById('revenueChart'), {
            series: series,
            ...options
        });
        
        chart.render();
        console.log('✅ Monthly revenue chart rendered');
    } catch (error) {
        console.error('❌ Error rendering revenue chart:', error);
        document.getElementById('revenueChart').innerHTML = '<div class="text-danger py-5">Lỗi tải biểu đồ</div>';
    }
}

/**
 * Render room status pie chart
 */
function renderRoomStatusChart(data) {
    try {
        if (!data) {
            document.getElementById('roomStatusChart').innerHTML = '<div class="text-center text-muted py-5">Chưa có dữ liệu phòng</div>';
            return;
        }
        
        const series = [
            data.occupied || 0,
            data.vacant || 0,
            data.maintenance || 0
        ];
        
        const labels = [
            'Đã Cho Thuê (' + (data.occupied || 0) + ')',
            'Trống (' + (data.vacant || 0) + ')',
            'Bảo Trì (' + (data.maintenance || 0) + ')'
        ];
        
        const options = {
            chart: {
                type: 'pie',
                height: 300
            },
            colors: ['#27ae60', '#f39c12', '#e74c3c'],
            labels: labels,
            legend: { position: 'bottom' },
            dataLabels: {
                formatter: function(val) {
                    return Math.round(val) + '%';
                }
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    legend: { position: 'bottom' }
                }
            }]
        };
        
        const chart = new ApexCharts(document.getElementById('roomStatusChart'), {
            series: series,
            ...options
        });
        
        chart.render();
        console.log('✅ Room status chart rendered');
    } catch (error) {
        console.error('❌ Error rendering room status chart:', error);
        document.getElementById('roomStatusChart').innerHTML = '<div class="text-danger py-5">Lỗi tải biểu đồ</div>';
    }
}

/**
 * Render overdue invoices widget
 */
function renderOverdueInvoicesWidget(invoices) {
    try {
        const container = document.getElementById('overdueInvoicesWidget');
        
        if (!invoices || invoices.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-3"><i class="fas fa-check-circle"></i> Không có hóa đơn quá hạn</div>';
            return;
        }
        
        let html = '';
        invoices.forEach(invoice => {
            html += `
                <div class="invoice-item">
                    <div>
                        <div class="invoice-name">${invoice.tenantName}</div>
                        <div class="invoice-days"><i class="fas fa-calendar"></i> ${invoice.daysOverdue} ngày quá hạn</div>
                    </div>
                    <div class="invoice-amount">${formatVND(invoice.amount)}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        console.log('✅ Overdue invoices widget rendered');
    } catch (error) {
        console.error('❌ Error rendering overdue invoices widget:', error);
        document.getElementById('overdueInvoicesWidget').innerHTML = '<div class="text-danger">Lỗi tải dữ liệu</div>';
    }
}

/**
 * Render debt summary widget
 */
function renderDebtSummaryWidget(debtData) {
    try {
        const container = document.getElementById('debtSummaryWidget');
        
        if (!debtData) {
            container.innerHTML = '<div class="text-center text-muted">Không có dữ liệu</div>';
            return;
        }
        
        const totalDebt = debtData.totalDebt || 0;
        const unpaidCount = debtData.unpaidCount || 0;
        
        const html = `
            <div class="debt-summary">
                <div class="debt-total">${formatVND(totalDebt)}</div>
                <div class="debt-count">
                    <i class="fas fa-file-invoice"></i> 
                    ${unpaidCount} hóa đơn chờ thanh toán
                </div>
                ${unpaidCount > 0 ? `
                    <div style="margin-top: 1rem;">
                        <span class="badge bg-danger" style="font-size: 0.9rem;">
                            ⚠️ Cần theo dõi
                        </span>
                    </div>
                ` : '<div style="margin-top: 1rem;"><span class="badge bg-success">✓ Không nợ</span></div>'}
            </div>
        `;
        
        container.innerHTML = html;
        console.log('✅ Debt summary widget rendered');
    } catch (error) {
        console.error('❌ Error rendering debt summary widget:', error);
        document.getElementById('debtSummaryWidget').innerHTML = '<div class="text-danger">Lỗi tải dữ liệu</div>';
    }
}

/**
 * Format number to VND currency
 */
function formatVND(value) {
    if (!value || isNaN(value)) return '0 đ';
    
    const num = parseInt(value);
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M đ';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K đ';
    } else {
        return num + ' đ';
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
    
    const roomsPropertyFilter = document.getElementById('roomsPropertyFilter');
    if (roomsPropertyFilter) {
        roomsPropertyFilter.addEventListener('change', handleRoomPropertyFilterChange);
    }

    loadPropertyOptions();
    loadDashboard();
});
