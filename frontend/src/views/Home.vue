<template>
  <div class="home">
    <h2>欢迎使用商城管理系统</h2>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>商品总数</template>
          <div class="stat-value">{{ stats.productCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>订单总数</template>
          <div class="stat-value">{{ stats.orderCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>用户总数</template>
          <div class="stat-value">{{ stats.userCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>今日销售额</template>
          <div class="stat-value">¥{{ stats.todaySales }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const stats = ref({ productCount: 0, orderCount: 0, userCount: 0, todaySales: 0 })

onMounted(async () => {
  try {
    const [products, orders] = await Promise.all([
      api.get('/products'),
      api.get('/orders')
    ])
    stats.value.productCount = products.data.length
    stats.value.orderCount = orders.data.content?.length || orders.data.length || 0
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.home h2 { color: #303133; }
.stat-value { font-size: 32px; font-weight: bold; color: #409EFF; text-align: center; }
</style>
