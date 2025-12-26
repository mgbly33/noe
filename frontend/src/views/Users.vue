<template>
  <div>
    <el-card>
      <template #header><span>用户管理</span></template>
      <el-table :data="users" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'ADMIN' ? 'danger' : 'info'">{{ row.role === 'ADMIN' ? '管理员' : '用户' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'danger'">{{ row.enabled ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="toggleRole(row)">{{ row.role === 'ADMIN' ? '设为用户' : '设为管理员' }}</el-button>
            <el-button size="small" :type="row.enabled ? 'danger' : 'success'" @click="toggleEnabled(row)">{{ row.enabled ? '禁用' : '启用' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'

const users = ref([])

const loadData = async () => {
  const { data } = await api.get('/users')
  users.value = data.content || data
}

const toggleRole = async (row) => {
  const newRole = row.role === 'ADMIN' ? 'USER' : 'ADMIN'
  await api.put(`/users/${row.id}/role`, { role: newRole })
  ElMessage.success('角色更新成功')
  loadData()
}

const toggleEnabled = async (row) => {
  await api.put(`/users/${row.id}/enabled`, { enabled: !row.enabled })
  ElMessage.success('状态更新成功')
  loadData()
}

onMounted(loadData)
</script>
