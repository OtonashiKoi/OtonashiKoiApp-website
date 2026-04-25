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

// Intersection Observer for scroll reveals
onMounted(() => {
  const els = document.querySelectorAll('.reveal')
  const obs = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
    { threshold: 0.12 },
  )
  els.forEach((el) => obs.observe(el))
})

const jobs = [
  { icon: '⚔️', name: '劍士', sub: 'SWORDSMAN', color: '#e8a04a', desc: '格擋後反擊，以一敵萬' },
  { icon: '🪓', name: '戰士', sub: 'WARRIOR', color: '#e05252', desc: '瀕死爆發，絕境翻盤' },
  { icon: '🏹', name: '弓箭手', sub: 'ARCHER', color: '#52b86e', desc: '命中要害，必殺一擊' },
  { icon: '🗡️', name: '盜賊', sub: 'ROGUE', color: '#a78bfa', desc: '連擊加速，如影隨形' },
  { icon: '🔮', name: '法師', sub: 'MAGE', color: '#60a5fa', desc: '魔法穿防，智慧碾壓' },
  { icon: '🏥', name: '治療師', sub: 'HEALER', color: '#f0e040', desc: '在場光環，守護全隊' },
  { icon: '🥊', name: '矮人', sub: 'DWARF', color: '#fb923c', desc: '高血防守，如銅牆鐵壁' },
]

const zones = [
  { key: 'beginner', emoji: '🌱', name: '新手區', lv: 'Lv.1–3', color: '#4ade80', monsters: 5, desc: '踏上旅途，學習基礎戰鬥' },
  { key: 'normal', emoji: '⚔️', name: '一般區', lv: 'Lv.1–10', color: '#facc15', monsters: 12, desc: '鍛煉身手，挑戰更強的敵人' },
  { key: 'mid', emoji: '✦', name: '中級區', lv: 'Lv.10+', color: '#fb923c', monsters: 10, desc: '中階冒險者的試煉場地' },
  { key: 'hard', emoji: '🔥', name: '高級區', lv: 'Lv.20+', color: '#f87171', monsters: 15, desc: '古城遺蹟中的強大怪物' },
  { key: 'elite', emoji: '💀', name: '精英區', lv: 'Lv.30+', color: '#c084fc', monsters: 10, desc: '傳說級別的凶猛敵人' },
]

const attrs = [
  { key: 'STR', name: '力量', color: '#ef4444', desc: '物理攻擊、砍傷' },
  { key: 'AGI', name: '敏捷', color: '#22d3ee', desc: '攻速、閃避、連擊' },
  { key: 'VIT', name: '體力', color: '#84cc16', desc: '最大HP、防禦' },
  { key: 'INT', name: '智力', color: '#818cf8', desc: '魔法傷害、魔防' },
  { key: 'DEX', name: '靈巧', color: '#f59e0b', desc: '命中率、暴擊' },
  { key: 'LUK', name: '幸運', color: '#ec4899', desc: '暴擊率、稀有掉落' },
]

const features = [
  {
    icon: '🗡️',
    title: '裝備強化',
    desc: '使用強化寶石提升裝備能力，四個等階、無上限突破，打造你的最強裝備。',
  },
  {
    icon: '🃏',
    title: '怪物卡片',
    desc: '40+1 張稀有卡片，戰鬥中觸發 Buff/Debuff，掌握技能就能左右戰局。',
  },
  {
    icon: '🌐',
    title: '世界 Boss',
    desc: '定時出現的強力 Boss，全服玩家聯合挑戰，搶奪限定稀有戰利品。',
  },
  {
    icon: '🏆',
    title: '拍賣行',
    desc: '自由交易市場，玩家之間競標稀有裝備，累積財富成為商會大亨。',
  },
  {
    icon: '📜',
    title: '每日任務',
    desc: '每日、每週、新手任務三大系統，完成任務獲取豐厚獎勵與特殊道具。',
  },
  {
    icon: '⚡',
    title: '即時戰鬥',
    desc: 'Discord 頻道內直接開打，自動回合戰鬥，完整戰報即時呈現。',
  },
]

</script>

<template>
  <div class="landing">
    <!-- Particle Canvas -->
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
        <div v-for="z in zones" :key="z.key" class="zone-card" :style="{ '--zc': z.color }">
          <div class="zone-emoji">{{ z.emoji }}</div>
          <div class="zone-lv">{{ z.lv }}</div>
          <div class="zone-name">{{ z.name }}</div>
          <div class="zone-desc">{{ z.desc }}</div>
          <div class="zone-monsters">怪物數：{{ z.monsters }}</div>
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
        <div v-for="j in jobs" :key="j.sub" class="job-card" :style="{ '--jc': j.color }">
          <div class="job-icon">{{ j.icon }}</div>
          <div class="job-sub">{{ j.sub }}</div>
          <div class="job-name">{{ j.name }}</div>
          <div class="job-desc">{{ j.desc }}</div>
          <div class="job-shine" />
        </div>
      </div>
    </section>

    <!-- ===== ATTRIBUTES ===== -->
    <section class="section reveal">
      <div class="section-header">
        <div class="sect-ornament">⟨ 屬性成長 ⟩</div>
        <h2 class="sect-title">六大核心屬性</h2>
        <p class="sect-sub">合理分配屬性點，發揮職業最大潛能</p>
      </div>
      <div class="attrs-grid">
        <div v-for="a in attrs" :key="a.key" class="attr-card" :style="{ '--ac': a.color }">
          <div class="attr-key">{{ a.key }}</div>
          <div class="attr-name">{{ a.name }}</div>
          <div class="attr-desc">{{ a.desc }}</div>
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
      <div class="footer-copy">
        © 2026 音無樂園 ・ Built with ⚔️ &amp; Discord
      </div>
    </section>
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

.hero-title-wrap {
  margin-bottom: 30px;
}

.hero-deco-line {
  height: 1px;
  background: linear-gradient(90deg, transparent, #c8a04a, #c8a04a, transparent);
  margin: 18px auto;
  width: 80%;
  max-width: 500px;
  opacity: 0.6;
}

.hero-title {
  margin: 0;
}

.hero-jp {
  display: block;
  font-size: clamp(48px, 10vw, 96px);
  font-weight: 400;
  letter-spacing: 0.15em;
  background: linear-gradient(135deg, #ffd770 0%, #c8a04a 40%, #fff3b0 60%, #c8a04a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
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

/* Corner ornaments */
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
}

.zone-card {
  position: relative;
  padding: 28px 20px;
  text-align: center;
  border: 1px solid color-mix(in srgb, var(--zc) 40%, transparent);
  border-radius: 2px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--zc) 8%, #06040f) 0%,
    #06040f 100%
  );
  overflow: hidden;
  cursor: default;
  transition: transform 0.3s, box-shadow 0.3s;
}

.zone-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 36px color-mix(in srgb, var(--zc) 30%, transparent);
}

.zone-emoji {
  font-size: 36px;
  margin-bottom: 10px;
  display: block;
  filter: drop-shadow(0 0 8px var(--zc));
}

.zone-lv {
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--zc);
  margin-bottom: 8px;
  opacity: 0.85;
}

.zone-name {
  font-size: 18px;
  letter-spacing: 0.15em;
  margin-bottom: 10px;
  color: #f0e8d8;
}

.zone-desc {
  font-size: 12px;
  color: #7a6e60;
  line-height: 1.6;
  margin-bottom: 12px;
}

.zone-monsters {
  font-size: 11px;
  letter-spacing: 2px;
  color: color-mix(in srgb, var(--zc) 70%, #888);
}

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
}

.job-card {
  position: relative;
  padding: 28px 16px;
  text-align: center;
  border: 1px solid color-mix(in srgb, var(--jc) 30%, transparent);
  border-radius: 2px;
  background: linear-gradient(
    160deg,
    color-mix(in srgb, var(--jc) 6%, #0a0812) 0%,
    #0a0812 100%
  );
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: default;
}

.job-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px color-mix(in srgb, var(--jc) 35%, transparent);
}

.job-icon {
  font-size: 32px;
  margin-bottom: 10px;
  display: block;
  filter: drop-shadow(0 0 6px var(--jc));
}

.job-sub {
  font-size: 9px;
  letter-spacing: 5px;
  color: var(--jc);
  margin-bottom: 6px;
  opacity: 0.7;
  font-family: 'Courier New', monospace;
}

.job-name {
  font-size: 18px;
  letter-spacing: 0.2em;
  margin-bottom: 10px;
  color: #f0e8d8;
}

.job-desc {
  font-size: 11px;
  color: #6a6058;
  line-height: 1.6;
}

.job-shine {
  position: absolute;
  top: 0; left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.04), transparent);
  transition: left 0.5s;
}

.job-card:hover .job-shine {
  left: 150%;
}

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
}

.attr-card {
  position: relative;
  padding: 24px 16px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 2px;
  overflow: hidden;
  transition: transform 0.3s;
}

.attr-card:hover {
  transform: scale(1.05);
}

.attr-border {
  position: absolute;
  inset: 0;
  border: 1px solid color-mix(in srgb, var(--ac) 35%, transparent);
  border-radius: 2px;
  pointer-events: none;
}

.attr-key {
  font-size: 30px;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--ac);
  text-shadow: 0 0 20px var(--ac);
  margin-bottom: 6px;
}

.attr-name {
  font-size: 14px;
  letter-spacing: 0.3em;
  color: #c0a870;
  margin-bottom: 8px;
}

.attr-desc {
  font-size: 11px;
  color: #5a5048;
  line-height: 1.5;
}

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
}

.feat-card {
  padding: 28px 24px;
  border: 1px solid rgba(200, 160, 74, 0.12);
  border-radius: 2px;
  background: rgba(200, 160, 74, 0.03);
  transition: background 0.3s, border-color 0.3s;
}

.feat-card:hover {
  background: rgba(200, 160, 74, 0.07);
  border-color: rgba(200, 160, 74, 0.3);
}

.feat-icon {
  font-size: 28px;
  margin-bottom: 12px;
}

.feat-title {
  font-size: 16px;
  letter-spacing: 0.15em;
  color: #dac890;
  margin-bottom: 10px;
}

.feat-desc {
  font-size: 13px;
  color: #6a6058;
  line-height: 1.7;
}

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
  background:
    radial-gradient(ellipse 70% 70% at 50% 50%, rgba(100, 50, 10, 0.3), transparent);
  z-index: -1;
}

.cta-inner {
  position: relative;
  display: inline-block;
  padding: 60px 80px;
  max-width: 600px;
}

.cta-ornament {
  font-size: 32px;
  color: #c8a04a;
  margin-bottom: 20px;
  display: block;
  text-shadow: 0 0 20px rgba(200, 160, 74, 0.6);
}

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

.cta-desc {
  font-size: 14px;
  color: #8a7860;
  letter-spacing: 0.08em;
  line-height: 1.8;
  margin: 0;
}

/* ─── Discord Button ─── */
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
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 0 24px rgba(88, 101, 242, 0.55),
    0 4px 16px rgba(0, 0, 0, 0.4);
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
.dc-btn:hover {
  background: #4752C4;
  transform: translateY(-3px);
  box-shadow:
    0 0 36px rgba(88, 101, 242, 0.75),
    0 8px 24px rgba(0, 0, 0, 0.5);
}
.dc-btn:active {
  transform: translateY(0);
}
.dc-btn-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.footer-copy {
  margin-top: 60px;
  font-size: 11px;
  letter-spacing: 4px;
  color: rgba(200, 160, 74, 0.3);
}

/* ─── Responsive ─── */
@media (max-width: 600px) {
  .cta-inner {
    padding: 40px 30px;
  }
  .section {
    padding: 60px 16px;
  }
}
</style>
