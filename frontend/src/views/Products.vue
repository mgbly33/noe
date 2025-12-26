<template>
  <div class="products-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-bold">商品管理</span>
          <div class="flex gap-2">
            <el-button type="success" @click="exportData">导出 Excel</el-button>
            <el-button type="primary" @click="showDialog()">添加商品</el-button>
          </div>
        </div>
      </template>
      <el-table :data="products" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <el-image 
              v-if="row.imageUrl" 
              :src="getImageUrl(row.imageUrl)" 
              :preview-src-list="[getImageUrl(row.imageUrl)]"
              fit="cover" 
              class="w-12 h-12 rounded"
              style="width: 50px; height: 50px"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <span v-else class="text-gray-400 text-xs">无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="category.name" label="分类" width="120" />
        <el-table-column label="价格" width="120">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span v-if="row.isOnPromotion" class="text-xs text-gray-400 line-through">¥{{ row.standardPrice }}</span>
              <span :class="{'text-red-500 font-bold': row.isOnPromotion}">
                ¥{{ row.isOnPromotion ? row.promotionPrice : row.standardPrice }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100">
          <template #default="{ row }">
            <el-tag :type="row.stock < 10 ? 'danger' : 'success'">{{ row.stock }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="showDialog(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑商品' : '添加商品'" width="600px" destroy-on-close>
      <el-form :model="form" label-width="80px" class="mt-4">
        <el-form-item label="商品图片">
          <el-upload
            class="avatar-uploader"
            action="/api/files/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :headers="uploadHeaders"
            name="file"
          >
            <img v-if="form.imageUrl" :src="getImageUrl(form.imageUrl)" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="text-xs text-gray-400 mt-1">支持 JPG/PNG，不超过 2MB</div>
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="分类" required>
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="原价" required>
              <el-input-number v-model="form.standardPrice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" required>
              <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="促销">
              <el-switch v-model="form.isOnPromotion" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.isOnPromotion">
            <el-form-item label="促销价" required>
              <el-input-number v-model="form.promotionPrice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="商品详细描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Picture } from '@element-plus/icons-vue'
import api from '../api'

const products = ref([])
const categories = ref([])
const dialogVisible = ref(false)
const loading = ref(false)
const submitting = ref(false)

const form = reactive({ 
  id: null, 
  name: '', 
  categoryId: null, 
  standardPrice: 0, 
  promotionPrice: 0,
  isOnPromotion: false,
  stock: 0, 
  description: '',
  imageUrl: ''
})

const uploadHeaders = computed(() => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
})

const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `http://localhost:8080${path}`
}

const loadData = async () => {
  loading.value = true
  try {
    const [p, c] = await Promise.all([api.get('/products'), api.get('/categories')])
    products.value = p.data
    categories.value = c.data
  } catch (e) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const exportData = async () => {
  try {
    const response = await api.get('/export/products', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'products.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (e) {
    ElMessage.error('导出失败')
  }
}

const showDialog = (row = null) => {
  if (row) {
    Object.assign(form, {
      ...row,
      categoryId: row.category?.id,
      promotionPrice: row.promotionPrice || 0
    })
  } else {
    Object.assign(form, { 
      id: null, 
      name: '', 
      categoryId: categories.value[0]?.id, 
      standardPrice: 0, 
      promotionPrice: 0,
      isOnPromotion: false,
      stock: 0, 
      description: '',
      imageUrl: ''
    })
  }
  dialogVisible.value = true
}

const handleAvatarSuccess = (response) => {
  // response 是后端返回的 URL 字符串
  form.imageUrl = response
  ElMessage.success('图片上传成功')
}

const beforeAvatarUpload = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('图片必须是 JPG 或 PNG 格式!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!form.name || !form.categoryId) {
    return ElMessage.warning('请填写必填项')
  }
  
  submitting.value = true
  try {
    // 构造提交数据
    const data = { ...form }
    // 如果没有促销，清空促销价
    if (!data.isOnPromotion) {
      data.promotionPrice = null
    }

    if (form.id) {
      await api.put(`/products/${form.id}`, data)
    } else {
      await api.post('/products', data)
    }
    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(e.response?.data || '操作失败')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除此商品？', '提示', { type: 'warning' })
    await api.delete(`/products/${id}`)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    // cancelled
  }
}

onMounted(loadData)
</script>

<style scoped>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}
</style>
