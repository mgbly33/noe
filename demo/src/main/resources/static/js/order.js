let products = [], orderItems = [];

const statusMap = {
    PENDING_PAYMENT: { text: '待支付', class: 'badge-pending' },
    PENDING_SHIPMENT: { text: '待发货', class: 'badge-paid' },
    SHIPPED: { text: '已发货', class: 'badge-shipped' },
    COMPLETED: { text: '已完成', class: 'badge-completed' },
    CANCELLED: { text: '已取消', class: 'badge-cancelled' }
};

async function loadProducts() {
    products = await fetchJSON(`${API}/products`);
    document.getElementById('product-select').innerHTML = products.map(p => {
        const price = p.isOnPromotion && p.promotionPrice ? p.promotionPrice : p.standardPrice;
        return `<option value="${p.id}" data-price="${price}" data-name="${p.name}">${p.name} - ¥${price}</option>`;
    }).join('');
}

async function loadData() {
    const status = document.getElementById('status-filter').value;
    const orders = await fetchJSON(`${API}/orders${status ? '?status=' + status : ''}`);
    renderTable(orders);
}

async function searchOrders() {
    const keyword = document.getElementById('search-input').value.trim();
    const orders = await fetchJSON(`${API}/orders?keyword=${encodeURIComponent(keyword)}`);
    renderTable(orders);
}

function renderTable(orders) {
    document.getElementById('table-body').innerHTML = orders.map(o => {
        const s = statusMap[o.status] || { text: o.status, class: '' };
        const itemsText = o.items?.map(i => `${i.productName}×${i.quantity}`).join(', ') || '-';
        return `<tr>
            <td>${o.orderNo}</td>
            <td>${o.buyerName}<br><small style="color:#999">${o.buyerPhone}</small></td>
            <td title="${itemsText}">${itemsText.length > 25 ? itemsText.substring(0,25)+'...' : itemsText}</td>
            <td>¥${o.totalAmount}</td>
            <td><span class="badge ${s.class}">${s.text}</span></td>
            <td>${formatDate(o.createdAt)}</td>
            <td class="actions">${getActions(o)}</td>
        </tr>`;
    }).join('');
}

function getActions(o) {
    let btns = `<button class="btn btn-info btn-sm" onclick="showDetail(${o.id})">详情</button>`;
    if (o.status === 'PENDING_PAYMENT') {
        btns += `<button class="btn btn-success btn-sm" onclick="showPayModal(${o.id}, '${o.orderNo}', ${o.totalAmount})">支付</button>`;
        btns += `<button class="btn btn-danger btn-sm" onclick="cancelOrder(${o.id})">取消</button>`;
    }
    if (o.status === 'PENDING_SHIPMENT') {
        btns += `<button class="btn btn-warning btn-sm" onclick="showShipModal(${o.id}, '${o.orderNo}')">发货</button>`;
        btns += `<button class="btn btn-danger btn-sm" onclick="cancelOrder(${o.id})">取消</button>`;
    }
    if (o.status === 'SHIPPED') {
        btns += `<button class="btn btn-success btn-sm" onclick="completeOrder(${o.id})">完成</button>`;
    }
    return btns;
}


async function showDetail(id) {
    const o = await fetchJSON(`${API}/orders/${id}`);
    const s = statusMap[o.status] || { text: o.status, class: '' };
    document.getElementById('detail-content').innerHTML = `
        <div class="order-info">
            <div class="order-info-item"><div class="order-info-label">订单号</div><div class="order-info-value">${o.orderNo}</div></div>
            <div class="order-info-item"><div class="order-info-label">状态</div><div class="order-info-value"><span class="badge ${s.class}">${s.text}</span></div></div>
            <div class="order-info-item"><div class="order-info-label">买家</div><div class="order-info-value">${o.buyerName}</div></div>
            <div class="order-info-item"><div class="order-info-label">手机</div><div class="order-info-value">${o.buyerPhone}</div></div>
            <div class="order-info-item" style="grid-column:span 2"><div class="order-info-label">地址</div><div class="order-info-value">${o.buyerAddress}</div></div>
            ${o.shippingCompany ? `<div class="order-info-item"><div class="order-info-label">物流公司</div><div class="order-info-value">${o.shippingCompany}</div></div>` : ''}
            ${o.trackingNumber ? `<div class="order-info-item"><div class="order-info-label">物流单号</div><div class="order-info-value">${o.trackingNumber}</div></div>` : ''}
        </div>
        <h4 style="margin:15px 0 10px">商品明细</h4>
        <div class="order-items">${o.items?.map(i => `<div class="order-item"><span>${i.productName} × ${i.quantity}</span><span>¥${i.subtotal}</span></div>`).join('') || '无'}</div>
        <div style="text-align:right;font-weight:bold;margin-top:10px">总计: ¥${o.totalAmount}</div>
        ${o.remark ? `<div style="margin-top:15px;padding:10px;background:#fffbe6;border-radius:4px"><strong>备注:</strong> ${o.remark}</div>` : ''}
        <div style="margin-top:15px;color:#999;font-size:12px">创建: ${formatDate(o.createdAt)} | 更新: ${formatDate(o.updatedAt)}</div>`;
    document.getElementById('detail-modal').classList.remove('hidden');
}

async function payOrder(id) {
    if (confirm('确认支付此订单？')) {
        await fetchJSON(`${API}/orders/${id}/pay`, { method: 'PUT' });
        loadData();
    }
}

// 显示支付模态框
function showPayModal(orderId, orderNo, amount) {
    document.getElementById('pay-order-id').value = orderId;
    document.getElementById('pay-order-info').innerHTML = `<strong>订单号:</strong> ${orderNo}<br><strong>支付金额:</strong> <span style="color:#ff4d4f;font-size:20px">¥${amount}</span>`;
    document.getElementById('pay-content').classList.remove('hidden');
    document.getElementById('pay-result').classList.add('hidden');
    document.getElementById('pay-modal').classList.remove('hidden');
}

// 确认支付
async function confirmPay() {
    const orderId = document.getElementById('pay-order-id').value;
    const payMethod = document.querySelector('input[name="payMethod"]:checked').value;
    
    document.getElementById('pay-content').innerHTML = '<div style="text-align:center;padding:40px"><div class="loading-spinner"></div><p style="margin-top:15px;color:#666">正在处理支付，请稍候...</p></div>';
    
    try {
        const result = await fetchJSON(`${API}/payments/pay`, {
            method: 'POST',
            body: JSON.stringify({ orderId, paymentMethod: payMethod })
        });
        
        showPayResult(result);
    } catch (e) {
        showPayResult({ success: false, message: e.message || '支付失败' });
    }
}

// 显示支付结果
function showPayResult(result) {
    document.getElementById('pay-content').classList.add('hidden');
    const resultDiv = document.getElementById('pay-result');
    resultDiv.classList.remove('hidden');
    
    if (result.success) {
        resultDiv.innerHTML = `
            <div style="text-align:center;padding:30px">
                <div style="font-size:60px;color:#52c41a">✓</div>
                <h3 style="color:#52c41a;margin:15px 0">支付成功</h3>
                <p style="color:#666">支付金额: ¥${result.amount}</p>
                <p style="color:#666">支付方式: ${result.paymentMethod}</p>
                <p style="color:#999;font-size:12px">交易号: ${result.transactionId}</p>
                <button class="btn btn-primary" onclick="closePayModal()" style="margin-top:20px">确定</button>
            </div>`;
    } else {
        resultDiv.innerHTML = `
            <div style="text-align:center;padding:30px">
                <div style="font-size:60px;color:#ff4d4f">✗</div>
                <h3 style="color:#ff4d4f;margin:15px 0">支付失败</h3>
                <p style="color:#666">${result.message || result.error}</p>
                <button class="btn btn-warning" onclick="retryPay()" style="margin-top:20px">重新支付</button>
                <button class="btn btn-default" onclick="closePayModal()" style="margin-top:20px;margin-left:10px">取消</button>
            </div>`;
    }
}

function retryPay() {
    document.getElementById('pay-content').classList.remove('hidden');
    document.getElementById('pay-content').innerHTML = `
        <p id="pay-order-info" style="margin-bottom:15px"></p>
        <div class="form-group">
            <label>选择支付方式</label>
            <div class="payment-methods">
                <label class="payment-option"><input type="radio" name="payMethod" value="ALIPAY" checked><span>支付宝</span></label>
                <label class="payment-option"><input type="radio" name="payMethod" value="WECHAT"><span>微信支付</span></label>
                <label class="payment-option"><input type="radio" name="payMethod" value="UNIONPAY"><span>银联支付</span></label>
                <label class="payment-option"><input type="radio" name="payMethod" value="BALANCE"><span>余额支付</span></label>
            </div>
        </div>
        <button class="btn btn-success" onclick="confirmPay()" style="width:100%;padding:12px;font-size:16px">确认支付</button>`;
    document.getElementById('pay-result').classList.add('hidden');
}

function closePayModal() {
    closeModal('pay-modal');
    loadData();
}

async function cancelOrder(id) {
    if (confirm('确认取消此订单？')) {
        await fetchJSON(`${API}/orders/${id}/cancel`, { method: 'PUT' });
        loadData();
    }
}

async function completeOrder(id) {
    if (confirm('确认完成此订单？')) {
        await fetchJSON(`${API}/orders/${id}/complete`, { method: 'PUT' });
        loadData();
    }
}

function showShipModal(id, orderNo) {
    document.getElementById('ship-id').value = id;
    document.getElementById('ship-order-no').textContent = '订单号: ' + orderNo;
    document.getElementById('ship-company').value = '';
    document.getElementById('ship-tracking').value = '';
    document.getElementById('ship-modal').classList.remove('hidden');
}

document.getElementById('ship-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('ship-id').value;
    await fetchJSON(`${API}/orders/${id}/ship`, {
        method: 'PUT',
        body: JSON.stringify({
            shippingCompany: document.getElementById('ship-company').value,
            trackingNumber: document.getElementById('ship-tracking').value
        })
    });
    closeModal('ship-modal');
    loadData();
};

// 创建订单
function showCreateModal() {
    orderItems = [];
    document.getElementById('buyer-name').value = '';
    document.getElementById('buyer-phone').value = '';
    document.getElementById('buyer-address').value = '';
    document.getElementById('order-remark').value = '';
    document.getElementById('product-qty').value = 1;
    renderItems();
    document.getElementById('create-modal').classList.remove('hidden');
}

function addItem() {
    const select = document.getElementById('product-select');
    const opt = select.options[select.selectedIndex];
    const qty = parseInt(document.getElementById('product-qty').value) || 1;
    const existing = orderItems.find(i => i.productId == select.value);
    if (existing) {
        existing.quantity += qty;
    } else {
        orderItems.push({
            productId: select.value,
            productName: opt.dataset.name,
            price: parseFloat(opt.dataset.price),
            quantity: qty
        });
    }
    renderItems();
}

function removeItem(idx) {
    orderItems.splice(idx, 1);
    renderItems();
}

function renderItems() {
    const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    document.getElementById('items-list').innerHTML = orderItems.length
        ? orderItems.map((i, idx) => `<div class="order-item"><span>${i.productName} × ${i.quantity} = ¥${(i.price * i.quantity).toFixed(2)}</span><button type="button" class="btn btn-danger btn-sm" onclick="removeItem(${idx})">删除</button></div>`).join('')
        : '<div style="color:#999;text-align:center;padding:10px">请添加商品</div>';
    document.getElementById('order-total').textContent = total.toFixed(2);
}

document.getElementById('create-form').onsubmit = async (e) => {
    e.preventDefault();
    if (!orderItems.length) { alert('请添加商品'); return; }
    await fetchJSON(`${API}/orders`, {
        method: 'POST',
        body: JSON.stringify({
            buyerName: document.getElementById('buyer-name').value,
            buyerPhone: document.getElementById('buyer-phone').value,
            buyerAddress: document.getElementById('buyer-address').value,
            remark: document.getElementById('order-remark').value,
            items: orderItems
        })
    });
    closeModal('create-modal');
    loadData();
    alert('订单创建成功！');
};

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

loadProducts();
loadData();
