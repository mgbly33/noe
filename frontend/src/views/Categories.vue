<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>分类管理</span>
          <el-button type="primary" @click="showDialog()">添加分类</el-button>
        </div>
      </template>
      <el-table :data="categories" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="showDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑分类' : '添加分类'" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" /></el-form-item>
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

const categories = ref([])
const dialogVisible = ref(false)
const form = reactive({ id: null, name: '', description: '' })

const loadData = async () => {
  const { data } = await api.get('/categories')
  categories.value = data
}

const showDialog = (row = null) => {
  Object.assign(form, row || { id: null, name: '', description: '' })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (form.id) {
      await api.put(`/categories/${form.id}`, form)
    } else {
      await api.post('/categories', form)
    }
    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(e.response?.data || '操作失败')
  }
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除此分类？', '提示', { type: 'warning' })
  await api.delete(`/categories/${id}`)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(loadData)
</script>
