<template>
  <div>
    <el-card>
      <template #header><span>评价管理</span></template>
      <el-table :data="reviews" stripe>
        <el-table-column prop="productName" label="商品" />
        <el-table-column prop="userName" label="用户" width="100" />
        <el-table-column prop="rating" label="评分" width="120">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType[row.status]">{{ statusText[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="success" v-if="row.status === 'PENDING'" @click="approve(row.id)">通过</el-button>
            <el-button size="small" type="danger" v-if="row.status === 'PENDING'" @click="reject(row.id)">拒绝</el-button>
            <el-button size="small" @click="showReply(row)">回复</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="replyVisible" title="回复评价" width="400px">
      <el-input v-model="replyContent" type="textarea" rows="4" placeholder="请输入回复内容" />
      <template #footer>
        <el-button @click="replyVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'

const reviews = ref([])
const replyVisible = ref(false)
const replyContent = ref('')
const currentReviewId = ref(null)

const statusText = { PENDING: '待审核', APPROVED: '已通过', REJECTED: '已拒绝' }
const statusType = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' }

const loadData = async () => {
  const { data } = await api.get('/reviews')
  reviews.value = data.content || data
}

const approve = async (id) => {
  await api.put(`/reviews/${id}/approve`)
  ElMessage.success('审核通过')
  loadData()
}

const reject = async (id) => {
  await api.put(`/reviews/${id}/reject`)
  ElMessage.success('已拒绝')
  loadData()
}

const showReply = (row) => {
  currentReviewId.value = row.id
  replyContent.value = row.adminReply || ''
  replyVisible.value = true
}

const submitReply = async () => {
  await api.put(`/reviews/${currentReviewId.value}/reply`, { reply: replyContent.value })
  ElMessage.success('回复成功')
  replyVisible.value = false
  loadData()
}

onMounted(loadData)
</script>
