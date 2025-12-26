async function loadData() {
    const products = await fetchJSON(`${API}/products`);
    renderTable(products);
}

async function loadLowStock() {
    const threshold = document.getElementById('threshold').value;
    const products = await fetchJSON(`${API}/products/low-stock?threshold=${threshold}`);
    renderTable(products);
}

function renderTable(products) {
    document.getElementById('table-body').innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.category?.name || '-'}</td>
            <td>${p.stock} ${p.stock < 10 ? '<span class="badge badge-low">低库存</span>' : ''}</td>
            <td>
                <button class="btn btn-success btn-sm" onclick="showModal(${p.id}, '${p.name}', ${p.stock})">修改库存</button>
            </td>
        </tr>
    `).join('');
}

function showModal(id, name, stock) {
    document.getElementById('item-id').value = id;
    document.getElementById('item-name').textContent = name;
    document.getElementById('item-stock').value = stock;
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

document.getElementById('form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('item-id').value;
    const stock = parseInt(document.getElementById('item-stock').value);
    await fetchJSON(`${API}/products/${id}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ stock })
    });
    closeModal();
    loadData();
};

loadData();
