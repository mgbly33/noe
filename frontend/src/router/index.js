import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { public: true } },
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/products', name: 'Products', component: () => import('../views/Products.vue') },
  { path: '/categories', name: 'Categories', component: () => import('../views/Categories.vue') },
  { path: '/orders', name: 'Orders', component: () => import('../views/Orders.vue') },
  { path: '/users', name: 'Users', component: () => import('../views/Users.vue'), meta: { admin: true } },
  { path: '/promotions', name: 'Promotions', component: () => import('../views/Promotions.vue') },
  { path: '/reviews', name: 'Reviews', component: () => import('../views/Reviews.vue') },
  { path: '/reports', name: 'Reports', component: () => import('../views/Reports.vue'), meta: { admin: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = store.getters.isLoggedIn
  const isAdmin = store.getters.isAdmin
  
  if (to.meta.public) {
    next()
  } else if (!isLoggedIn) {
    next('/login')
  } else if (to.meta.admin && !isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router
