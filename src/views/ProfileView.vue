<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { playerApi, enhanceApi } from '@/api'

const player   = usePlayerStore()
const router   = useRouter()
const prof     = computed(() => player.profile)
const progress = computed(() => prof.value?.progress)
const eq       = computed(() => player.equipped)

// ── 常數 ──────────────────────────────────────────
const STAT_LABELS = {
  STR: { color: '#ef4444', icon: '⚔️' },
  AGI: { color: '#22c55e', icon: '💨' },
  VIT: { color: '#f97316', icon: '🛡️' },
  INT: { color: '#a855f7', icon: '✨' },
  DEX: { color: '#06b6d4', icon: '🎯' },
  LUK: { color: '#eab308', icon: '⭐' },
}

const SLOT_LABELS = {
  weapon:    '武器',    shield:    '副手',
  armor:     '衣服',    garment:   '披肩',
  shoes:     '鞋子',    head_top:  '頭上',
  head_mid:  '頭中',    head_low:  '頭下',
  accessory_l: '飾品左', accessory_r: '飾品右',
  job_eq:    '職業',    title_eq:  '稱號',
  special_1: '特殊1',   special_2: '特殊2', special_3: '特殊3',
}
const SLOT_ORDER = [
  'weapon', 'shield', 'armor', 'garment', 'shoes',
  'head_top', 'head_mid', 'head_low', 'accessory_l', 'accessory_r',
  'job_eq', 'title_eq', 'special_1', 'special_2', 'special_3',
]

// 不可強化的槽位
const NO_ENHANCE = new Set(['job_eq', 'title_eq', 'special_1', 'special_2', 'special_3'])

const TIER_COLOR = { S: '#ef4444', A: '#f97316', B: '#a855f7', C: '#3b82f6', D: '#6b7280' }
function tierColor(t) { return TIER_COLOR[t] || '#6b7280' }

// ── 強化彈窗狀態 ─────────────────────────────────
const detailItem = ref(null)   // { slot, item }
const enhanceInfo = ref(null)
const enhancing   = ref(false)
const enhanceMsg  = ref('')
const loadingEnhance = ref(false)
const enhanceReadyMap = ref({})

onMounted(async () => {
  await player.refresh()
  await refreshEnhanceHints()
})

function itemKey(item) {
  return item?.uuid || item?.id || ''
}

function openDetail(slot) {
  const item = eq.value?.[slot]
  if (!item) return
  detailItem.value  = { slot, item }
  enhanceInfo.value = null
  enhanceMsg.value  = ''
  if (!NO_ENHANCE.has(slot)) {
    loadEnhance()
  }
}
function closeDetail() { detailItem.value = null }

function onEquipCellClick(slot) {
  if (isSlotLocked(slot)) return
  if (eq.value?.[slot]) {
    openDetail(slot)
    return
  }
  router.push({ path: '/backpack', query: { slot } })
}

function isTwoHandWeapon(item) {
  if (!item) return false
  const hands = String(item.hands ?? item.weaponHands ?? item.handType ?? '').toLowerCase()
  const weaponType = String(item.weaponType ?? '').toLowerCase()
  const name = String(item.itemName || item.name || '').toLowerCase()
  return Boolean(
    item.twoHanded ||
    item.isTwoHanded ||
    hands === '2' ||
    hands === 'two' ||
    hands === 'two_hand' ||
    hands === '2h' ||
    weaponType.includes('two') ||
    weaponType.includes('bow') ||
    name.includes('弓') ||
    name.includes('bow')
  )
}

function isSlotLocked(slot) {
  return slot === 'shield' && isTwoHandWeapon(eq.value?.weapon)
}

async function unequip(slot) {
  await playerApi.unequipItem(slot)
  await player.refresh()
  await refreshEnhanceHints()
  closeDetail()
}

async function loadEnhance() {
  if (!detailItem.value) return
  loadingEnhance.value = true
  enhanceMsg.value     = ''
  try {
    const res = await enhanceApi.getInfo(detailItem.value.item.uuid)
    enhanceInfo.value = res.data ?? res
  } catch (e) {
    enhanceMsg.value = '❌ ' + e.message
  } finally { loadingEnhance.value = false }
}

async function doEnhance() {
  if (!detailItem.value || enhancing.value) return
  enhancing.value = true
  enhanceMsg.value = ''
  try {
    const res = await enhanceApi.doEnhance(detailItem.value.item.uuid)
    enhanceMsg.value = '✅ ' + (res.data?.message || res.message || '強化完成')
    await player.refresh()
    await refreshEnhanceHints()
    enhanceInfo.value = null
    // 更新 detailItem 顯示最新資料
    const updated = player.equipped?.[detailItem.value.slot]
    if (updated) detailItem.value = { ...detailItem.value, item: updated }
  } catch (e) {
    enhanceMsg.value = '❌ ' + e.message
  } finally { enhancing.value = false }
}

async function refreshEnhanceHints() {
  const next = {}
  const tasks = []

  for (const [slot, item] of Object.entries(eq.value || {})) {
    const key = itemKey(item)
    if (!item || !key || NO_ENHANCE.has(slot)) continue

    const task = enhanceApi
      .getInfo(key)
      .then((res) => {
        const info = res.data ?? res
        next[key] = !info?.isMaxed && canAffordEnhance(info)
      })
      .catch(() => {
        next[key] = false
      })
    tasks.push(task)
  }

  await Promise.all(tasks)
  enhanceReadyMap.value = next
}

function showEnhanceHint(slot, item) {
  if (!item || NO_ENHANCE.has(slot)) return false
  const key = itemKey(item)
  return !!key && enhanceReadyMap.value[key] === true
}

// 合併所有效果顯示
function allEffects(item) {
  const out = []
  for (const e of item.passiveEffects  || []) out.push({ label: e.definitionName || e.key, type: 'passive', notes: e.notes })
  for (const e of item.procEffects     || []) out.push({ label: e.definitionName || e.key, type: 'proc',    notes: e.notes, chance: e.chance })
  for (const e of item.combatEffects   || []) out.push({ label: e.definitionName || e.key, type: 'combat',  notes: e.notes })
  return out
}

function statEntries(item) {
  return Object.entries(item.equipStats || {})
    .filter(([, v]) => Number(v) > 0)
    .map(([k, v]) => ({ key: k.toUpperCase(), val: v }))
}

function primaryStat(item) {
  const stats = statEntries(item)
  if (!stats.length) return ''
  const best = stats.sort((a, b) => b.val - a.val)[0]
  return `${best.key}+${best.val}`
}

function collectCardEffects(item) {
  const out = []
  const skill = item?.monsterCardSkill
  if (skill?.name) {
    const skillDesc = skill.description ? `（${skill.description}）` : ''
    out.push({ name: `${skill.name}${skillDesc}`, tag: '卡片技能' })
    return out
  }
  return out
}

const canEnhance = computed(() => {
  if (!detailItem.value) return false
  return !NO_ENHANCE.has(detailItem.value.slot)
})

function normalizeEnhanceRequirements(info) {
  if (!info) return []
  const out = []

  for (const req of (info.requirements || [])) {
    out.push({
      name: req?.name || req?.itemName || '材料',
      need: Number(req?.need ?? req?.required ?? 0),
      have: Number(req?.have ?? req?.owned ?? 0),
    })
  }

  const gemsRequired = Number(info.gemsRequired ?? info.gemRequired ?? 0)
  const gemsOwned = Number(info.gemsOwned ?? info.gemOwned ?? 0)
  if (gemsRequired > 0 || gemsOwned > 0) {
    out.push({
      name: '強化石',
      need: gemsRequired,
      have: gemsOwned,
    })
  }

  return out.filter((r) => r.need > 0 || r.have > 0)
}

function canAffordEnhance(info) {
  const reqs = normalizeEnhanceRequirements(info)
  if (!reqs.length) return false
  return reqs.every((r) => r.have >= r.need)
}

const enhanceRequirements = computed(() => normalizeEnhanceRequirements(enhanceInfo.value))

const expPct = computed(() => {
  if (!progress.value) return 0
  return Math.min(100, Math.round(((progress.value.exp ?? 0) / (progress.value.nextLevelExp ?? 1)) * 100))
})
const expRemain = computed(() => {
  if (!progress.value) return 0
  const remain = (progress.value.nextLevelExp ?? 0) - (progress.value.exp ?? 0)
  return Math.max(0, remain)
})

const battleStats = computed(() => {
  const src = prof.value?.battleStats || prof.value?.combatStats || progress.value?.battleStats || {}
  const attrs = progress.value?.attributes || {}
  return {
    hp: src.hp ?? src.HP ?? 0,
    atk: src.atk ?? src.attack ?? attrs.str ?? 0,
    def: src.def ?? src.defense ?? attrs.vit ?? 0,
    crit: src.crit ?? src.critRate ?? attrs.dex ?? 0,
    combo: src.combo ?? src.comboRate ?? attrs.agi ?? 0,
    evade: src.evade ?? src.evasion ?? attrs.luk ?? 0,
  }
})

const specialCardEffects = computed(() => {
  const result = []
  const slots = ['special_1', 'special_2', 'special_3']
  for (const slot of slots) {
    const item = eq.value?.[slot]
    if (!item) continue
    const itemName = item.itemName || item.name || SLOT_LABELS[slot]
    const effects = collectCardEffects(item)
    if (!effects.length) {
      result.push({ slot, itemName, name: '（無效果）', tag: '卡片' })
      continue
    }
    for (const effect of effects) {
      result.push({ slot, itemName, ...effect })
    }
  }
  return result
})
</script>

<template>
  <div class="page">
    <div v-if="player.loading && !prof" class="loading-center">
      <div class="spinner" />
    </div>

    <template v-else-if="prof">
      <!-- ── 角色概要 ── -->
      <section class="hero-section">
        <div class="hero-head">
          <div class="hero-name-wrap">
            <div class="job-badge">{{ progress?.jobSpecialDisplay?.jobName || progress?.job || '冒險者' }}</div>
            <div class="hero-tier">{{ progress?.playerTier ?? 'E' }} 階</div>
          </div>
          <div class="lv-big">Lv.{{ progress?.level ?? 1 }}</div>
        </div>

        <div class="exp-row">
          <span class="exp-label">EXP {{ progress?.exp ?? 0 }} / {{ progress?.nextLevelExp ?? '?' }}</span>
          <div class="exp-bar-full"><div class="exp-fill" :style="{ width: expPct + '%' }" /></div>
          <span class="exp-num">{{ expPct }}%</span>
        </div>

        <div class="battle-panel">
          <div class="battle-title">【戰鬥能力】</div>
          <div class="battle-grid">
            <div class="battle-item">❤️ HP: {{ battleStats.hp }}</div>
            <div class="battle-item">⚔️ ATK: {{ battleStats.atk }}</div>
            <div class="battle-item">🛡️ DEF: {{ battleStats.def }}</div>
            <div class="battle-item">🎯 CRIT: {{ battleStats.crit }}%</div>
            <div class="battle-item">⚡ 連擊: {{ battleStats.combo }}%</div>
            <div class="battle-item">🟢 迴避: {{ battleStats.evade }}%</div>
          </div>
          <div v-if="specialCardEffects.length" class="special-effects">
            <div class="special-title">怪物卡特效</div>
            <div v-for="(eff, idx) in specialCardEffects" :key="`${eff.slot}-${eff.name}-${idx}`" class="special-row">
              <span class="special-card">{{ eff.itemName }}</span>
              <span class="special-tag">{{ eff.tag }}</span>
              <span class="special-name">{{ eff.name }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── 六大屬性 ── -->
      <section class="panel mx-3 mb-3 p-3">
        <h2 class="section-title">⚡ 角色屬性</h2>
        <div class="stats-grid">
          <div v-for="(meta, key) in STAT_LABELS" :key="key" class="stat-row">
            <span class="stat-icon">{{ meta.icon }}</span>
            <span class="stat-name">{{ key }}</span>
            <div class="stat-bar-bg">
              <div class="stat-bar-fill" :style="{ width: Math.min(100, ((progress?.attributes?.[key.toLowerCase()] ?? 0) / 60) * 100) + '%', background: meta.color }" />
            </div>
            <span class="stat-val" :style="{ color: meta.color }">{{ progress?.attributes?.[key.toLowerCase()] ?? 0 }}</span>
          </div>
        </div>
      </section>

      <!-- ── 職業技能 ── -->
      <section v-if="progress?.jobSpecialDisplay?.activeSpecials?.length" class="panel mx-3 mb-3 p-3">
        <h2 class="section-title">🏹 職業技能</h2>
        <div class="specials-list">
          <div v-for="s in progress.jobSpecialDisplay.activeSpecials" :key="s" class="special-tag">✦ {{ s }}</div>
        </div>
      </section>

      <!-- ── 裝備欄 ── -->
      <section class="panel mx-3 mb-3 p-3">
        <h2 class="section-title">⚔️ 裝備欄</h2>
        <div class="equip-grid">
          <button
            v-for="slot in SLOT_ORDER"
            :key="slot"
            type="button"
            class="equip-cell"
            :class="{ filled: !!eq[slot], locked: isSlotLocked(slot) }"
            @click="onEquipCellClick(slot)"
          >
            <div class="cell-slot">{{ SLOT_LABELS[slot] }}</div>
            <div class="cell-thumb">
              <img
                v-if="eq[slot]?.imageThumbnailUrl || eq[slot]?.imageUrl"
                :src="eq[slot].imageThumbnailUrl || eq[slot].imageUrl"
                :alt="eq[slot].itemName || eq[slot].name || SLOT_LABELS[slot]"
                class="cell-img"
              />
              <div v-else class="cell-empty">—</div>
              <div v-if="showEnhanceHint(slot, eq[slot])" class="cell-up-on-thumb" title="素材足夠可升級">⬆</div>
              <div v-if="isSlotLocked(slot)" class="cell-lock-on-thumb" title="雙手武器中，副手不可裝備">🚫</div>
            </div>
            <div class="cell-name-row">
              <div class="cell-name">
                {{ eq[slot] ? (eq[slot].itemName || eq[slot].name) : '未裝備' }}
              </div>
              <div
                v-if="eq[slot]?.tier"
                class="cell-tier-inline"
                :style="{ color: tierColor(eq[slot].tier), borderColor: tierColor(eq[slot].tier) }"
              >
                {{ eq[slot].tier }}
              </div>
            </div>
            <div class="cell-meta" v-if="eq[slot]">
              <span v-if="primaryStat(eq[slot])" class="cell-stat">{{ primaryStat(eq[slot]) }}</span>
            </div>
            <div v-else-if="isSlotLocked(slot)" class="cell-lock-text">雙手武器中</div>
          </button>
        </div>
      </section>
    </template>

    <div v-else class="loading-center"><p style="color:#9a8e7a">讀取失敗，請重新整理</p></div>

    <!-- ── 裝備詳情 Sheet ── -->
    <Teleport to="body">
      <div v-if="detailItem" class="overlay" @click.self="closeDetail">
        <div class="detail-sheet">
          <button class="close-btn" @click="closeDetail">✕</button>

          <div class="detail-header">
            <div class="detail-thumb">
              <img v-if="detailItem.item.imageThumbnailUrl || detailItem.item.imageUrl"
                   :src="detailItem.item.imageThumbnailUrl || detailItem.item.imageUrl"
                   :alt="detailItem.item.itemName" class="detail-img" />
              <div v-else class="detail-placeholder">📦</div>
            </div>
            <div class="detail-meta">
              <div class="detail-name">{{ detailItem.item.itemName || detailItem.item.name }}</div>
              <div class="detail-slot-label">{{ SLOT_LABELS[detailItem.slot] }}</div>
              <div class="detail-badges">
                <span v-if="detailItem.item.tier" class="tier-badge" :style="{ color: tierColor(detailItem.item.tier), borderColor: tierColor(detailItem.item.tier) }">{{ detailItem.item.tier }}</span>
                <span v-if="detailItem.item.enhanceLevel > 0" class="enhance-badge">+{{ detailItem.item.enhanceLevel }}</span>
              </div>
            </div>
          </div>

          <!-- 裝備數值 -->
          <div v-if="statEntries(detailItem.item).length" class="section-block">
            <div class="block-title">裝備加成</div>
            <div class="stat-chips-row">
              <span v-for="s in statEntries(detailItem.item)" :key="s.key" class="stat-chip-lg">
                {{ STAT_LABELS[s.key]?.icon }} {{ s.key }} +{{ s.val }}
              </span>
            </div>
          </div>

          <!-- 特性 -->
          <div v-if="allEffects(detailItem.item).length" class="section-block">
            <div class="block-title">特性</div>
            <div v-for="e in allEffects(detailItem.item)" :key="e.label" class="effect-row">
              <span class="effect-type" :class="e.type">{{ e.type === 'passive' ? '被動' : e.type === 'proc' ? `觸發 ${e.chance}%` : '戰鬥' }}</span>
              <span class="effect-label">{{ e.label }}</span>
              <div v-if="e.notes" class="effect-notes">{{ e.notes }}</div>
            </div>
          </div>

          <!-- 強化區 -->
          <div v-if="canEnhance" class="section-block">
            <div class="block-title">強化</div>
            <div v-if="loadingEnhance" class="enhance-loading">載入中…</div>
            <div v-if="enhanceInfo" class="enhance-info">
              <div class="enhance-lv-row">目前 <strong>+{{ enhanceInfo.currentLevel }}</strong> → <strong style="color:#f0c040">+{{ enhanceInfo.nextLevel }}</strong></div>
              <div v-for="req in enhanceRequirements" :key="req.name" class="mat-row">
                <span>{{ req.name }} × {{ req.need }}</span>
                <span>
                  <span :class="req.have >= req.need ? 'ok' : 'lack'">(持有 {{ req.have }})</span>
                  <span v-if="req.have < req.need" class="lack-count">差 {{ req.need - req.have }}</span>
                </span>
              </div>
              <div v-if="enhanceInfo.successRate !== undefined && enhanceInfo.successRate !== null" class="success-rate">成功率 {{ enhanceInfo.successRate }}%</div>
              <div v-if="!enhanceRequirements.length" class="enhance-loading">目前未提供材料清單</div>
              <button class="btn-gold w-full mt-2" :disabled="enhancing" @click="doEnhance">
                {{ enhancing ? '強化中…' : '確認強化' }}
              </button>
            </div>
            <div v-if="enhanceMsg" class="enhance-msg">{{ enhanceMsg }}</div>
          </div>

          <!-- 操作 -->
          <button class="btn-ghost w-full mt-2" @click="unequip(detailItem.slot)">脫下裝備</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page { padding-bottom: 16px; }
.loading-center { display: flex; justify-content: center; align-items: center; min-height: 200px; }
.spinner { width: 36px; height: 36px; border: 3px solid #60300840; border-top-color: #e8a020; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.hero-section { padding: 10px 12px 12px; background: linear-gradient(180deg, #3d2010 0%, transparent 100%); border-bottom: 1px solid #c08030; margin-bottom: 10px; }
.hero-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.hero-name-wrap { display: flex; align-items: center; gap: 6px; min-width: 0; }
.job-badge { display: inline-block; background: linear-gradient(135deg, #e8a020, #ffc840); color: #3a1800; font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 20px; box-shadow: 0 1px 0 #7a3a00; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hero-tier { font-size: 10px; font-weight: 700; color: #ffe4aa; border: 1px solid #c08030; border-radius: 12px; padding: 1px 7px; background: rgba(42,16,5,.55); }
.lv-big { font-size: 30px; font-weight: 700; color: #ffc840; line-height: 1; text-shadow: 0 0 12px rgba(255,200,60,0.5); }
.exp-row { display: flex; flex-direction: column; gap: 5px; margin-top: 8px; }
.exp-label { font-size: 10px; color: #b58a58; display: flex; justify-content: space-between; }
.exp-bar-full { width: 100%; height: 6px; background: #2a1005; border-radius: 3px; overflow: hidden; border: 1px solid #60300820; }
.exp-fill { height: 100%; background: linear-gradient(90deg, #20c060, #60e890); transition: width 0.4s; }
.exp-num { font-size: 10px; color: #b58a58; white-space: nowrap; text-align: right; }
.battle-panel { margin-top: 8px; border: 1px solid #60300855; border-radius: 8px; background: rgba(18,10,4,.6); padding: 7px 8px; }
.battle-title { font-size: 12px; font-weight: 700; color: #efdebd; margin-bottom: 6px; letter-spacing: 0.2px; }
.battle-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.battle-item { font-size: 12px; color: #f0e0c0; font-weight: 700; white-space: nowrap; }
.special-effects { margin-top: 8px; border-top: 1px solid #60300855; padding-top: 7px; display: flex; flex-direction: column; gap: 4px; }
.special-title { font-size: 11px; color: #f0c040; font-weight: 700; }
.special-row { display: flex; align-items: center; gap: 6px; font-size: 11px; line-height: 1.25; color: #efd5ad; }
.special-card { color: #ffd786; font-weight: 700; }
.special-tag { flex-shrink: 0; border: 1px solid #7e4f1f; border-radius: 6px; padding: 0 5px; color: #c89f69; font-size: 10px; }
.special-name { color: #e9d7b8; }

.panel { background: linear-gradient(160deg, #3d2010 0%, #2a1508 100%); border: 2px solid #c08030; border-radius: 14px; box-shadow: 0 2px 12px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,200,80,0.08); }
.mx-3 { margin-left: 12px; margin-right: 12px; }
.mb-3 { margin-bottom: 12px; }
.p-3 { padding: 14px; }
.section-title { margin: 0 0 12px; font-size: 13px; font-weight: 700; color: #ffc840; text-shadow: 0 1px 4px rgba(255,160,0,0.4); }

.stats-grid { display: flex; flex-direction: column; gap: 8px; }
.stat-row { display: flex; align-items: center; gap: 8px; }
.stat-icon { font-size: 14px; width: 18px; text-align: center; }
.stat-name { font-size: 11px; font-weight: 700; color: #9a7850; width: 28px; }
.stat-bar-bg { flex: 1; height: 6px; background: #2a1005; border-radius: 3px; overflow: hidden; border: 1px solid #60300820; }
.stat-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
.stat-val { font-size: 13px; font-weight: 700; width: 24px; text-align: right; }

.specials-list { display: flex; flex-direction: column; gap: 6px; }
.special-tag { font-size: 12px; color: #f0e0c0; background: #1a0a02; border: 1px solid #60300840; border-radius: 6px; padding: 6px 10px; }

/* 裝備格子（5 x 3） */
.equip-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
}
.equip-cell {
  position: relative;
  min-height: 112px;
  background: #1a0a02;
  border: 1px solid #60300840;
  border-radius: 10px;
  padding: 6px 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.equip-cell.filled { border-color: #c0803070; }
.equip-cell.locked {
  border-color: #7a2c2c;
  background: #2a1010;
}
.equip-cell:active { background: #3d2010; }
.cell-slot {
  width: 100%;
  font-size: 10px;
  color: #9a7850;
  line-height: 1.2;
}
.cell-thumb {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  overflow: hidden;
  background: #2a1508;
  border: 1px solid #60300840;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 3px;
}
.cell-img { width: 100%; height: 100%; object-fit: contain; }
.cell-empty { font-size: 20px; color: #6f4725; }
.cell-up-on-thumb {
  position: absolute;
  right: -4px;
  bottom: -4px;
  font-size: 9px;
  color: #ffd77f;
  border: 1px solid #e8a020;
  border-radius: 5px;
  padding: 0 3px;
  background: linear-gradient(180deg, #5e3a17, #2b1709);
  line-height: 1.2;
  box-shadow: 0 1px 4px rgba(0,0,0,.5);
}
.cell-lock-on-thumb {
  position: absolute;
  left: -4px;
  bottom: -4px;
  font-size: 9px;
  color: #ffb3b3;
  border: 1px solid #d05a5a;
  border-radius: 5px;
  padding: 0 3px;
  background: linear-gradient(180deg, #4a1a1a, #250909);
  line-height: 1.2;
  box-shadow: 0 1px 4px rgba(0,0,0,.5);
}
.cell-name-row {
  width: 100%;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.cell-name {
  font-size: 10px;
  font-weight: 600;
  color: #f0e0c0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cell-tier-inline {
  flex-shrink: 0;
  font-size: 8px;
  font-weight: 700;
  border: 1px solid;
  border-radius: 4px;
  padding: 0 3px;
  line-height: 1.3;
  background: rgba(0,0,0,.2);
}
.cell-meta {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}
.cell-enhance {
  font-size: 10px;
  font-weight: 700;
  color: #ffc840;
}
.cell-stat {
  font-size: 10px;
  color: #c8a47a;
  background: #2a1508;
  border: 1px solid #60300830;
  border-radius: 4px;
  line-height: 1.25;
  padding: 1px 4px;
}
.cell-lock-text {
  margin-top: auto;
  font-size: 9px;
  color: #f4b0b0;
  background: #3c1717;
  border: 1px solid #8e3f3f;
  border-radius: 4px;
  line-height: 1.2;
  padding: 1px 4px;
}
@media (max-width: 420px) {
  .equip-grid { gap: 5px; }
  .equip-cell { min-height: 106px; padding: 5px 4px; }
  .cell-thumb { width: 34px; height: 34px; }
  .cell-name, .cell-stat, .cell-slot, .cell-enhance { font-size: 9px; }
  .cell-up-on-thumb { font-size: 8px; }
}

/* 詳情 sheet */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 100; display: flex; align-items: flex-end; justify-content: center; }
.detail-sheet { background: linear-gradient(180deg, #3d2010 0%, #1a0a02 100%); border: 2px solid #c08030; border-bottom: none; border-radius: 20px 20px 0 0; padding: 24px 16px 32px; width: 100%; max-width: 480px; position: relative; max-height: 85vh; overflow-y: auto; box-shadow: 0 -4px 24px rgba(0,0,0,0.7); }
.close-btn { position: absolute; top: 14px; right: 14px; background: none; border: none; color: #9a7850; font-size: 18px; cursor: pointer; }
.detail-header { display: flex; gap: 14px; margin-bottom: 16px; }
.detail-thumb { width: 72px; height: 72px; border-radius: 12px; background: #1a0a02; border: 2px solid #c08030; flex-shrink: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px rgba(192,128,48,0.3); }
.detail-img { width: 100%; height: 100%; object-fit: contain; }
.detail-placeholder { font-size: 32px; }
.detail-meta { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 4px; }
.detail-name { font-size: 16px; font-weight: 700; color: #f0e0c0; text-shadow: 0 1px 4px rgba(0,0,0,0.8); }
.detail-slot-label { font-size: 11px; color: #9a7850; }
.detail-badges { display: flex; gap: 6px; align-items: center; }

.section-block { margin-bottom: 14px; }
.block-title { font-size: 11px; font-weight: 700; color: #e8a020; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-chips-row { display: flex; flex-wrap: wrap; gap: 6px; }
.stat-chip-lg { font-size: 12px; font-weight: 600; background: #1a0a02; border: 1px solid #60300850; border-radius: 6px; padding: 4px 10px; color: #f0e0c0; }

.effect-row { background: #1a0a02; border: 1px solid #60300840; border-radius: 8px; padding: 8px 10px; margin-bottom: 6px; }
.effect-type { font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; margin-right: 6px; }
.effect-type.passive { background: #1a3020; color: #22c55e; border: 1px solid #22c55e40; }
.effect-type.proc    { background: #2a1a38; color: #c084fc; border: 1px solid #c084fc40; }
.effect-type.combat  { background: #3a1a1a; color: #f87171; border: 1px solid #f8717140; }
.effect-label { font-size: 12px; font-weight: 600; color: #f0e0c0; }
.effect-notes { font-size: 11px; color: #9a7850; margin-top: 4px; line-height: 1.4; }

.enhance-lv-row { font-size: 13px; color: #f0e0c0; margin-bottom: 8px; }
.mat-row { display: flex; justify-content: space-between; font-size: 12px; color: #f0e0c0; padding: 4px 0; border-bottom: 1px solid #60300830; }
.ok { color: #22c55e; }
.lack { color: #f87171; }
.lack-count { margin-left: 8px; font-size: 11px; color: #f87171; }
.success-rate { margin-top: 8px; font-size: 12px; color: #f0c040; text-align: right; }
.enhance-loading { font-size: 12px; color: #9a7850; }
.enhance-msg { font-size: 13px; margin-top: 10px; text-align: center; }

.btn-gold { font-weight: 700; border-radius: 10px; padding: 10px 16px; color: #3a1800; background: linear-gradient(180deg, #ffd060 0%, #e8900a 50%, #c06808 100%); border: none; cursor: pointer; box-shadow: 0 2px 0 #7a3a00, 0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,240,180,0.6); transition: transform 0.1s, box-shadow 0.1s; }
.btn-gold:active { transform: translateY(1px); box-shadow: 0 1px 0 #7a3a00; }
.btn-gold:disabled { opacity: .5; cursor: not-allowed; }
.btn-ghost { background: rgba(60,20,0,0.5); border: 1px solid #c08030; border-radius: 10px; padding: 10px 16px; color: #c09060; cursor: pointer; }
.w-full { width: 100%; display: block; text-align: center; }
.mt-2 { margin-top: 8px; }
</style>
