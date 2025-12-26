let categories = [];

async function loadData() {
    categories = await fetchJSON(`${API}/categories`);
    document.getElementById('table-body').innerHTML = categories.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>${c.description || '-'}</td>
            <td>${formatDate(c.createdAt)}</td>
            <td class="actions">
                <button class="btn btn-primary btn-sm" onclick="edit(${c.id})">编辑</button>
                <button class="btn btn-danger btn-sm" onclick="remove(${c.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

function showModal(item = null) {
    document.getElementById('modal-title').textContent = item ? '编辑分类' : '添加分类';
    document.getElementById('item-id').value = item?.id || '';
    document.getElementById('item-name').value = item?.name || '';
    document.getElementById('item-desc').value = item?.description || '';
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function edit(id) {
    showModal(categories.find(c => c.id === id));
}

async function remove(id) {
    if (!confirm('确定删除此分类？')) return;
    await fetchJSON(`${API}/categories/${id}`, { method: 'DELETE' });
    loadData();
}

document.getElementById('form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('item-id').value;
    const data = {
        name: document.getElementById('item-name').value,
        description: document.getElementById('item-desc').value
    };
    await fetchJSON(`${API}/categories${id ? '/' + id : ''}`, {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(data)
    });
    closeModal();
    loadData();
};

loadData();
