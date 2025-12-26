import { createStore } from 'vuex'
import api from '../api'

export default createStore({
  state: {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null')
  },
  getters: {
    isLoggedIn: state => !!state.token,
    isAdmin: state => state.user?.role === 'ADMIN'
  },
  mutations: {
    SET_AUTH(state, { token, user }) {
      state.token = token
      state.user = user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    CLEAR_AUTH(state) {
      state.token = null
      state.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },
  actions: {
    async login({ commit }, credentials) {
      const { data } = await api.post('/auth/login', credentials)
      commit('SET_AUTH', { token: data.token, user: data.user })
      return data
    },
    logout({ commit }) {
      commit('CLEAR_AUTH')
    }
  }
})
