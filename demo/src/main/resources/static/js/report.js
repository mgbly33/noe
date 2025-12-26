let salesTrendChart, orderStatusChart, topProductsChart, categorySalesChart;

const statusMap = {
    PENDING_PAYMENT: '待支付',
    PENDING_SHIPMENT: '待发货',
    SHIPPED: '已发货',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
};

const chartColors = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];

async function loadOverview() {
    const data = await fetchJSON(`${API}/reports/overview`);
    document.getElementById('today-sales').textContent = '¥' + (data.todaySales || 0).toLocaleString();
    document.getElementById('today-orders').textContent = data.todayOrders || 0;
    document.getElementById('pending-orders').textContent = data.pendingOrders || 0;
    document.getElementById('total-users').textContent = data.totalUsers || 0;
}

async function loadSalesTrend() {
    const period = document.getElementById('trend-period').value;
    const data = await fetchJSON(`${API}/reports/sales-trend?period=${period}`);
    
    const labels = data.map(d => d.date);
    const sales = data.map(d => d.sales);
    const orders = data.map(d => d.orders);
    
    if (salesTrendChart) salesTrendChart.destroy();
    
    salesTrendChart = new Chart(document.getElementById('sales-trend-chart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '销售额',
                    data: sales,
                    borderColor: '#1890ff',
                    backgroundColor: 'rgba(24, 144, 255, 0.1)',
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: '订单数',
                    data: orders,
                    borderColor: '#52c41a',
                    backgroundColor: 'rgba(82, 196, 26, 0.1)',
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: { type: 'linear', display: true, position: 'left', title: { display: true, text: '销售额' } },
                y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: '订单数' }, grid: { drawOnChartArea: false } }
            }
        }
    });
}

async function loadOrderStatus() {
    const data = await fetchJSON(`${API}/reports/order-status`);
    
    if (orderStatusChart) orderStatusChart.destroy();
    
    orderStatusChart = new Chart(document.getElementById('order-status-chart'), {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.statusName || statusMap[d.status] || d.status),
            datasets: [{
                data: data.map(d => d.count),
                backgroundColor: chartColors.slice(0, data.length)
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}

async function loadTopProducts() {
    const data = await fetchJSON(`${API}/reports/top-products?limit=10`);
    
    if (topProductsChart) topProductsChart.destroy();
    
    topProductsChart = new Chart(document.getElementById('top-products-chart'), {
        type: 'bar',
        data: {
            labels: data.map(d => d.product_name?.substring(0, 10) || '未知'),
            datasets: [{
                label: '销量',
                data: data.map(d => d.total_quantity),
                backgroundColor: '#1890ff'
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            plugins: { legend: { display: false } }
        }
    });
}

async function loadCategorySales() {
    const data = await fetchJSON(`${API}/reports/category-sales`);
    
    if (categorySalesChart) categorySalesChart.destroy();
    
    categorySalesChart = new Chart(document.getElementById('category-sales-chart'), {
        type: 'pie',
        data: {
            labels: data.map(d => d.name || '未分类'),
            datasets: [{
                data: data.map(d => d.total_sales || 0),
                backgroundColor: chartColors.slice(0, data.length)
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}


async function loadRecentOrders() {
    const data = await fetchJSON(`${API}/reports/recent-orders?limit=10`);
    document.getElementById('recent-orders').innerHTML = data.map(o => `
        <tr>
            <td>${o.order_no}</td>
            <td>${o.buyer_name}</td>
            <td>¥${o.total_amount}</td>
            <td><span class="badge badge-${getStatusClass(o.status)}">${statusMap[o.status] || o.status}</span></td>
            <td>${formatDate(o.created_at)}</td>
        </tr>
    `).join('') || '<tr><td colspan="5" style="text-align:center;color:#999">暂无数据</td></tr>';
}

async function loadLowStock() {
    const data = await fetchJSON(`${API}/reports/low-stock?threshold=10`);
    document.getElementById('low-stock').innerHTML = data.map(p => `
        <tr>
            <td>${p.name}</td>
            <td>${p.category_name || '-'}</td>
            <td><span class="badge badge-low">${p.stock}</span></td>
        </tr>
    `).join('') || '<tr><td colspan="3" style="text-align:center;color:#999">暂无低库存商品</td></tr>';
}

function getStatusClass(status) {
    const map = {
        PENDING_PAYMENT: 'pending',
        PENDING_SHIPMENT: 'paid',
        SHIPPED: 'shipped',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    };
    return map[status] || '';
}

// 初始化
async function init() {
    await loadOverview();
    await loadSalesTrend();
    await loadOrderStatus();
    await loadTopProducts();
    await loadCategorySales();
    await loadRecentOrders();
    await loadLowStock();
}

init();
