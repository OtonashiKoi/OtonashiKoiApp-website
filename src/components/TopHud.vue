<script setup>
import { computed, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useAuthStore }   from '@/stores/auth'
import { useRouter }      from 'vue-router'

const player = usePlayerStore()
const auth   = useAuthStore()
const router = useRouter()

const p        = computed(() => player.profile)
const progress = computed(() => p.value?.progress)
const wallet   = computed(() => p.value?.wallet)
const expPct   = computed(() => {
  if (!progress.value) return 0
  const exp     = progress.value.exp       ?? 0
  const expNext = progress.value.nextLevelExp ?? 1
  return Math.min(100, Math.round((exp / expNext) * 100))
})

onMounted(() => { if (!p.value) player.fetchProfile() })

function logout() { auth.logout(); router.push('/login') }
</script>

<template>
  <header class="top-hud">
    <div class="hud-left">
      <div class="avatar">
        <img v-if="p?.player?.avatarUrl" :src="p.player.avatarUrl" alt="avatar" class="avatar-img" />
        <span v-else>{{ (p?.player?.displayName ?? auth.user?.displayName ?? '?')[0] }}</span>
      </div>
      <div class="player-info">
        <div class="name">{{ p?.player?.displayName ?? auth.user?.displayName ?? '玩家' }}</div>
        <div class="lv-exp">
          <span class="lv-badge">Lv.{{ progress?.level ?? 1 }}</span>
          <div class="exp-bar">
            <div class="exp-fill" :style="{ width: expPct + '%' }" />
          </div>
          <span class="exp-txt">{{ progress?.exp ?? 0 }}/{{ progress?.nextLevelExp ?? '?' }}</span>
        </div>
      </div>
    </div>

    <div class="hud-right">
      <div class="currency">
        <span class="icon">💰</span>
        <span>{{ (wallet?.gold ?? 0).toLocaleString() }}</span>
      </div>
      <div class="currency">
        <span class="icon">💎</span>
        <span>{{ (wallet?.diamond ?? 0).toLocaleString() }}</span>
      </div>
      <button class="logout-btn" @click="logout" title="登出">⏻</button>
    </div>
  </header>
</template>

<style scoped>
.top-hud {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: linear-gradient(180deg, #4a2510 0%, #2a1205 100%);
  border-bottom: 2px solid #c08030;
  box-shadow: 0 2px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,200,80,0.15);
  flex-shrink: 0;
}
.hud-left { display: flex; align-items: center; gap: 8px; }
.avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, #e8a020, #ffc840);
  color: #3a1800; font-weight: 700; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
  border: 2px solid #ffc840;
  box-shadow: 0 0 8px rgba(255,200,60,0.4);
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.player-info { display: flex; flex-direction: column; gap: 2px; }
.name { font-size: 13px; font-weight: 700; color: #ffc840; line-height: 1; text-shadow: 0 1px 4px rgba(0,0,0,0.8); }
.lv-exp { display: flex; align-items: center; gap: 4px; }
.lv-badge {
  font-size: 10px; font-weight: 700; color: #3a1800;
  background: linear-gradient(135deg, #ffd060, #e8900a);
  padding: 1px 6px; border-radius: 4px; white-space: nowrap;
  box-shadow: 0 1px 0 #7a3a00;
}
.exp-bar {
  width: 60px; height: 5px;
  background: #2a1005; border-radius: 3px; overflow: hidden;
  border: 1px solid #60300820;
}
.exp-fill { height: 100%; background: linear-gradient(90deg, #20c060, #60e890); transition: width .4s; }
.exp-txt { font-size: 9px; color: #9a7850; white-space: nowrap; }

.hud-right { display: flex; align-items: center; gap: 8px; }
.currency { display: flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 600; color: #f0e0c0; }
.currency .icon { font-size: 14px; }
.logout-btn {
  background: none; border: none; color: #9a7850; font-size: 16px;
  cursor: pointer; padding: 4px; line-height: 1;
}
</style>
