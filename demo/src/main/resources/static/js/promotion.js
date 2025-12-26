let categories = [];

const couponTypeMap = { FIXED: '满减券', PERCENT: '折扣券' };
const discountTypeMap = { PERCENT: '折扣', FIXED: '直减' };
const scopeMap = { ALL: '全场', CATEGORY: '指定分类', PRODUCT: '指定商品' };

async function loadCategories() {
    categories = await fetchJSON(`${API}/categories`);
    document.getElementById('discount-category').innerHTML = categories.map(c => 
        `<option value="${c.id}">${c.name}</option>`
    ).join('');
}

function showSubTab(tab) {
    document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[onclick="showSubTab('${tab}')"]`).classList.add('active');
    document.getElementById('coupons-panel').classList.toggle('hidden', tab !== 'coupons');
    document.getElementById('discounts-panel').classList.toggle('hidden', tab !== 'discounts');
    if (tab === 'coupons') loadCoupons();
    else loadDiscounts();
}

// ========== 优惠券 ==========
async function loadCoupons() {
    const coupons = await fetchJSON(`${API}/promotions/coupons`);
    renderCouponsTable(coupons);
}

async function loadValidCoupons() {
    const coupons = await fetchJSON(`${API}/promotions/coupons/valid`);
    renderCouponsTable(coupons);
}

function renderCouponsTable(coupons) {
    document.getElementById('coupons-table').innerHTML = coupons.map(c => {
        const isValid = c.enabled && new Date(c.startTime) <= new Date() && new Date(c.endTime) >= new Date();
        const valueText = c.type === 'FIXED' ? `减¥${c.value}` : `${c.value}折`;
        const conditionText = c.minAmount ? `满¥${c.minAmount}可用` : '无门槛';
        return `<tr>
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td><code>${c.code}</code></td>
            <td>${couponTypeMap[c.type]}</td>
            <td>${valueText}</td>
            <td>${conditionText}${c.maxDiscount ? `，最多减¥${c.maxDiscount}` : ''}</td>
            <td>${formatDateTime(c.startTime)}<br>至 ${formatDateTime(c.endTime)}</td>
            <td>${isValid ? '<span class="badge badge-shipped">有效</span>' : '<span class="badge badge-cancelled">无效</span>'}</td>
            <td class="actions">
                <button class="btn btn-primary btn-sm" onclick="editCoupon(${c.id})">编辑</button>
                <button class="btn ${c.enabled ? 'btn-danger' : 'btn-success'} btn-sm" onclick="toggleCoupon(${c.id})">${c.enabled ? '禁用' : '启用'}</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCoupon(${c.id})">删除</button>
            </td>
        </tr>`;
    }).join('');
}

function onCouponTypeChange() {
    const type = document.getElementById('coupon-type').value;
    document.getElementById('coupon-value-label').textContent = type === 'FIXED' ? '减免金额' : '折扣比例(如85表示85折)';
    document.getElementById('max-discount-group').style.display = type === 'PERCENT' ? 'block' : 'none';
}

function showCouponModal(coupon = null) {
    document.getElementById('coupon-modal-title').textContent = coupon ? '编辑优惠券' : '创建优惠券';
    document.getElementById('coupon-id').value = coupon?.id || '';
    document.getElementById('coupon-name').value = coupon?.name || '';
    document.getElementById('coupon-code').value = coupon?.code || '';
    document.getElementById('coupon-type').value = coupon?.type || 'FIXED';
    document.getElementById('coupon-value').value = coupon?.value || '';
    document.getElementById('coupon-min-amount').value = coupon?.minAmount || '';
    document.getElementById('coupon-max-discount').value = coupon?.maxDiscount || '';
    document.getElementById('coupon-total').value = coupon?.totalCount || '';
    document.getElementById('coupon-limit').value = coupon?.perLimit || 1;
    document.getElementById('coupon-start').value = coupon ? coupon.startTime.substring(0, 16) : '';
    document.getElementById('coupon-end').value = coupon ? coupon.endTime.substring(0, 16) : '';
    document.getElementById('coupon-desc').value = coupon?.description || '';
    onCouponTypeChange();
    document.getElementById('coupon-modal').classList.remove('hidden');
}

async function editCoupon(id) {
    const coupon = await fetchJSON(`${API}/promotions/coupons/${id}`);
    showCouponModal(coupon);
}

async function toggleCoupon(id) {
    await fetchJSON(`${API}/promotions/coupons/${id}/toggle`, { method: 'PUT' });
    loadCoupons();
}

async function deleteCoupon(id) {
    if (!confirm('确定删除此优惠券？')) return;
    await fetchJSON(`${API}/promotions/coupons/${id}`, { method: 'DELETE' });
    loadCoupons();
}

document.getElementById('coupon-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('coupon-id').value;
    const data = {
        name: document.getElementById('coupon-name').value,
        code: document.getElementById('coupon-code').value,
        type: document.getElementById('coupon-type').value,
        value: document.getElementById('coupon-value').value,
        minAmount: document.getElementById('coupon-min-amount').value || null,
        maxDiscount: document.getElementById('coupon-max-discount').value || null,
        totalCount: document.getElementById('coupon-total').value || null,
        perLimit: document.getElementById('coupon-limit').value || 1,
        startTime: document.getElementById('coupon-start').value + ':00',
        endTime: document.getElementById('coupon-end').value + ':00',
        description: document.getElementById('coupon-desc').value
    };
    await fetchJSON(`${API}/promotions/coupons${id ? '/' + id : ''}`, {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(data)
    });
    closeModal('coupon-modal');
    loadCoupons();
};


// ========== 折扣活动 ==========
async function loadDiscounts() {
    const discounts = await fetchJSON(`${API}/promotions/discounts`);
    renderDiscountsTable(discounts);
}

async function loadActiveDiscounts() {
    const discounts = await fetchJSON(`${API}/promotions/discounts/active`);
    renderDiscountsTable(discounts);
}

function renderDiscountsTable(discounts) {
    document.getElementById('discounts-table').innerHTML = discounts.map(d => {
        const isActive = d.enabled && new Date(d.startTime) <= new Date() && new Date(d.endTime) >= new Date();
        const valueText = d.type === 'PERCENT' ? `${d.value}折` : `减¥${d.value}`;
        let scopeText = scopeMap[d.scope];
        if (d.scope === 'CATEGORY') {
            const cat = categories.find(c => c.id === d.categoryId);
            scopeText += cat ? `: ${cat.name}` : '';
        } else if (d.scope === 'PRODUCT') {
            scopeText += `: ${d.productIds}`;
        }
        return `<tr>
            <td>${d.id}</td>
            <td>${d.name}</td>
            <td>${discountTypeMap[d.type]}</td>
            <td>${valueText}</td>
            <td>${scopeText}</td>
            <td>${formatDateTime(d.startTime)}<br>至 ${formatDateTime(d.endTime)}</td>
            <td>${isActive ? '<span class="badge badge-shipped">进行中</span>' : '<span class="badge badge-cancelled">未生效</span>'}</td>
            <td class="actions">
                <button class="btn btn-primary btn-sm" onclick="editDiscount(${d.id})">编辑</button>
                <button class="btn ${d.enabled ? 'btn-danger' : 'btn-success'} btn-sm" onclick="toggleDiscount(${d.id})">${d.enabled ? '禁用' : '启用'}</button>
                <button class="btn btn-danger btn-sm" onclick="deleteDiscount(${d.id})">删除</button>
            </td>
        </tr>`;
    }).join('');
}

function onDiscountTypeChange() {
    const type = document.getElementById('discount-type').value;
    document.getElementById('discount-value-label').textContent = type === 'PERCENT' ? '折扣(如85表示85折)' : '减免金额';
}

function onDiscountScopeChange() {
    const scope = document.getElementById('discount-scope').value;
    document.getElementById('category-group').style.display = scope === 'CATEGORY' ? 'block' : 'none';
    document.getElementById('products-group').style.display = scope === 'PRODUCT' ? 'block' : 'none';
}

function showDiscountModal(discount = null) {
    document.getElementById('discount-modal-title').textContent = discount ? '编辑折扣活动' : '创建折扣活动';
    document.getElementById('discount-id').value = discount?.id || '';
    document.getElementById('discount-name').value = discount?.name || '';
    document.getElementById('discount-type').value = discount?.type || 'PERCENT';
    document.getElementById('discount-value').value = discount?.value || '';
    document.getElementById('discount-scope').value = discount?.scope || 'ALL';
    document.getElementById('discount-category').value = discount?.categoryId || '';
    document.getElementById('discount-products').value = discount?.productIds || '';
    document.getElementById('discount-start').value = discount ? discount.startTime.substring(0, 16) : '';
    document.getElementById('discount-end').value = discount ? discount.endTime.substring(0, 16) : '';
    document.getElementById('discount-desc').value = discount?.description || '';
    onDiscountTypeChange();
    onDiscountScopeChange();
    document.getElementById('discount-modal').classList.remove('hidden');
}

async function editDiscount(id) {
    const discount = await fetchJSON(`${API}/promotions/discounts/${id}`);
    showDiscountModal(discount);
}

async function toggleDiscount(id) {
    await fetchJSON(`${API}/promotions/discounts/${id}/toggle`, { method: 'PUT' });
    loadDiscounts();
}

async function deleteDiscount(id) {
    if (!confirm('确定删除此折扣活动？')) return;
    await fetchJSON(`${API}/promotions/discounts/${id}`, { method: 'DELETE' });
    loadDiscounts();
}

document.getElementById('discount-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('discount-id').value;
    const scope = document.getElementById('discount-scope').value;
    const data = {
        name: document.getElementById('discount-name').value,
        type: document.getElementById('discount-type').value,
        value: document.getElementById('discount-value').value,
        scope: scope,
        categoryId: scope === 'CATEGORY' ? document.getElementById('discount-category').value : null,
        productIds: scope === 'PRODUCT' ? document.getElementById('discount-products').value : null,
        startTime: document.getElementById('discount-start').value + ':00',
        endTime: document.getElementById('discount-end').value + ':00',
        description: document.getElementById('discount-desc').value
    };
    await fetchJSON(`${API}/promotions/discounts${id ? '/' + id : ''}`, {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(data)
    });
    closeModal('discount-modal');
    loadDiscounts();
};

function formatDateTime(dt) {
    return dt ? new Date(dt).toLocaleString('zh-CN') : '-';
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

// 初始化
loadCategories().then(() => loadCoupons());
