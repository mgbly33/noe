let currentPage = 0;
const pageSize = 10;

const roleMap = {
    USER: { text: '普通用户', class: 'badge-paid' },
    ADMIN: { text: '管理员', class: 'badge-completed' }
};

async function loadData() {
    const keyword = document.getElementById('search-input').value.trim();
    const role = document.getElementById('role-filter').value;
    const enabled = document.getElementById('status-filter').value;
    
    let url = `${API}/users?page=${currentPage}&size=${pageSize}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    if (role) url += `&role=${role}`;
    if (enabled) url += `&enabled=${enabled}`;
    
    const data = await fetchJSON(url);
    renderTable(data.content);
    renderPagination(data);
}

function search() {
    currentPage = 0;
    loadData();
}

function renderTable(users) {
    document.getElementById('table-body').innerHTML = users.map(u => {
        const r = roleMap[u.role] || { text: u.role, class: '' };
        return `<tr>
            <td>${u.id}</td>
            <td>${u.username}</td>
            <td>${u.name}</td>
            <td>${u.email || '-'}</td>
            <td>${u.phone || '-'}</td>
            <td><span class="badge ${r.class}">${r.text}</span></td>
            <td>${u.enabled 
                ? '<span class="badge badge-shipped">已启用</span>' 
                : '<span class="badge badge-cancelled">已禁用</span>'}</td>
            <td>${formatDate(u.createdAt)}</td>
            <td class="actions">
                <button class="btn btn-primary btn-sm" onclick="editUser(${u.id})">编辑</button>
                <button class="btn btn-info btn-sm" onclick="showRoleModal(${u.id}, '${u.name}', '${u.role}')">角色</button>
                <button class="btn btn-warning btn-sm" onclick="showPasswordModal(${u.id}, '${u.name}')">密码</button>
                <button class="btn ${u.enabled ? 'btn-danger' : 'btn-success'} btn-sm" onclick="toggleEnabled(${u.id})">${u.enabled ? '禁用' : '启用'}</button>
            </td>
        </tr>`;
    }).join('');
}

function renderPagination(data) {
    const totalPages = data.totalPages;
    if (totalPages <= 1) {
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    let html = '<div class="page-info">共 ' + data.totalElements + ' 条，第 ' + (currentPage + 1) + '/' + totalPages + ' 页</div>';
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


function showCreateModal() {
    document.getElementById('modal-title').textContent = '添加用户';
    document.getElementById('user-id').value = '';
    document.getElementById('user-username').value = '';
    document.getElementById('user-username').disabled = false;
    document.getElementById('user-name').value = '';
    document.getElementById('user-email').value = '';
    document.getElementById('user-phone').value = '';
    document.getElementById('user-password').value = '';
    document.getElementById('password-group').style.display = 'block';
    document.getElementById('user-password').required = true;
    document.getElementById('user-modal').classList.remove('hidden');
}

async function editUser(id) {
    const user = await fetchJSON(`${API}/users/${id}`);
    document.getElementById('modal-title').textContent = '编辑用户';
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-username').value = user.username;
    document.getElementById('user-username').disabled = true;
    document.getElementById('user-name').value = user.name;
    document.getElementById('user-email').value = user.email || '';
    document.getElementById('user-phone').value = user.phone || '';
    document.getElementById('password-group').style.display = 'none';
    document.getElementById('user-password').required = false;
    document.getElementById('user-modal').classList.remove('hidden');
}

document.getElementById('user-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('user-id').value;
    const data = {
        username: document.getElementById('user-username').value,
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value || null,
        phone: document.getElementById('user-phone').value || null
    };
    
    if (!id) {
        data.password = document.getElementById('user-password').value;
        if (!data.password) {
            alert('请输入密码');
            return;
        }
    }
    
    await fetchJSON(`${API}/users${id ? '/' + id : ''}`, {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(data)
    });
    closeModal('user-modal');
    loadData();
};

function showRoleModal(id, name, role) {
    document.getElementById('role-user-id').value = id;
    document.getElementById('role-user-name').textContent = '用户: ' + name;
    document.getElementById('role-select').value = role;
    document.getElementById('role-modal').classList.remove('hidden');
}

document.getElementById('role-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('role-user-id').value;
    const role = document.getElementById('role-select').value;
    await fetchJSON(`${API}/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role })
    });
    closeModal('role-modal');
    loadData();
};

function showPasswordModal(id, name) {
    document.getElementById('pwd-user-id').value = id;
    document.getElementById('pwd-user-name').textContent = '用户: ' + name;
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('password-modal').classList.remove('hidden');
}

document.getElementById('password-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('pwd-user-id').value;
    const password = document.getElementById('new-password').value;
    const confirm = document.getElementById('confirm-password').value;
    
    if (password !== confirm) {
        alert('两次输入的密码不一致');
        return;
    }
    
    await fetchJSON(`${API}/users/${id}/password`, {
        method: 'PUT',
        body: JSON.stringify({ password })
    });
    closeModal('password-modal');
    alert('密码重置成功');
};

async function toggleEnabled(id) {
    const action = event.target.textContent === '禁用' ? '禁用' : '启用';
    if (!confirm(`确定${action}此用户？`)) return;
    await fetchJSON(`${API}/users/${id}/toggle-enabled`, { method: 'PUT' });
    loadData();
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

loadData();
