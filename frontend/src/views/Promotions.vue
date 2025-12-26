<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>优惠券管理</span>
          <el-button type="primary" @click="showDialog()">添加优惠券</el-button>
        </div>
      </template>
      <el-table :data="coupons" stripe>
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="code" label="优惠码" width="120" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">{{ row.type === 'FIXED' ? '满减' : '折扣' }}</template>
        </el-table-column>
        <el-table-column label="优惠" width="100">
          <template #default="{ row }">{{ row.type === 'FIXED' ? `¥${row.value}` : `${row.value}%` }}</template>
        </el-table-column>
        <el-table-column prop="usedCount" label="已使用" width="80" />
        <el-table-column prop="enabled" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="showDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑优惠券' : '添加优惠券'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="优惠码"><el-input v-model="form.code" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type">
            <el-option label="满减" value="FIXED" />
            <el-option label="折扣" value="PERCENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="优惠值"><el-input-number v-model="form.value" :min="0" /></el-form-item>
        <el-form-item label="最低消费"><el-input-number v-model="form.minAmount" :min="0" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="form.enabled" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'

const coupons = ref([])
const dialogVisible = ref(false)
const form = reactive({ id: null, name: '', code: '', type: 'FIXED', value: 0, minAmount: 0, enabled: true })

const loadData = async () => {
  const { data } = await api.get('/promotions/coupons')
  coupons.value = data
}

const showDialog = (row = null) => {
  Object.assign(form, row || { id: null, name: '', code: '', type: 'FIXED', value: 0, minAmount: 0, enabled: true })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (form.id) {
      await api.put(`/promotions/coupons/${form.id}`, form)
    } else {
      await api.post('/promotions/coupons', form)
    }
    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(e.response?.data || '操作失败')
  }
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除此优惠券？', '提示', { type: 'warning' })
  await api.delete(`/promotions/coupons/${id}`)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(loadData)
</script>
