<script setup>
import { ref, computed, onMounted } from 'vue'
import { shopApi } from '@/api'
import { usePlayerStore } from '@/stores/player'

const player    = usePlayerStore()
const items     = ref([])
const catFilter = ref('all')
const selected  = ref(null)
const buying    = ref(false)
const msg       = ref('')

const CATS = [
  { key: 'all',        label: '全部'   },
  { key: 'consumable', label: '消耗品' },
  { key: 'equipment',  label: '裝備'   },
  { key: 'special',    label: '特殊'   },
]

const TIER_COLOR = { S: '#ef4444', A: '#f97316', B: '#a855f7', C: '#3b82f6', D: '#6b7280' }

onMounted(async () => {
  const res = await shopApi.listItems()
  items.value = (res.data ?? res) || []
})

const filtered = computed(() => {
  if (catFilter.value === 'all') return items.value
  return items.value.filter(i => i.category === catFilter.value || i.type === catFilter.value)
})

function openDetail(item) { selected.value = item; msg.value = '' }
function closeDetail() { selected.value = null }

async function buyItem() {
  if (!selected.value || buying.value) return
  buying.value = true
  msg.value    = ''
  try {
    await shopApi.buyItem(selected.value.id || selected.value.itemId)
    msg.value = '✅ 購買成功！道具已放入背包'
    await player.fetchProfile()
  } catch (e) {
    msg.value = '❌ ' + (e.message || '購買失敗')
  } finally { buying.value = false }
}
</script>

<template>
  <div class="page">
    <h2 class="page-title">🛒 冒險商店</h2>

    <!-- 分類 -->
    <div class="cat-bar">
      <button
        v-for="c in CATS" :key="c.key"
        class="cat-btn" :class="{ active: catFilter === c.key }"
        @click="catFilter = c.key"
      >{{ c.label }}</button>
    </div>

    <!-- 商品列表 -->
    <div class="shop-grid">
      <div v-if="filtered.length === 0" class="empty-hint">沒有商品</div>
      <div
        v-for="item in filtered"
        :key="item.id || item.itemId"
        class="shop-card"
        @click="openDetail(item)"
      >
        <div class="shop-icon">{{ item.icon || '📦' }}</div>
        <div class="shop-name">{{ item.name }}</div>
        <div class="shop-price">
          <span v-if="item.priceGold">💰 {{ item.priceGold }}</span>
          <span v-if="item.priceDiamond">💎 {{ item.priceDiamond }}</span>
        </div>
        <div class="shop-tier" :style="{ color: TIER_COLOR[item.tier] }">{{ item.tier }}</div>
      </div>
    </div>

    <!-- 詳情 -->
    <Teleport to="body">
      <div v-if="selected" class="overlay" @click.self="closeDetail">
        <div class="detail-sheet">
          <button class="close-btn" @click="closeDetail">✕</button>
          <div class="detail-icon">{{ selected.icon || '📦' }}</div>
          <div class="detail-name">{{ selected.name }}</div>
          <div class="detail-tier" :style="{ color: TIER_COLOR[selected.tier] }">{{ selected.tier }} 階</div>
          <p class="detail-desc">{{ selected.description || '—' }}</p>
          <div class="price-row">
            <div v-if="selected.priceGold"    class="price-tag">💰 {{ selected.priceGold }} 金幣</div>
            <div v-if="selected.priceDiamond" class="price-tag diamond">💎 {{ selected.priceDiamond }} 鑽石</div>
          </div>
          <div v-if="msg" class="action-msg">{{ msg }}</div>
          <button class="btn-gold buy-btn" :disabled="buying" @click="buyItem">
            {{ buying ? '購買中…' : '立即購買' }}
          </button>
          <button class="btn-ghost cancel-btn" @click="closeDetail">取消</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page { padding: 0 12px 16px; }
.page-title { font-size: 18px; font-weight: 700; color: #f0c040; margin: 16px 0 12px; }

.cat-bar { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
.cat-btn {
  padding: 6px 14px; font-size: 12px; font-weight: 600;
  background: #161b2e; border: 1px solid #2d3555; border-radius: 20px;
  color: #9a8e7a; cursor: pointer; transition: all 0.2s;
}
.cat-btn.active { border-color: #d4a017; color: #f0c040; }

.shop-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
}
.empty-hint { grid-column: span 2; text-align: center; color: #2d3555; padding: 40px 0; }
.shop-card {
  background: #161b2e; border: 1px solid #2d3555; border-radius: 12px;
  padding: 14px 12px; cursor: pointer; text-align: center;
  transition: border-color 0.2s; position: relative;
}
.shop-card:active { background: #1e2540; }
.shop-icon { font-size: 28px; margin-bottom: 6px; }
.shop-name { font-size: 13px; font-weight: 600; color: #e8dcc8; margin-bottom: 4px; }
.shop-price { font-size: 12px; color: #f0c040; font-weight: 700; }
.shop-tier {
  position: absolute; top: 8px; right: 8px;
  font-size: 11px; font-weight: 700;
}

/* Detail sheet */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100;
  display: flex; align-items: flex-end; justify-content: center;
}
.detail-sheet {
  background: linear-gradient(180deg, #1e2540 0%, #161b2e 100%);
  border: 1px solid #d4a017; border-bottom: none;
  border-radius: 20px 20px 0 0;
  padding: 24px 20px 32px;
  width: 100%; max-width: 480px; position: relative;
}
.close-btn {
  position: absolute; top: 14px; right: 16px;
  background: none; border: none; color: #9a8e7a; font-size: 18px; cursor: pointer;
}
.detail-icon { font-size: 48px; text-align: center; margin-bottom: 8px; }
.detail-name { text-align: center; font-size: 18px; font-weight: 700; color: #e8dcc8; }
.detail-tier { text-align: center; font-size: 13px; font-weight: 700; margin-top: 4px; }
.detail-desc { text-align: center; font-size: 12px; color: #9a8e7a; margin: 8px 0; }
.price-row { display: flex; justify-content: center; gap: 12px; margin: 12px 0; }
.price-tag {
  padding: 6px 16px; background: #0d0f1a; border: 1px solid #d4a017;
  border-radius: 8px; font-size: 14px; font-weight: 700; color: #f0c040;
}
.price-tag.diamond { border-color: #a855f7; color: #c084fc; }
.action-msg { text-align: center; font-size: 13px; margin-bottom: 10px; }
.buy-btn { width: 100%; margin-bottom: 8px; text-align: center; }
.cancel-btn { width: 100%; text-align: center; }
</style>
