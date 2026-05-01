/**
 * PHASE 1.1: ENHANCED DASHBOARD - FRONTEND CHARTS
 * Thêm vào api.js
 */

// ==========================================
// LOAD ENHANCED DASHBOARD WITH CHARTS
// ==========================================
async function loadEnhancedDashboard() {
    try {
        console.log('📊 Loading Enhanced Dashboard...');
        
        // Show loading state
        const dashboardContainer = document.getElementById('dashboard');
        if (dashboardContainer) {
            dashboardContainer.innerHTML = '<div class="text-center py-5"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-3">Đang tải dữ liệu Dashboard...</p></div>';
        }
        
        // Call new API endpoint
        const data = await callApi('getDashboardWithCharts');
        
        if (!data || !data.success) {
            throw new Error(data?.message || 'Failed to load dashboard');
        }
        
        // Update KPI cards
        updateKPICards(data.kpis);
        
        // Render charts
        renderMonthlyRevenueChart(data.monthlyRevenue);
        renderRoomStatusChart(data.roomStatus);
        
        // Render widgets
        renderOverdueInvoicesWidget(data.overdueInvoices);
        renderDebtSummaryWidget(data.totalDebt);
        
        console.log('✅ Enhanced Dashboard loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading enhanced dashboard:', error);
        alert('❌ Lỗi tải Dashboard: ' + error.message);
    }
}

// ==========================================
// UPDATE KPI CARDS
// ==========================================
function updateKPICards(kpis) {
    console.log('📊 Updating KPI cards:', kpis);
    
    // Update KPI values
    if (document.getElementById('totalRooms')) {
        document.getElementById('totalRooms').textContent = kpis.totalRooms || 0;
    }
    if (document.getElementById('occupiedRooms')) {
        document.getElementById('occupiedRooms').textContent = kpis.occupiedRooms || 0;
    }
    if (document.getElementById('unpaidCount')) {
        document.getElementById('unpaidCount').textContent = kpis.unpaidCount || 0;
    }
    
    // Format revenue
    const monthlyRevenue = kpis.monthlyRevenue || 0;
    const formattedRevenue = monthlyRevenue >= 1000000 
        ? (monthlyRevenue / 1000000).toFixed(1) + 'M' 
        : (monthlyRevenue / 1000).toFixed(0) + 'K';
    if (document.getElementById('monthlyRevenue')) {
        document.getElementById('monthlyRevenue').textContent = formattedRevenue;
    }
}

// ==========================================
// RENDER MONTHLY REVENUE CHART (Line Chart)
// ==========================================
function renderMonthlyRevenueChart(data) {
    console.log('📈 Rendering Monthly Revenue Chart...');
    
    try {
        // Get container
        const container = document.getElementById('revenueChart');
        if (!container) {
            console.warn('⚠️ Revenue chart container not found: #revenueChart');
            return;
        }
        
        // Check if ApexCharts is loaded
        if (typeof ApexCharts === 'undefined') {
            console.error('❌ ApexCharts library not loaded');
            container.innerHTML = '<p class="text-danger">Chart library not loaded</p>';
            return;
        }
        
        // Prepare data for chart
        const categories = data.map(item => item.month);
        const revenues = data.map(item => item.revenue);
        
        // Chart options
        const options = {
            chart: {
                type: 'line',
                height: 350,
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        zoom: true,
                        pan: true,
                        reset: true
                    }
                }
            },
            series: [{
                name: 'Doanh Thu (VND)',
                data: revenues
            }],
            xaxis: {
                categories: categories,
                title: { text: 'Tháng' }
            },
            yaxis: {
                title: { text: 'Doanh Thu' },
                labels: {
                    formatter: function(value) {
                        return formatVND(value);
                    }
                }
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            colors: ['#3498db'],
            dataLabels: {
                enabled: false
            },
            tooltip: {
                y: {
                    formatter: function(value) {
                        return formatVND(value);
                    }
                }
            },
            grid: {
                show: true,
                borderColor: '#e0e0e0',
                strokeDashArray: 4
            }
        };
        
        // Destroy existing chart if any
        if (window.revenueChart) {
            window.revenueChart.destroy();
        }
        
        // Create chart
        window.revenueChart = new ApexCharts(container, options);
        window.revenueChart.render();
        
        console.log('✅ Monthly Revenue Chart rendered');
    } catch (error) {
        console.error('❌ Error rendering monthly revenue chart:', error);
    }
}

// ==========================================
// RENDER ROOM STATUS CHART (Pie/Donut Chart)
// ==========================================
function renderRoomStatusChart(roomStatus) {
    console.log('🥧 Rendering Room Status Chart...');
    
    try {
        // Get container
        const container = document.getElementById('roomStatusChart');
        if (!container) {
            console.warn('⚠️ Room status chart container not found: #roomStatusChart');
            return;
        }
        
        // Check if ApexCharts is loaded
        if (typeof ApexCharts === 'undefined') {
            console.error('❌ ApexCharts library not loaded');
            container.innerHTML = '<p class="text-danger">Chart library not loaded</p>';
            return;
        }
        
        // Chart options
        const options = {
            chart: {
                type: 'donut',
                height: 350
            },
            series: [
                roomStatus.occupied || 0,
                roomStatus.vacant || 0,
                roomStatus.maintenance || 0
            ],
            labels: ['Đã Cho Thuê', 'Trống', 'Sửa Chữa'],
            colors: ['#27ae60', '#95a5a6', '#f39c12'],
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return Math.round(val) + '%';
                }
            },
            tooltip: {
                y: {
                    formatter: function(value) {
                        return value + ' phòng';
                    }
                }
            },
            legend: {
                position: 'bottom'
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            name: {
                                show: true
                            },
                            value: {
                                show: true,
                                fontSize: '16px',
                                fontWeight: 600
                            }
                        }
                    }
                }
            }
        };
        
        // Destroy existing chart if any
        if (window.roomStatusChart) {
            window.roomStatusChart.destroy();
        }
        
        // Create chart
        window.roomStatusChart = new ApexCharts(container, options);
        window.roomStatusChart.render();
        
        console.log('✅ Room Status Chart rendered');
    } catch (error) {
        console.error('❌ Error rendering room status chart:', error);
    }
}

// ==========================================
// RENDER OVERDUE INVOICES WIDGET
// ==========================================
function renderOverdueInvoicesWidget(invoices) {
    console.log('⚠️ Rendering Overdue Invoices Widget...');
    
    try {
        const container = document.getElementById('overdueInvoicesWidget');
        if (!container) {
            console.warn('⚠️ Overdue invoices widget not found: #overdueInvoicesWidget');
            return;
        }
        
        let html = '<div class="p-3">';
        
        if (!invoices || invoices.length === 0) {
            html += '<p class="text-muted text-center">✅ Không có hóa đơn quá hạn</p>';
        } else {
            html += '<div class="table-responsive">';
            html += '<table class="table table-sm table-hover">';
            html += '<thead style="background-color: #f8f9fa;">';
            html += '<tr>';
            html += '<th>Phòng</th>';
            html += '<th>Khách</th>';
            html += '<th>Số Tiền</th>';
            html += '<th>Quá Hạn</th>';
            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';
            
            invoices.forEach(invoice => {
                const daysOverdue = invoice.daysOverdue || 0;
                const color = daysOverdue > 60 ? '#e74c3c' : daysOverdue > 30 ? '#f39c12' : '#f1c40f';
                
                html += '<tr>';
                html += `<td><strong>${invoice.roomId}</strong></td>`;
                html += `<td><small>${invoice.tenantName}</small></td>`;
                html += `<td><strong class="text-danger">${formatVND(invoice.amount)}</strong></td>`;
                html += `<td><span style="background-color: ${color}; padding: 3px 8px; border-radius: 12px; color: white; font-size: 12px; font-weight: bold;">${daysOverdue} ngày</span></td>`;
                html += '</tr>';
            });
            
            html += '</tbody>';
            html += '</table>';
            html += '</div>';
        }
        
        html += '</div>';
        container.innerHTML = html;
        
        console.log('✅ Overdue Invoices Widget rendered');
    } catch (error) {
        console.error('❌ Error rendering overdue invoices widget:', error);
    }
}

// ==========================================
// RENDER DEBT SUMMARY WIDGET
// ==========================================
function renderDebtSummaryWidget(totalDebt) {
    console.log('💰 Rendering Debt Summary Widget...');
    
    try {
        const container = document.getElementById('debtSummaryWidget');
        if (!container) {
            console.warn('⚠️ Debt summary widget not found: #debtSummaryWidget');
            return;
        }
        
        const debtFormatted = formatVND(totalDebt);
        const color = totalDebt > 10000000 ? '#e74c3c' : '#f39c12';
        
        let html = `
            <div class="p-3" style="text-align: center;">
                <p style="color: #7f8c8d; margin-bottom: 5px; font-size: 14px;">TỔNG NỢ CỦA KHÁCH HÀNG</p>
                <h2 style="color: ${color}; margin: 0; font-weight: bold;">${debtFormatted}</h2>
                <p style="color: #95a5a6; margin-top: 10px; font-size: 12px;">
                    ${totalDebt > 0 ? '⚠️ Cần thu hộ ngay' : '✅ Tất cả khách hàng đã thanh toán'}
                </p>
            </div>
        `;
        
        container.innerHTML = html;
        
        console.log('✅ Debt Summary Widget rendered');
    } catch (error) {
        console.error('❌ Error rendering debt summary widget:', error);
    }
}

// ==========================================
// HELPER FUNCTION: FORMAT VND CURRENCY
// ==========================================
function formatVND(value) {
    if (!value || isNaN(value)) return '0 đ';
    const num = Math.abs(value);
    
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M đ';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K đ';
    } else {
        return Math.round(num) + ' đ';
    }
}

// ==========================================
// OVERRIDE loadDashboard() to use enhanced version
// ==========================================
// Replace the old loadDashboard() with this:
async function loadDashboard() {
    loadEnhancedDashboard();
}

// If using API that has both old and new, keep old as fallback:
async function loadDashboardLegacy() {
    try {
        console.log('📊 Loading dashboard (legacy)...');
        const data = await callApi('getDashboardStats');
        
        if (data.success && data.stats) {
            const stats = data.stats;
            document.getElementById('totalRooms').textContent = stats.totalRooms || 0;
            document.getElementById('occupiedRooms').textContent = stats.occupiedRooms || 0;
            document.getElementById('unpaidCount').textContent = stats.unpaidCount || 0;
            
            const monthlyRevenue = stats.monthlyRevenue || 0;
            const formattedRevenue = monthlyRevenue >= 1000000 
                ? (monthlyRevenue / 1000000).toFixed(1) + 'M' 
                : (monthlyRevenue / 1000).toFixed(0) + 'K';
            document.getElementById('monthlyRevenue').textContent = formattedRevenue;
        }
    } catch (error) {
        console.error('❌ Error in legacy dashboard:', error);
    }
}
