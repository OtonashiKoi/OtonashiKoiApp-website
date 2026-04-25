<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref(null)
let animFrame = null

// Particle system
onMounted(() => {
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  let W = (canvas.width = window.innerWidth)
  let H = (canvas.height = window.innerHeight)

  const particles = Array.from({ length: 80 }, () => createParticle(W, H))

  function createParticle(w, h, fromBottom = false) {
    return {
      x: Math.random() * w,
      y: fromBottom ? h + 10 : Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.3 + Math.random() * 0.6),
      r: 1 + Math.random() * 2,
      alpha: 0.3 + Math.random() * 0.6,
      flicker: Math.random() * Math.PI * 2,
      color: Math.random() < 0.6 ? '#ffd770' : Math.random() < 0.5 ? '#a78bfa' : '#f87171',
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H)
    particles.forEach((p, i) => {
      p.x += p.vx + Math.sin(p.flicker) * 0.15
      p.y += p.vy
      p.flicker += 0.03
      p.alpha += Math.sin(p.flicker * 2) * 0.015
      if (p.y < -10 || p.alpha <= 0) {
        particles[i] = createParticle(W, H, true)
        return
      }
      ctx.save()
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha))
      ctx.shadowBlur = 8
      ctx.shadowColor = p.color
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })
    animFrame = requestAnimationFrame(draw)
  }

  draw()

  const resize = () => {
    W = canvas.width = window.innerWidth
    H = canvas.height = window.innerHeight
  }
  window.addEventListener('resize', resize)
  onUnmounted(() => {
    cancelAnimationFrame(animFrame)
    window.removeEventListener('resize', resize)
  })
})

// Scroll reveals
onMounted(() => {
  const els = document.querySelectorAll('.reveal')
  const obs = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
    { threshold: 0.12 },
  )
  els.forEach((el) => obs.observe(el))
})

// ─── Modal ───
const activeModal = ref(null)
function openModal(type, data) { activeModal.value = { type, data } }
function closeModal() { activeModal.value = null }
onMounted(() => {
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal() })
})

// ─── Data ───
const zones = [
  {
    key: 'beginner', emoji: '🌱', name: '新手區', lv: 'Lv.1–3', color: '#4ade80', monsters: 5,
    desc: '踏上旅途，學習基礎戰鬥',
    detail: {
      intro: '音無樂園的起點，怪物溫和適合新手熟悉戰鬥系統。',
      monsterList: ['小史(小)', '野兔', '蘑菇怪', '小史(中)', '★ 大野兔(B)'],
      drops: '木製單手劍・木製弓・木製單/雙手法杖・布衣・布披風・布靴・銅戒指系列・新手護目鏡',
      tips: '刷到 Lv.3 後前往一般區，此區掉落布系與木製裝備，適合建立初期配備。',
      recommend: '任何職業皆可 / 無裝備需求',
    },
  },
  {
    key: 'normal', emoji: '⚔️', name: '一般區', lv: 'Lv.1–10', color: '#facc15', monsters: 8,
    desc: '鍛煉身手，挑戰更強的敵人',
    detail: {
      intro: '小史、哥布、小狼、石頭四大常駐怪，外加青草地精、綠野狼兩種精英怪。稀有的小金(稀) 出現時必搶。',
      monsterList: ['小史', '哥布', '小狼', '石頭', '青草地精', '綠野狼', '★ 大史(B)', '★ 小金(稀)'],
      drops: '布系→皮系裝備・木製→鐵製武器・銅戒指・鐵戒指｜Boss 大史(B): 木製雙手劍/槌/斧・初級法杖',
      tips: '小金(稀) 是稀有怪，掉落銅戒指機率高，出現時優先攻擊。',
      recommend: 'Lv.1+ / 無裝備限制',
    },
  },
  {
    key: 'mid', emoji: '✦', name: '中級區', lv: 'Lv.10+', color: '#fb923c', monsters: 12,
    desc: '中階冒險者的試煉場地',
    detail: {
      intro: '甲蟹、牙牙狼、巨巨、黑暗弓手等六種常駐怪，加上林地妖靈(樹樹)等森林系精英怪。Boss 米拉桑(B) 有機率掉落鋼製裝備。',
      monsterList: ['甲蟹', '牙牙狼', '巨巨', '黑暗弓手', '林地妖靈(樹樹)', '森林古樹', '暗夜獵豹', '森林巫師', '森林盜賊', '森林之獸', '★ 米拉桑(B)', '★ 中金(稀)'],
      drops: '皮系裝備・鐵製系列武器・銀戒指・鋼製武器・鋼盾｜Boss 米拉桑(B): 鐵製雙手劍/法杖/弓・皮甲・鋼製裝備',
      tips: '米拉桑(B) 掉落最豐富，中金(稀) 機率低但掉落銀戒指穩定。',
      recommend: 'Lv.10+ / 建議裝備木製系列強化',
    },
  },
  {
    key: 'hard', emoji: '🔥', name: '高級區', lv: 'Lv.20+', color: '#f87171', monsters: 15,
    desc: '古城遺蹟中的強大怪物',
    detail: {
      intro: '城牆衛兵、石像鬼、古城法師等 12 種古城怪物盤踞，三位 Boss 掌管豐厚寶藏。鋼鐵與秘銀裝備的主要來源。',
      monsterList: ['城牆衛兵', '古城弓手', '石像鬼', '古城法師', '廢墟蠍兵', '冰封騎士', '詛咒祭司', '鐵甲衛將', '古城刺客', '毒霧蜘蛛', '古城狂戰士', '黑焰巫師', '★ 城堡魔像(B)', '★ 古城將軍(B)', '★ 廢都魔王(B)'],
      drops: '鐵系→鋼鐵系裝備・鋼製武器・秘銀武器・秘銀盾・金戒指・銀戒指',
      tips: '三位 Boss 輪流刷。廢都魔王(B) 掉落含秘銀裝備，是高級區最值得農的目標。',
      recommend: 'Lv.20+ / 建議裝備鐵製系列',
    },
  },
  {
    key: 'elite', emoji: '💀', name: '精英區', lv: 'Lv.30+', color: '#c084fc', monsters: 1,
    desc: '傳說級別的凶猛敵人',
    detail: {
      intro: '目前精英區僅有大史王坐鎮，掉落包含鋼鐵與秘銀系列裝備，金戒指也是此區的重要產出。',
      monsterList: ['★ 大史王'],
      drops: '鐵系→鋼鐵系裝備・秘銀盾・鋼製弓・鋼製雙手槌・金戒指',
      tips: '大史王為精英 Boss，建議備齊高級裝備再挑戰。更多精英怪物正在規劃中。',
      recommend: 'Lv.30+ / 建議裝備鋼製系列強化',
    },
  },
]

const jobs = [
  {
    icon: '⚔️', name: '劍士', sub: 'SWORDSMAN', color: '#e8a04a', desc: '格擋後反擊，以一敵萬',
    detail: {
      mainStats: ['STR', 'VIT'],
      mechanic: '受到攻擊時有機率觸發「格擋」，成功格擋後立即進行一次反擊，反擊傷害享有額外加成。格擋率隨 VIT 提升而增加。',
      style: '防禦反擊型',
      tips: '均衡配置 STR 和 VIT，面對多段攻擊的怪物時表現最為出色。不要只堆一項屬性。',
    },
  },
  {
    icon: '🪓', name: '戰士', sub: 'WARRIOR', color: '#e05252', desc: '瀕死爆發，絕境翻盤',
    detail: {
      mainStats: ['STR', 'VIT'],
      mechanic: 'HP 低於 30% 時進入「憤怒」狀態，攻擊力大幅提升。越接近死亡，爆發力越驚人，是真正的絕境翻盤機。',
      style: '爆發輸出型',
      tips: '可主動讓自己保持低血量來維持高傷害輸出，但需精確計算安全邊界，避免被一發秒殺。',
    },
  },
  {
    icon: '🏹', name: '弓箭手', sub: 'ARCHER', color: '#52b86e', desc: '命中要害，必殺一擊',
    detail: {
      mainStats: ['DEX', 'AGI'],
      mechanic: '每次攻擊有機率觸發「命中要害」，造成額外傷害，且可與普通暴擊效果疊加，實現超高單發傷害。DEX 越高觸發率越高。',
      style: '高爆發遠程型',
      tips: '優先堆疊 DEX 提升要害觸發率，搭配 AGI 提高攻速，實現高頻率的驚人輸出爆發。',
    },
  },
  {
    icon: '🗡️', name: '盜賊', sub: 'ROGUE', color: '#a78bfa', desc: '連擊加速，如影隨形',
    detail: {
      mainStats: ['AGI', 'LUK'],
      mechanic: '攻擊時有機率觸發「連擊」，連續打出多段傷害。AGI 同時大幅提升閃避率，讓盜賊如幽靈般難以捕捉。',
      style: '連擊閃避型',
      tips: '大量堆疊 AGI 是盜賊的核心策略。達到閃避觸發後立即反擊，可以形成恐怖的循環輸出。',
    },
  },
  {
    icon: '🔮', name: '法師', sub: 'MAGE', color: '#60a5fa', desc: '魔法穿防，智慧碾壓',
    detail: {
      mainStats: ['INT'],
      mechanic: '魔法傷害可無視部分物理防禦，純 INT 配置可達最大魔法輸出。INT 同時提升魔法防禦，形成攻防一體的體系。',
      style: '高傷害魔法型',
      tips: '全力堆疊 INT，搭配魔法加成裝備可達驚人爆發。但需注意物理防禦較低，避免被近戰反打。',
    },
  },
  {
    icon: '🏥', name: '治療師', sub: 'HEALER', color: '#f0e040', desc: '在場光環，守護全隊',
    detail: {
      mainStats: ['INT', 'VIT'],
      mechanic: '「在場光環」效果：治療師在場時，同區所有玩家獲得持續回血效果。光環效果會持久化，你的存在即是隊伍最大資產。',
      style: '支援輔助型',
      tips: '在熱門討伐區頻繁現身，INT 提升治療量，VIT 確保自身存活。光環效果對精英區團隊至關重要。',
    },
  },
  {
    icon: '🥊', name: '矮人', sub: 'DWARF', color: '#fb923c', desc: '高血防守，如銅牆鐵壁',
    detail: {
      mainStats: ['VIT', 'STR'],
      mechanic: '全職業最高的 HP 和防禦成長，受到攻擊時傷害減免效果更為顯著。天生的肉盾擔當，讓隊友安心輸出。',
      style: '坦克防守型',
      tips: '主力堆疊 VIT 提升防禦和 HP 上限。在精英區長時間鏖戰也不用擔心被秒，是最穩定的存在。',
    },
  },
]

const attrs = [
  {
    key: 'STR', name: '力量', color: '#ef4444', desc: '物理攻擊、砍傷',
    detail: {
      effect: '直接提升物理攻擊力，影響劈砍、穿刺等所有物理技能傷害輸出',
      threshold: '無特殊閾值，線性穩定成長',
      bestFor: ['⚔️ 劍士', '🪓 戰士', '🥊 矮人'],
      tips: '近戰物理職業的主屬性。搭配高 STR 武器效果加倍。法師與治療師不需優先投入此屬性。',
    },
  },
  {
    key: 'AGI', name: '敏捷', color: '#22d3ee', desc: '攻速、閃避、連擊',
    detail: {
      effect: '提升攻擊速度（最快達 0.5秒/回合）、閃避率，以及盜賊連擊觸發率',
      threshold: '⚡ AGI 40 = 最快攻速 0.5s/回合（重要閾值）',
      bestFor: ['🗡️ 盜賊', '🏹 弓箭手'],
      tips: 'AGI 40 是攻速的最大閾值，超過後僅提升閃避。盜賊建議優先衝到 40 點再分配其他屬性。',
    },
  },
  {
    key: 'VIT', name: '體力', color: '#84cc16', desc: '最大HP、防禦',
    detail: {
      effect: '提升最大 HP 上限和物理防禦力，同時影響劍士的格擋率',
      threshold: '無特殊閾值，但精英區幾乎是生存必需屬性',
      bestFor: ['🥊 矮人', '⚔️ 劍士', '🏥 治療師'],
      tips: '所有職業都應投入一定的 VIT，特別是前往高難度區域前。純輸出職業可在後期補點。',
    },
  },
  {
    key: 'INT', name: '智力', color: '#818cf8', desc: '魔法傷害、魔防',
    detail: {
      effect: '提升魔法技能傷害、魔法防禦力，以及治療師的治療量',
      threshold: '無特殊閾值，與魔法裝備加乘效果顯著',
      bestFor: ['🔮 法師', '🏥 治療師'],
      tips: '法師應將 INT 投到最高。其他職業若不使用魔法技能，可將此屬性點投入其他更有效的方向。',
    },
  },
  {
    key: 'DEX', name: '靈巧', color: '#f59e0b', desc: '命中率、暴擊',
    detail: {
      effect: '提升命中率和暴擊率基礎值，弓箭手的「命中要害」觸發率也與 DEX 直接掛鉤',
      threshold: '命中不足時攻擊大量落空，須確保基本的 DEX 投入',
      bestFor: ['🏹 弓箭手', '🗡️ 盜賊'],
      tips: '命中率不足時攻擊頻繁落空，所有職業都需要保持基本的 DEX 值。弓箭手應作為主屬性全力培養。',
    },
  },
  {
    key: 'LUK', name: '幸運', color: '#ec4899', desc: '暴擊率、稀有掉落',
    detail: {
      effect: '提升暴擊率和稀有道具掉落率，是格鬥家（矮人）的核心爆發屬性',
      threshold: '無特殊閾值，高 LUK 在農稀有裝備時效益顯著',
      bestFor: ['🥊 矮人（格鬥家）', '🗡️ 盜賊'],
      tips: '想要提高稀有道具掉落率時非常有用。高 LUK 搭配暴擊裝備，能打出讓對手絕望的瞬間爆發。',
    },
  },
]

const features = [
  { icon: '🗡️', title: '裝備強化', desc: '使用強化寶石提升裝備能力，四個等階、無上限突破，打造你的最強裝備。' },
  { icon: '🃏', title: '怪物卡片', desc: '40+1 張稀有卡片，戰鬥中觸發 Buff/Debuff，掌握技能就能左右戰局。' },
  { icon: '🌐', title: '世界 Boss', desc: '定時出現的強力 Boss，全服玩家聯合挑戰，搶奪限定稀有戰利品。' },
  { icon: '🏆', title: '拍賣行', desc: '自由交易市場，玩家之間競標稀有裝備，累積財富成為商會大亨。' },
  { icon: '📜', title: '每日任務', desc: '每日、每週、新手任務三大系統，完成任務獲取豐厚獎勵與特殊道具。' },
  { icon: '⚡', title: '即時戰鬥', desc: 'Discord 頻道內直接開打，自動回合戰鬥，完整戰報即時呈現。' },
]
</script>

<template>
  <div class="landing">
    <canvas ref="canvasRef" class="particle-canvas" />

    <!-- ===== HERO ===== -->
    <section class="hero">
      <div class="hero-bg-pattern" />
      <div class="hero-inner">
        <div class="hero-badge">✦ Discord RPG ✦</div>
        <div class="hero-title-wrap">
          <div class="hero-deco-line" />
          <h1 class="hero-title">
            <span class="hero-jp">音無樂園</span>
            <span class="hero-sub-kanji">音無の世界 · 傳說裝備冒險</span>
          </h1>
          <div class="hero-deco-line" />
        </div>
        <p class="hero-desc">
          在 Discord 伺服器中，踏上你的 RPG 旅程<br />
          選擇職業、收集裝備、挑戰怪物、稱霸排行
        </p>
        <div class="hero-corner tl" />
        <div class="hero-corner tr" />
        <div class="hero-corner bl" />
        <div class="hero-corner br" />
      </div>
      <div class="hero-scroll-hint">▼ 繼續探索</div>
    </section>

    <!-- ===== ZONES ===== -->
    <section class="section reveal">
      <div class="section-header">
        <div class="sect-ornament">⟨ 冒險地帶 ⟩</div>
        <h2 class="sect-title">五大討伐區域</h2>
        <p class="sect-sub">由新手到精英，每個區域都有獨特的怪物與挑戰</p>
      </div>
      <div class="zones-grid">
        <div
          v-for="z in zones" :key="z.key"
          class="zone-card" :style="{ '--zc': z.color }"
          @click="openModal('zone', z)"
        >
          <div class="zone-emoji">{{ z.emoji }}</div>
          <div class="zone-lv">{{ z.lv }}</div>
          <div class="zone-name">{{ z.name }}</div>
          <div class="zone-desc">{{ z.desc }}</div>
          <div class="zone-monsters">怪物數：{{ z.monsters }}</div>
          <div class="card-hint">點擊查看詳情 ▸</div>
          <div class="zone-glow" />
        </div>
      </div>
    </section>

    <!-- ===== JOBS ===== -->
    <section class="section section-dark reveal">
      <div class="section-header">
        <div class="sect-ornament">⟨ 職業系統 ⟩</div>
        <h2 class="sect-title">七大基礎職業自由替換</h2>
        <p class="sect-sub">每個職業擁有獨特的戰鬥機制，選擇最適合你的風格</p>
      </div>
      <div class="jobs-grid">
        <div
          v-for="j in jobs" :key="j.sub"
          class="job-card" :style="{ '--jc': j.color }"
          @click="openModal('job', j)"
        >
          <div class="job-icon">{{ j.icon }}</div>
          <div class="job-sub">{{ j.sub }}</div>
          <div class="job-name">{{ j.name }}</div>
          <div class="job-desc">{{ j.desc }}</div>
          <div class="card-hint">點擊查看詳情 ▸</div>
          <div class="job-shine" />
        </div>
      </div>
    </section>

    <!-- ===== ATTRIBUTES ===== -->
    <section class="section reveal">
      <div class="section-header">
        <div class="sect-ornament">⟨ 屬性成長 ⟩</div>
        <h2 class="sect-title">六大核心屬性</h2>
        <p class="sect-sub">隨機分配屬性點，獨一無二的BUILD</p>
      </div>
      <div class="attrs-grid">
        <div
          v-for="a in attrs" :key="a.key"
          class="attr-card" :style="{ '--ac': a.color }"
          @click="openModal('attr', a)"
        >
          <div class="attr-key">{{ a.key }}</div>
          <div class="attr-name">{{ a.name }}</div>
          <div class="attr-desc">{{ a.desc }}</div>
          <div class="card-hint">點擊查看詳情 ▸</div>
          <div class="attr-border" />
        </div>
      </div>
    </section>

    <!-- ===== FEATURES ===== -->
    <section class="section section-dark reveal">
      <div class="section-header">
        <div class="sect-ornament">⟨ 遊戲特色 ⟩</div>
        <h2 class="sect-title">豐富的冒險體驗</h2>
        <p class="sect-sub">深度系統、多元玩法，讓你在異世界中樂此不疲</p>
      </div>
      <div class="features-grid">
        <div v-for="f in features" :key="f.title" class="feat-card">
          <div class="feat-icon">{{ f.icon }}</div>
          <div class="feat-title">{{ f.title }}</div>
          <div class="feat-desc">{{ f.desc }}</div>
        </div>
      </div>
    </section>

    <!-- ===== FOOTER CTA ===== -->
    <section class="cta-section">
      <div class="cta-bg-pattern" />
      <div class="cta-inner">
        <div class="cta-ornament">⚜</div>
        <h2 class="cta-title">開始你的傳說</h2>
        <p class="cta-desc">加入 Discord 伺服器，立刻開始你的 RPG 冒險旅程</p>
        <a class="dc-btn" href="https://discord.gg/EfpECVDJF6" target="_blank" rel="noopener">
          <span class="dc-btn-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
          </span>
          加入 Discord 伺服器
        </a>
        <div class="cta-corner tl" />
        <div class="cta-corner tr" />
        <div class="cta-corner bl" />
        <div class="cta-corner br" />
      </div>
      <div class="footer-copy">© 2026 音無樂園 ・ Built with ⚔️ &amp; Discord</div>
    </section>

    <!-- ===== MODAL ===== -->
    <Transition name="modal">
      <div v-if="activeModal" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-panel" :style="{ '--mc': activeModal.data.color || '#c8a04a' }">
          <button class="modal-close" @click="closeModal">✕</button>
          <div class="modal-corner tl" /><div class="modal-corner tr" />
          <div class="modal-corner bl" /><div class="modal-corner br" />

          <!-- Zone modal -->
          <template v-if="activeModal.type === 'zone'">
            <div class="modal-head">
              <span class="modal-emoji">{{ activeModal.data.emoji }}</span>
              <div>
                <div class="modal-badge-text">{{ activeModal.data.lv }}</div>
                <div class="modal-title">{{ activeModal.data.name }}</div>
              </div>
            </div>
            <div class="modal-deco-line" />
            <p class="modal-intro">{{ activeModal.data.detail.intro }}</p>
            <div class="modal-section-label">⚔ 怪物列表</div>
            <div class="modal-tags">
              <span v-for="m in activeModal.data.detail.monsterList" :key="m" class="modal-tag">{{ m }}</span>
            </div>
            <div class="modal-section-label">💰 主要掉落</div>
            <div class="modal-drops">{{ activeModal.data.detail.drops }}</div>
            <div class="modal-section-label">📌 冒險建議</div>
            <p class="modal-tips">{{ activeModal.data.detail.tips }}</p>
            <div class="modal-recommend">推薦條件：{{ activeModal.data.detail.recommend }}</div>
          </template>

          <!-- Job modal -->
          <template v-else-if="activeModal.type === 'job'">
            <div class="modal-head">
              <span class="modal-emoji">{{ activeModal.data.icon }}</span>
              <div>
                <div class="modal-badge-text">{{ activeModal.data.sub }}</div>
                <div class="modal-title">{{ activeModal.data.name }}</div>
              </div>
            </div>
            <div class="modal-deco-line" />
            <div class="modal-section-label">📊 主要屬性</div>
            <div class="modal-tags">
              <span v-for="s in activeModal.data.detail.mainStats" :key="s" class="modal-tag modal-tag-stat">{{ s }}</span>
            </div>
            <div class="modal-section-label">⚙ 核心機制</div>
            <p class="modal-intro">{{ activeModal.data.detail.mechanic }}</p>
            <div class="modal-section-label">🎯 戰鬥風格</div>
            <div class="modal-drops">{{ activeModal.data.detail.style }}</div>
            <div class="modal-section-label">📌 攻略提示</div>
            <p class="modal-tips">{{ activeModal.data.detail.tips }}</p>
          </template>

          <!-- Attr modal -->
          <template v-else-if="activeModal.type === 'attr'">
            <div class="modal-head">
              <span class="modal-attr-key">{{ activeModal.data.key }}</span>
              <div>
                <div class="modal-badge-text">ATTRIBUTE</div>
                <div class="modal-title">{{ activeModal.data.name }}</div>
              </div>
            </div>
            <div class="modal-deco-line" />
            <div class="modal-section-label">📈 效果說明</div>
            <p class="modal-intro">{{ activeModal.data.detail.effect }}</p>
            <div class="modal-section-label">⚡ 特殊閾值</div>
            <div class="modal-drops">{{ activeModal.data.detail.threshold }}</div>
            <div class="modal-section-label">🏆 最佳職業</div>
            <div class="modal-tags">
              <span v-for="b in activeModal.data.detail.bestFor" :key="b" class="modal-tag">{{ b }}</span>
            </div>
            <div class="modal-section-label">📌 配點建議</div>
            <p class="modal-tips">{{ activeModal.data.detail.tips }}</p>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ─── Base ─── */
.landing {
  min-height: 100vh;
  background: #06040f;
  color: #e8dcc8;
  font-family: 'Georgia', '游明朝', 'YuMincho', serif;
  overflow-x: hidden;
}

/* ─── Particle Canvas ─── */
.particle-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.55;
}

/* ─── HERO ─── */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px 80px;
  overflow: hidden;
}

.hero-bg-pattern {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 40%, rgba(120, 60, 10, 0.35), transparent),
    radial-gradient(ellipse 50% 50% at 20% 80%, rgba(80, 20, 120, 0.25), transparent),
    radial-gradient(ellipse 50% 50% at 80% 20%, rgba(20, 60, 120, 0.2), transparent);
  z-index: 1;
}

.hero-inner {
  position: relative;
  z-index: 2;
  max-width: 820px;
}

.hero-badge {
  display: inline-block;
  border: 1px solid rgba(200, 160, 74, 0.6);
  color: #c8a04a;
  font-size: 12px;
  letter-spacing: 6px;
  padding: 6px 20px;
  margin-bottom: 40px;
  background: rgba(200, 160, 74, 0.06);
  animation: pulse-border 3s ease-in-out infinite;
}

@keyframes pulse-border {
  0%, 100% { box-shadow: 0 0 0 0 rgba(200, 160, 74, 0); }
  50% { box-shadow: 0 0 18px 2px rgba(200, 160, 74, 0.25); }
}

.hero-title-wrap { margin-bottom: 30px; }

.hero-deco-line {
  height: 1px;
  background: linear-gradient(90deg, transparent, #c8a04a, #c8a04a, transparent);
  margin: 18px auto;
  width: 80%;
  max-width: 500px;
  opacity: 0.6;
}

.hero-title { margin: 0; }

.hero-jp {
  display: block;
  font-size: clamp(48px, 10vw, 96px);
  font-weight: 400;
  letter-spacing: 0.15em;
  background: linear-gradient(135deg, #ffd770 0%, #c8a04a 40%, #fff3b0 60%, #c8a04a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 30px rgba(200, 160, 74, 0.5));
  animation: title-glow 4s ease-in-out infinite;
}

@keyframes title-glow {
  0%, 100% { filter: drop-shadow(0 0 20px rgba(200, 160, 74, 0.4)); }
  50% { filter: drop-shadow(0 0 40px rgba(200, 160, 74, 0.8)); }
}

.hero-sub-kanji {
  display: block;
  font-size: clamp(13px, 2.5vw, 18px);
  letter-spacing: 0.4em;
  color: #b09060;
  margin-top: 10px;
  font-weight: 400;
}

.hero-desc {
  font-size: clamp(14px, 2vw, 17px);
  line-height: 1.9;
  color: #c0b090;
  letter-spacing: 0.05em;
  margin: 0 auto 40px;
  max-width: 520px;
}

.hero-corner, .cta-corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border-color: rgba(200, 160, 74, 0.55);
  border-style: solid;
}
.hero-corner.tl, .cta-corner.tl { top: -2px; left: -2px; border-width: 2px 0 0 2px; }
.hero-corner.tr, .cta-corner.tr { top: -2px; right: -2px; border-width: 2px 2px 0 0; }
.hero-corner.bl, .cta-corner.bl { bottom: -2px; left: -2px; border-width: 0 0 2px 2px; }
.hero-corner.br, .cta-corner.br { bottom: -2px; right: -2px; border-width: 0 2px 2px 0; }

.hero-scroll-hint {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  letter-spacing: 4px;
  color: rgba(200, 160, 74, 0.5);
  animation: float-down 2.5s ease-in-out infinite;
  z-index: 2;
}

@keyframes float-down {
  0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.5; }
  50% { transform: translateX(-50%) translateY(8px); opacity: 1; }
}

/* ─── Sections ─── */
.section {
  position: relative;
  z-index: 1;
  padding: 80px 24px;
}

.section-dark {
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(200, 160, 74, 0.08);
  border-bottom: 1px solid rgba(200, 160, 74, 0.08);
}

.section-header {
  text-align: center;
  margin-bottom: 56px;
}

.sect-ornament {
  font-size: 11px;
  letter-spacing: 8px;
  color: #c8a04a;
  margin-bottom: 12px;
  opacity: 0.8;
}

.sect-title {
  font-size: clamp(24px, 4vw, 38px);
  font-weight: 400;
  letter-spacing: 0.2em;
  margin: 0 0 12px;
  background: linear-gradient(135deg, #ffd770, #c8a04a, #ffd770);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sect-sub {
  font-size: 14px;
  color: #8a7860;
  letter-spacing: 0.08em;
  margin: 0;
}

/* ─── Reveal Animation ─── */
.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ─── Card hint ─── */
.card-hint {
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--zc, var(--jc, var(--ac, #c8a04a)));
  opacity: 0;
  margin-top: 10px;
  transition: opacity 0.25s;
}
.zone-card:hover .card-hint,
.job-card:hover .card-hint,
.attr-card:hover .card-hint { opacity: 0.7; }

/* ─── Zones Grid ─── */
.zones-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  max-width: 1100px;
  margin: 0 auto;
}
.zone-card {
  flex: 0 0 200px;
  max-width: 220px;
  position: relative;
  padding: 28px 20px;
  text-align: center;
  border: 1px solid color-mix(in srgb, var(--zc) 40%, transparent);
  border-radius: 2px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--zc) 8%, #06040f) 0%, #06040f 100%);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}
.zone-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 36px color-mix(in srgb, var(--zc) 30%, transparent);
}
.zone-emoji { font-size: 36px; margin-bottom: 10px; display: block; filter: drop-shadow(0 0 8px var(--zc)); }
.zone-lv { font-size: 11px; letter-spacing: 3px; color: var(--zc); margin-bottom: 8px; opacity: 0.85; }
.zone-name { font-size: 18px; letter-spacing: 0.15em; margin-bottom: 10px; color: #f0e8d8; }
.zone-desc { font-size: 12px; color: #7a6e60; line-height: 1.6; margin-bottom: 12px; }
.zone-monsters { font-size: 11px; letter-spacing: 2px; color: color-mix(in srgb, var(--zc) 70%, #888); }
.zone-glow {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--zc), transparent);
  opacity: 0.7;
}

/* ─── Jobs Grid ─── */
.jobs-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  max-width: 1100px;
  margin: 0 auto;
}
.job-card {
  flex: 0 0 160px;
  max-width: 180px;
  position: relative;
  padding: 28px 16px;
  text-align: center;
  border: 1px solid color-mix(in srgb, var(--jc) 30%, transparent);
  border-radius: 2px;
  background: linear-gradient(160deg, color-mix(in srgb, var(--jc) 6%, #0a0812) 0%, #0a0812 100%);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}
.job-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px color-mix(in srgb, var(--jc) 35%, transparent);
}
.job-icon { font-size: 32px; margin-bottom: 10px; display: block; filter: drop-shadow(0 0 6px var(--jc)); }
.job-sub { font-size: 9px; letter-spacing: 5px; color: var(--jc); margin-bottom: 6px; opacity: 0.7; font-family: 'Courier New', monospace; }
.job-name { font-size: 18px; letter-spacing: 0.2em; margin-bottom: 10px; color: #f0e8d8; }
.job-desc { font-size: 11px; color: #6a6058; line-height: 1.6; }
.job-shine {
  position: absolute;
  top: 0; left: -100%;
  width: 60%; height: 100%;
  background: linear-gradient(105deg, transparent, rgba(255,255,255,0.04), transparent);
  transition: left 0.5s;
}
.job-card:hover .job-shine { left: 150%; }

/* ─── Attributes Grid ─── */
.attrs-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  max-width: 900px;
  margin: 0 auto;
}
.attr-card {
  flex: 0 0 160px;
  max-width: 180px;
  position: relative;
  padding: 24px 16px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;
}
.attr-card:hover { transform: scale(1.05); }
.attr-border {
  position: absolute;
  inset: 0;
  border: 1px solid color-mix(in srgb, var(--ac) 35%, transparent);
  border-radius: 2px;
  pointer-events: none;
}
.attr-key { font-size: 30px; font-family: 'Courier New', monospace; font-weight: 700; letter-spacing: 3px; color: var(--ac); text-shadow: 0 0 20px var(--ac); margin-bottom: 6px; }
.attr-name { font-size: 14px; letter-spacing: 0.3em; color: #c0a870; margin-bottom: 8px; }
.attr-desc { font-size: 11px; color: #5a5048; line-height: 1.5; }

/* ─── Features Grid ─── */
.features-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
}
.feat-card {
  flex: 0 0 280px;
  max-width: 300px;
  padding: 28px 24px;
  border: 1px solid rgba(200, 160, 74, 0.12);
  border-radius: 2px;
  background: rgba(200, 160, 74, 0.03);
  transition: background 0.3s, border-color 0.3s;
}
.feat-card:hover { background: rgba(200, 160, 74, 0.07); border-color: rgba(200, 160, 74, 0.3); }
.feat-icon { font-size: 28px; margin-bottom: 12px; }
.feat-title { font-size: 16px; letter-spacing: 0.15em; color: #dac890; margin-bottom: 10px; }
.feat-desc { font-size: 13px; color: #6a6058; line-height: 1.7; }

/* ─── CTA Section ─── */
.cta-section {
  position: relative;
  z-index: 1;
  padding: 100px 24px 60px;
  text-align: center;
  overflow: hidden;
}
.cta-bg-pattern {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 70% 70% at 50% 50%, rgba(100, 50, 10, 0.3), transparent);
  z-index: -1;
}
.cta-inner {
  position: relative;
  display: inline-block;
  padding: 60px 80px;
  max-width: 600px;
}
.cta-ornament { font-size: 32px; color: #c8a04a; margin-bottom: 20px; display: block; text-shadow: 0 0 20px rgba(200, 160, 74, 0.6); }
.cta-title {
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 400;
  letter-spacing: 0.25em;
  margin: 0 0 16px;
  background: linear-gradient(135deg, #ffd770, #c8a04a, #ffd770);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.cta-desc { font-size: 14px; color: #8a7860; letter-spacing: 0.08em; line-height: 1.8; margin: 0; }

.dc-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 32px;
  padding: 14px 32px;
  background: #5865F2;
  color: #fff;
  font-size: 16px;
  font-family: 'Georgia', serif;
  letter-spacing: 0.1em;
  text-decoration: none;
  border-radius: 2px;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 0 24px rgba(88,101,242,0.55), 0 4px 16px rgba(0,0,0,0.4);
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
  position: relative;
  overflow: hidden;
}
.dc-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
  pointer-events: none;
}
.dc-btn:hover { background: #4752C4; transform: translateY(-3px); box-shadow: 0 0 36px rgba(88,101,242,0.75), 0 8px 24px rgba(0,0,0,0.5); }
.dc-btn:active { transform: translateY(0); }
.dc-btn-icon { display: flex; align-items: center; flex-shrink: 0; }

.footer-copy { margin-top: 60px; font-size: 11px; letter-spacing: 4px; color: rgba(200, 160, 74, 0.3); }

/* ─── Modal ─── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(4, 2, 10, 0.85);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-panel {
  position: relative;
  background: linear-gradient(160deg, #0e0a1e 0%, #08050f 100%);
  border: 1px solid color-mix(in srgb, var(--mc) 50%, transparent);
  border-radius: 2px;
  padding: 48px 40px 40px;
  max-width: 520px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--mc) 15%, transparent),
    0 30px 80px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 color-mix(in srgb, var(--mc) 20%, transparent);
}

.modal-panel::-webkit-scrollbar { width: 4px; }
.modal-panel::-webkit-scrollbar-track { background: transparent; }
.modal-panel::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--mc) 40%, transparent); border-radius: 2px; }

.modal-close {
  position: absolute;
  top: 16px;
  right: 20px;
  background: none;
  border: none;
  color: #c8a04a;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  line-height: 1;
}
.modal-close:hover { opacity: 1; }

.modal-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: color-mix(in srgb, var(--mc) 60%, transparent);
  border-style: solid;
}
.modal-corner.tl { top: 8px; left: 8px; border-width: 1px 0 0 1px; }
.modal-corner.tr { top: 8px; right: 8px; border-width: 1px 1px 0 0; }
.modal-corner.bl { bottom: 8px; left: 8px; border-width: 0 0 1px 1px; }
.modal-corner.br { bottom: 8px; right: 8px; border-width: 0 1px 1px 0; }

.modal-head {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.modal-emoji {
  font-size: 48px;
  filter: drop-shadow(0 0 12px var(--mc));
  flex-shrink: 0;
}

.modal-attr-key {
  font-size: 40px;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: var(--mc);
  text-shadow: 0 0 20px var(--mc);
  flex-shrink: 0;
  letter-spacing: 2px;
}

.modal-badge-text {
  font-size: 10px;
  letter-spacing: 5px;
  color: var(--mc);
  opacity: 0.7;
  font-family: 'Courier New', monospace;
  margin-bottom: 4px;
}

.modal-title {
  font-size: 28px;
  letter-spacing: 0.2em;
  color: #f0e8d8;
  font-weight: 400;
}

.modal-deco-line {
  height: 1px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--mc) 80%, transparent), transparent);
  margin-bottom: 24px;
}

.modal-section-label {
  font-size: 10px;
  letter-spacing: 4px;
  color: var(--mc);
  opacity: 0.8;
  margin: 20px 0 8px;
  font-family: 'Courier New', monospace;
}

.modal-intro {
  font-size: 14px;
  color: #a09080;
  line-height: 1.8;
  margin: 0;
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.modal-tag {
  font-size: 12px;
  padding: 4px 12px;
  border: 1px solid color-mix(in srgb, var(--mc) 40%, transparent);
  color: #c0b090;
  background: color-mix(in srgb, var(--mc) 8%, transparent);
  border-radius: 2px;
  letter-spacing: 1px;
}

.modal-tag-stat {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 14px;
  color: var(--mc);
  letter-spacing: 3px;
}

.modal-drops {
  font-size: 13px;
  color: #c0a870;
  letter-spacing: 0.05em;
  padding: 8px 14px;
  border-left: 2px solid color-mix(in srgb, var(--mc) 50%, transparent);
  background: color-mix(in srgb, var(--mc) 5%, transparent);
}

.modal-tips {
  font-size: 13px;
  color: #7a7060;
  line-height: 1.8;
  margin: 0;
}

.modal-recommend {
  margin-top: 20px;
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--mc);
  opacity: 0.7;
  text-align: center;
  padding: 10px;
  border: 1px solid color-mix(in srgb, var(--mc) 20%, transparent);
}

/* ─── Modal Transition ─── */
.modal-enter-active { transition: all 0.25s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from { opacity: 0; }
.modal-leave-to { opacity: 0; }
.modal-enter-from .modal-panel { transform: scale(0.93) translateY(12px); }
.modal-leave-to .modal-panel { transform: scale(0.95); }
.modal-panel { transition: transform 0.25s ease; }

/* ─── Responsive ─── */
@media (max-width: 600px) {
  .cta-inner { padding: 40px 30px; }
  .section { padding: 60px 16px; }
  .modal-panel { padding: 40px 24px 32px; }
  .modal-title { font-size: 22px; }
}
</style>
