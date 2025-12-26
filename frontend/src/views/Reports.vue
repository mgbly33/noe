<template>
  <div class="reports-container">
    <!-- 核心指标卡片 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header><span class="card-header">今日销售额</span></template>
          <div class="stat-value">¥{{ stats.todaySales || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header><span class="card-header">今日订单</span></template>
          <div class="stat-value">{{ stats.todayOrders || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header><span class="card-header">总销售额</span></template>
          <div class="stat-value">¥{{ stats.totalSales || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header><span class="card-header">总订单数</span></template>
          <div class="stat-value">{{ stats.totalOrders || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 销售趋势图 -->
    <el-card shadow="hover" class="mb-4">
      <template #header>
        <div class="flex justify-between items-center">
          <span>销售趋势</span>
          <el-radio-group v-model="trendPeriod" size="small" @change="fetchTrendData">
            <el-radio-button label="day">近30天</el-radio-button>
            <el-radio-button label="month">近12月</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div class="chart-container">
        <v-chart class="chart" :option="trendOption" autoresize />
      </div>
    </el-card>

    <el-row :gutter="20">
      <!-- 订单状态分布 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>订单状态分布</span></template>
          <div class="chart-container">
            <v-chart class="chart" :option="pieOption" autoresize />
          </div>
        </el-card>
      </el-col>
      
      <!-- 热销商品排行 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>热销商品 TOP 5</span></template>
          <div class="chart-container">
            <v-chart class="chart" :option="barOption" autoresize />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import api from '../api'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const stats = ref({})
const trendPeriod = ref('day')

// 图表配置
const trendOption = reactive({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: [] },
  yAxis: { type: 'value' },
  series: [
    { name: '销售额', type: 'line', smooth: true, data: [], itemStyle: { color: '#409EFF' }, areaStyle: { opacity: 0.1 } },
    { name: '订单数', type: 'line', smooth: true, yAxisIndex: 0, data: [], itemStyle: { color: '#67C23A' } }
  ]
})

const pieOption = reactive({
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', left: 'left' },
  series: [
    {
      name: '订单状态',
      type: 'pie',
      radius: '50%',
      data: [],
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }
  ]
})

const barOption = reactive({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'value' },
  yAxis: { type: 'category', data: [] },
  series: [
    {
      name: '销量',
      type: 'bar',
      data: [],
      itemStyle: { color: '#E6A23C' }
    }
  ]
})

const statusText = { PENDING_PAYMENT: '待付款', PENDING_SHIPMENT: '待发货', SHIPPED: '已发货', COMPLETED: '已完成', CANCELLED: '已取消' }

// 获取数据
const fetchData = async () => {
  try {
    const [salesRes, topRes, orderRes] = await Promise.all([
      api.get('/reports/sales-summary'),
      api.get('/reports/top-products?limit=5'),
      api.get('/reports/order-status')
    ])
    
    // 基础统计
    stats.value = salesRes.data

    // 订单状态饼图
    pieOption.series[0].data = orderRes.data.map(item => ({
      value: item.count,
      name: statusText[item.status] || item.status
    }))

    // 热销商品柱状图 (数据反转以匹配yAxis从下到上)
    const topData = topRes.data.reverse()
    barOption.yAxis.data = topData.map(item => item.product_name)
    barOption.series[0].data = topData.map(item => item.total_quantity)

    // 获取趋势数据
    fetchTrendData()
  } catch (e) {
    console.error('获取报表数据失败:', e)
  }
}

const fetchTrendData = async () => {
  try {
    const res = await api.get(`/reports/sales-trend?period=${trendPeriod.value}`)
    const data = res.data
    trendOption.xAxis.data = data.map(item => item.date)
    trendOption.series[0].data = data.map(item => item.sales)
    trendOption.series[1].data = data.map(item => item.orders)
  } catch (e) {
    console.error('获取趋势数据失败:', e)
  }
}

onMounted(fetchData)
</script>

<style scoped>
.mb-4 { margin-bottom: 20px; }
.card-header { font-weight: bold; color: #606266; }
.stat-value { font-size: 24px; font-weight: bold; margin-top: 10px; color: #303133; }
.chart-container { height: 350px; width: 100%; }
.chart { height: 100%; width: 100%; }
</style>
