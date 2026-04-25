<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { playerApi, enhanceApi } from '@/api'

const player = usePlayerStore()
const route = useRoute()
const tab        = ref('item')  // item | weapon | armor | special | badge
const selectedItem = ref(null)
const actionMsg    = ref('')
const enhanceInfo  = ref(null)
const enhancing    = ref(false)

const TABS = [
  { key: 'item',    label: '道具'  },
  { key: 'weapon',  label: '武器'  },
  { key: 'armor',   label: '防具'  },
  { key: 'special', label: '特殊'  },
  { key: 'badge',   label: '徽章'  },
]

const TYPE_MAP = {
  item: ['consumable', 'material', 'other', 'collectible'],
  weapon: ['weapon', 'shield'],
  armor: ['armor', 'helmet', 'gloves', 'boots', 'accessory', 'ring'],
  special: ['special', 'monster_card', 'title'],
  badge: ['job_badge', 'badge'],
}

function itemTypeOf(item) {
  return String(item?.type || item?.itemType || item?.category || '').toLowerCase()
}

function itemSlotOf(item) {
  return String(item?.equipSlot || item?.slot || '').toLowerCase()
}

function itemIdOf(item) {
  return item?.uuid || item?.id || item?._id || item?.itemId || ''
}

function tabMatch(item, tabKey) {
  const slot = itemSlotOf(item)
  const type = itemTypeOf(item)

  if (tabKey === 'item') {
    return !['equipment', 'job_badge', 'badge', 'monster_card'].includes(type)
  }
  if (tabKey === 'badge') {
    return ['job_badge', 'badge'].includes(type)
  }
  if (tabKey === 'special') {
    if (type === 'monster_card') return true
    if (type === 'equipment' && (['title_eq', 'special_1', 'special_2', 'special_3', 'special'].includes(slot) || slot === 'special')) return true
    return ['special', 'title'].includes(type)
  }

  if (slot) {
    if (['weapon', 'shield'].includes(slot)) return tabKey === 'weapon'
    if (['armor', 'garment', 'shoes', 'head_top', 'head_mid', 'head_low'].includes(slot)) return tabKey === 'armor'
    if (['accessory_l', 'accessory_r'].includes(slot)) return tabKey === 'armor'
    if (['special_1', 'special_2', 'special_3', 'title_eq', 'special'].includes(slot)) return tabKey === 'special'
    if (['job_eq'].includes(slot)) return tabKey === 'badge'
  }

  const allow = TYPE_MAP[tabKey] || []
  return allow.includes(type)
}

const SLOT_LABELS = {
  weapon: '武器', shield: '副手',
  armor: '衣服', garment: '披肩', shoes: '鞋子',
  head_top: '頭上', head_mid: '頭中', head_low: '頭下',
  accessory_l: '飾品左', accessory_r: '飾品右',
  job_eq: '職業', title_eq: '稱號',
  special_1: '特殊1', special_2: '特殊2', special_3: '特殊3',
}

const SLOT_TAB_MAP = {
  weapon: 'weapon',
  shield: 'weapon',
  armor: 'armor',
  garment: 'armor',
  shoes: 'armor',
  head_top: 'armor',
  head_mid: 'armor',
  head_low: 'armor',
  accessory_l: 'armor',
  accessory_r: 'armor',
  special_1: 'special',
  special_2: 'special',
  special_3: 'special',
  job_eq: 'badge',
  title_eq: 'special',
}

const requestedSlot = computed(() => {
  const s = String(route.query.slot || '')
  return SLOT_LABELS[s] ? s : ''
})

const requestedSlotLabel = computed(() => SLOT_LABELS[requestedSlot.value] || '')

function itemFitsSlot(item, slot) {
  if (!slot) return true
  const equipSlot = String(item?.equipSlot || item?.slot || '').toLowerCase()
  const type = itemTypeOf(item)

  if (equipSlot) {
    if (equipSlot === slot) return true

    // API 可能只回傳 `special`，但前端是 `special_1/2/3` 三格
    const specialSlotSet = new Set(['special', 'special_1', 'special_2', 'special_3'])
    if (specialSlotSet.has(equipSlot) && specialSlotSet.has(slot)) return true

    if (slot === 'title_eq' && ['title_eq', 'special', 'title'].includes(equipSlot)) return true
    if (slot === 'job_eq' && ['job_eq', 'badge', 'job_badge'].includes(equipSlot)) return true
  }

  if (slot === 'weapon') return type === 'weapon'
  if (slot === 'shield') return ['shield', 'weapon'].includes(type)
  if (['armor', 'garment', 'shoes', 'head_top', 'head_mid', 'head_low'].includes(slot)) {
    return ['armor', 'helmet', 'gloves', 'boots'].includes(type)
  }
  if (['accessory_l', 'accessory_r'].includes(slot)) {
    return ['accessory', 'ring', 'armor'].includes(type)
  }
  if (['special_1', 'special_2', 'special_3'].includes(slot)) {
    return ['special', 'collectible', 'monster_card'].includes(type)
  }
  if (slot === 'title_eq') {
    return ['title', 'special'].includes(type)
  }
  if (slot === 'job_eq') {
    return ['badge', 'job_badge'].includes(type)
  }
  return true
}

const filtered = computed(() => {
  return player.inventory.filter((i) => tabMatch(i, tab.value) && itemFitsSlot(i, requestedSlot.value))
})

function countForTab(tabKey) {
  return player.inventory.filter((i) => tabMatch(i, tabKey) && itemFitsSlot(i, requestedSlot.value)).length
}

function switchToFirstNonEmptyTab() {
  if (!player.inventory?.length) return
  if (countForTab(tab.value) > 0) return
  const first = TABS.find((t) => countForTab(t.key) > 0)
  if (first) tab.value = first.key
}

const TIER_COLOR = { S: '#ef4444', A: '#f97316', B: '#a855f7', C: '#3b82f6', D: '#6b7280' }

function tierColor(t) { return TIER_COLOR[t] || '#6b7280' }

onMounted(async () => {
  await player.fetchInventory()
  if (requestedSlot.value && SLOT_TAB_MAP[requestedSlot.value]) {
    tab.value = SLOT_TAB_MAP[requestedSlot.value]
  }
  switchToFirstNonEmptyTab()
})

watch(requestedSlot, (slot) => {
  if (slot && SLOT_TAB_MAP[slot]) {
    tab.value = SLOT_TAB_MAP[slot]
    selectedItem.value = null
  }
  switchToFirstNonEmptyTab()
})

function selectItem(item) {
  selectedItem.value = item
  enhanceInfo.value  = null
  actionMsg.value    = ''
}

function closeDetail() { selectedItem.value = null }

function cardSkillText(item) {
  const skill = item?.monsterCardSkill
  if (skill?.name) {
    const desc = skill.description ? `（${skill.description}）` : ''
    return `${skill.name}${desc}`
  }
  return item?.cardSkillText || item?.effectText || ''
}

async function doAction(action) {
  const uuid = itemIdOf(selectedItem.value)
  actionMsg.value = ''
  try {
    if (action === 'use')    await playerApi.useItem(uuid)
    if (action === 'sell')   await playerApi.sellItem(uuid)
    if (action === 'discard') await playerApi.discardItem(uuid)
    if (action === 'equip')  await playerApi.equipItem(uuid, requestedSlot.value || undefined)
    actionMsg.value = '✅ 操作成功'
    await player.fetchInventory()
    closeDetail()
  } catch (e) {
    actionMsg.value = '❌ ' + (e.message || '操作失敗')
  }
}

async function loadEnhance() {
  const uuid = itemIdOf(selectedItem.value)
  try {
    const res = await enhanceApi.getInfo(uuid)
    enhanceInfo.value = res.data ?? res
  } catch (e) {
    actionMsg.value = '❌ ' + e.message
  }
}

async function doEnhance() {
  const uuid = itemIdOf(selectedItem.value)
  enhancing.value = true
  try {
    const res = await enhanceApi.doEnhance(uuid)
    actionMsg.value = '✅ ' + (res.data?.message || res.message || '強化完成')
    await player.fetchInventory()
    enhanceInfo.value = null
  } catch (e) {
    actionMsg.value = '❌ ' + e.message
  } finally { enhancing.value = false }
}

const isEquippable = computed(() => {
  const t = itemTypeOf(selectedItem.value)
  if (!['equipment','weapon','shield','armor','helmet','gloves','boots','accessory','ring','special','badge','job_badge','collectible','monster_card','title'].includes(t)) return false
  return itemFitsSlot(selectedItem.value, requestedSlot.value)
})
const isMonsterCard = computed(() => {
  const t = itemTypeOf(selectedItem.value)
  const slot = String(selectedItem.value?.equipSlot || selectedItem.value?.slot || '').toLowerCase()
  return t === 'monster_card' || !!selectedItem.value?.monsterCardSkill || slot.startsWith('special_')
})
const isEnhanceable = computed(() => isEquippable.value && !isMonsterCard.value)
const isSellable = computed(() => !isMonsterCard.value)
const isConsumable  = computed(() => ['consumable'].includes(itemTypeOf(selectedItem.value)))
</script>

<template>
  <div class="page">
    <div v-if="requestedSlot" class="slot-hint">
      請選擇可裝備到「{{ requestedSlotLabel }}」的道具
    </div>

    <!-- Tab 切換 -->
    <div class="tab-bar">
      <button
        v-for="t in TABS" :key="t.key"
        class="tab-btn" :class="{ active: tab === t.key }"
        @click="tab = t.key; selectedItem = null"
      >{{ t.label }}</button>
    </div>

    <!-- 道具列表 -->
    <div class="item-list">
      <div v-if="filtered.length === 0" class="empty-hint">背包是空的</div>
      <div
        v-for="item in filtered"
        :key="item.uuid || item.id || item._id || item.itemId || item.name"
        class="item-card"
        :class="{ selected: selectedItem?.uuid === item.uuid }"
        @click="selectItem(item)"
      >
        <div class="item-icon">{{ item.icon || '📦' }}</div>
        <div class="item-body">
          <div class="item-name">{{ item.itemName || item.name || '未命名道具' }}</div>
          <div v-if="cardSkillText(item)" class="item-skill">{{ cardSkillText(item) }}</div>
          <div class="item-meta">
            <span class="tier-badge" :style="{ color: tierColor(item.tier), borderColor: tierColor(item.tier) }">{{ item.tier }}</span>
            <span v-if="item.quantity > 1" class="qty">×{{ item.quantity }}</span>
            <span v-if="item.enhanceLevel" class="enhance-lv">+{{ item.enhanceLevel }}</span>
          </div>
        </div>
        <div v-if="item.equipped || item.isEquipped" class="equipped-tag">裝備中</div>
      </div>
    </div>

    <!-- 選中道具詳情 -->
    <Teleport to="body">
      <div v-if="selectedItem" class="overlay" @click.self="closeDetail">
        <div class="detail-sheet">
          <button class="close-btn" @click="closeDetail">✕</button>

          <div class="detail-icon">{{ selectedItem.icon || '📦' }}</div>
          <div class="detail-name">{{ selectedItem.itemName || selectedItem.name || selectedItem.displayName }}</div>
          <div class="detail-tier" :style="{ color: tierColor(selectedItem.tier) }">
            {{ selectedItem.tier }} 階 {{ selectedItem.enhanceLevel > 0 ? `+${selectedItem.enhanceLevel}` : '' }}
          </div>
          <p class="detail-desc">{{ selectedItem.description || cardSkillText(selectedItem) || '—' }}</p>

          <div v-if="actionMsg" class="action-msg">{{ actionMsg }}</div>

          <!-- 強化資訊 -->
          <div v-if="enhanceInfo" class="enhance-box">
            <p class="eh-title">強化等級：+{{ enhanceInfo.currentLevel }} → +{{ enhanceInfo.nextLevel }}</p>
            <p class="eh-req">所需材料：</p>
            <div v-for="req in (enhanceInfo.requirements || [])" :key="req.name" class="eh-mat">
              {{ req.name }} × {{ req.need }}
              <span :class="req.have >= req.need ? 'ok' : 'lack'">（持有 {{ req.have }}）</span>
            </div>
            <button class="btn-gold mt-3 w-full" :disabled="enhancing" @click="doEnhance">
              {{ enhancing ? '強化中…' : '確認強化' }}
            </button>
          </div>

          <!-- 操作按鈕 -->
          <div class="action-btns">
            <button v-if="isConsumable" class="btn-gold" @click="doAction('use')">使用</button>
            <button v-if="isEquippable && !(selectedItem.equipped || selectedItem.isEquipped)" class="btn-gold" @click="doAction('equip')">裝備</button>
            <button v-if="isEnhanceable && !enhanceInfo" class="btn-ghost" @click="loadEnhance">強化</button>
            <button v-if="isSellable" class="btn-ghost" @click="doAction('sell')">賣出</button>
            <button class="btn-ghost danger" @click="doAction('discard')">丟棄</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; height: 100%; }
.slot-hint {
  font-size: 12px;
  color: #f0c040;
  background: #1a0f06;
  border-bottom: 1px solid #5d3518;
  padding: 8px 10px;
}
.tab-bar {
  display: flex; background: #161b2e; border-bottom: 1px solid #2d3555;
  flex-shrink: 0;
}
.tab-btn {
  flex: 1; padding: 10px 4px; font-size: 12px; font-weight: 600;
  background: none; border: none; color: #9a8e7a; cursor: pointer;
  border-bottom: 2px solid transparent; transition: all 0.2s;
}
.tab-btn.active { color: #f0c040; border-bottom-color: #d4a017; }

.item-list { flex: 1; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; gap: 6px; }
.empty-hint { text-align: center; color: #2d3555; padding: 40px 0; font-size: 14px; }

.item-card {
  display: flex; align-items: center; gap: 10px;
  background: #161b2e; border: 1px solid #2d3555; border-radius: 10px; padding: 10px;
  cursor: pointer; transition: border-color 0.2s;
}
.item-card:active { background: #1e2540; }
.item-card.selected { border-color: #d4a017; }
.item-icon { font-size: 24px; width: 36px; text-align: center; flex-shrink: 0; }
.item-body { flex: 1; min-width: 0; }
.item-name { font-size: 14px; font-weight: 600; color: #e8dcc8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-skill {
  margin-top: 3px;
  font-size: 11px;
  color: #f0c040;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-meta { display: flex; align-items: center; gap: 6px; margin-top: 3px; }
.tier-badge { font-size: 11px; font-weight: 700; border: 1px solid; padding: 0 5px; border-radius: 4px; }
.qty { font-size: 11px; color: #9a8e7a; }
.enhance-lv { font-size: 11px; color: #f0c040; font-weight: 700; }
.equipped-tag {
  font-size: 10px; background: #d4a017; color: #0d0f1a;
  padding: 2px 6px; border-radius: 4px; font-weight: 700; flex-shrink: 0;
}

/* 詳情 sheet */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100;
  display: flex; align-items: flex-end; justify-content: center;
}
.detail-sheet {
  background: linear-gradient(180deg, #1e2540 0%, #161b2e 100%);
  border: 1px solid #d4a017;
  border-bottom: none;
  border-radius: 20px 20px 0 0;
  padding: 24px 20px 32px;
  width: 100%; max-width: 480px;
  position: relative;
  max-height: 80vh; overflow-y: auto;
}
.close-btn {
  position: absolute; top: 14px; right: 16px;
  background: none; border: none; color: #9a8e7a; font-size: 18px; cursor: pointer;
}
.detail-icon { font-size: 48px; text-align: center; margin-bottom: 8px; }
.detail-name { text-align: center; font-size: 18px; font-weight: 700; color: #e8dcc8; }
.detail-tier { text-align: center; font-size: 13px; font-weight: 700; margin-top: 4px; }
.detail-desc { text-align: center; font-size: 12px; color: #9a8e7a; margin: 8px 0 12px; }
.action-msg { text-align: center; font-size: 13px; margin-bottom: 12px; }

.enhance-box {
  background: #0d0f1a; border: 1px solid #2d3555; border-radius: 10px;
  padding: 12px; margin-bottom: 12px;
}
.eh-title { font-size: 13px; font-weight: 700; color: #f0c040; margin: 0 0 6px; }
.eh-req { font-size: 11px; color: #9a8e7a; margin: 0 0 4px; }
.eh-mat { font-size: 12px; color: #e8dcc8; margin-bottom: 3px; }
.ok { color: #22c55e; }
.lack { color: #ef4444; }

.action-btns { display: flex; flex-wrap: wrap; gap: 8px; }
.action-btns .btn-gold,
.action-btns .btn-ghost { flex: 1; min-width: calc(50% - 4px); text-align: center; }
.btn-ghost.danger { color: #ef4444; border-color: #ef4444; }
.mt-3 { margin-top: 12px; }
.w-full { width: 100%; }
</style>
