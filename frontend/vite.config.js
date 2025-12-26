import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 将所有以 /api 开头的请求代理到 http://localhost:8080
      '/api': {
        target: 'http://localhost:8080', // 这是你的 Spring Boot 后端地址
        changeOrigin: true             // 必须设置为 true，开启跨域
        // 移除了 rewrite 规则，因为后端接口本身就带 /api
      }
    }
  }
})
