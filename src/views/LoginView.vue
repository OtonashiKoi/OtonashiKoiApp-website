<script setup>
import { computed, ref } from 'vue'
import { useRouter }    from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID || ''
const REDIRECT_URI      = `${window.location.origin}/callback`
const IS_DEV            = import.meta.env.DEV

const auth   = useAuthStore()
const router = useRouter()

const mockId    = ref('')
const mockError = ref('')
const mocking   = ref(false)

const oauthUrl = computed(() => {
  const params = new URLSearchParams({
    client_id:     DISCORD_CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    scope:         'identify guilds.members.read',
  })
  return `https://discord.com/api/oauth2/authorize?${params}`
})

async function devLogin() {
  if (!mockId.value.trim()) return
  mocking.value   = true
  mockError.value = ''
  try {
    await auth.mockLogin(mockId.value.trim())
    router.replace('/')
  } catch (e) {
    mockError.value = e.message || '登入失敗'
  } finally { mocking.value = false }
}
</script>

<template>
  <div class="login-bg">
    <div class="login-card">
      <div class="logo-area">
        <div class="game-logo">⚔️</div>
        <h1 class="game-title">冒險者世界</h1>
        <p class="game-sub">Equipment Game — Web 版</p>
      </div>

      <div class="divider" />

      <p class="login-hint">使用 Discord 帳號登入，繼續你的冒險</p>

      <a :href="oauthUrl" class="discord-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.014.043.03.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
        </svg>
        以 Discord 登入
      </a>

      <p v-if="!DISCORD_CLIENT_ID" class="warn">
        ⚠️ 需設定 VITE_DISCORD_CLIENT_ID 環境變數
      </p>

      <!-- 開發快速登入（只在 dev 模式顯示） -->
      <template v-if="IS_DEV">
        <div class="dev-divider">— 開發模式快速登入 —</div>
        <div class="dev-row">
          <input
            v-model="mockId"
            class="dev-input"
            placeholder="貼上 Discord ID"
            @keydown.enter="devLogin"
          />
          <button class="dev-btn" :disabled="mocking" @click="devLogin">
            {{ mocking ? '…' : '進入' }}
          </button>
        </div>
        <p v-if="mockError" class="warn">{{ mockError }}</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.login-bg {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: radial-gradient(ellipse at 50% 0%, #1e2540 0%, #0d0f1a 70%);
}
.login-card {
  width: 100%;
  max-width: 340px;
  background: linear-gradient(180deg, #1e2540 0%, #161b2e 100%);
  border: 1px solid #d4a017;
  border-radius: 20px;
  padding: 40px 28px;
  box-shadow: 0 0 40px rgba(212,160,23,0.15);
  text-align: center;
}
.logo-area { margin-bottom: 24px; }
.game-logo { font-size: 56px; margin-bottom: 8px; }
.game-title { margin: 0; font-size: 24px; font-weight: 700; color: #f0c040; }
.game-sub { margin: 4px 0 0; font-size: 12px; color: #9a8e7a; }
.divider { height: 1px; background: #2d3555; margin: 24px 0; }
.login-hint { font-size: 13px; color: #9a8e7a; margin: 0 0 20px; }
.discord-btn {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  background: #5865F2;
  color: #fff;
  font-size: 15px; font-weight: 700;
  padding: 13px 20px;
  border-radius: 12px;
  text-decoration: none;
  transition: opacity 0.2s;
}
.discord-btn:active { opacity: 0.8; }
.warn { margin-top: 16px; font-size: 11px; color: #f87171; }
.dev-divider { font-size: 11px; color: #2d3555; margin: 20px 0 10px; }
.dev-row { display: flex; gap: 8px; }
.dev-input {
  flex: 1; background: #0d0f1a; border: 1px solid #2d3555; border-radius: 8px;
  padding: 8px 12px; color: #e8dcc8; font-size: 13px; outline: none;
}
.dev-input:focus { border-color: #d4a017; }
.dev-btn {
  padding: 8px 14px; background: #2d3555; border: none; border-radius: 8px;
  color: #e8dcc8; font-size: 13px; font-weight: 600; cursor: pointer;
}
.dev-btn:disabled { opacity: 0.5; }
</style>
