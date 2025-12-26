<template>
  <div id="app">
    <el-container v-if="isLoggedIn">
      <el-aside width="200px">
        <el-menu :default-active="$route.path" router background-color="#304156" text-color="#bfcbd9" active-text-color="#409EFF">
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/products">
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </el-menu-item>
          <el-menu-item index="/categories">
            <el-icon><Menu /></el-icon>
            <span>分类管理</span>
          </el-menu-item>
          <el-menu-item index="/orders">
            <el-icon><List /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/users" v-if="isAdmin">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/promotions">
            <el-icon><Discount /></el-icon>
            <span>促销管理</span>
          </el-menu-item>
          <el-menu-item index="/reviews">
            <el-icon><ChatDotRound /></el-icon>
            <span>评价管理</span>
          </el-menu-item>
          <el-menu-item index="/reports" v-if="isAdmin">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据报表</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div class="header-content">
            <span class="title">商城管理系统</span>
            <div class="user-info">
              <span>{{ user?.name }}</span>
              <el-button type="text" @click="logout">退出</el-button>
            </div>
          </div>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
    <router-view v-else />
  </div>
</template>

<script>
import { computed, watch, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { HomeFilled, Goods, Menu, List, User, Discount, ChatDotRound, DataAnalysis } from '@element-plus/icons-vue'

export default {
  name: 'App',
  components: { HomeFilled, Goods, Menu, List, User, Discount, ChatDotRound, DataAnalysis },
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const isLoggedIn = computed(() => store.getters.isLoggedIn)
    const isAdmin = computed(() => store.getters.isAdmin)
    const user = computed(() => store.state.user)
    
    let stompClient = null
    
    const connectWebSocket = () => {
      // 避免重复连接
      if (stompClient && stompClient.connected) return

      import('sockjs-client/dist/sockjs.min.js').then((SockJS) => {
        import('@stomp/stompjs').then(({ Stomp }) => {
          const socket = new SockJS.default('http://localhost:8080/ws')
          stompClient = Stomp.over(socket)
          stompClient.debug = () => {} // 禁用调试日志
          
          stompClient.connect({}, () => {
             // 订阅通知
             stompClient.subscribe('/topic/notifications', (message) => {
               const body = JSON.parse(message.body)
               if (body.type === 'NEW_ORDER') {
                 ElNotification({
                   title: '新订单提醒',
                   message: body.message,
                   type: 'success',
                   duration: 0, // 不自动关闭
                   position: 'bottom-right',
                   onClick: () => router.push('/orders')
                 })
               }
             })
          }, (err) => {
            console.error('WebSocket连接失败', err)
            // 5秒后重连
            setTimeout(connectWebSocket, 5000)
          })
        })
      })
    }
    
    const disconnectWebSocket = () => {
      if (stompClient) {
        stompClient.disconnect()
        stompClient = null
      }
    }
    
    // 监听登录状态变化
    watch(isLoggedIn, (newVal) => {
      if (newVal) {
        connectWebSocket()
      } else {
        disconnectWebSocket()
      }
    })
    
    onMounted(() => {
      if (isLoggedIn.value) {
        connectWebSocket()
      }
    })
    
    onUnmounted(() => {
      disconnectWebSocket()
    })
    
    const logout = () => {
      store.dispatch('logout')
      router.push('/login')
    }
    
    return { isLoggedIn, isAdmin, user, logout }
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { height: 100%; }
.el-container { height: 100%; }
.el-aside { background-color: #304156; }
.el-header { background-color: #fff; border-bottom: 1px solid #e6e6e6; }
.header-content { display: flex; justify-content: space-between; align-items: center; height: 100%; }
.title { font-size: 18px; font-weight: bold; }
.user-info { display: flex; align-items: center; gap: 10px; }
.el-main { background-color: #f5f7fa; }
</style>
