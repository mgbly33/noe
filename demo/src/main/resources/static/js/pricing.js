async function loadData() {
    const products = await fetchJSON(`${API}/products`);
    renderTable(products);
}

async function loadPromotions() {
    const products = await fetchJSON(`${API}/products/promotions`);
    renderTable(products);
}

function renderTable(products) {
    document.getElementById('table-body').innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>¥${p.standardPrice}</td>
            <td>${p.promotionPrice ? '¥' + p.promotionPrice : '-'}</td>
            <td>${p.isOnPromotion ? '<span class="badge badge-promo">促销中</span>' : '未促销'}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="showModal(${p.id}, '${p.name}', ${p.standardPrice}, ${p.promotionPrice || 'null'}, ${p.isOnPromotion})">修改价格</button>
            </td>
        </tr>
    `).join('');
}

function showModal(id, name, standard, promo, isPromo) {
    document.getElementById('item-id').value = id;
    document.getElementById('item-name').textContent = name;
    document.getElementById('item-standard').value = standard;
    document.getElementById('item-promo').value = promo || '';
    document.getElementById('item-on-promo').checked = isPromo;
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

document.getElementById('form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('item-id').value;
    const data = {
        standardPrice: document.getElementById('item-standard').value,
        promotionPrice: document.getElementById('item-promo').value || null,
        isOnPromotion: document.getElementById('item-on-promo').checked
    };
    await fetchJSON(`${API}/products/${id}/price`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    closeModal();
    loadData();
};

loadData();
