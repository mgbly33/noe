<template>
  <div>
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>订单管理</span>
          <el-button type="success" @click="exportData">导出 Excel</el-button>
        </div>
      </template>
      <el-table :data="orders" stripe>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="buyerName" label="买家" width="100" />
        <el-table-column prop="totalAmount" label="金额">
          <template #default="{ row }">¥{{ row.totalAmount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType[row.status]">{{ statusText[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="showDetail(row)">详情</el-button>
            <el-button size="small" type="primary" v-if="row.status === 'PENDING_SHIPMENT'" @click="ship(row.id)">发货</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" title="订单详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ detail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusText[detail.status] }}</el-descriptions-item>
        <el-descriptions-item label="买家">{{ detail.buyerName }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ detail.buyerPhone }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ detail.buyerAddress }}</el-descriptions-item>
        <el-descriptions-item label="总金额">¥{{ detail.totalAmount }}</el-descriptions-item>
      </el-descriptions>
      <h4 style="margin: 15px 0">商品列表</h4>
      <el-table :data="detail.items" size="small">
        <el-table-column prop="productName" label="商品" />
        <el-table-column prop="price" label="单价">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" />
        <el-table-column prop="subtotal" label="小计">
          <template #default="{ row }">¥{{ row.subtotal }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'

const orders = ref([])
const detailVisible = ref(false)
const detail = reactive({})

const statusText = { PENDING_PAYMENT: '待付款', PENDING_SHIPMENT: '待发货', SHIPPED: '已发货', COMPLETED: '已完成', CANCELLED: '已取消' }
const statusType = { PENDING_PAYMENT: 'warning', PENDING_SHIPMENT: 'info', SHIPPED: 'primary', COMPLETED: 'success', CANCELLED: 'danger' }

const formatDate = (dt) => dt ? new Date(dt).toLocaleString('zh-CN') : '-'

const loadData = async () => {
  const { data } = await api.get('/orders')
  orders.value = data.content || data
}

const exportData = async () => {
  try {
    const response = await api.get('/export/orders', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'orders.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (e) {
    ElMessage.error('导出失败')
  }
}

const showDetail = async (row) => {
  const { data } = await api.get(`/orders/${row.id}`)
  Object.assign(detail, data)
  detailVisible.value = true
}

const ship = async (id) => {
  await api.put(`/orders/${id}/ship`)
  ElMessage.success('发货成功')
  loadData()
}

onMounted(loadData)
</script>
