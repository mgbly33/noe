const API = '/api';

async function fetchJSON(url, options = {}) {
    const res = await fetch(url, { 
        headers: { 'Content-Type': 'application/json' }, 
        ...options 
    });
    if (!res.ok) {
        const error = await res.text();
        alert('操作失败: ' + error);
        throw new Error(error);
    }
    return res.status === 200 ? res.json() : null;
}

function closeModal(id) { 
    document.getElementById(id).classList.add('hidden'); 
}

function formatDate(dt) { 
    return dt ? new Date(dt).toLocaleString('zh-CN') : '-'; 
}
