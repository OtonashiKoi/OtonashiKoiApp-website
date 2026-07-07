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
    key: 'beginner', emoji: '🌱', name: '新手村外的草叢', lv: 'Lv.1–3', color: '#4ade80', monsters: 5,
    desc: '踏上旅途，學習基礎戰鬥',
    detail: {
      intro: '音無樂園的起點，怪物溫和，適合熟悉戰鬥系統與基礎操作。',
      monsterList: ['小史(小)', '野兔', '蘑菇怪', '小史(中)', '★ 大野兔(B)'],
      drops: '木製武器・布衣系防具・新手套裝・銅戒指系列',
      tips: '刷到 Lv.3 後前往一般區；此區建立最初期配備。',
      recommend: '任何職業皆可 / 無裝備需求',
    },
  },
  {
    key: 'normal', emoji: '⚔️', name: '起始的草原', lv: 'Lv.1+', color: '#facc15', monsters: 8,
    desc: '鍛煉身手，挑戰更強的敵人',
    detail: {
      intro: '小史、哥布、小狼、石頭四大常駐怪，外加青草地精、綠野狼精英怪；稀有的小金(稀)出現必搶。',
      monsterList: ['小史', '哥布', '小狼', '石頭', '青草地精', '綠野狼', '★ 大史(B)', '★ 小金(稀)'],
      drops: '皮革／鐵製裝備・皮鐵套裝・鐵戒指',
      tips: '小金(稀) 稀有必搶；大史(B) 掉落最多。',
      recommend: 'Lv.1+ / 無上限，高等玩家也可回刷',
    },
  },
  {
    key: 'mid', emoji: '✦', name: '陽光草原', lv: 'Lv.10–25', color: '#fb923c', monsters: 12,
    desc: '中階冒險者的試煉場地',
    detail: {
      intro: '甲蟹、牙牙狼、巨巨、黑暗弓手等常駐怪，加上森林系精英怪；Boss 米拉桑(B) 掉落豐富。',
      monsterList: ['甲蟹', '牙牙狼', '巨巨', '黑暗弓手', '林地妖靈(樹樹)', '森林古樹', '暗夜獵豹', '森林巫師', '森林盜賊', '森林之獸', '★ 米拉桑(B)', '★ 中金(稀)'],
      drops: '鐵／鋼製武器・鋼製套裝・銀戒指',
      tips: '米拉桑(B) 掉落最豐富，中金(稀) 穩定掉銀戒指。',
      recommend: 'Lv.10–25 / 建議木製→鐵製強化',
    },
  },
  {
    key: 'ancient_city', emoji: '🏛️', name: '古城', lv: 'Lv.25–40', color: '#f87171', monsters: 8,
    desc: '古城遺蹟中的強大守衛',
    detail: {
      intro: '古城的衛兵、石像鬼、法師盤踞，城堡魔像(B) 坐鎮，是鋼鐵邁向秘銀的過渡帶。',
      monsterList: ['古城弓手', '石像鬼', '古城法師', '廢墟蠍兵', '詛咒祭司', '古城刺客', '毒霧蜘蛛', '★ 城堡魔像(B)'],
      drops: '鋼鐵→秘銀過渡裝備・金戒指・強化石',
      tips: '城堡魔像(B) 是古城主要 Boss；此區銜接秘銀裝備。',
      recommend: 'Lv.25–40 / 建議鐵製→鋼製系列',
    },
  },
  {
    key: 'ancient_city_deep', emoji: '🕳️', name: '古城深處', lv: 'Lv.40+', color: '#c084fc', monsters: 7,
    desc: '三條 A 路線之一・秘銀產地',
    detail: {
      intro: 'Lv.40 後開放的三條平行 A 路線之一；秘銀套裝的主要產地，也是踏入 A 階最平緩的入口。',
      monsterList: ['城牆衛兵', '冰封騎士', '鐵甲衛將', '古城狂戰士', '黑焰巫師', '★ 古城將軍(B)', '★ 廢都魔王(B)'],
      drops: '秘銀套裝（A 階防具）・秘銀武器・A 階強化石・附魔重骰藥水',
      tips: '想入手秘銀套從這裡開始；廢都魔王(B)、古城將軍(B) 掉落最豐。',
      recommend: 'Lv.40 開放 / 三條 A 路線最易入門',
    },
  },
  {
    key: 'dragon_realm', emoji: '🐲', name: '龍族之領', lv: 'Lv.40+', color: '#38bdf8', monsters: 10,
    desc: '三條 A 路線之一・連擊流派',
    detail: {
      intro: 'Lv.40 三條 A 路線之一；龍族群棲，龍鱗套裝與連擊流派裝備的來源，龍王(B) 鎮守。',
      monsterList: ['飛龍幼崽', '龍蜥武士', '火翼龍人', '冰鱗龍人', '雷霆飛龍', '黑曜龍騎', '暗影龍將', '龍翼魔法師', '★ 黃金幼龍(稀)', '★ 龍王(B)'],
      drops: '龍鱗套裝（連擊向 A 防具）・龍系武器・龍族怪物卡',
      tips: '走連擊流派（盜賊／雙匕首）的玩家優先農龍鱗套。',
      recommend: 'Lv.40 開放 / 連擊流派裝備來源',
    },
  },
  {
    key: 'hellfire', emoji: '🔥', name: '地獄火焰', lv: 'Lv.40+', color: '#fb7185', monsters: 11,
    desc: '三條 A 路線之一・傷害流派',
    detail: {
      intro: 'Lv.40 三條 A 路線之一；烈焰生物橫行，焚獄套裝與火焰特攻武器的產地，菁英煉獄烈焰狼王坐鎮。',
      monsterList: ['焰爪幼狼', '灰燼豺', '熔岩犬', '硫火蝙蝠', '焦炎蜥', '火髓魔蟲', '餘燼骷髏', '炙炎鴉', '岩漿巨蟲', '烈焰狼', '★ 煉獄烈焰狼王(菁英)'],
      drops: '焚獄套裝（共 29 件）：A 階武器 10 型（涵蓋各武器家族）、S 階武器 10 型（帶「焚獄特攻」火焰區增傷）、A 階防具 9 件（甲／盔／靴／盾／披風／護目／口罩／雙戒）・火焰系怪物卡',
      tips: '想集滿焚獄套從這裡農起；S 武器另可從地獄狼牙王寶箱取得，煉獄烈焰狼王掉落附魔重骰藥水。',
      recommend: 'Lv.40 開放 / 傷害流派與火焰特攻裝',
    },
  },
]

const worldBosses = [
  {
    key: 'daishi', emoji: '👑', name: '大史王', lair: '精英區', lv: '進場 Lv.40', color: '#c084fc',
    tagline: '首位世界王・精英試煉',
    detail: {
      intro: '坐鎮精英區的首位世界王，是玩家踏入世界王討伐的第一道門檻。血量與攻擊遠超一般 Boss，需要備齊裝備與隊友才推得動。',
      mechanics: ['多部位結構，需逐一擊破部位', '超高血量的長期戰，考驗續戰與減傷', '全服玩家可共同累積傷害討伐'],
      unlock: '進場 Lv.40',
      rewards: '世界王寶箱：依傷害／貢獻排名發放，含高階裝備與強化石',
      recommend: '建議組隊、備齊 A 階裝備再挑戰',
    },
  },
  {
    key: 'dragon_king', emoji: '🐉', name: '古龍王(B)', lair: '龍王巢穴', lv: '進場 Lv.50', color: '#38bdf8',
    tagline: '龍族頂點・逆鱗焚天',
    detail: {
      intro: '龍族之領盡頭的古龍王，是龍系最強的存在。以龍焰與破鱗攻勢壓迫全場，血量極為龐大，討伐後才會開啟當週的焰獄深處。',
      mechanics: ['破鱗機制：破壞部位後龍防下降', '龍焰 AOE：對全隊造成雷焰傷害', '討伐後解鎖當週焰獄深處'],
      unlock: '進場 Lv.50',
      rewards: '世界王寶箱：龍系高階裝備、S 強化石、古龍王卡',
      recommend: '連擊／穿防流派效率高，建議滿編組隊',
    },
  },
  {
    key: 'hellfang', emoji: '🐺', name: '地獄狼牙王', lair: '焰獄深處', lv: '進場 Lv.50', color: '#fb7185',
    tagline: '終局世界王・煉獄咬噬',
    detail: {
      intro: '棲身焰獄深處的終局世界王，也是目前最強的討伐目標。分為三個階段，隨戰鬥推進不斷強化，煉獄咬噬與破防攻勢會愈打愈狂。',
      mechanics: ['三階段強化：血量下降時攻勢升級', '煉獄咬噬：高倍火焰傷害並附帶破防', '需先討伐當週古龍王才能進入焰獄深處'],
      unlock: '進場 Lv.50（需先討伐當週古龍王，解鎖焰獄深處）',
      rewards: '世界王寶箱：S 裝備、S 強化石、地獄狼牙王卡、附魔重骰藥水',
      recommend: '終局挑戰，需滿編＋高輸出＋減傷支援',
    },
  },
]

const jobs = [
  {
    icon: '⚔️', name: '劍士', sub: 'SWORDSMAN', color: '#e8a04a', desc: '格擋後反擊，以一敵萬',
    detail: {
      mainStats: ['STR', 'DEX'],
      weapon: '主要武器：單手劍 / 雙手劍',
      quest: '劍士試煉：Lv.10，基礎 STR + DEX > 10。使用單手劍或雙手劍出戰 10 次，獎勵 500 金幣與劍士徽章。',
      badge: '劍士徽章：STR +2 / VIT +3 / DEX +2。',
      skills: [
        '被動：單手劍或雙手劍強化；單手劍 + 盾牌時格擋 +20%。',
        '被動：單手劍 + 副手時連擊傷害提升；雙手劍額外獲得少量格擋。',
        '主動：舉步若堅，格擋率 +25%、DEF +12，持續 2 回合。',
        '主動：碎甲斬，使敵方 DEF -10，持續 3 回合，可疊至 -30。',
      ],
      mechanic: '受到攻擊時有機率觸發「格擋」，成功格擋後立即進行一次反擊，反擊傷害享有額外加成。格擋率隨 VIT 提升而增加。',
      style: '防禦反擊型',
      tips: 'STR 提升劍傷害，DEX 確保命中率穩定。格擋反擊的傷害同樣吃 STR，命中落空就沒機會反擊。',
    },
  },
  {
    icon: '🪓', name: '戰士', sub: 'WARRIOR', color: '#e05252', desc: '瀕死爆發，絕境翻盤',
    detail: {
      mainStats: ['STR', 'VIT'],
      weapon: '主要武器：斧類，雙手斧可獲得更高爆發。',
      quest: '戰士試煉：Lv.10，基礎 STR + VIT > 10。使用單手斧或雙手斧出戰 10 次，獎勵 500 金幣與戰士徽章。',
      badge: '戰士徽章：STR +4 / VIT +1 / LUK +2。',
      skills: [
        '被動：雙手斧低血量時最終傷害 +35%。',
        '主動：踢到桌腳很生氣，自身 ATK +25%，持續 2 回合。',
        '主動：死亡意志，HP 低於 35% 時免疫傷害 1 回合並 ATK +50%。',
      ],
      mechanic: 'HP 低於 30% 時進入「憤怒」狀態，攻擊力大幅提升。越接近死亡，爆發力越驚人，是真正的絕境翻盤機。',
      style: '爆發輸出型',
      tips: 'STR 決定斧頭基礎傷害，VIT 讓你在危險血量邊緣撐住不被秒殺，精準控制血量才能發揮最大爆發。',
    },
  },
  {
    icon: '🏹', name: '弓箭手', sub: 'ARCHER', color: '#52b86e', desc: '命中要害，必殺一擊',
    detail: {
      mainStats: ['DEX', 'AGI'],
      weapon: '主要武器：弓。',
      quest: '弓箭手試煉：Lv.10，基礎 DEX + AGI > 10。使用弓出戰 10 次，獎勵 500 金幣與弓箭手徽章。',
      badge: '弓箭手徽章：AGI +1 / DEX +5 / LUK +2。',
      skills: [
        '被動：弓系強化，提升遠程輸出與要害節奏。',
        '主動：瞄準，命中 +20、爆擊率 +15%，持續 2 回合。',
        '主動：穿刺箭，ATK +20%、敵方 DEF -15、自身爆擊率 +20%，持續 2 回合。',
      ],
      mechanic: '每次攻擊有機率觸發「命中要害」，造成額外傷害，且可與普通暴擊效果疊加，實現超高單發傷害。DEX 越高觸發率越高。',
      style: '高爆發遠程型',
      tips: '優先堆疊 DEX 提升要害觸發率，搭配 AGI 提高攻速，實現高頻率的驚人輸出爆發。',
    },
  },
  {
    icon: '🗡️', name: '盜賊', sub: 'ROGUE', color: '#a78bfa', desc: '連擊加速，如影隨形',
    detail: {
      mainStats: ['AGI', 'DEX'],
      weapon: '主要武器：匕首。',
      quest: '盜賊試煉：Lv.10，基礎 AGI + DEX > 10。使用匕首出戰 10 次，獎勵 500 金幣與盜賊徽章。',
      badge: '盜賊徽章：STR +2 / AGI +4 / LUK +2。',
      skills: [
        '被動：主手匕首時武器強化；主匕首 + 副手匕首時連擊率 +10%。',
        '被動：主匕首 + 副手且 HP >50% 時爆擊率 +15%。',
        '主動：背刺，爆擊率 +20%、爆擊傷害 +30%，持續 2 回合。',
        '主動：煙霧彈，敵方命中 -20、自身迴避 +12，持續 2 回合。',
      ],
      mechanic: '攻擊時有機率觸發「連擊」，連續打出多段傷害。AGI 同時大幅提升閃避率，讓盜賊如幽靈般難以捕捉。',
      style: '連擊閃避型',
      tips: 'AGI 驅動連擊與閃避，DEX 確保每段連擊都能命中目標。命中率不足時連擊白打，兩者缺一不可。',
    },
  },
  {
    icon: '🔮', name: '法師', sub: 'MAGE', color: '#60a5fa', desc: '魔法穿防，智慧碾壓',
    detail: {
      mainStats: ['INT', 'AGI'],
      weapon: '主要武器：單手法杖 / 雙手法杖。',
      quest: '法師試煉：Lv.10，基礎 INT + AGI > 10。使用雙手法杖出戰 10 次，獎勵 500 金幣與法師徽章。',
      badge: '法師徽章：VIT +1 / INT +5 / LUK +2。',
      skills: [
        '被動：法杖系強化，偏向高魔法輸出與穿防。',
        '主動：魔力爆炎，自身 ATK +40% 並無視防禦 +50%，持續 1 回合。',
        '主動：魔力衰減，敵方最終傷害 -25%、DEF -10，持續 3 回合。',
      ],
      mechanic: '魔法傷害可無視部分物理防禦，純 INT 配置可達最大魔法輸出。雙手法杖讓怪物攻擊次數翻倍，AGI 的閃避率能有效減少受到傷害的次數。',
      style: '高傷害魔法型',
      tips: 'INT 全力堆疊衝傷害，AGI 提升閃避抵消怪物加倍攻擊的壓力，是法師在高級區存活的關鍵。',
    },
  },
  {
    icon: '🏥', name: '治療師', sub: 'HEALER', color: '#f0e040', desc: '在場光環，守護全隊',
    detail: {
      mainStats: ['INT', 'VIT'],
      weapon: '主要武器：法杖。',
      quest: '治療師試煉：Lv.10，基礎 INT + VIT > 10。使用單手法杖出戰 10 次，獎勵 500 金幣與治療師徽章。',
      badge: '治療師徽章：VIT +2 / INT +4 / DEX +2。',
      skills: [
        '光環：在場時提供隊伍治療支援；組隊爬塔中會改為全隊一起受益。',
        '主動：聖光術，立即回復最大 HP 的 12%。',
        '主動：神聖護盾，HP 低於 60% 時受傷降低 35%，持續 2 回合。',
      ],
      mechanic: '「在場光環」效果：治療師在場時，同區所有玩家獲得持續回血效果。光環效果會持久化，你的存在即是隊伍最大資產。',
      style: '支援輔助型',
      tips: '在熱門討伐區頻繁現身，INT 提升治療量，VIT 確保自身存活。光環效果對精英區團隊至關重要。',
    },
  },
  {
    icon: '🔨', name: '矮人戰士', sub: 'DWARF', color: '#fb923c', desc: '重槌控場，如銅牆鐵壁',
    detail: {
      mainStats: ['VIT', 'STR'],
      weapon: '主要武器：單手槌 / 雙手槌。',
      quest: '矮人戰士試煉：Lv.10，基礎 VIT + STR > 10。使用單手槌或雙手槌出戰 10 次，獎勵 500 金幣與矮人戰士徽章。',
      badge: '矮人戰士徽章：STR +1 / VIT +5 / DEX +2。',
      skills: [
        '被動：單手槌 / 雙手槌強化；單手槌 + 盾牌時格擋 +20%。',
        '被動：雙手槌命中後有機率擊暈，對暈眩目標傷害提高。',
        '主動：鐵壁，受傷降低 25%、DEF +15，持續 2 回合。',
        '主動：震地重擊，使敵方暈眩 1 回合並 ATK -10%，持續 2 回合。',
      ],
      mechanic: '以槌類武器打出擊暈控場，高血量時能讓擊暈更穩定，面對暈眩目標時傷害也會提高。',
      style: '控場坦克型',
      tips: 'VIT 讓你撐住前線，STR 提升槌類傷害。適合在組隊與高難度戰鬥中創造安全輸出窗口。',
    },
  },
  {
    icon: '♟️', name: '軍師', sub: 'TACTICIAN', color: '#38bdf8', desc: '戰線指揮，破防討王',
    detail: {
      mainStats: ['AGI', 'INT', 'DEX'],
      weapon: '鎖定武器：單手劍。',
      quest: '軍師試煉：Lv.10，基礎 AGI + INT + DEX > 10。任務進度需使用單手劍出戰 10 次。',
      badge: '軍師徽章：AGI +4 / INT +2 / DEX +2。',
      skills: [
        '被動：單手劍 ATK 強化。',
        '光環：隊伍對 Boss 傷害 +5%，隊伍攻擊視為怪物防禦降低 5%。',
        '主動：戰術分析，敵方 DEF -15、ATK -10，持續 3 回合。',
        '主動：兵法破陣，無視敵方防禦 +35%、自身 ATK +10%，持續 2 回合。',
      ],
      mechanic: '裝備單手劍時啟動共鬥光環：隊伍對 Boss 傷害 +5%，並讓隊伍攻擊視為怪物防禦降低 5%。',
      style: 'Boss 共鬥光環型',
      tips: '軍師不是單純拼個人輸出，而是讓整隊在 Boss 戰更快破防。想推世界 Boss 或爬塔高層時很有價值。',
    },
  },
  {
    icon: '🎼', name: '詩人', sub: 'BARD', color: '#f472b6', desc: '戰歌鼓舞，收益支援',
    detail: {
      mainStats: ['DEX', 'AGI', 'LUK'],
      weapon: '鎖定武器：弓。',
      quest: '詩人試煉：Lv.10，基礎 DEX + AGI + LUK > 10。任務進度需使用弓出戰 10 次。',
      badge: '詩人徽章：DEX +4 / AGI +2 / LUK +2。',
      skills: [
        '被動：弓 ATK 強化。',
        '光環：隊伍 EXP +5%，隊伍 AGI +8%。',
        '主動：激昂旋律，自身 ATK +18%、AGI +8，持續 2 回合。',
        '主動：沉靜之歌，敵方 ATK -15%、AGI -6，持續 3 回合。',
      ],
      mechanic: '裝備弓時啟動共鬥光環：隊伍 EXP +5%，並提升隊伍 AGI，適合長時間農怪、練等與爬塔排軸。',
      style: '資源成長與速度光環型',
      tips: '詩人能讓整隊刷怪更有效率，也能在組隊爬塔中影響行動軸。適合每日農裝、練等與支援高 AGI 節奏。',
    },
  },
  {
    icon: '🛡️', name: '結界師', sub: 'BARRIER', color: '#2dd4bf', desc: '防護結界，穩住全隊',
    detail: {
      mainStats: ['INT', 'VIT', 'DEX'],
      weapon: '鎖定武器：單手法杖 / 雙手法杖。',
      quest: '結界師試煉：Lv.10，基礎 INT + VIT + DEX > 10。任務進度需使用法杖出戰 10 次。',
      badge: '結界師徽章：INT +3 / VIT +3 / DEX +2。',
      skills: [
        '被動：裝備法杖時自身 DEF +5%。',
        '光環：隊伍受到傷害 -15%，隊伍被暴擊傷害 -10%。',
        '主動：八門盾甲，使敵方受到傷害增加 20%，持續 2 回合。',
        '主動：束縛之陣，敵方迴避 -50%、命中 -30%，持續 3 回合。',
      ],
      mechanic: '裝備法杖時啟動防護光環：自身 DEF +5%，隊伍受到傷害 -15%，隊伍被暴擊傷害 -10%。',
      style: '團隊減傷光環型',
      tips: '結界師適合高壓戰鬥，尤其是怪物爆擊痛、隊伍容易倒人的場合。和治療師一起出現時，隊伍穩定度會明顯提高。',
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
      effect: '提升攻擊速度、閃避率與部分連擊能力；在組隊爬塔中會直接影響速度條行動軸。',
      threshold: '一般戰鬥影響出手節奏；組隊爬塔依 AGI 即時計算行動順序。',
      bestFor: ['🗡️ 盜賊', '🏹 弓箭手'],
      tips: '高 AGI 角色在爬塔更容易提早出手；若卡片、光環或 Buff 改變 AGI，行動軸也會跟著變動。',
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
  { icon: '🗡️', title: '裝備強化 & 附魔', desc: '強化提升裝備能力，並可為裝備骰出附魔詞條（爆擊／連擊／攻擊／減傷等），打造專屬核心配裝。' },
  { icon: '🎽', title: '具名套裝', desc: '秘銀・焚獄・龍鱗・三紋・特效戒等多套具名套裝，穿滿指定件數解鎖階梯加成，一件可同時屬於多套。' },
  { icon: '⚓', title: '錨點傳說裝', desc: '傳說級「錨點」專屬槽位，戴上就改寫你的戰鬥法則——每一件都是一種極端取捨。（內容待你親自發掘）' },
  { icon: '🃏', title: '怪物卡片', desc: '多種怪物卡裝在特殊槽位，戰鬥中觸發 Buff、Debuff、控場與武器流派追加效果。' },
  { icon: '🐉', title: '世界 Boss', desc: '三大世界王——大史王、古龍王、地獄狼牙王，全服玩家聯合討伐，搶奪限定寶箱。' },
  { icon: '🗼', title: '組隊爬塔', desc: '最多 6 人組隊挑戰 52 層，依 AGI 速度條排軸，51／52 層由大史王與古龍王坐鎮。' },
  { icon: '📖', title: '主線劇情', desc: '文字冒險式主線，跟著音無恋踏上音無樂園的故事，隨進度逐步解鎖新區域。' },
  { icon: '🏆', title: '拍賣行', desc: '自由交易市場，玩家之間競標稀有裝備（部分靈魂綁定道具不可交易）。' },
  { icon: '📜', title: '任務中心', desc: '新手、每日、每週與職業任務並行，引導戰鬥、強化、打卡與職業養成。' },
  { icon: '⚡', title: '即時戰鬥', desc: 'Discord 頻道內直接開打，自動回合戰鬥，完整戰報即時呈現。' },
  { icon: '🥊', title: 'PK 擂台', desc: 'Lv.40 玩家可進入擂台對決，Elo Rating 影響排行榜與 Boss 傷害加成。' },
  { icon: '🎒', title: '背包 & 面板', desc: '背包容量依會員等級提升；Discord 面板查看資料、裝備、技能、卡片與套裝效果。' },
  { icon: '📅', title: '直播連動', desc: '直播打卡領獎、斗內累積解鎖全服 Buff，另有儲值頁與 SC 進度條。' },
]

const gameStats = [
  { num: '64', label: '怪物與 Boss' },
  { num: '10', label: '職業徽章' },
  { num: '38', label: '任務內容' },
  { num: '400+', label: '道具與裝備' },
]

const towerStages = [
  { floor: '1–10F', name: '初啟之境', color: '#4ade80', bonus: '隊伍小幅強化', monster: '前期草原怪物' },
  { floor: '11–25F', name: '試煉之路', color: '#facc15', bonus: '隊伍中階強化', monster: '陽光草原怪物' },
  { floor: '26–40F', name: '古城深淵', color: '#c084fc', bonus: '隊伍高階強化', monster: '古城～古城深處怪物' },
  { floor: '41–50F', name: '龍炎邊境', color: '#f87171', bonus: '隊伍強力強化', monster: '龍族之領／地獄火焰怪物' },
  { floor: '51F', name: '精英魔王・大史王', color: '#fbbf24', bonus: '世界王級試煉', monster: '世界王 大史王' },
  { floor: '52F', name: '終焉・古龍王', color: '#fb7185', bonus: '終局挑戰', monster: '終局世界王 古龍王(B)' },
]

const towerRules = [
  '最多 6 人組隊，由隊長開房、開始後鎖定成員。',
  '進入條件 Lv.30，每人每小時最多挑戰 3 次。',
  '玩家與怪物都依 AGI 速度條排軸，卡片、Buff、光環改變 AGI 時會即時影響順序。',
  '怪物行動會攻擊全隊；怪物身上的降防、暈眩、Debuff 由全隊共享。',
  '光環與治療支援全隊，同職業同效果不疊加，只取最高值；陣亡者光環失效。',
  '打輸會依目前通關層結算獎勵並解散隊伍，下次重新挑戰。',
  '通過 10 / 20 / 30 / 40 / 50 / 51 / 52 層可取得攻塔祝福，帶回怪物區使用。',
]

const towerRewards = [
  { floor: '10F', reward: '突破初境：基礎獎勵 ×1' },
  { floor: '20F', reward: '深淵征服：基礎獎勵 ×2.5' },
  { floor: '30F', reward: '古城突破：基礎獎勵 ×5' },
  { floor: '40F', reward: '邊境超越：基礎獎勵 ×10' },
  { floor: '51F', reward: '大史王討伐：基礎獎勵 ×20' },
  { floor: '52F', reward: '古龍王討伐：基礎獎勵 ×45' },
]

const tierSets = [
  {
    tier: '秘', name: '秘銀套', color: '#cbd5e1',
    identity: 'A 階主力・全能輸出',
    effects: ['3 件：最終傷害提升', '5 件：對 BOSS 傷害提升', '7 件：掉落率提升'],
  },
  {
    tier: '焚', name: '焚獄套', color: '#fb7185',
    identity: '火焰流派・高傷爆發',
    effects: ['傷害與爆擊傷害提升', '地獄火焰／焰獄深處受傷遞減', '火焰 A／S 武器專屬特攻'],
  },
  {
    tier: '龍', name: '龍鱗套', color: '#38bdf8',
    identity: '連擊流派・龍族專精',
    effects: ['連擊率與連擊傷害提升', '龍族之領受傷遞減', '適合盜賊等連擊型'],
  },
  {
    tier: '紋', name: '三紋套', color: '#a78bfa',
    identity: '跨階通算・迅／鬥／智',
    effects: ['迅紋：迴避・連擊・速度', '鬥紋：傷害・爆擊', '智紋：終傷・命中・穿防'],
  },
  {
    tier: '戒', name: '特效戒套', color: '#fbbf24',
    identity: '左右雙戒・九大主題',
    effects: ['疾風／獵手／狂血／吸血…等 9 套', '左右 2 件成套即啟動', '可與基礎套複合疊加'],
  },
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
        <div class="hero-stats">
          <div v-for="stat in gameStats" :key="stat.label" class="hero-stat">
            <strong>{{ stat.num }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        </div>
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
        <h2 class="sect-title">七大討伐區域</h2>
        <p class="sect-sub">從新手草叢到地獄火焰；Lv.40 後有古城深處・龍族之領・地獄火焰三條平行 A 路線</p>
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

    <!-- ===== WORLD BOSSES ===== -->
    <section class="section section-dark reveal">
      <div class="section-header">
        <div class="sect-ornament">⟨ 世界王 ⟩</div>
        <h2 class="sect-title">三大世界王討伐</h2>
        <p class="sect-sub">全服聯合挑戰的頂級 Boss，點擊查看討伐資料</p>
      </div>
      <div class="zones-grid">
        <div
          v-for="b in worldBosses" :key="b.key"
          class="zone-card" :style="{ '--zc': b.color }"
          @click="openModal('boss', b)"
        >
          <div class="zone-emoji">{{ b.emoji }}</div>
          <div class="zone-lv">{{ b.lv }}</div>
          <div class="zone-name">{{ b.name }}</div>
          <div class="zone-desc">{{ b.tagline }}</div>
          <div class="zone-monsters">巢穴：{{ b.lair }}</div>
          <div class="card-hint">點擊查看詳情 ▸</div>
          <div class="zone-glow" />
        </div>
      </div>
    </section>

    <!-- ===== JOBS ===== -->
    <section class="section section-dark reveal">
      <div class="section-header">
        <div class="sect-ornament">⟨ 職業系統 ⟩</div>
        <h2 class="sect-title">十大職業自由替換</h2>
        <p class="sect-sub">輸出、控場、治療與共鬥光環並存，下一季組隊定位更加清楚</p>
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

    <!-- ===== EQUIPMENT TIER SETS ===== -->
    <section class="section tier-section reveal">
      <div class="section-header">
        <div class="sect-ornament">⟨ 具名套裝 ⟩</div>
        <h2 class="sect-title">3 / 5 / 7 件混搭加成</h2>
        <p class="sect-sub">不再依裝備階級計算，改由秘銀・焚獄・龍鱗・三紋・特效戒等具名套裝提供加成</p>
      </div>
      <div class="tier-rules">
        <div class="tier-rule">
          <span class="tier-rule-mark">01</span>
          <span>具名套裝穿滿指定件數（3/5/7，部分套 3/6/9 或左右 2 件）依序啟動</span>
        </div>
        <div class="tier-rule">
          <span class="tier-rule-mark">02</span>
          <span>一件裝備可同時屬於多套，戒指常複合疊加</span>
        </div>
        <div class="tier-rule">
          <span class="tier-rule-mark">03</span>
          <span>D／C／B／A 階級只作品階顯示，加成一律走具名套裝</span>
        </div>
      </div>
      <div class="tier-grid">
        <article
          v-for="set in tierSets"
          :key="set.tier"
          class="tier-card"
          :style="{ '--tc': set.color }"
        >
          <div class="tier-card-head">
            <div class="tier-letter">{{ set.tier }}</div>
            <div>
              <div class="tier-label">{{ set.name }}</div>
              <div class="tier-identity">{{ set.identity }}</div>
            </div>
          </div>
          <div class="tier-effect-list">
            <div v-for="effect in set.effects" :key="effect" class="tier-effect">
              {{ effect }}
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- ===== TEAM TOWER ===== -->
    <section class="section tower-section reveal">
      <div class="section-header">
        <div class="sect-ornament">⟨ 組隊爬塔 ⟩</div>
        <h2 class="sect-title">六人攻塔・五十二層終焉挑戰</h2>
        <p class="sect-sub">隊長開房、成員集結，依 AGI 速度條與怪物正面交鋒</p>
      </div>

      <div class="tower-overview">
        <div class="tower-stat">
          <div class="tower-stat-num">6</div>
          <div class="tower-stat-label">最多隊員</div>
        </div>
        <div class="tower-stat">
          <div class="tower-stat-num">52</div>
          <div class="tower-stat-label">總樓層</div>
        </div>
        <div class="tower-stat">
          <div class="tower-stat-num">Lv.30</div>
          <div class="tower-stat-label">入場門檻</div>
        </div>
        <div class="tower-stat">
          <div class="tower-stat-num">3/hr</div>
          <div class="tower-stat-label">每小時次數</div>
        </div>
      </div>

      <div class="tower-layout">
        <div class="tower-stage-list">
          <article
            v-for="stage in towerStages"
            :key="stage.floor"
            class="tower-stage"
            :style="{ '--twc': stage.color }"
          >
            <div class="tower-floor">{{ stage.floor }}</div>
            <div class="tower-stage-body">
              <div class="tower-stage-name">{{ stage.name }}</div>
              <div class="tower-stage-bonus">{{ stage.bonus }}</div>
              <div class="tower-stage-monster">{{ stage.monster }}</div>
            </div>
          </article>
        </div>

        <div class="tower-side">
          <div class="tower-panel">
            <div class="tower-panel-title">攻略規則</div>
            <div v-for="rule in towerRules" :key="rule" class="tower-rule">{{ rule }}</div>
          </div>
          <div class="tower-panel">
            <div class="tower-panel-title">里程碑獎勵</div>
            <div v-for="reward in towerRewards" :key="reward.floor" class="tower-reward">
              <span>{{ reward.floor }}</span>
              <strong>{{ reward.reward }}</strong>
            </div>
          </div>
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
            <template v-if="activeModal.data.detail.weapon">
              <div class="modal-section-label">🗡 武器定位</div>
              <div class="modal-drops">{{ activeModal.data.detail.weapon }}</div>
            </template>
            <template v-if="activeModal.data.detail.quest">
              <div class="modal-section-label">📜 職業任務</div>
              <p class="modal-tips">{{ activeModal.data.detail.quest }}</p>
            </template>
            <template v-if="activeModal.data.detail.badge">
              <div class="modal-section-label">🏅 徽章效果</div>
              <div class="modal-drops">{{ activeModal.data.detail.badge }}</div>
            </template>
            <template v-if="activeModal.data.detail.skills?.length">
              <div class="modal-section-label">✨ 職業技能</div>
              <div class="modal-skill-list">
                <div v-for="skill in activeModal.data.detail.skills" :key="skill" class="modal-skill">{{ skill }}</div>
              </div>
            </template>
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

          <!-- World boss modal -->
          <template v-else-if="activeModal.type === 'boss'">
            <div class="modal-head">
              <span class="modal-emoji">{{ activeModal.data.emoji }}</span>
              <div>
                <div class="modal-badge-text">{{ activeModal.data.lv }} ・ {{ activeModal.data.lair }}</div>
                <div class="modal-title">{{ activeModal.data.name }}</div>
              </div>
            </div>
            <div class="modal-deco-line" />
            <p class="modal-intro">{{ activeModal.data.detail.intro }}</p>
            <div class="modal-section-label">⚙ 討伐機制</div>
            <div class="modal-skill-list">
              <div v-for="m in activeModal.data.detail.mechanics" :key="m" class="modal-skill">{{ m }}</div>
            </div>
            <div class="modal-section-label">🔓 進場條件</div>
            <div class="modal-drops">{{ activeModal.data.detail.unlock }}</div>
            <div class="modal-section-label">🎁 討伐獎勵</div>
            <div class="modal-drops">{{ activeModal.data.detail.rewards }}</div>
            <div class="modal-section-label">📌 挑戰建議</div>
            <p class="modal-tips">{{ activeModal.data.detail.recommend }}</p>
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
  margin: 0 auto 28px;
  max-width: 520px;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  max-width: 620px;
  margin: 0 auto 40px;
}

.hero-stat {
  padding: 12px 10px;
  border: 1px solid rgba(200, 160, 74, 0.18);
  background:
    linear-gradient(180deg, rgba(200, 160, 74, 0.08), rgba(255, 255, 255, 0.015)),
    rgba(6, 4, 15, 0.52);
}

.hero-stat strong {
  display: block;
  color: #ffd770;
  font-family: 'Courier New', monospace;
  font-size: 26px;
  line-height: 1;
  text-shadow: 0 0 20px rgba(200, 160, 74, 0.35);
}

.hero-stat span {
  display: block;
  margin-top: 6px;
  color: #8a7860;
  font-size: 10px;
  letter-spacing: 0.18em;
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

/* ─── Equipment Tier Sets ─── */
.tier-section {
  background:
    linear-gradient(180deg, rgba(200, 160, 74, 0.035), rgba(255, 255, 255, 0.01)),
    repeating-linear-gradient(90deg, rgba(200, 160, 74, 0.04) 0 1px, transparent 1px 72px);
  border-top: 1px solid rgba(200, 160, 74, 0.08);
  border-bottom: 1px solid rgba(200, 160, 74, 0.08);
}

.tier-rules {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  max-width: 980px;
  margin: -20px auto 28px;
}

.tier-rule {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(200, 160, 74, 0.14);
  background: rgba(6, 4, 15, 0.5);
  color: #9f927c;
  font-size: 12px;
  line-height: 1.6;
}

.tier-rule-mark {
  color: #c8a04a;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  letter-spacing: 2px;
}

.tier-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  max-width: 1120px;
  margin: 0 auto;
}

.tier-card {
  position: relative;
  min-height: 260px;
  padding: 22px 18px;
  border: 1px solid color-mix(in srgb, var(--tc) 35%, transparent);
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--tc) 12%, #08050f) 0%, #08050f 72%),
    radial-gradient(circle at 30% 10%, color-mix(in srgb, var(--tc) 18%, transparent), transparent 34%);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
}

.tier-card::after {
  content: '';
  position: absolute;
  inset: auto 18px 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--tc), transparent);
  opacity: 0.75;
}

.tier-card:hover {
  transform: translateY(-6px);
  border-color: color-mix(in srgb, var(--tc) 65%, transparent);
  box-shadow: 0 18px 42px color-mix(in srgb, var(--tc) 20%, transparent);
}

.tier-card-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
}

.tier-letter {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border: 1px solid color-mix(in srgb, var(--tc) 60%, transparent);
  color: var(--tc);
  font-family: 'Courier New', monospace;
  font-size: 30px;
  font-weight: 700;
  text-shadow: 0 0 18px color-mix(in srgb, var(--tc) 70%, transparent);
  background: color-mix(in srgb, var(--tc) 8%, transparent);
}

.tier-label {
  color: #f0e8d8;
  font-size: 16px;
  letter-spacing: 0.16em;
  margin-bottom: 5px;
}

.tier-identity {
  color: color-mix(in srgb, var(--tc) 70%, #8a7860);
  font-size: 11px;
  line-height: 1.5;
}

.tier-effect-list {
  display: grid;
  gap: 10px;
}

.tier-effect {
  padding: 10px 12px;
  border-left: 2px solid color-mix(in srgb, var(--tc) 65%, transparent);
  background: color-mix(in srgb, var(--tc) 7%, transparent);
  color: #c8bda8;
  font-size: 13px;
  line-height: 1.5;
  letter-spacing: 0.04em;
}

/* ─── Team Tower ─── */
.tower-section {
  background:
    radial-gradient(circle at 20% 10%, rgba(45, 212, 191, 0.12), transparent 28%),
    radial-gradient(circle at 80% 35%, rgba(251, 191, 36, 0.12), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.015), rgba(6, 4, 15, 0.9));
}

.tower-overview {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  max-width: 980px;
  margin: -20px auto 28px;
}

.tower-stat {
  position: relative;
  padding: 20px 16px;
  text-align: center;
  border: 1px solid rgba(45, 212, 191, 0.22);
  background: linear-gradient(160deg, rgba(45, 212, 191, 0.08), rgba(255, 255, 255, 0.015));
  overflow: hidden;
}

.tower-stat::after {
  content: '';
  position: absolute;
  inset: auto 20px 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #2dd4bf, transparent);
}

.tower-stat-num {
  color: #e8dcc8;
  font-family: 'Courier New', monospace;
  font-size: 30px;
  font-weight: 700;
  text-shadow: 0 0 22px rgba(45, 212, 191, 0.45);
}

.tower-stat-label {
  margin-top: 6px;
  color: #7ccfc1;
  font-size: 11px;
  letter-spacing: 0.2em;
}

.tower-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
  gap: 22px;
  max-width: 1120px;
  margin: 0 auto;
}

.tower-stage-list {
  display: grid;
  gap: 12px;
}

.tower-stage {
  display: flex;
  gap: 16px;
  align-items: stretch;
  padding: 16px;
  border: 1px solid color-mix(in srgb, var(--twc) 32%, transparent);
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--twc) 10%, #08050f), rgba(8, 5, 15, 0.9)),
    radial-gradient(circle at 0% 50%, color-mix(in srgb, var(--twc) 18%, transparent), transparent 35%);
  transition: transform 0.3s, border-color 0.3s;
}

.tower-stage:hover {
  transform: translateX(6px);
  border-color: color-mix(in srgb, var(--twc) 62%, transparent);
}

.tower-floor {
  display: grid;
  place-items: center;
  min-width: 78px;
  color: var(--twc);
  border: 1px solid color-mix(in srgb, var(--twc) 50%, transparent);
  font-family: 'Courier New', monospace;
  font-weight: 700;
  letter-spacing: 1px;
}

.tower-stage-name {
  color: #f0e8d8;
  font-size: 17px;
  letter-spacing: 0.16em;
  margin-bottom: 8px;
}

.tower-stage-bonus {
  color: color-mix(in srgb, var(--twc) 78%, #c0b090);
  font-size: 13px;
  line-height: 1.6;
}

.tower-stage-monster {
  color: #7a7060;
  font-size: 12px;
  line-height: 1.6;
}

.tower-side {
  display: grid;
  gap: 16px;
}

.tower-panel {
  padding: 22px;
  border: 1px solid rgba(200, 160, 74, 0.16);
  background: rgba(6, 4, 15, 0.62);
}

.tower-panel-title {
  color: #dac890;
  font-size: 16px;
  letter-spacing: 0.18em;
  margin-bottom: 14px;
}

.tower-rule {
  position: relative;
  padding: 10px 0 10px 18px;
  color: #9f927c;
  border-bottom: 1px solid rgba(200, 160, 74, 0.08);
  font-size: 13px;
  line-height: 1.7;
}

.tower-rule::before {
  content: '';
  position: absolute;
  top: 19px;
  left: 0;
  width: 6px;
  height: 6px;
  background: #2dd4bf;
  box-shadow: 0 0 12px rgba(45, 212, 191, 0.65);
  transform: rotate(45deg);
}

.tower-reward {
  display: grid;
  grid-template-columns: 54px 1fr;
  gap: 12px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(200, 160, 74, 0.08);
}

.tower-reward span {
  color: #2dd4bf;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.tower-reward strong {
  color: #c0b090;
  font-size: 13px;
  line-height: 1.5;
  font-weight: 400;
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

.modal-skill-list {
  display: grid;
  gap: 8px;
}

.modal-skill {
  position: relative;
  padding: 9px 12px 9px 26px;
  border: 1px solid color-mix(in srgb, var(--mc) 24%, transparent);
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--mc) 8%, transparent), transparent),
    rgba(255, 255, 255, 0.015);
  color: #c8bda8;
  font-size: 12px;
  line-height: 1.6;
}

.modal-skill::before {
  content: '';
  position: absolute;
  top: 17px;
  left: 12px;
  width: 6px;
  height: 6px;
  background: var(--mc);
  box-shadow: 0 0 12px color-mix(in srgb, var(--mc) 70%, transparent);
  transform: rotate(45deg);
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
  .hero-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tier-rules,
  .tier-grid,
  .tower-overview,
  .tower-layout { grid-template-columns: 1fr; }
  .tier-card { min-height: auto; }
  .tower-stage { flex-direction: column; }
  .tower-floor { min-height: 42px; }
}

@media (min-width: 601px) and (max-width: 980px) {
  .tier-rules { grid-template-columns: 1fr; }
  .tier-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tower-overview { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .tower-layout { grid-template-columns: 1fr; }
}
</style>
