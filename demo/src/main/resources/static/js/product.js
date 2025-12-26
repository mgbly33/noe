let categories = [], products = [];

async function loadCategories() {
    categories = await fetchJSON(`${API}/categories`);
    const options = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    document.getElementById('category-filter').innerHTML = '<option value="">全部分类</option>' + options;
    document.getElementById('item-category').innerHTML = options;
}

async function loadData() {
    const categoryId = document.getElementById('category-filter').value;
    const url = categoryId ? `${API}/products?categoryId=${categoryId}` : `${API}/products`;
    products = await fetchJSON(url);
    document.getElementById('table-body').innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.category?.name || '-'}</td>
            <td>${p.isOnPromotion && p.promotionPrice 
                ? `<span class="price-original">¥${p.standardPrice}</span> <span class="price-promo">¥${p.promotionPrice}</span>` 
                : `¥${p.standardPrice}`}</td>
            <td>${p.stock} ${p.stock < 10 ? '<span class="badge badge-low">低</span>' : ''}</td>
            <td class="actions">
                <button class="btn btn-primary btn-sm" onclick="edit(${p.id})">编辑</button>
                <button class="btn btn-danger btn-sm" onclick="remove(${p.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

function showModal(item = null) {
    document.getElementById('modal-title').textContent = item ? '编辑商品' : '添加商品';
    document.getElementById('item-id').value = item?.id || '';
    document.getElementById('item-name').value = item?.name || '';
    document.getElementById('item-category').value = item?.category?.id || categories[0]?.id || '';
    document.getElementById('item-price').value = item?.standardPrice || '';
    document.getElementById('item-stock').value = item?.stock ?? 0;
    document.getElementById('item-desc').value = item?.description || '';
    document.getElementById('item-image').value = item?.imageUrl || '';
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

async function edit(id) {
    const prod = await fetchJSON(`${API}/products/${id}`);
    showModal(prod);
}

async function remove(id) {
    if (!confirm('确定删除此商品？')) return;
    await fetchJSON(`${API}/products/${id}`, { method: 'DELETE' });
    loadData();
}

document.getElementById('form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('item-id').value;
    const data = {
        name: document.getElementById('item-name').value,
        categoryId: document.getElementById('item-category').value,
        standardPrice: document.getElementById('item-price').value,
        stock: parseInt(document.getElementById('item-stock').value),
        description: document.getElementById('item-desc').value,
        imageUrl: document.getElementById('item-image').value
    };
    await fetchJSON(`${API}/products${id ? '/' + id : ''}`, {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(data)
    });
    closeModal();
    loadData();
};

loadCategories().then(() => loadData());
