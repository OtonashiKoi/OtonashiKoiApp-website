<script setup>
import { ref, onMounted } from 'vue'
import { combatApi } from '@/api'

const ZONES = [
  { key: 'beginner', label: '🌱 新手區', desc: 'Lv.1–3', color: '#22c55e' },
  { key: 'normal',   label: '⚔️ 一般區', desc: 'Lv.1+ 無上限', color: '#3b82f6' },
  { key: 'mid',      label: '✦ 中級區',  desc: 'Lv.10+ 無上限', color: '#a855f7' },
  { key: 'hard',     label: '🔥 高級區',  desc: 'Lv.20+',  color: '#f97316' },
  { key: 'elite',    label: '💀 精英區',  desc: 'Lv.20+ 無上限', color: '#ef4444' },
]

const selectedZone = ref(null)
const fighting      = ref(false)
const battleResult  = ref(null)
const battleError   = ref('')

function selectZone(z) {
  selectedZone.value = z
  battleResult.value = null
  battleError.value  = ''
}

async function fight() {
  if (!selectedZone.value || fighting.value) return
  fighting.value     = true
  battleResult.value = null
  battleError.value  = ''
  try {
    const res = await combatApi.quickBattle(selectedZone.value.key)
    battleResult.value = res.data ?? res
  } catch (e) {
    battleError.value = e.message || '戰鬥失敗'
  } finally {
    fighting.value = false
  }
}

const WIN_COLOR  = '#22c55e'
const LOSE_COLOR = '#ef4444'
</script>

<template>
  <div class="page">
    <h2 class="page-title">👾 怪物區</h2>

    <!-- Zone 選擇 -->
    <div class="zone-list">
      <button
        v-for="z in ZONES"
        :key="z.key"
        class="zone-card"
        :class="{ active: selectedZone?.key === z.key }"
        :style="selectedZone?.key === z.key ? { borderColor: z.color, boxShadow: `0 0 12px ${z.color}44` } : {}"
        @click="selectZone(z)"
      >
        <span class="zone-label">{{ z.label }}</span>
        <span class="zone-desc">{{ z.desc }}</span>
      </button>
    </div>

    <!-- 戰鬥按鈕 -->
    <div class="fight-area" v-if="selectedZone">
      <div class="selected-zone-info">
        選擇：<strong style="color: #f0c040">{{ selectedZone.label }}</strong>
      </div>
      <button class="btn-fight" :disabled="fighting" @click="fight">
        <span v-if="!fighting">⚔️ 出擊！</span>
        <span v-else>戰鬥中…</span>
      </button>
    </div>

    <!-- 戰鬥結果 -->
    <div v-if="battleError" class="battle-error">❌ {{ battleError }}</div>

    <div v-if="battleResult" class="battle-result" :style="{ borderColor: battleResult.win ? WIN_COLOR : LOSE_COLOR }">
      <div class="result-header" :style="{ color: battleResult.win ? WIN_COLOR : LOSE_COLOR }">
        {{ battleResult.win ? '🏆 勝利！' : '💀 敗北' }}
      </div>

      <!-- 怪物資訊 -->
      <div class="monster-row" v-if="battleResult.monster">
        <span class="monster-name">{{ battleResult.monster.name }}</span>
        <span class="monster-hp">HP: {{ battleResult.monster.hpBefore }} → {{ battleResult.monster.hpAfter }}</span>
      </div>

      <!-- 戰鬥回合 -->
      <div class="battle-log" v-if="battleResult.rounds?.length">
        <div
          v-for="(round, i) in battleResult.rounds"
          :key="i"
          class="round-row"
        >
          <span class="round-num">R{{ i+1 }}</span>
          <span class="round-dmg player-dmg">你 → {{ round.playerDmg }}</span>
          <span class="round-dmg monster-dmg">怪 → {{ round.monsterDmg }}</span>
        </div>
      </div>

      <!-- 獎勵 -->
      <div class="rewards" v-if="battleResult.rewards">
        <div class="reward-title">🎁 獎勵</div>
        <div class="reward-row" v-if="battleResult.rewards.exp">
          EXP +{{ battleResult.rewards.exp }}
        </div>
        <div class="reward-row" v-if="battleResult.rewards.gold">
          💰 金幣 +{{ battleResult.rewards.gold }}
        </div>
        <div
          v-for="item in (battleResult.rewards.items || [])"
          :key="item.name"
          class="reward-row"
        >
          📦 {{ item.name }} ×{{ item.qty ?? 1 }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { padding: 0 12px 16px; }
.page-title { font-size: 18px; font-weight: 700; color: #f0c040; margin: 16px 0 12px; }

.zone-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.zone-card {
  display: flex; justify-content: space-between; align-items: center;
  background: #161b2e; border: 1px solid #2d3555; border-radius: 12px;
  padding: 14px 16px; cursor: pointer; transition: all 0.2s;
  text-align: left;
}
.zone-card:active { opacity: 0.8; }
.zone-label { font-size: 15px; font-weight: 700; color: #e8dcc8; }
.zone-desc { font-size: 12px; color: #9a8e7a; }

.fight-area { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 16px; }
.selected-zone-info { font-size: 13px; color: #9a8e7a; }
.btn-fight {
  width: 100%; padding: 16px;
  background: linear-gradient(135deg, #d4a017, #f0c040);
  color: #0d0f1a; font-size: 18px; font-weight: 700;
  border: none; border-radius: 14px; cursor: pointer;
  transition: opacity 0.2s;
}
.btn-fight:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-fight:active:not(:disabled) { opacity: 0.8; }

.battle-error { color: #ef4444; font-size: 14px; text-align: center; margin-bottom: 12px; }

.battle-result {
  background: #161b2e; border: 1px solid; border-radius: 14px; padding: 16px;
}
.result-header { font-size: 20px; font-weight: 700; text-align: center; margin-bottom: 12px; }
.monster-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 10px; }
.monster-name { color: #e8dcc8; font-weight: 600; }
.monster-hp { color: #9a8e7a; }

.battle-log { max-height: 200px; overflow-y: auto; margin-bottom: 10px; }
.round-row { display: flex; gap: 8px; font-size: 12px; padding: 4px 0; border-bottom: 1px solid #2d3555; }
.round-num { color: #9a8e7a; width: 28px; flex-shrink: 0; }
.player-dmg { color: #22c55e; }
.monster-dmg { color: #ef4444; }

.rewards { background: #0d0f1a; border-radius: 10px; padding: 10px; }
.reward-title { font-size: 13px; font-weight: 700; color: #f0c040; margin-bottom: 6px; }
.reward-row { font-size: 12px; color: #e8dcc8; margin-bottom: 3px; }
</style>
