<script setup>
import { onMounted, ref } from 'vue'
import { useRouter }     from 'vue-router'
import { useAuthStore }  from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()
const error  = ref('')

onMounted(async () => {
  const params      = new URLSearchParams(window.location.search)
  const code        = params.get('code')
  const redirectUri = `${window.location.origin}/callback`

  if (!code) { error.value = '未取得授權碼，請重新登入'; return }

  try {
    await auth.loginWithCode(code, redirectUri)
    router.replace('/')
  } catch (e) {
    error.value = e.message || '登入失敗，請稍後再試'
  }
})
</script>

<template>
  <div class="cb-wrap">
    <div v-if="!error" class="loading">
      <div class="spinner" />
      <p>正在登入中…</p>
    </div>
    <div v-else class="err-box">
      <p class="err-msg">{{ error }}</p>
      <RouterLink to="/login" class="back-btn">返回登入</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.cb-wrap {
  min-height: 100%;
  display: flex; align-items: center; justify-content: center;
  flex-direction: column; gap: 16px;
}
.loading { display: flex; flex-direction: column; align-items: center; gap: 12px; color: #9a8e7a; }
.spinner {
  width: 40px; height: 40px;
  border: 3px solid #2d3555;
  border-top-color: #d4a017;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.err-box { text-align: center; }
.err-msg { color: #f87171; margin-bottom: 16px; }
.back-btn {
  padding: 10px 20px; background: linear-gradient(135deg,#d4a017,#f0c040);
  color: #0d0f1a; font-weight: 700; border-radius: 10px; text-decoration: none;
}
</style>
