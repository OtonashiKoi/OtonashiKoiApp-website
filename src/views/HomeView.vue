<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { combatApi, missionApi } from '@/api'

const player = usePlayerStore()

const zones = ref([])
const zoneLoading = ref(false)
const zoneError = ref('')
const selectedZoneKey = ref('')
const fighting = ref(false)
const fightError = ref('')
const battleRounds = ref([])
const battleRewards = ref([])
const battleOutcome = ref('')
const showBattleDetailModal = ref(false)
const showBattleModal = ref(false)
const roundPopup = ref(null)
const roundPopupTick = ref(0)
const roundPlaybackMs = ref(900)
const cooldownUntil = ref(0)
const nowMs = ref(Date.now())
let roundPopupTimer = null
let cooldownTimer = null

const missions = ref([])
const missionLoading = ref(false)
const missionError = ref('')
const missionType = ref('daily')
const missionOpen = ref(false)
const claimingId = ref('')
const claimingAll = ref(false)
const showRewardModal = ref(false)
const rewardModalTitle = ref('領取成功')
const rewardModalItems = ref([])

const ZONE_META = {
  beginner: { label: '🌱 新手區', recLv: 'Lv.1-3', minLv: 1, maxLv: 3 },
  normal: { label: '⚔️ 一般區', recLv: 'Lv.1+ 無上限', minLv: 1, maxLv: null },
  mid: { label: '✦ 中級區', recLv: 'Lv.10+ 無上限', minLv: 10, maxLv: null },
  hard: { label: '🔥 高級區', recLv: 'Lv.20+', minLv: 20, maxLv: null },
  elite: { label: '💀 精英區', recLv: 'Lv.20+ 無上限', minLv: 20, maxLv: null },
}

const MISSION_TABS = [
  { key: 'onboarding', label: '新手' },
  { key: 'daily', label: '每日' },
  { key: 'weekly', label: '每週' },
]

const MISSION_RESET_HINT = {
  onboarding: '新手任務為一次性，不重置',
  daily: '台灣時間每日 00:00 重置',
  weekly: '台灣時間每週一 00:00 重置',
}

onMounted(async () => {
  await Promise.all([loadProfile(), loadZones(), loadMissions(missionType.value)])
  cooldownTimer = setInterval(() => {
    nowMs.value = Date.now()
  }, 1000)
})
onBeforeUnmount(() => {
  stopRoundPopup()
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
    cooldownTimer = null
  }
})

async function loadProfile() {
  if (!player.profile) await player.fetchProfile()
}

const playerLevel = computed(() => Number(player.profile?.progress?.level || 1))
const playerAgi = computed(() => {
  const progressAgi = Number(player.profile?.progress?.attributes?.agi)
  if (Number.isFinite(progressAgi) && progressAgi > 0) return progressAgi
  const profileAgi = Number(player.profile?.attributes?.agi)
  if (Number.isFinite(profileAgi) && profileAgi > 0) return profileAgi
  return 1
})
const currentPlayerName = computed(() =>
  player.profile?.player?.displayName ||
  player.profile?.player?.name ||
  player.profile?.displayName ||
  '玩家'
)
const currentPlayerDiscordId = computed(() =>
  String(
    player.profile?.player?.discordId ||
    player.profile?.player?.id ||
    player.profile?.discordId ||
    ''
  )
)
const hasBattleDetail = computed(() =>
  Boolean(battleOutcome.value || battleRounds.value.length || battleRewards.value.length)
)

const selectedZone = computed(() => zones.value.find((z) => z.zone === selectedZoneKey.value) || null)
const selectedZoneCooldownUntil = computed(() => {
  const raw = Number(selectedZone.value?.nextBattleAt || 0)
  return Number.isFinite(raw) ? raw : 0
})
const effectiveCooldownUntil = computed(() => Math.max(cooldownUntil.value, selectedZoneCooldownUntil.value))
const cooldownRemainingMs = computed(() => Math.max(0, effectiveCooldownUntil.value - nowMs.value))
const cooldownRemainingSec = computed(() => Math.ceil(cooldownRemainingMs.value / 1000))
const isInCooldown = computed(() => cooldownRemainingMs.value > 0)

const recommendedZone = computed(() => {
  const lv = playerLevel.value
  if (lv <= 3) return 'beginner'
  if (lv <= 10) return 'normal'
  if (lv <= 20) return 'mid'
  return 'hard'
})

const recommendedZoneText = computed(() => {
  const key = recommendedZone.value
  const meta = ZONE_META[key]
  return `${meta?.label || key}（${meta?.recLv || ''}）`
})

function normalizeZone(raw) {
  return {
    zone: raw?.zone || 'beginner',
    monsterName: raw?.monsterName || '未知怪物',
    monsterImageUrl: raw?.monsterImageUrl || '',
    currentHp: Number(raw?.currentHp || 0),
    maxHp: Number(raw?.maxHp || 1),
    participantCount: Number(raw?.participantCount || 0),
    damageLeaderboard: Array.isArray(raw?.damageLeaderboard) ? raw.damageLeaderboard : [],
    nextBattleAt: raw?.nextBattleAt || null,
  }
}

async function loadZones() {
  zoneLoading.value = true
  zoneError.value = ''
  try {
    const res = await combatApi.getZones()
    const data = res?.data ?? res ?? []
    zones.value = (Array.isArray(data) ? data : []).map(normalizeZone)

    if (!selectedZoneKey.value) {
      const rec = recommendedZone.value
      const hasRec = zones.value.some((z) => z.zone === rec)
      selectedZoneKey.value = hasRec ? rec : zones.value[0]?.zone || 'beginner'
    }

    const active = zones.value.find((z) => z.zone === selectedZoneKey.value)
    const zoneCd = Number(active?.nextBattleAt || 0)
    if (Number.isFinite(zoneCd) && zoneCd > cooldownUntil.value) {
      cooldownUntil.value = zoneCd
    }
  } catch (e) {
    zoneError.value = e?.message || '怪物區資料讀取失敗'
  } finally {
    zoneLoading.value = false
  }
}

function chooseZone(key) {
  selectedZoneKey.value = key
}

function hpPercent(z) {
  if (!z) return 0
  if (!z.maxHp) return 0
  return Math.max(0, Math.min(100, Math.round((z.currentHp / z.maxHp) * 100)))
}

function normalizeBattleLine(line) {
  return String(line || '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

function extractBattleEvents(text) {
  const cleaned = normalizeBattleLine(text)
  if (!cleaned) return []
  const byLine = cleaned.split(/\r?\n/).map((x) => x.trim()).filter(Boolean)
  const result = []
  for (const row of byLine) {
    const pieces = row
      .split(/(?<=[。！？!?.])/)
      .map((x) => x.trim())
      .filter(Boolean)
    if (pieces.length) result.push(...pieces)
    else result.push(row)
  }
  return result
}

function parseBattleRounds(rawLogs) {
  const logs = (Array.isArray(rawLogs) ? rawLogs : [])
    .map((x) => normalizeBattleLine(x))
    .filter(Boolean)
  if (!logs.length) return []

  const text = logs.join('\n')
  const roundHeaderReg = /【第\s*(\d+)\s*回合】/g
  const matches = [...text.matchAll(roundHeaderReg)]

  if (!matches.length) {
    return [{
      round: 1,
      title: '第 1 回合',
      events: extractBattleEvents(text),
    }]
  }

  const rounds = []
  for (let i = 0; i < matches.length; i += 1) {
    const curr = matches[i]
    const next = matches[i + 1]
    const start = curr.index ?? 0
    const end = next?.index ?? text.length
    const chunk = text.slice(start, end).trim()
    const roundNo = Number(curr[1] || i + 1)
    const body = chunk.replace(/【第\s*\d+\s*回合】/, '').trim()
    rounds.push({
      round: roundNo,
      title: `第 ${roundNo} 回合`,
      events: extractBattleEvents(body),
    })
  }
  return rounds.slice(0, 15)
}

// 一般戰鬥播放速度依 AGI 推估；組隊爬塔另由後端速度條行動軸計算。
function calculateAgiTickDelay(agi = 1) {
  const baseDelay = 1500
  const minDelay = 500
  const capAgi = 40
  const safeAgi = Number.isFinite(Number(agi)) ? Number(agi) : 1
  const cappedAgi = Math.min(Math.max(1, safeAgi), capAgi)
  return Math.round(baseDelay - ((cappedAgi - 1) / (capAgi - 1)) * (baseDelay - minDelay))
}

function resolveRoundPlaybackMs(payload) {
  const fromBackend = Number(
    payload?.tickDelayMs ??
    payload?.tickDelay ??
    payload?.roundMs ??
    payload?.battleRoundMs ??
    0
  )
  if (Number.isFinite(fromBackend) && fromBackend >= 200) {
    return Math.round(fromBackend)
  }
  return calculateAgiTickDelay(playerAgi.value)
}

function stopRoundPopup() {
  if (roundPopupTimer) {
    clearInterval(roundPopupTimer)
    roundPopupTimer = null
  }
}

function playRoundPopup(rounds, intervalMs = 900) {
  stopRoundPopup()
  roundPopup.value = null
  if (!rounds?.length) return
  const queue = rounds.slice(0, 15)
  const safeMs = Math.min(2200, Math.max(350, Math.round(intervalMs)))
  let idx = 0
  const pushNext = () => {
    const current = queue[idx]
    if (!current) {
      stopRoundPopup()
      return
    }
    roundPopup.value = current
    roundPopupTick.value += 1
    idx += 1
    if (idx >= queue.length) {
      stopRoundPopup()
    }
  }
  pushNext()
  roundPopupTimer = setInterval(pushNext, safeMs)
}

async function startBattle() {
  if (!selectedZone.value || fighting.value || isInCooldown.value) return
  stopRoundPopup()
  fighting.value = true
  fightError.value = ''
  try {
    const res = await combatApi.quickBattle(selectedZone.value.zone)
    const data = res?.data ?? res ?? {}
    const logs = Array.isArray(data?.logs) ? data.logs : []
    const rewards = Array.isArray(data?.rewardLines) ? data.rewardLines : []
    const outcome = `【${selectedZone.value.monsterName}】${data?.outcome === 'win' ? '勝利' : data?.outcome === 'lose' ? '失敗' : '結束'}`
    const rounds = parseBattleRounds(logs)
    const playbackMs = resolveRoundPlaybackMs(data)

    battleOutcome.value = outcome
    battleRounds.value = rounds
    battleRewards.value = rewards.map((x) => normalizeBattleLine(x)).filter(Boolean)
    roundPlaybackMs.value = playbackMs
    playRoundPopup(rounds, playbackMs)
    showBattleModal.value = true

    const next = Number(data?.nextBattleAt || 0)
    if (Number.isFinite(next) && next > 0) {
      cooldownUntil.value = Math.max(cooldownUntil.value, next)
    }

    await loadZones()
  } catch (e) {
    fightError.value = e?.message || '開始戰鬥失敗'
  } finally {
    fighting.value = false
  }
}

function normalizeMission(raw, idx) {
  const quest = raw?.quest || {}
  const current = Number(raw?.progressCurrent ?? raw?.current ?? 0)
  const target = Number(raw?.progressTarget ?? raw?.target ?? raw?.total ?? quest?.target ?? 0)
  const progressPct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  const completed = Boolean(raw?.completed || raw?.isCompleted || raw?.done || raw?.status === 'completed' || progressPct >= 100)
  const claimed = Boolean(raw?.claimed)
  const claimable = Boolean((raw?.claimable || raw?.canClaim || raw?.status === 'claimable' || completed) && !claimed)

  const rewardGold = Number(quest?.rewardGold ?? raw?.rewardGold ?? 0)
  const rewardExp = Number(quest?.rewardExp ?? raw?.rewardExp ?? 0)
  const rewardItemName = quest?.rewardItemName || raw?.rewardItemName || ''
  const rewardText = [
    rewardGold > 0 ? `金幣 ${rewardGold}` : '',
    rewardExp > 0 ? `EXP ${rewardExp}` : '',
    rewardItemName || '',
  ].filter(Boolean).join(' / ')

  return {
    id: raw?.id || raw?._id || raw?.missionId || quest?.id || `mission-${idx}`,
    title: raw?.title || raw?.name || raw?.missionName || quest?.title || `任務 ${idx + 1}`,
    subtitle: raw?.description || raw?.desc || raw?.objective || quest?.description || '',
    current,
    target,
    progressPct,
    reward: raw?.rewardText || raw?.reward?.text || raw?.reward?.name || rewardText,
    rewardGold,
    rewardExp,
    completed,
    claimed,
    claimable,
  }
}

function extractMissionList(data, typeKey) {
  const key = String(typeKey || '').toLowerCase()
  if (Array.isArray(data)) return data

  const pools = [
    data?.missions?.[key],
    data?.tasks?.[key],
    data?.list?.[key],
    data?.items?.[key],
    data?.missionCenter?.[key],
  ]

  for (const p of pools) {
    if (Array.isArray(p)) return p
  }

  const flat = data?.missions || data?.tasks || data?.list || data?.items || []
  if (!Array.isArray(flat)) return []

  const filtered = flat.filter((m) => {
    const t = String(m?.category || m?.type || m?.missionType || m?.tab || '').toLowerCase()
    if (!t) return true
    return t === key
  })

  return filtered.length ? filtered : flat
}

const visibleMissions = computed(() => missions.value.filter((m) => !m.claimed))
const claimableMissions = computed(() => visibleMissions.value.filter((m) => m.claimable))

function toRewardText(reward) {
  const gold = Number(reward?.gold ?? reward?.rewardGold ?? 0)
  const exp = Number(reward?.exp ?? reward?.rewardExp ?? 0)
  return [
    gold > 0 ? `金幣 ${gold}` : '',
    exp > 0 ? `EXP ${exp}` : '',
    reward?.rewardItemName || reward?.itemName || '',
  ].filter(Boolean).join(' / ') || '無可見獎勵'
}

function openRewardModal(title, items) {
  rewardModalTitle.value = title
  rewardModalItems.value = items
  showRewardModal.value = true
}

function closeRewardModal() {
  showRewardModal.value = false
}

async function loadMissions(type = missionType.value) {
  const key = String(type || 'daily').toLowerCase()
  missionType.value = key
  missionLoading.value = true
  missionError.value = ''

  try {
    const res = await missionApi.getCenter(key)
    const data = res?.data ?? res ?? {}
    const list = extractMissionList(data, key)
    missions.value = Array.isArray(list) ? list.map(normalizeMission) : []
  } catch (e) {
    const rawMsg = e?.message || '任務中心讀取失敗'
    missionError.value = rawMsg.includes('404')
      ? '任務中心接口不存在（404），請對齊 DC/後台任務中心 endpoint'
      : rawMsg
    missions.value = []
  } finally {
    missionLoading.value = false
  }
}

async function claimMission(mission) {
  if (!mission?.id || claimingId.value || claimingAll.value) return
  claimingId.value = mission.id
  try {
    const res = await missionApi.claimQuest(mission.id)
    const payload = res?.data ?? res ?? {}
    const reward = payload?.reward || payload
    openRewardModal('領取成功', [{ missionTitle: mission.title, rewardText: toRewardText(reward) }])
    await loadMissions(missionType.value)
  } finally {
    claimingId.value = ''
  }
}

async function claimAllMissions() {
  if (claimingAll.value || claimingId.value || claimableMissions.value.length === 0) return
  claimingAll.value = true
  const claimedItems = []

  try {
    for (const mission of claimableMissions.value) {
      try {
        const res = await missionApi.claimQuest(mission.id)
        const payload = res?.data ?? res ?? {}
        const reward = payload?.reward || payload
        claimedItems.push({ missionTitle: mission.title, rewardText: toRewardText(reward) })
      } catch (_) {}
    }
    await loadMissions(missionType.value)
    if (claimedItems.length > 0) {
      openRewardModal(`一鍵領取完成（${claimedItems.length} 項）`, claimedItems)
    }
  } finally {
    claimingAll.value = false
  }
}

function openMissionCenter() {
  missionOpen.value = true
}

function closeMissionCenter() {
  missionOpen.value = false
}

function openBattleDetailModal() {
  if (!hasBattleDetail.value) return
  showBattleDetailModal.value = true
}

function closeBattleDetailModal() {
  showBattleDetailModal.value = false
}

function closeBattleModal() {
  showBattleModal.value = false
}
</script>

<template>
  <div class="home-page">
    <section class="map-stage">
      <div class="sky-layer"></div>
      <div class="rift-layer"></div>

      <button class="mission-entry" @click="openMissionCenter">
        📜 任務中心
        <span v-if="claimableMissions.length" class="entry-badge">{{ claimableMissions.length }}</span>
      </button>

      <div class="monster-card" v-if="selectedZone">
        <div class="monster-head">
          <div>
            <div class="monster-name">{{ selectedZone.monsterName }}</div>
            <div class="monster-meta">{{ ZONE_META[selectedZone.zone]?.recLv || '' }} · 挑戰人數 {{ selectedZone.participantCount }}</div>
          </div>
          <div class="recommend-tag" v-if="selectedZone.zone === recommendedZone">推薦</div>
        </div>

        <div class="monster-body">
          <img v-if="selectedZone.monsterImageUrl" :src="selectedZone.monsterImageUrl" :alt="selectedZone.monsterName" class="monster-img" />
          <div v-else class="monster-placeholder">怪物圖</div>

          <div class="monster-side">
            <div class="hp-title">HP {{ selectedZone.currentHp.toLocaleString() }} / {{ selectedZone.maxHp.toLocaleString() }}</div>
            <div class="hp-bar"><div class="hp-fill" :style="{ width: `${hpPercent(selectedZone)}%` }" /></div>
            <div class="hp-num">{{ hpPercent(selectedZone) }}%</div>

            <div class="leader-title">傷害排行榜</div>
            <div class="leader-list">
              <div v-if="!selectedZone.damageLeaderboard.length" class="leader-empty">目前尚無紀錄</div>
              <div v-for="(row, i) in selectedZone.damageLeaderboard.slice(0, 5)" :key="`${row.discordId || row.name}-${i}`" class="leader-row">
                <span class="leader-rank">#{{ i + 1 }}</span>
                <span class="leader-name">
                  {{
                    String(row?.discordId || row?.id || '') === currentPlayerDiscordId
                      ? currentPlayerName
                      : ((row?.name === 'WebPlayer' ? currentPlayerName : row?.name) || row?.displayName || '玩家')
                  }}
                </span>
                <span class="leader-dmg">{{ Number(row.damage || 0).toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="battle-panel">
        <div class="recommend-line">目前等級推薦怪物區：{{ recommendedZoneText }}</div>
        <button class="battle-btn" :disabled="!selectedZone || fighting || zoneLoading || isInCooldown" @click="startBattle">
          {{ fighting ? '戰鬥中…' : isInCooldown ? `冷卻中 ${cooldownRemainingSec}s` : '開始戰鬥' }}
        </button>
        <div class="zone-strip">
          <button
            v-for="z in zones"
            :key="z.zone"
            class="zone-btn"
            :class="{ active: selectedZoneKey === z.zone }"
            @click="chooseZone(z.zone)"
          >
            {{ ZONE_META[z.zone]?.label || z.zone }}
          </button>
        </div>
        <div v-if="fightError" class="fight-error">{{ fightError }}</div>
        <div v-if="zoneError" class="fight-error">{{ zoneError }}</div>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="missionOpen" class="overlay" @click.self="closeMissionCenter">
        <div class="sheet">
          <button class="close-btn" @click="closeMissionCenter">✕</button>
          <div class="sheet-head">
            <h2 class="sheet-title">📜 任務列表</h2>
            <div class="sheet-actions">
              <button
                v-if="claimableMissions.length > 0"
                class="claim-all-btn"
                :disabled="claimingAll || missionLoading || !!claimingId"
                @click="claimAllMissions"
              >
                {{ claimingAll ? '領取中…' : '一鍵領取' }}
              </button>
              <button class="refresh-btn" :disabled="missionLoading || claimingAll" @click="loadMissions(missionType)">
                {{ missionLoading ? '讀取中…' : '刷新' }}
              </button>
            </div>
          </div>

          <div class="tabs">
            <button
              v-for="t in MISSION_TABS"
              :key="t.key"
              class="tab-btn"
              :class="{ active: missionType === t.key }"
              :disabled="missionLoading && missionType === t.key"
              @click="loadMissions(t.key)"
            >
              {{ t.label }}
            </button>
          </div>
          <div class="reset-hint">{{ MISSION_RESET_HINT[missionType] }}</div>

          <div class="list">
            <div v-if="missionLoading" class="hint">任務中心讀取中…</div>
            <div v-else-if="missionError" class="hint error">{{ missionError }}</div>
            <div v-else-if="visibleMissions.length === 0" class="hint">目前沒有待處理任務</div>

            <article v-for="m in visibleMissions" :key="m.id" class="card">
              <div class="card-top">
                <div class="title">{{ m.title }}</div>
                <button
                  v-if="m.claimable"
                  class="claim-btn"
                  :disabled="claimingId === m.id"
                  @click="claimMission(m)"
                >
                  {{ claimingId === m.id ? '領取中…' : '領取' }}
                </button>
                <div v-else class="state" :class="{ done: m.completed }">{{ m.completed ? '已完成' : '進行中' }}</div>
              </div>

              <div v-if="m.subtitle" class="sub">{{ m.subtitle }}</div>
              <div class="progress-line">
                {{ m.current }} / {{ m.target }}
                <span v-if="m.rewardGold > 0" class="coin">｜獎勵：{{ m.rewardGold }}🪙</span>
                <span v-else-if="m.reward">｜獎勵：{{ m.reward }}</span>
              </div>
              <div v-if="m.target > 0" class="progress-wrap">
                <div class="progress-bar"><div class="progress-fill" :style="{ width: `${m.progressPct}%` }" /></div>
                <div class="progress-num">{{ m.current }} / {{ m.target }}</div>
              </div>
              <div v-if="m.rewardExp > 0" class="reward">附加：EXP {{ m.rewardExp }}</div>
            </article>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showRewardModal" class="reward-overlay" @click.self="closeRewardModal">
        <div class="reward-sheet">
          <button class="reward-close" @click="closeRewardModal">✕</button>
          <div class="reward-title">{{ rewardModalTitle }}</div>
          <div class="reward-list">
            <div v-for="(item, idx) in rewardModalItems" :key="`${item.missionTitle}-${idx}`" class="reward-item">
              <div class="reward-mission">{{ item.missionTitle }}</div>
              <div class="reward-detail">{{ item.rewardText }}</div>
            </div>
          </div>
          <button class="reward-ok-btn" @click="closeRewardModal">確認</button>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showBattleDetailModal" class="overlay" @click.self="closeBattleDetailModal">
        <div class="sheet">
          <button class="close-btn" @click="closeBattleDetailModal">✕</button>
          <div class="sheet-head">
            <h2 class="sheet-title">📘 詳細戰報（最多 15 回合）</h2>
          </div>
          <div class="list">
            <article class="card">
              <div class="title">{{ battleOutcome || '本次戰鬥結果' }}</div>
            </article>
            <article v-for="round in battleRounds" :key="`detail-round-${round.round}`" class="card">
              <div class="title">{{ round.title }}</div>
              <div class="sub" v-if="round.events.length === 0">本回合無事件</div>
              <div v-for="(eventLine, eventIdx) in round.events" :key="`event-${round.round}-${eventIdx}`" class="log-line">
                {{ eventLine }}
              </div>
            </article>
            <article v-if="battleRewards.length" class="card">
              <div class="title">獎勵結算</div>
              <div v-for="(reward, rewardIdx) in battleRewards" :key="`rw-${rewardIdx}`" class="log-line">
                {{ reward }}
              </div>
            </article>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showBattleModal" class="overlay" @click.self="closeBattleModal">
        <div class="sheet battle-sheet">
          <button class="close-btn" @click="closeBattleModal">✕</button>
          <div class="sheet-head">
            <h2 class="sheet-title">⚔ 戰鬥戰報</h2>
            <button class="detail-log-btn" :disabled="!hasBattleDetail" @click="openBattleDetailModal">完整15回合</button>
          </div>
          <article class="card">
            <div class="title">{{ battleOutcome || '本次戰鬥結果' }}</div>
          </article>
          <Transition name="round-pop">
            <article
              v-if="roundPopup"
              :key="roundPopupTick"
              class="round-popup"
            >
              <div class="round-popup-head">{{ roundPopup.title }}</div>
              <div v-if="roundPopup.events.length" class="round-popup-text">
                <p
                  v-for="(eventLine, eventIdx) in roundPopup.events.slice(0, 3)"
                  :key="`${roundPopup.round}-${eventIdx}`"
                >
                  {{ eventLine }}
                </p>
              </div>
              <div v-else class="round-popup-text">
                <p>本回合無事件</p>
              </div>
            </article>
          </Transition>
          <div v-if="!roundPopup && !hasBattleDetail" class="log-empty">尚無戰報</div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.home-page {
  height: 100%;
  overflow: hidden;
}

.map-stage {
  position: relative;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(circle at 50% 20%, #6b7ed4 0%, #372652 45%, #1a0f24 100%);
}

.sky-layer {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,214,160,0.25), rgba(99,65,155,0.08));
}
.rift-layer {
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: 24%;
  height: 30%;
  background: linear-gradient(180deg, rgba(255,245,220,0.2), rgba(112,79,186,0.12));
  clip-path: polygon(0 78%, 18% 62%, 36% 68%, 53% 52%, 71% 58%, 100% 40%, 100% 100%, 0 100%);
}

.mission-entry {
  position: absolute;
  left: 14px;
  top: 14px;
  border: 1px solid #efc487;
  border-radius: 12px;
  background: linear-gradient(180deg, #4b2a13, #2a160b);
  color: #ffdca8;
  font-size: 13px;
  font-weight: 700;
  padding: 10px 14px;
  cursor: pointer;
  z-index: 2;
}
.entry-badge {
  margin-left: 8px;
  display: inline-flex;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #1f1209;
  background: #ffd37b;
}

.zone-strip {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
}
.zone-btn {
  border: 1px solid #7a441e;
  border-radius: 8px;
  background: rgba(39, 21, 9, 0.85);
  color: #eac89a;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 4px;
  cursor: pointer;
}
.zone-btn.active {
  border-color: #e6ad56;
  background: linear-gradient(180deg, #ffd37b, #da9834);
  color: #3b1f04;
}

.monster-card {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 64px;
  background: rgba(17, 12, 24, 0.72);
  border: 1px solid #c08030;
  border-radius: 12px;
  padding: 10px;
  z-index: 2;
}
.monster-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.monster-name { font-size: 15px; font-weight: 700; color: #ffe3c0; }
.monster-meta { font-size: 11px; color: #d7be9b; margin-top: 2px; }
.recommend-tag {
  border: 1px solid #e6ad56;
  border-radius: 999px;
  background: linear-gradient(180deg, #ffd37b, #da9834);
  color: #3b1f04;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
}

.monster-body {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
}
.monster-img,
.monster-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 10px;
  border: 1px solid #8f6135;
  background: #1f1209;
  object-fit: cover;
}
.monster-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9f7a55;
  font-size: 12px;
}
.monster-side { min-width: 0; }
.hp-title { font-size: 11px; color: #f3dcc0; }
.hp-bar {
  margin-top: 4px;
  height: 8px;
  border-radius: 999px;
  background: #2a1005;
  border: 1px solid #60300830;
  overflow: hidden;
}
.hp-fill {
  height: 100%;
  background: linear-gradient(90deg, #f74444, #f6a74a);
}
.hp-num { margin-top: 3px; font-size: 11px; color: #ffcb84; text-align: right; }
.leader-title { margin-top: 6px; font-size: 11px; color: #f0c040; font-weight: 700; }
.leader-list { margin-top: 4px; display: flex; flex-direction: column; gap: 3px; max-height: 64px; overflow: auto; }
.leader-empty { font-size: 11px; color: #9b7b58; }
.leader-row { display: grid; grid-template-columns: 24px 1fr auto; gap: 6px; font-size: 11px; color: #e8d4b8; }
.leader-rank { color: #f0c040; }
.leader-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.leader-dmg { color: #ffd37b; }

.battle-panel {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 2;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #6c4a2b;
  background: rgba(15,10,25,0.7);
}
.recommend-line { font-size: 12px; color: #f3ddbb; margin-bottom: 8px; }
.battle-btn {
  width: 100%;
  border: 1px solid #6bc4ff;
  border-radius: 999px;
  background: linear-gradient(180deg, #4bc5ff, #2572e5);
  color: #eaf7ff;
  font-size: 13px;
  font-weight: 700;
  padding: 9px 14px;
  cursor: pointer;
}
.battle-btn:disabled { opacity: .6; cursor: not-allowed; }
.fight-error { margin-top: 6px; font-size: 11px; color: #ffb3b3; }

.detail-log-btn {
  border: 1px solid #caa03e;
  border-radius: 8px;
  background: linear-gradient(180deg, #ffd37b, #da9834);
  color: #3b1f04;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 10px;
  cursor: pointer;
}
.detail-log-btn:disabled {
  opacity: .55;
  cursor: not-allowed;
}
.log-empty {
  font-size: 11px;
  color: #a08060;
  text-align: center;
  padding: 12px;
  background: #1a0a02;
  border: 1px solid #60300840;
  border-radius: 8px;
}
.log-line { font-size: 11px; color: #f0e0c0; line-height: 1.35; }
.round-popup {
  position: relative;
  z-index: 1;
  border: 1px solid #efc487;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(34, 15, 7, 0.96), rgba(20, 9, 4, 0.95));
  box-shadow: 0 8px 30px rgba(0,0,0,.35);
  padding: 10px;
  margin-bottom: 8px;
}
.round-popup-head {
  font-size: 12px;
  color: #ffc840;
  font-weight: 700;
  margin-bottom: 6px;
}
.round-popup-text p {
  margin: 0;
  font-size: 11px;
  line-height: 1.35;
  color: #f0e0c0;
}
.round-popup-text p + p {
  margin-top: 3px;
}
.round-pop-enter-active,
.round-pop-leave-active {
  transition: all .26s ease;
}
.round-pop-enter-from,
.round-pop-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(.98);
}

.overlay,
.reward-overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(0,0,0,.66);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sheet,
.reward-sheet {
  width: 100%;
  max-width: 480px;
  max-height: 78vh;
  overflow-y: auto;
  background: linear-gradient(180deg, #382210, #1f1209);
  border: 1px solid #c08030;
  border-bottom: none;
  border-radius: 16px 16px 0 0;
  padding: 14px;
  position: relative;
}
.battle-sheet {
  max-height: 72vh;
}

.close-btn,
.reward-close {
  position: absolute;
  right: 12px;
  top: 10px;
  border: none;
  background: transparent;
  color: #d7a76a;
  font-size: 16px;
  cursor: pointer;
}

.sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.sheet-title,
.reward-title { margin: 0; font-size: 16px; font-weight: 700; color: #ffd98f; }
.sheet-actions { display: flex; gap: 6px; }

.claim-all-btn,
.refresh-btn,
.claim-btn,
.reward-ok-btn {
  border: 1px solid #caa03e;
  border-radius: 8px;
  background: linear-gradient(180deg, #ffd37b, #da9834);
  color: #3b1f04;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 10px;
  cursor: pointer;
}
.claim-all-btn:disabled,
.refresh-btn:disabled,
.claim-btn:disabled { opacity: .65; cursor: not-allowed; }

.tabs { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 6px; margin-bottom: 8px; }
.tab-btn {
  border: 1px solid #7a441e;
  border-radius: 8px;
  background: #271509;
  color: #dcb788;
  font-size: 12px;
  font-weight: 700;
  padding: 7px 6px;
  cursor: pointer;
}
.tab-btn.active {
  color: #3b1f04;
  border-color: #e6ad56;
  background: linear-gradient(180deg, #ffd37b, #da9834);
}
.reset-hint {
  margin-bottom: 8px;
  font-size: 11px;
  color: #e7c28d;
  border-left: 2px solid #a4622f;
  padding-left: 8px;
}

.list,
.reward-list { display: flex; flex-direction: column; gap: 8px; }
.hint {
  font-size: 12px;
  color: #d2b182;
  border: 1px dashed #784827;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}
.hint.error { color: #ffb3b3; border-color: #9b4040; }

.card,
.reward-item {
  border: 1px solid #6b3b19;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(48,24,10,0.8), rgba(30,14,6,0.9));
  padding: 10px;
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.title,
.reward-mission { font-size: 13px; font-weight: 700; color: #ffd98f; }
.state {
  font-size: 10px;
  font-weight: 700;
  border-radius: 999px;
  border: 1px solid #8a5227;
  color: #e8be85;
  padding: 2px 8px;
}
.state.done { color: #93e6b0; border-color: #3b8a5a; }
.sub { margin-top: 4px; font-size: 11px; color: #f2d0a7; }
.progress-line {
  margin-top: 6px;
  font-size: 12px;
  color: #f0ddbc;
}
.coin { color: #ffca62; }
.progress-wrap {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.progress-bar {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: #1e0f06;
  border: 1px solid #5d3518;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f7b24f, #ffd77b);
}
.progress-num { font-size: 11px; color: #dcb788; min-width: 64px; text-align: right; }
.reward,
.reward-detail { margin-top: 6px; font-size: 11px; color: #f0c040; }
.reward-ok-btn { margin-top: 12px; width: 100%; font-size: 13px; padding: 10px 12px; }

@media (max-width: 390px) {
  .zone-strip { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .monster-card { top: 62px; }
  .monster-body { grid-template-columns: 100px 1fr; }
  .monster-img,
  .monster-placeholder { width: 100px; height: 100px; }
}
</style>
