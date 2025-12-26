let products = [];
let currentPage = 0;
const pageSize = 10;

const statusMap = {
    PENDING: { text: '待审核', class: 'badge-pending' },
    APPROVED: { text: '已通过', class: 'badge-shipped' },
    REJECTED: { text: '已拒绝', class: 'badge-cancelled' }
};

async function loadProducts() {
    products = await fetchJSON(`${API}/products`);
    const options = products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    document.getElementById('product-filter').innerHTML = '<option value="">全部商品</option>' + options;
    document.getElementById('review-product').innerHTML = options;
}

async function loadData() {
    const productId = document.getElementById('product-filter').value;
    const status = document.getElementById('status-filter').value;
    
    let url = `${API}/reviews?page=${currentPage}&size=${pageSize}`;
    if (productId) url += `&productId=${productId}`;
    if (status) url += `&status=${status}`;
    
    const data = await fetchJSON(url);
    renderTable(data.content);
    renderPagination(data);
}

function renderTable(reviews) {
    document.getElementById('table-body').innerHTML = reviews.map(r => {
        const s = statusMap[r.status] || { text: r.status, class: '' };
        const displayName = r.isAnonymous ? '匿名用户' : (r.userName || '未知用户');
        return `<tr>
            <td>${r.id}</td>
            <td>${r.productName || '-'}</td>
            <td>${displayName}</td>
            <td>${renderStars(r.rating)}</td>
            <td title="${r.content}">${r.content.length > 30 ? r.content.substring(0, 30) + '...' : r.content}</td>
            <td><span class="badge ${s.class}">${s.text}</span></td>
            <td>${formatDate(r.createdAt)}</td>
            <td class="actions">
                <button class="btn btn-info btn-sm" onclick="showDetail(${r.id})">详情</button>
                ${r.status === 'PENDING' ? `
                    <button class="btn btn-success btn-sm" onclick="approveReview(${r.id})">通过</button>
                    <button class="btn btn-warning btn-sm" onclick="rejectReview(${r.id})">拒绝</button>
                ` : ''}
                <button class="btn btn-primary btn-sm" onclick="showReplyModal(${r.id})">回复</button>
                <button class="btn btn-danger btn-sm" onclick="deleteReview(${r.id})">删除</button>
            </td>
        </tr>`;
    }).join('');
}

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="star ${i <= rating ? 'active' : ''}">★</span>`;
    }
    return stars;
}

function renderPagination(data) {
    const totalPages = data.totalPages;
    if (totalPages <= 1) {
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    let html = `<div class="page-info">共 ${data.totalElements} 条，第 ${currentPage + 1}/${totalPages} 页</div>`;
    html += '<div class="page-btns">';
    html += `<button class="btn btn-sm" ${currentPage === 0 ? 'disabled' : ''} onclick="goPage(0)">首页</button>`;
    html += `<button class="btn btn-sm" ${currentPage === 0 ? 'disabled' : ''} onclick="goPage(${currentPage - 1})">上一页</button>`;
    html += `<button class="btn btn-sm" ${currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="goPage(${currentPage + 1})">下一页</button>`;
    html += `<button class="btn btn-sm" ${currentPage >= totalPages - 1 ? 'disabled' : ''} onclick="goPage(${totalPages - 1})">末页</button>`;
    html += '</div>';
    document.getElementById('pagination').innerHTML = html;
}

function goPage(page) {
    currentPage = page;
    loadData();
}


async function showDetail(id) {
    const r = await fetchJSON(`${API}/reviews/${id}`);
    const s = statusMap[r.status] || { text: r.status, class: '' };
    const displayName = r.isAnonymous ? '匿名用户' : (r.userName || '未知用户');
    
    let imagesHtml = '';
    if (r.images) {
        const imgs = r.images.split(',').filter(i => i.trim());
        if (imgs.length > 0) {
            imagesHtml = `<div class="review-images">${imgs.map(img => `<img src="${img.trim()}" alt="评价图片" onerror="this.style.display='none'">`).join('')}</div>`;
        }
    }
    
    document.getElementById('detail-content').innerHTML = `
        <div class="review-detail">
            <div class="review-header">
                <span class="review-user">${displayName}</span>
                <span class="review-rating">${renderStars(r.rating)}</span>
                <span class="badge ${s.class}">${s.text}</span>
            </div>
            <div class="review-product">商品: ${r.productName || '-'}</div>
            <div class="review-content">${r.content}</div>
            ${imagesHtml}
            <div class="review-time">${formatDate(r.createdAt)}</div>
            ${r.adminReply ? `
                <div class="admin-reply">
                    <div class="reply-label">商家回复:</div>
                    <div class="reply-content">${r.adminReply}</div>
                    <div class="reply-time">${formatDate(r.replyAt)}</div>
                </div>
            ` : ''}
        </div>`;
    document.getElementById('detail-modal').classList.remove('hidden');
}

async function approveReview(id) {
    if (!confirm('确定通过此评价？')) return;
    await fetchJSON(`${API}/reviews/${id}/approve`, { method: 'PUT' });
    loadData();
}

async function rejectReview(id) {
    if (!confirm('确定拒绝此评价？')) return;
    await fetchJSON(`${API}/reviews/${id}/reject`, { method: 'PUT' });
    loadData();
}

async function deleteReview(id) {
    if (!confirm('确定删除此评价？此操作不可恢复！')) return;
    await fetchJSON(`${API}/reviews/${id}`, { method: 'DELETE' });
    loadData();
}

function showReplyModal(id) {
    document.getElementById('reply-id').value = id;
    document.getElementById('reply-content').value = '';
    document.getElementById('reply-modal').classList.remove('hidden');
}

document.getElementById('reply-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('reply-id').value;
    await fetchJSON(`${API}/reviews/${id}/reply`, {
        method: 'PUT',
        body: JSON.stringify({ reply: document.getElementById('reply-content').value })
    });
    closeModal('reply-modal');
    loadData();
    alert('回复成功');
};

// 创建评价
function showCreateModal() {
    document.getElementById('review-product').value = products[0]?.id || '';
    document.getElementById('review-user').value = '';
    document.getElementById('review-content').value = '';
    document.getElementById('review-images').value = '';
    document.getElementById('review-anonymous').checked = false;
    setRating(5);
    document.getElementById('create-modal').classList.remove('hidden');
}

function setRating(value) {
    document.getElementById('review-rating').value = value;
    document.querySelectorAll('#rating-input .star').forEach((star, idx) => {
        star.classList.toggle('active', idx < value);
    });
}

// 星级点击事件
document.querySelectorAll('#rating-input .star').forEach(star => {
    star.addEventListener('click', () => setRating(parseInt(star.dataset.value)));
});

document.getElementById('create-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        productId: document.getElementById('review-product').value,
        userName: document.getElementById('review-user').value,
        rating: document.getElementById('review-rating').value,
        content: document.getElementById('review-content').value,
        images: document.getElementById('review-images').value || null,
        isAnonymous: document.getElementById('review-anonymous').checked
    };
    await fetchJSON(`${API}/reviews`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    closeModal('create-modal');
    loadData();
    alert('评价提交成功，等待审核');
};

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

loadProducts().then(() => loadData());
