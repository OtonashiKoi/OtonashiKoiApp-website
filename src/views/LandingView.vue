<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import hero from "../assets/autumn/season-character.webp";
import battle from "../assets/autumn/battle.webp";
import party from "../assets/autumn/party.webp";
import alchemy from "../assets/autumn/alchemy.webp";
import titleMaple from "../assets/autumn/title-maple.webp";
import titleTraveler from "../assets/autumn/title-traveler.webp";
import titleVeteran from "../assets/autumn/title-veteran.webp";
import titleAttendance from "../assets/autumn/title-attendance.webp";
import titleForge from "../assets/autumn/title-forge.webp";
import titleCompanions from "../assets/autumn/title-companions.webp";
import titleSummit from "../assets/autumn/title-summit.webp";

const gameUrl = "https://otonashikoi.org/";
const discordUrl = "https://discord.gg/EfpECVDJF6";
const nav = [
  { id: "season", name: "本季更新" },
  { id: "guide", name: "開始冒險" },
  { id: "world", name: "世界與養成" },
  { id: "tower", name: "組隊爬塔" },
  { id: "craft", name: "鍊金工房" },
  { id: "titles", name: "賽季稱號" },
];
const menuOpen = ref(false);
const gallery = [
  {
    image: battle,
    title: "日常共鬥",
    tag: "一起打怪，各自骰寶",
    text: "同區冒險者共同推進戰鬥，享受光環支援；擊敗怪物後，每位符合資格的玩家都有自己的掉落機會。",
  },
  {
    image: party,
    title: "組隊爬塔",
    tag: "坦克・輸出・輔助",
    text: "同一個戰鬥場景裡連續向上挑戰。看行動條掌握出手節奏，點自己的頭像調整策略，詩人仍能手動演奏。",
  },
  {
    image: alchemy,
    title: "鍊金工房",
    tag: "把素材放入爐中",
    text: "翻開配方書、放入寶石、攪拌製作。已有的低階素材，也能成為下一次裝備提升的準備。",
  },
];
const lightbox = ref(null);
const dialog = ref(null);
let returnFocus = null;
let previousOverflow = "";
async function openImage(item) {
  returnFocus = document.activeElement;
  previousOverflow = document.body.style.overflow;
  lightbox.value = item;
  document.body.style.overflow = "hidden";
  await nextTick();
  dialog.value?.focus();
}
function closeImage() {
  if (!lightbox.value) return;
  lightbox.value = null;
  document.body.style.overflow = previousOverflow;
  returnFocus?.focus();
}
function dialogKeys(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeImage();
  }
  if (event.key === "Tab") {
    event.preventDefault();
    dialog.value?.querySelector("button")?.focus();
  }
}
onBeforeUnmount(closeImage);
const jobs = [
  { name: "劍士", group: "近戰", text: "以劍作戰，建立近戰攻守的基礎。" },
  { name: "戰士", group: "近戰", text: "偏重力量，追求正面交鋒的打擊力。" },
  {
    name: "矮人戰士",
    group: "近戰",
    text: "重視體魄，適合喜歡厚實角色的冒險者。",
  },
  { name: "盜賊", group: "近戰", text: "以敏捷與連續攻擊創造戰鬥節奏。" },
  { name: "弓箭手", group: "遠程", text: "拉開戰鬥風格，走向精準的弓箭輸出。" },
  { name: "法師", group: "遠程", text: "以智力與魔法建立自己的輸出路線。" },
  { name: "賭徒", group: "遠程", text: "使用骰子作戰，享受帶有運氣的變化。" },
  {
    name: "治療師",
    group: "支援",
    text: "提供治療與支援，幫助隊伍維持續戰能力。",
  },
  { name: "軍師", group: "支援", text: "以戰術與光環支援，帶動團隊作戰。" },
  {
    name: "詩人",
    group: "支援",
    text: "以樂器與演奏加入共鬥，二轉可走向吟遊詩人。",
  },
  {
    name: "結界師",
    group: "支援",
    text: "以防護與結界支援，補上團隊的生存空間。",
  },
];
const jobFilter = ref("全部");
const shownJobs = computed(() =>
  jobs.filter((j) => jobFilter.value === "全部" || j.group === jobFilter.value),
);
const mapStages = [
  {
    lv: "01—09",
    name: "草叢與起始草原",
    gear: "D 階裝備",
    text: "先在新手村外的草叢熟悉戰鬥，取得基礎裝備後再挑戰起始的草原。防具同樣重要。",
  },
  {
    lv: "10—19",
    name: "陽光草原",
    gear: "C 階裝備",
    text: "準備第一個職業，將武器與防具逐步換成 C 階，開始建立自己的養成方向。",
  },
  {
    lv: "20—29",
    name: "古城",
    gear: "B 階裝備",
    text: "探索古城、收集區域裝備與怪物卡。不要只提升武器，也要留意承傷與生命值。",
  },
  {
    lv: "30—39",
    name: "霧隱林地",
    gear: "B 階裝備・一般塔",
    text: "探索霧林的怪物與專屬卡片；30 等起能組隊挑戰一般塔，35 等起可準備二轉試煉。",
  },
  {
    lv: "40—50",
    name: "更深處的冒險",
    gear: "A 階裝備・挑戰塔",
    text: "古城深處、龍族之領、地獄火焰與鐵鳴礦城都在這裡。朝完整裝備、50 樓與世界王邁進。",
  },
];
const roleDetails = [
  {
    name: "坦克",
    icon: "◇",
    text: "站在隊伍最前線",
    effects: ["最大生命 +20%", "物理與魔法防禦 +20%", "最終傷害 −30%"],
    note: "怪物優先攻擊存活坦克。防具、生命值與隊友的治療，是持續扛傷的關鍵。",
  },
  {
    name: "輸出",
    icon: "✧",
    text: "把握每一次出手",
    effects: ["最終傷害 +20%", "最大生命 −15%", "防禦與迴避各降低 20%"],
    note: "坦克倒下後，怪物會優先找本場累積傷害最高的存活輸出。",
  },
  {
    name: "輔助",
    icon: "❋",
    text: "放大既有的支援",
    effects: ["光環效果 +25%", "防禦降低 20%", "生命值與治療能力不額外加成"],
    note: "站位不會直接送你補血技能；治療、護盾與演奏仍由原本的職業和裝備決定。",
  },
];
const titles = [
  {
    name: "初楓旅人",
    image: titleTraveler,
    target: "累積獲勝 100 場",
    note: "從第一場勝利，開始收藏這個秋天。",
  },
  {
    name: "楓紅百戰",
    image: titleVeteran,
    target: "累積獲勝 3,000 場",
    note: "把日常出戰累積成自己的戰績。",
  },
  {
    name: "秋日常在",
    image: titleAttendance,
    target: "於 15 個不同日期完成簽到",
    note: "不要求連續 15 天；同一天只計一次。",
  },
  {
    name: "紅葉煉成",
    image: titleForge,
    target: "親自將 3 件不同的 A 裝強化到 +5",
    note: "同一件裝備不會重複計數。",
  },
  {
    name: "共登秋塔",
    image: titleCompanions,
    target: "累積通過組隊塔 100 樓",
    note: "一般與挑戰難度都可累積，不必一趟完成。",
  },
  {
    name: "高塔摘楓",
    image: titleSummit,
    target: "完整通過一次挑戰塔 50 樓",
    note: "和隊友一起站上本季的高處。",
  },
];
const faqs = [
  {
    q: "怎麼登入？一定要先下載遊戲嗎？",
    a: "直接打開網頁遊戲，依登入畫面的 Discord 授權流程進入。網頁可在桌面或手機瀏覽器使用；加入社群能查看公告、交流與找隊友。",
  },
  {
    q: "一般區是每個人打不同的怪，還是共同戰鬥？",
    a: "是共同戰鬥。同區玩家一起推進怪物血量，也能吃到同區的既有光環。經驗與金幣由獎勵池分配，道具則由每位符合參戰資格的玩家獨立骰掉落。",
  },
  {
    q: "爬塔選「輔助」就能補血嗎？",
    a: "不會。輔助站位提升既有光環效果，不會另外賦予治療或護盾技能。需要補血時，仍要安排有相應能力的職業、裝備，或攜帶藥水。",
  },
  {
    q: "組隊藥水哪裡取得？誰能使用？",
    a: "前往遊戲商店的消耗品分類購買。出發前配置攜帶數量；每人一趟最多 10 瓶，復活藥最多 2 瓶且包含在總量內。戰鬥中由存活玩家使用自己的藥水，可以對自己或隊友用藥。",
  },
  {
    q: "坦克倒下就結束嗎？爬塔會自動回血嗎？",
    a: "全隊倒下才判定失敗。血量會帶入下一隻怪，不再每十樓自動回血；倒地者無法操作，需由存活隊友使用復活藥。失敗後可查看戰報與原因，重新回到組隊流程。",
  },
  {
    q: "為什麼在舊地圖升級變慢？",
    a: "各區有自己的推薦等級帶。角色等級超出該區的適合範圍，會受到經驗衰減；把裝備準備好再前往適合的區域，通常更能推進養成。",
  },
  {
    q: "合成會失敗嗎？放入素材就扣掉了嗎？",
    a: "目前公開的寶石升階與屬性石轉換是必定成功。先放入素材、攪拌並查看確認內容，最後確認才會消耗素材與金幣。取消確認不會扣款；配方書會顯示當前可製作的上限。",
  },
  {
    q: "稱號達成後去哪裡領？加成會自動生效嗎？",
    a: "在任務的賽季分類領取，再到背包穿戴稱號。「楓紅漸漸」的經驗 +3%、金幣 +2% 需要實際穿戴才生效。各角色的稱號進度與領取分別計算。",
  },
  {
    q: "戰鬥特效可以關閉嗎？",
    a: "可以在遊戲設定調整戰鬥特效與音效。戰鬥中也能點擊技能或光環圖示查看說明，詳細數字與結果可在戰報確認。",
  },
];
</script>

<template>
  <a class="skip-link" href="#main">跳至主要內容</a>
  <header class="site-header">
    <a class="brand" href="#"
      ><span class="brand-mark" aria-hidden="true">❋</span
      ><span>音無樂園<small>OTONASHI KOI</small></span></a
    >
    <button
      class="menu-toggle"
      :aria-expanded="menuOpen"
      aria-controls="site-nav"
      @click="menuOpen = !menuOpen"
    >
      {{ menuOpen ? "關閉" : "導覽" }}
      <span aria-hidden="true">{{ menuOpen ? "×" : "☰" }}</span>
    </button>
    <nav id="site-nav" :class="{ open: menuOpen }" aria-label="網站導覽">
      <a
        v-for="n in nav"
        :key="n.id"
        :href="`#${n.id}`"
        @click="menuOpen = false"
        >{{ n.name }}</a
      >
    </nav>
    <a
      class="button header-play"
      :href="gameUrl"
      target="_blank"
      rel="noopener noreferrer"
      >進入遊戲 <span aria-hidden="true">↗</span></a
    >
  </header>
  <main id="main">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow">音無樂園 · 秋季篇章</p>
        <h1 id="hero-title">楓紅<span>漸漸</span></h1>
        <p class="hero-subtitle">
          一起打怪，各自收藏。<br />把這個秋天，走成我們的冒險。
        </p>
        <p class="hero-description">
          以 Discord 帳號踏入網頁
          RPG。從日常共鬥、裝備養成，到和隊友一起挑戰高塔，找到屬於你的冒險節奏。
        </p>
        <div class="hero-actions">
          <a
            class="button primary"
            :href="gameUrl"
            target="_blank"
            rel="noopener noreferrer"
            >開始冒險 <span aria-hidden="true">↗</span></a
          ><a class="button subtle" href="#guide">第一次來？看入門指南</a>
        </div>
        <p class="season-date">
          2026.10.04 21:00 — 11.01 23:59 <span>台灣時間</span>
        </p>
      </div>
      <div class="hero-art">
        <img
          :src="hero"
          alt="楓紅漸漸主視覺：音無恋手持紅葉，坐在秋色與紫色花紋之間"
          width="836"
          height="941"
          fetchpriority="high"
        /><span class="art-seal">THE AUTUMN CHAPTER<small>2026</small></span>
      </div>
      <a class="scroll-cue" href="#season"
        >翻開本季的冒險 <span aria-hidden="true">↓</span></a
      >
    </section>

    <section id="season" class="section season-section">
      <div class="section-heading">
        <p class="eyebrow">WHAT'S NEW</p>
        <h2>這一次，把共鬥放進日常。</h2>
        <p>平常自在練功打寶，準備好再一起挑戰。這是「楓紅漸漸」的四個重點。</p>
      </div>
      <div class="updates-grid">
        <article>
          <span class="chapter-number">01</span>
          <h3>共同戰鬥，掉落分開</h3>
          <p>
            一般區共享戰鬥與同區光環。每人獨立骰自己的寶物，經驗與金幣則維持獎勵池分配。
          </p>
          <a href="#combat">了解共鬥分配 →</a>
        </article>
        <article>
          <span class="chapter-number">02</span>
          <h3>30／50 樓組隊塔</h3>
          <p>
            坦克、輸出、輔助各有定位。2～5
            人集結，一次出發、連續向上，考驗整隊的續戰力。
          </p>
          <a href="#tower">查看爬塔規則 →</a>
        </article>
        <article>
          <span class="chapter-number">03</span>
          <h3>素材的下一個用途</h3>
          <p>
            鍊金工房正式公開：五份素材合成一份成品，寶石升階、五行與日月屬性石轉換。
          </p>
          <a href="#craft">打開配方書 →</a>
        </article>
        <article>
          <span class="chapter-number">04</span>
          <h3>收集秋季的稱號</h3>
          <p>
            從戰鬥、簽到、強化與爬塔收集七款稱號。「楓紅漸漸」穿戴後提供經驗與金幣加成。
          </p>
          <a href="#titles">找到你的目標 →</a>
        </article>
      </div>
    </section>

    <section id="screens" class="section gallery-section">
      <div class="section-heading">
        <p class="eyebrow">INSIDE THE GAME</p>
        <h2>冒險，長這個樣子。</h2>
        <p>場景、角色與操作都在同一個畫面裡。點圖可以放大查看。</p>
      </div>
      <div class="gallery-grid">
        <figure v-for="item in gallery" :key="item.title">
          <button
            class="screenshot"
            @click="openImage(item)"
            :aria-label="`放大${item.title}遊戲畫面`"
          >
            <img
              :src="item.image"
              :alt="`${item.title}的實際遊戲介面，包含上下導覽列`"
              width="648"
              height="1230"
              loading="lazy"
            /><span>放大查看 ↗</span>
          </button>
          <figcaption>
            <small>{{ item.tag }}</small>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </figcaption>
        </figure>
      </div>
      <p class="caption-note">
        以目前遊戲元件拍攝；範例角色、等級、背包與隊伍為示範資料。實際內容以遊戲內顯示為準。
      </p>
    </section>

    <section id="guide" class="section parchment-section">
      <div class="section-heading">
        <p class="eyebrow">YOUR FIRST ADVENTURE</p>
        <h2>從第一件裝備開始。</h2>
        <p>不用一次記住所有系統。先完成一場戰鬥，再慢慢認識這個世界。</p>
      </div>
      <ol class="steps">
        <li>
          <span>01</span>
          <div>
            <h3>登入，選擇你的角色</h3>
            <p>
              打開網頁，以 Discord
              授權登入。從角色選擇進入據點，依新手提示確認起步資金與裝備。
            </p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <h3>到草叢完成第一場戰鬥</h3>
            <p>
              從「出戰」選擇新手村外的草叢。選好可用的攻擊方式後出戰，觀察生命、傷害與戰報。
            </p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <h3>把戰利品穿到身上</h3>
            <p>
              回到背包，比較武器與防具。不要只堆傷害：生命與防禦會決定你能否安全前往下一區。
            </p>
          </div>
        </li>
        <li>
          <span>04</span>
          <div>
            <h3>配點、轉職，找到日常目標</h3>
            <p>
              每次升等獲得 1 點隨機屬性與 1
              點自選點數。查看任務、完成每日與試煉，再逐步挑戰適合等級的地圖。
            </p>
          </div>
        </li>
      </ol>
      <div class="guide-foot">
        <p>
          升級、穿裝、圖鑑收藏、卡片與寵物，會一起構成你的角色。先養成，再挑戰。
        </p>
        <a
          class="button primary"
          :href="gameUrl"
          target="_blank"
          rel="noopener noreferrer"
          >前往遊戲 ↗</a
        >
      </div>
    </section>

    <section id="combat" class="section split-section">
      <div class="section-heading">
        <p class="eyebrow">EVERYDAY CO-OP</p>
        <h2>同一場戰鬥，<br />每個人都有收穫。</h2>
        <p>不用先開副本房間，平常也能感受到一起打怪的力量。</p>
      </div>
      <div class="reading-panel">
        <h3>共同推進怪物血量</h3>
        <p>
          普通戰鬥可能遇到 1～3 隻同種怪物；區域 BOSS
          為單隻。怪物倒下就停止攻擊，剩下的怪物繼續戰鬥。同區冒險者提供既有光環，幫助彼此出戰。
        </p>
        <h3>掉落獨立，經驗與金幣分配</h3>
        <p>
          符合參戰資格的人，各自獲得一般道具掉落判定。有人沒骰到，不會影響其他人的機會；單人的基礎掉率不因多一位隊友而被平分。
        </p>
        <p>
          經驗與金幣來自整場獎勵池，再依規則分配。多人加成擴大的是整體經驗池，不代表每人都拿到同樣倍數的完整獎勵。
        </p>
        <details>
          <summary>想看更清楚的多人經驗例子？</summary>
          <p>
            3／4／5 人的整體經驗池為單人基準的 1.6／1.9／2.2
            倍，再平均分配。以基礎 1,000 EXP、3 位合資格玩家為例：整體為
            1,600，每人約 533 EXP；角色加成、區域衰減與取整會影響最後數字。
          </p>
          <p>
            怪物血量會隨有效參戰人數提高，最多以 5 人計算至 2.8
            倍；再多人也不繼續追加血量。
          </p>
        </details>
        <h3>看得懂每一次出手</h3>
        <p>
          戰鬥有武器與技能演出、傷害數字與死亡淡出。技能和光環圖示可點開說明，詳細結果留在戰報；特效與音效可從設定調整。
        </p>
      </div>
    </section>

    <section id="world" class="section world-section">
      <div class="section-heading">
        <p class="eyebrow">A WORLD TO GROW INTO</p>
        <h2>從草原，到世界的深處。</h2>
        <p>
          本季角色上限為 50
          等。各地圖有自己的裝備、怪物與收藏目標，讓換區成為成長的一部分。
        </p>
      </div>
      <div class="map-road">
        <article v-for="stage in mapStages" :key="stage.lv">
          <span class="level-mark">Lv. {{ stage.lv }}</span>
          <div>
            <h3>{{ stage.name }}</h3>
            <span class="gear-label">{{ stage.gear }}</span>
            <p>{{ stage.text }}</p>
          </div>
        </article>
      </div>
      <div class="world-notes">
        <article>
          <h3>掉落屬於那片土地</h3>
          <p>
            區域裝備在該區的一般怪也有取得機會。從 D、C、B 到
            A，透過刷怪、換裝、強化與鑲嵌累積強度，再追求 BOSS
            與世界王的高階戰利品。
          </p>
        </article>
        <article>
          <h3>把收藏變成成長</h3>
          <p>
            怪物與卡片圖鑑以書頁分類呈現，寵物可查看效果。主線劇情、任務與收藏，提供戰鬥之外的進展；完成的任務也能一鍵領取。
          </p>
        </article>
      </div>
      <div class="boss-route">
        <p class="eyebrow">WORLD BOSS</p>
        <h3>世界王，是下一個長線目標。</h3>
        <ol>
          <li><span>Lv.40</span>大史王</li>
          <li><span>Lv.50</span>古龍王</li>
          <li><span>Lv.50</span>地獄狼牙王</li>
          <li><span>Lv.50</span>赫鋼王</li>
        </ol>
        <p>
          依序完成前置討伐，進度依帳號判定。遊戲內世界王頁面會顯示目前可挑戰的對象、條件與狀態。
        </p>
      </div>
    </section>

    <section id="jobs" class="section jobs-section">
      <div class="section-heading">
        <p class="eyebrow">MAKE IT YOUR ADVENTURE</p>
        <h2>十一種起點，自己的養成路。</h2>
        <p>
          10 等起查看一轉試煉，依基礎屬性與指定武器完成條件。35
          等起可準備二轉；需要對應的一轉徽章等級與試煉資格。
        </p>
      </div>
      <div class="filter-tabs" aria-label="職業分類">
        <button
          v-for="group in ['全部', '近戰', '遠程', '支援']"
          :key="group"
          :aria-pressed="jobFilter === group"
          @click="jobFilter = group"
        >
          {{ group }}
        </button>
      </div>
      <div class="jobs-grid">
        <article v-for="job in shownJobs" :key="job.name">
          <span>{{ job.group }}</span>
          <h3>{{ job.name }}</h3>
          <p>{{ job.text }}</p>
        </article>
      </div>
      <p class="caption-note">
        分類用於入門認識，不是副本站位限制。實際技能、可用二轉分支、徽章與試煉條件，以角色的遊戲內轉職頁面為準。
      </p>
      <div class="attribute-note">
        <h3>配點的第一步，應該有感。</h3>
        <p>
          攻擊主屬性採用前期效果明顯、後期逐漸遞減的曲線。AGI
          影響出手速度；爬塔以行動條累積判定，快的角色能比其他人多出手，怪物也同樣參與。
        </p>
      </div>
    </section>

    <section id="town" class="section town-section">
      <div class="section-heading">
        <p class="eyebrow">LIFE BETWEEN ADVENTURES</p>
        <h2>回到城鎮，整理下一次出發。</h2>
        <p>
          冒險手冊連接戰鬥之外的生活：補給、交易、任務與賽季進度。每次回城，都能找到下一個目標。
        </p>
      </div>
      <div class="town-grid">
        <article>
          <span class="eyebrow">EQUIPMENT</span>
          <h3>背包與裝備養成</h3>
          <p>
            把新戰利品與身上裝備比較，再選擇穿戴、強化、附魔或鑲嵌。武器、副手、防具、卡片與屬性石一起構成戰鬥能力；重要物品先鎖定，避免整理時誤用。
          </p>
        </article>
        <article>
          <span class="eyebrow">MARKET</span>
          <h3>商店與拍賣</h3>
          <p>
            日常補給從商店取得，包括組隊需要的治療與復活藥。拍賣則讓冒險者交流可交易的戰利品；上架、購買前先確認道具內容、數量與價格。
          </p>
        </article>
        <article>
          <span class="eyebrow">DAILY GOALS</span>
          <h3>任務與收藏</h3>
          <p>
            任務依新手、每日、每週與賽季分類，完成後可單筆或一鍵領獎。翻閱主線劇情、怪物與卡片圖鑑，查看寵物效果，讓刷怪同時推進收藏。
          </p>
        </article>
        <article>
          <span class="eyebrow">SEASON PASS</span>
          <h3>30 級賽季通行證</h3>
          <p>
            打怪與副本推進通行證點數，每 1,000 點提升一級，上限 30
            級。免費軌可直接累積與領取；高級軌需 5
            鑽石開通，獎勵包含金幣、寶石與養成補給。
          </p>
          <p class="town-detail">
            本季加入 S
            階強化寶石獎勵。通行證等級與角色等級分開計算，開通高級軌不會直接增加等級；實際獎勵可在遊戲內逐級預覽。
          </p>
        </article>
      </div>
    </section>

    <section id="tower" class="section tower-section">
      <div class="section-heading">
        <p class="eyebrow">THE PARTY TOWER</p>
        <h2>隊伍集結。<br />這次，一起走得更高。</h2>
        <p>
          爬塔是一段需要安排站位、技能與補給的連續戰鬥。單人不能出發；準備好彼此的角色，比只堆輸出更重要。
        </p>
      </div>
      <div class="difficulty-grid">
        <article>
          <span>一般難度</span>
          <h3>30<span>樓</span></h3>
          <p>全員 Lv.30 以上<br />從第 1 樓一路挑戰至 30 樓</p>
        </article>
        <article>
          <span>挑戰難度</span>
          <h3>50<span>樓</span></h3>
          <p>全員 Lv.40 以上<br />從第 1 樓一路挑戰至 50 樓</p>
        </article>
        <div class="tower-reward">
          <span>副本收益</span><strong>+50%</strong>
          <p>
            經驗收益與個人掉落機率提高<br /><small
              >掉率最多 100%；金幣不追加此倍率</small
            >
          </p>
        </div>
      </div>
      <ol class="tower-flow">
        <li><b>開房或加入</b><span>公開房間／密碼房</span></li>
        <li><b>選擇站位</b><span>2～5 人・一位坦克</span></li>
        <li><b>準備技能與藥水</b><span>所有隊員確認準備</span></li>
        <li><b>隊長統一出發</b><span>勝利後自動換下一隻</span></li>
      </ol>
      <div class="roles-grid">
        <article v-for="r in roleDetails" :key="r.name">
          <span class="role-symbol" aria-hidden="true">{{ r.icon }}</span>
          <h3>{{ r.name }}</h3>
          <small>{{ r.text }}</small>
          <ul>
            <li v-for="effect in r.effects" :key="effect">{{ effect }}</li>
          </ul>
          <p>{{ r.note }}</p>
        </article>
      </div>
      <div class="tower-rules">
        <article>
          <h3>連戰中，也保留你的操作</h3>
          <p>
            每 5 樓遇到
            BOSS，打贏會自動往下一樓。存活時點自己的頭像調整可用技能或策略；吟遊詩人可以照方向列手動演奏，並以線條呈現作答與冷卻進度。
          </p>
          <p>
            攻擊順序由 AGI
            行動條決定，不保證每人固定輪流一次。隊長可管理隊伍，隊員也可離開；途中離隊會停止本趟挑戰並依已完成樓層處理結算。
          </p>
        </article>
        <article>
          <h3>血量會留下，補給要先想好</h3>
          <p>
            每人最多帶 10 瓶藥，包含最多 2
            瓶復活藥，途中不能補帶。存活玩家能在戰鬥中使用自己的藥水；使用者與被用藥者各有
            10 秒冷卻，隊友不能同時對同一人灌藥。
          </p>
          <p>
            沒有每十樓的系統回血。倒地後不能操作，復活需要存活隊友用藥。全隊倒下才結束，已通過的樓層仍會結算，並提供失敗原因與戰報。
          </p>
        </article>
      </div>
      <details class="tower-detail">
        <summary>怪物強度、攻擊目標與掉落怎麼算？</summary>
        <p>
          副本怪物血量為對應一般區怪物的 5 倍。一般塔攻擊為 1.5
          倍；挑戰塔普通怪為 2 倍、BOSS 為 2.5
          倍。高難度使用較後期的區域怪物，不會從新手村怪物開始。
        </p>
        <p>
          存活坦克最先受攻；坦克倒下後，改打本場累積傷害最高的存活輸出，最後才是輔助。同位置傷害相同時隨機選擇。
        </p>
        <p>
          掉落沿用每人獨立骰寶，在各自原本機率上乘
          1.5。經驗沿用基礎分配規則後提高
          50%，不是每位隊員都拿一整份全隊經驗。背包滿時，留意遊戲內的待領獎勵。
        </p>
      </details>
    </section>

    <section id="craft" class="section craft-section">
      <div class="craft-visual">
        <button
          class="screenshot"
          @click="openImage(gallery[2])"
          aria-label="放大鍊金工房畫面"
        >
          <img
            :src="alchemy"
            alt="鍊金工房中的鍊金師、配方書與素材爐"
            width="648"
            height="1230"
            loading="lazy"
          /><span>走進工房 ↗</span>
        </button>
      </div>
      <div class="craft-copy">
        <p class="eyebrow">THE ALCHEMIST'S WORKSHOP</p>
        <h2>下一次變強，<br />從爐中的素材開始。</h2>
        <p class="intro">
          目前公開 10 種配方，全部是五份材料換一份成品、必定成功。
        </p>
        <div class="recipe-list">
          <article>
            <h3>寶石升階</h3>
            <p>
              D → C：500 金幣／份<br />C → B：2,000 金幣／份<br />B → A：6,000
              金幣／份
            </p>
          </article>
          <article>
            <h3>五行相生</h3>
            <p>木 → 火 → 土 → 金 → 水 → 木<br />每次轉換需 1,000 金幣／份</p>
          </article>
          <article>
            <h3>日月轉換</h3>
            <p>日 → 月、月 → 日<br />每次轉換需 2,000 金幣／份</p>
          </article>
        </div>
        <p>
          從冒險手冊進入「合成」，選配方和份數，把材料點入或拖入鍊金爐，再攪拌並確認。單次最多
          99 份，可用 ＋10／MAX 快速調整，仍受材料與金幣上限限制。
        </p>
        <p class="fine-print">
          最後確認才消耗材料與金幣。現階段配方不含 S
          級寶石升階，也不包含裝備直接合成。
        </p>
      </div>
    </section>

    <section id="titles" class="section titles-section">
      <div class="section-heading">
        <p class="eyebrow">MEMORIES OF AUTUMN</p>
        <h2>把這個秋天，留在名字旁。</h2>
        <p>
          完成賽季任務，收藏七款限定稱號。戰鬥、簽到、強化與爬塔，都有自己的目標。
        </p>
      </div>
      <div class="title-grid">
        <article v-for="t in titles" :key="t.name">
          <img
            :src="t.image"
            :alt="`${t.name}稱號徽記`"
            width="90"
            height="90"
            loading="lazy"
          />
          <div>
            <h3>{{ t.name }}</h3>
            <b>{{ t.target }}</b>
            <p>{{ t.note }}</p>
          </div>
        </article>
      </div>
      <article class="maple-title">
        <img
          :src="titleMaple"
          alt="楓紅漸漸限定稱號徽記"
          width="140"
          height="140"
          loading="lazy"
        />
        <div>
          <p class="eyebrow">THE SEASON TITLE</p>
          <h3>楓紅漸漸</h3>
          <p>領取上面六款稱號中的任意四款，即可達成。</p>
          <strong>經驗 +3% <span>／</span> 金幣 +2%</strong
          ><small
            >從「任務 →
            賽季」領取，再到背包穿戴才會生效。其餘六款為收藏稱號。</small
          >
        </div>
      </article>
      <p class="caption-note">
        本季任務從 2026／10／4 21:00 開放後開始計數；各角色獨立累積。11／1
        當天仍可遊玩，請把握季末前完成目標與領取。
      </p>
    </section>

    <section id="faq" class="section faq-section">
      <div class="section-heading">
        <p class="eyebrow">ADVENTURER'S NOTES</p>
        <h2>出發前，還想知道⋯⋯</h2>
      </div>
      <div class="faq-list">
        <details v-for="f in faqs" :key="f.q">
          <summary>{{ f.q }}</summary>
          <p>{{ f.a }}</p>
        </details>
      </div>
    </section>
    <section class="closing">
      <p class="eyebrow">YOUR NEXT CHAPTER</p>
      <h2>下一場冒險，等你一起。</h2>
      <p>進入遊戲，或先到社群找找同行的冒險者。</p>
      <div class="hero-actions">
        <a
          class="button primary"
          :href="gameUrl"
          target="_blank"
          rel="noopener noreferrer"
          >進入音無樂園 ↗</a
        ><a
          class="button subtle"
          :href="discordUrl"
          target="_blank"
          rel="noopener noreferrer"
          >加入 Discord 社群 ↗</a
        >
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <a class="brand" href="#"
      ><span class="brand-mark" aria-hidden="true">❋</span
      ><span>音無樂園<small>OTONASHI KOI</small></span></a
    >
    <div>
      <a :href="gameUrl" target="_blank" rel="noopener noreferrer"
        >網頁遊戲 ↗</a
      ><a :href="discordUrl" target="_blank" rel="noopener noreferrer"
        >Discord 社群 ↗</a
      ><a href="#faq">常見問題</a>
    </div>
    <p>
      本頁核對更新：2026.10.05<br />數值、開放狀態與調整公告以遊戲內及官方社群最新內容為準。
    </p>
    <small>© 2026 音無樂園 Otonashi Koi</small>
  </footer>
  <Teleport to="body"
    ><div v-if="lightbox" class="lightbox-backdrop" @click.self="closeImage">
      <section
        ref="dialog"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="`${lightbox.title}畫面`"
        tabindex="-1"
        @keydown="dialogKeys"
      >
        <header>
          <h2>{{ lightbox.title }}</h2>
          <button @click="closeImage" aria-label="關閉放大畫面">×</button>
        </header>
        <img
          :src="lightbox.image"
          :alt="`${lightbox.title}實際遊戲介面放大圖`"
        />
        <p>實際遊戲介面・示範角色與資料</p>
      </section>
    </div></Teleport
  >
</template>
