import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('jwt') || '')
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)

  async function loginWithCode(code, redirectUri) {
    const res = await authApi.discordLogin(code, redirectUri)
    _saveSession(res)
  }

  async function mockLogin(discordId) {
    const res = await authApi.mockLogin(discordId)
    _saveSession(res)
  }

  function _saveSession(res) {
    token.value = res.data?.token || res.token
    user.value  = { discordId: res.data?.discordId, displayName: res.data?.displayName }
    localStorage.setItem('jwt',  token.value)
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  function logout() {
    token.value = ''
    user.value  = null
    localStorage.removeItem('jwt')
    localStorage.removeItem('user')
  }

  return { token, user, isLoggedIn, loginWithCode, mockLogin, logout }
})
