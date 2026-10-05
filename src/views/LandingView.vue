<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import receptionist from "../assets/guide/receptionist.webp";
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
const basicSections = [
  { id: "account", name: "登入與綁定" },
  { id: "getting-started", name: "第一場戰鬥" },
  { id: "equipment", name: "穿戴與配點" },
  { id: "enhance", name: "強化與鑲嵌" },
  { id: "combat", name: "一般共鬥" },
  { id: "world", name: "地圖路線" },
  { id: "worldboss", name: "世界王" },
  { id: "jobs", name: "職業與轉職" },
  { id: "tower", name: "組隊教學" },
  { id: "craft", name: "合成教學" },
  { id: "town", name: "城鎮與日常" },
  { id: "faq", name: "常見問題" },
];
const updateSections = [
  { id: "season", name: "本季重點" },
  { id: "season-details", name: "改版內容" },
  { id: "screens", name: "介面範例" },
  { id: "titles", name: "限定稱號" },
];
const activePage = ref(
  ["guide", ...basicSections.map((n) => n.id)].includes(location.hash.slice(1))
    ? "guide"
    : "updates",
);
function syncPage() {
  const hash = location.hash.slice(1);
  if (hash !== "main")
    activePage.value = ["guide", ...basicSections.map((n) => n.id)].includes(
      hash,
    )
      ? "guide"
      : "updates";
  document.title =
    activePage.value === "guide"
      ? "音無樂園｜基礎教學・綁定、裝備、強化與職業指南"
      : "音無樂園｜楓紅漸漸・本季更新";
  nextTick(() => {
    const target = hash ? document.getElementById(hash) : null;
    if (target) target.scrollIntoView({ block: "start" });
    else if (!hash) window.scrollTo(0, 0);
  });
}
onMounted(() => {
  window.addEventListener("hashchange", syncPage);
  syncPage();
});
onBeforeUnmount(() => window.removeEventListener("hashchange", syncPage));
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
    text: "以弓完成一轉試煉，透過職業光環支援；二轉吟遊詩人保留手動演奏。",
  },
  {
    name: "結界師",
    group: "支援",
    text: "以防護與結界支援，補上團隊的生存空間。",
  },
];
const jobDetails = [
  {
    name: "劍士",
    gate: "STR + DEX > 10",
    weapon: "單手劍／雙手劍",
    target: 10,
    advance: "聖劍士",
  },
  {
    name: "戰士",
    gate: "STR + VIT > 10",
    weapon: "單手斧／雙手斧",
    target: 10,
    advance: "狂戰士",
  },
  {
    name: "矮人戰士",
    gate: "VIT + STR > 10",
    weapon: "單手槌／雙手槌",
    target: 10,
    advance: "矮人戰士長",
  },
  {
    name: "盜賊",
    gate: "AGI + DEX > 10",
    weapon: "匕首",
    target: 10,
    advance: "影舞者",
  },
  {
    name: "法師",
    gate: "INT + AGI > 10",
    weapon: "雙手法杖",
    target: 10,
    advance: "元素師",
  },
  {
    name: "治療師",
    gate: "INT + VIT > 10",
    weapon: "單手法杖",
    target: 10,
    advance: "聖靈師",
  },
  {
    name: "弓箭手",
    gate: "DEX + AGI > 10",
    weapon: "弓",
    target: 10,
    advance: "神射手",
  },
  {
    name: "軍師",
    gate: "無屬性限制",
    weapon: "不限武器",
    target: 10,
    advance: "兵聖",
  },
  {
    name: "詩人",
    gate: "DEX + AGI + LUK > 10",
    weapon: "弓",
    target: 10,
    advance: "吟遊詩人",
  },
  {
    name: "結界師",
    gate: "INT + VIT + DEX > 10",
    weapon: "單手法杖／雙手法杖",
    target: 10,
    advance: "聖域師",
  },
  {
    name: "賭徒",
    gate: "LUK + AGI > 10",
    weapon: "骰子",
    target: 10,
    advance: "賭神",
  },
];
for (const job of jobs)
  Object.assign(
    job,
    jobDetails.find((j) => j.name === job.name),
  );
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
    q: "YouTube 綁定完成，但會員還沒有顯示？",
    a: "綁定只確認直播帳號身分。請在正在運行的官方直播聊天室，以會員身分留言一次，讓系統辨識會員徽章，再回設定確認或刷新會員位階。直播尚未開啟或偵測尚未完成時，不要反覆更換帳號。",
  },
  {
    q: "一般強化會掉等或把裝備弄壞嗎？",
    a: "一般模式失敗會消耗本次寶石與金幣，但保留裝備與目前強化等級。賭鬼模式不同：需 +1 以上裝備，素材費用減半，失敗時另有 50% 機率銷毀整件裝備。重要裝備先確認使用的是一般模式。",
  },
  {
    q: "穿了裝備，為什麼職業試煉沒有進度？",
    a: "試煉會檢查角色等級、基礎屬性與指定的武器型態，不是只看裝備總數值。確認真的裝備了對應武器再出戰；軍師試煉例外，不限武器與屬性。各職業要求可在教學職業卡查看。",
  },

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
    <a class="brand" href="#updates"
      ><span class="brand-mark" aria-hidden="true">❋</span
      ><span>音無樂園<small>OTONASHI KOI</small></span></a
    >
    <nav class="page-tabs" aria-label="官網內容分類">
      <a
        href="#guide"
        :aria-current="activePage === 'guide' ? 'page' : undefined"
        ><small>HOW TO PLAY</small>基礎教學</a
      ><a
        href="#updates"
        :aria-current="activePage === 'updates' ? 'page' : undefined"
        ><small>SEASON UPDATE</small>本季更新</a
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
    <div
      class="page-pane"
      v-show="activePage === 'updates'"
      data-page="updates"
    >
      <section id="updates" class="hero" aria-labelledby="hero-title">
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
          <p>
            平常自在練功打寶，準備好再一起挑戰。這是「楓紅漸漸」的四個重點。
          </p>
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

      <section id="season-details" class="section season-details">
        <div class="section-heading">
          <p class="eyebrow">THIS SEASON'S CHANGES</p>
          <h2>這一季，更新了什麼？</h2>
          <p>
            這一區只整理「楓紅漸漸」的改版內容。登入、強化、穿裝與職業操作的完整教學，請到另一頁查閱。
          </p>
        </div>
        <nav class="update-index" aria-label="本季更新章節">
          <a v-for="n in updateSections" :key="n.id" :href="`#${n.id}`"
            >{{ n.name }} ↓</a
          >
        </nav>
        <div class="season-change-list">
          <article>
            <span>01</span>
            <div>
              <h3>日常共鬥：一起打怪，每人各自骰寶</h3>
              <p>
                保留共同戰鬥與同區既有光環，每位合資格玩家獨立骰一般道具。多人擴大的是經驗獎勵池，再依規則分配；怪物擴血最多計
                5 位有效參戰者。
              </p>
              <a href="#combat">完整共鬥與收益教學 →</a>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>新組隊塔：一般 30 樓、挑戰 50 樓</h3>
              <p>
                2～5 人、一名坦克，30／40
                等起挑戰兩種難度。隊長出發後連續換怪；AGI
                行動條決定出手，存活玩家可調整技能、吟遊詩人可手動演奏。
              </p>
              <p>
                經驗與個人掉率提高
                50%。取消整備倒數與每十樓系統回血；每人最多攜帶 10
                瓶藥，其中復活最多 2 瓶。戰鬥中手動用藥，使用者與目標各冷卻 10
                秒。
              </p>
              <a href="#tower">查看站位、開房與用藥教學 →</a>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>鍊金工房公開：10 種五換一配方</h3>
              <p>
                寶石
                D→C、C→B、B→A，五行相生及日月轉換，全部必定成功。從配方書選數量、放入爐中再確認；＋10／MAX
                可快速調整批量。
              </p>
              <a href="#craft">查看操作、材料與金幣費用 →</a>
            </div>
          </article>
          <article>
            <span>04</span>
            <div>
              <h3>養成節奏：配點、地圖與區域掉落</h3>
              <p>
                升等改為隨機 1 點＋自選 1
                點。攻擊屬性採用前期有感、後期遞減的曲線，AGI
                戰鬥節奏放慢，讓動畫與出手差異更清楚。
              </p>
              <p>
                一般怪可取得對應區域裝備；30 等霧隱林地與 40
                等鐵鳴礦城帶來新的怪物、卡片與裝備目標，50
                等可準備挑戰赫鋼世界王。
              </p>
              <a href="#world">查看等級與裝備路線 →</a>
            </div>
          </article>
          <article>
            <span>05</span>
            <div>
              <h3>冒險手冊與戰鬥畫面更新</h3>
              <p>
                以 NPC
                與場景帶出功能：鍊金爐、圖鑑書頁、主線閱讀與各功能介面。怪物血量歸零時立即退場，技能／光環圖示可查看說明，戰報收斂成關鍵結果。
              </p>
              <p>
                任務補上一鍵領獎；背包顯示、分類與道具操作持續改善。三張範例圖可在下面放大查看。
              </p>
              <a href="#screens">看本季介面範例 →</a>
            </div>
          </article>
          <article>
            <span>06</span>
            <div>
              <h3>限定稱號與賽季通行證</h3>
              <p>
                新增七款秋季稱號。收集六款目標中的任意四款，即可領「楓紅漸漸」；穿戴後經驗
                +3%、金幣 +2%。30 級通行證保留免費／高級雙軌，加入 S
                階強化寶石補給。
              </p>
              <a href="#titles">查看七款稱號的達成方式 →</a>
            </div>
          </article>
        </div>
        <p class="caption-note">
          本季錨點與舊夏日龜王活動暫停。未開放的活動王與玩法不列為本季可玩內容；後續開放以公告為準。
        </p>
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

      <section class="closing">
        <p class="eyebrow">READY FOR YOUR ADVENTURE?</p>
        <h2>知道更新，接著準備出發。</h2>
        <p>第一次玩，或想重新確認操作？到基礎教學找答案。</p>
        <div class="hero-actions">
          <a
            class="button primary"
            :href="gameUrl"
            target="_blank"
            rel="noopener noreferrer"
            >進入遊戲 ↗</a
          ><a class="button subtle" href="#guide">閱讀基礎教學 →</a>
        </div>
      </section>
    </div>
    <div class="page-pane" v-show="activePage === 'guide'" data-page="guide">
      <section id="guide" class="guide-intro section">
        <div>
          <p class="eyebrow">ADVENTURER'S HANDBOOK</p>
          <h1>冒險，從這裡開始。</h1>
          <p class="guide-lead">
            登入與綁定、穿上第一件裝備、學會強化，再找到適合你的職業與地圖。
          </p>
          <p>
            這裡是可以隨時回來查的基礎教學。先看操作路線，遇到不熟悉的系統再翻到對應章節；本季新增內容另外放在「本季更新」。
          </p>
          <div class="hero-actions">
            <a class="button primary" href="#account">從登入開始 ↓</a
            ><a class="button subtle" href="#updates">查看本季更新 →</a>
          </div>
        </div>
        <div class="guide-host">
          <img
            :src="receptionist"
            alt="音無樂園櫃檯小姐，為冒險者介紹入門教學"
            width="580"
            height="750"
          /><span>歡迎回來。<br />這次，想了解哪一個系統？</span>
        </div>
        <nav class="handbook-index" aria-label="基礎教學章節">
          <a v-for="(n, i) in basicSections" :key="n.id" :href="`#${n.id}`"
            ><span>{{ String(i + 1).padStart(2, "0") }}</span
            >{{ n.name }}<b aria-hidden="true">↗</b></a
          >
        </nav>
      </section>

      <section id="account" class="section tutorial-section parchment-section">
        <div class="section-heading">
          <p class="eyebrow">01 · ACCOUNT & BINDING</p>
          <h2>先登入，再把直播帳號綁好。</h2>
          <p>
            Discord 是遊戲登入身分；YouTube／Twitch
            綁定則讓系統辨識你的直播身分與會員狀態。兩者是不同步驟。
          </p>
        </div>
        <div class="tutorial-columns">
          <article>
            <h3>遊戲登入</h3>
            <ol class="instruction-list">
              <li>
                打開
                <a :href="gameUrl" target="_blank" rel="noopener noreferrer"
                  >音無樂園網頁遊戲 ↗</a
                >，選擇 Discord 登入。
              </li>
              <li>在授權頁確認使用的是自己的 Discord 帳號，再完成授權。</li>
              <li>
                回到遊戲，選擇要使用的人物；即使人物已預設選中，也可以點該人物進入。
              </li>
              <li>
                進入據點後，從冒險手冊找到「設定」，查看帳號與直播綁定狀態。
              </li>
            </ol>
          </article>
          <article>
            <h3>Twitch：以授權視窗綁定</h3>
            <ol class="instruction-list">
              <li>進入「設定 → 帳號與直播」，找到 Twitch 綁定區。</li>
              <li>按綁定，登入你的 Twitch 帳號並完成授權。</li>
              <li>授權完成後回到設定，確認顯示「已綁定」及正確帳號。</li>
              <li>
                需要更新訂閱身分時，使用刷新會員位階，並等待系統查詢結果。
              </li>
            </ol>
            <p class="tutorial-note">
              如果瀏覽器擋住授權視窗，允許本站開啟彈出視窗，或依頁面指示完成同頁授權。
            </p>
          </article>
        </div>
        <article class="binding-guide">
          <h3>YouTube：使用直播聊天室綁定碼</h3>
          <ol class="binding-flow">
            <li>
              <b>取得綁定碼</b>
              <p>設定裡選 YouTube，閱讀說明後取得綁定碼。</p>
            </li>
            <li>
              <b>複製完整指令</b>
              <p>
                按複製，取得類似 <code>!綁定 你的綁定碼</code> 的指令。綁定碼 10
                分鐘內有效。
              </p>
            </li>
            <li>
              <b>到官方直播聊天室送出</b>
              <p>
                使用你要綁定的 YouTube
                帳號，前往畫面提供的直播連結，在聊天室貼上指令。
              </p>
            </li>
            <li>
              <b>回遊戲確認</b>
              <p>
                回到設定確認綁定成功。若是會員，再以會員身分留言一次，讓系統偵測會員徽章。
              </p>
            </li>
          </ol>
        </article>
        <div class="tutorial-callout">
          <b>綁定完成，不代表已經辨識到會員。</b>
          <p>
            YouTube 會員需從直播留言辨識；一般綁定不會直接讓你變成會員。每個
            Discord 帳號最多綁一個 YouTube 與一個
            Twitch，同一直播帳號不能被重複綁到不同
            Discord。需要更換或解綁時，請聯絡管理員。
          </p>
        </div>
      </section>

      <section id="getting-started" class="section parchment-section">
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

      <section id="equipment" class="section tutorial-section">
        <div class="section-heading">
          <p class="eyebrow">03 · EQUIPMENT & ATTRIBUTES</p>
          <h2>拿到裝備，記得真正穿上。</h2>
          <p>
            背包裡有好裝，不代表它正在生效。先分清裝備欄、背包、職業徽章與稱號，再看角色面板。
          </p>
        </div>
        <div class="tutorial-columns">
          <article>
            <h3>穿戴一件新裝備</h3>
            <ol class="instruction-list">
              <li>
                點底部「背包」，找到要比較的裝備；可用名稱、分類與階級篩選。
              </li>
              <li>點道具，查看階級、部位、數值、強化等級、屬性洞與效果。</li>
              <li>
                對照身上的同部位裝備，按穿戴；更換後回裝備欄確認該件確實在身上。
              </li>
              <li>
                開啟個人資料，看最大生命、攻擊與防禦等實際面板，再去適合的地圖測試。
              </li>
            </ol>
            <p>
              雙手武器與副手配置會受武器型態限制；不要只看單件攻擊值，整體搭配也要一起比較。
            </p>
          </article>
          <article>
            <h3>先看用途，再看稀有度</h3>
            <p>
              武器決定攻擊型態與主要屬性；防具、披風與飾品補上生命、防禦或其他數值。怪物卡、職業徽章、寵物與稱號提供各自的效果，需放在正確的欄位或啟用。
            </p>
            <p>
              D → C → B → A → S
              是裝備階級。地圖掉落、角色等級、武器種類與套裝效果都會影響實際提升；一件高階武器不等於整套生存能力已成型。
            </p>
            <p class="tutorial-note">
              要保留的裝備先鎖定；出售、分解或批量整理前，確認選中的是哪一件。素材與裝備的背包占用方式不同，以遊戲內容量顯示為準。
            </p>
          </article>
        </div>
        <h3 class="subheading">六種屬性，先認識自己的武器吃哪一項。</h3>
        <div class="attribute-grid">
          <article>
            <b>STR <span>力量</span></b>
            <p>劍、斧、槌等近戰武器的主要攻擊屬性。</p>
          </article>
          <article>
            <b>AGI <span>敏捷</span></b>
            <p>影響出手節奏、迴避與連擊；匕首也以 AGI 作為主要攻擊屬性。</p>
          </article>
          <article>
            <b>VIT <span>體質</span></b>
            <p>影響生命與減傷，是準備防具、坦克或續戰角色時的重要項目。</p>
          </article>
          <article>
            <b>INT <span>智力</span></b>
            <p>法杖的主要攻擊屬性，也會影響傷害浮動下限。</p>
          </article>
          <article>
            <b>DEX <span>靈巧</span></b>
            <p>影響命中；弓以 DEX 作為主要攻擊屬性。</p>
          </article>
          <article>
            <b>LUK <span>幸運</span></b>
            <p>影響爆擊與判定；骰子以 LUK 作為主要攻擊屬性。</p>
          </article>
        </div>
        <p class="caption-note">
          每次角色升等獲得隨機 1 點＋自選 1
          點。攻擊主屬性效果前期明顯、後期遞減；想拿職業徽章時，另要留意試煉檢查的是基礎屬性，而非穿裝後的總數值。
        </p>
      </section>

      <section id="enhance" class="section tutorial-section enhance-section">
        <div class="section-heading">
          <p class="eyebrow">04 · ENHANCEMENT</p>
          <h2>強化、鑲嵌與附魔，是不同的提升。</h2>
          <p>
            寶石強化提升裝備等級；屬性石填入屬性洞；附魔則改變附加詞條。先確認自己開的是哪一個操作。
          </p>
        </div>
        <div class="tutorial-columns">
          <article>
            <h3>一般寶石強化：一步一步升到 +5</h3>
            <ol class="instruction-list">
              <li>在背包或裝備欄點要強化的裝備，選「寶石強化」。</li>
              <li>
                使用和裝備同階的強化寶石：D 裝用 D 石、A 裝用 A 石，以此類推。
              </li>
              <li>在強化視窗確認目前等級、下一級、寶石數量、金幣與成功率。</li>
              <li>
                確認是「一般」模式，按強化；完成後查看結果與裝備的 +N 標示。
              </li>
              <li>
                材料不足就先打寶、分解多餘裝備或到合成工房升階素材，再回來繼續。
              </li>
            </ol>
          </article>
          <article>
            <h3>一般失敗不壞裝，但會吃材料</h3>
            <p>
              一般模式失敗會扣掉本次寶石與金幣，裝備及原本的強化等級保留。+1
              是基礎 100% 成功；+4、+5 成功率較低，是長線追求。
            </p>
            <p>
              目前 D～S 裝的強化上限都是
              +5。金幣費用依裝備階級與目標等級不同，請以操作視窗的當次費用為準。
            </p>
            <div class="tutorial-callout risk">
              <b>「賭鬼」不是一般模式。</b>
              <p>
                需要 +1 以上裝備，寶石與金幣費用減半；強化失敗時另有 50%
                機率直接銷毀整件裝備。重要裝備請先確認模式，再決定是否承擔風險。
              </p>
            </div>
          </article>
        </div>
        <div class="enhance-ladder" aria-label="一般強化基礎材料與成功率">
          <article>
            <b>+1</b><span>2 顆同階寶石</span><strong>100%</strong>
          </article>
          <article>
            <b>+2</b><span>5 顆同階寶石</span><strong>85%</strong>
          </article>
          <article>
            <b>+3</b><span>8 顆同階寶石</span><strong>70%</strong>
          </article>
          <article>
            <b>+4</b><span>12 顆同階寶石</span><strong>30%</strong>
          </article>
          <article>
            <b>+5</b><span>25 顆同階寶石</span><strong>10%</strong>
          </article>
        </div>
        <p class="caption-note">
          表中是每次升到該級所需的寶石與基礎成功率，不是累計費用。個別有效加成、金幣與新手免費強化資格，以遊戲內視窗為準；免費資格不是無限次。
        </p>
        <div class="tutorial-columns extra-upgrades">
          <article>
            <h3>屬性石：決定屬性與抗性</h3>
            <ol class="instruction-list">
              <li>點裝備查看屬性洞，再打開強化視窗中的屬性鑲嵌。</li>
              <li>依用途選木、火、土、金、水、日或月，確認可用洞位。</li>
              <li>確認該屬性的材料、金幣和成功率，再提交鑲嵌。</li>
              <li>完成後在裝備詳情查看填洞數、濃度與效果。</li>
            </ol>
            <p>
              D／C／B／A／S 最多 1／2／3／4／5
              洞。同件裝備重複堆同一屬性，素材費用與難度會增加；鑲嵌失敗會消耗材料與金幣，但不會破壞裝備，空洞仍保留。
            </p>
            <p class="tutorial-note">
              拆除不是免費取回：有成功率、會收費，成功後石頭不返還；每件裝備最多成功拆除
              3 次。先想好用途再填洞。
            </p>
          </article>
          <article>
            <h3>附魔、分解，與素材循環</h3>
            <p>
              在道具詳情開啟可用的附魔操作，先查看目前詞條、可用選項與費用。重骰會改變詞條，不會增加寶石強化的
              +N；確認你要重骰的是哪件裝備。
            </p>
            <p>
              多餘、未穿戴且未鎖定的裝備，可使用分解或出售。分解目前有 50%
              機率取得同階強化石，不保證每件都有產物；出售則換取金幣。兩者都會消耗原裝備。
            </p>
            <p>
              低階強化石可在鍊金工房五換一升階；屬性石也有轉換配方。先整理補給，再挑戰高一階的地圖。
            </p>
            <a class="text-link" href="#craft">查看合成操作與配方 →</a>
          </article>
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
            目前角色上限為 50
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
      </section>

      <section id="worldboss" class="section tutorial-section worldboss-guide">
        <div class="section-heading">
          <p class="eyebrow">07 · WORLD BOSS</p>
          <h2>世界王，不是普通地圖裡的大怪。</h2>
          <p>
            它是獨立的討伐目標，有入場條件、開戰狀態與重生時間。想挑戰下一隻，先完成自己的前置討伐。
          </p>
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
        <div class="tutorial-columns">
          <article>
            <h3>從選王到出戰</h3>
            <ol class="instruction-list">
              <li>點底部「出戰」，切到世界王分類。</li>
              <li>
                選擇目前可挑戰的王，讀取等級、前置、入場費、重生或冷卻狀態。
              </li>
              <li>先檢查自己的裝備、防具、職業徽章與可用技能。</li>
              <li>
                若王有部位，先看部位狀態與弱點，再選擇可攻擊目標。不同王的部位機制可能不同。
              </li>
              <li>
                確認費用後出戰。詳細傷害、助攻與討伐結果，可在戰報及該王的貢獻排行查看。
              </li>
            </ol>
          </article>
          <article>
            <h3>參與、助攻與獎勵</h3>
            <p>
              世界王沿用自己的貢獻與獎勵規則，不能直接套用一般區「全員均分」的例子。寶箱排行使用本場傷害＋0.7
              倍助攻當量；看排行時，也能切換純傷害與貢獻視角。
            </p>
            <p>
              要完成自己的討伐前置，需要讓自己的帳號取得該王的完成記錄，不是其他人打倒就替你解鎖。每次查看王的入口，以目前角色等級與帳號進度為準。
            </p>
            <p class="tutorial-note">
              入場費、剩餘討伐時間、部位狀態與重生倒數會隨王而不同。沒有開放或正在冷卻的王，不會因為按鈕連點就能進場。
            </p>
          </article>
        </div>
        <details>
          <summary>怎麼避免錯過世界王開戰？</summary>
          <p>
            在遊戲設定或世界王頁面開啟世界王鬧鐘。有人發起挑戰時，系統可在
            Discord 的開戰通知提及你；請同時確認社群通知設定與遊戲內狀態。
          </p>
        </details>
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
            <dl class="job-requirements">
              <div>
                <dt>一轉條件</dt>
                <dd>
                  {{
                    job.gate === "無屬性限制"
                      ? "Lv.10・不限屬性"
                      : "Lv.10・基礎 " + job.gate
                  }}
                </dd>
              </div>
              <div>
                <dt>試煉武器</dt>
                <dd>{{ job.weapon }}</dd>
              </div>
              <div>
                <dt>完成方式</dt>
                <dd>符合條件出戰 {{ job.target }} 場</dd>
              </div>
              <div>
                <dt>二轉方向</dt>
                <dd>{{ job.advance }}</dd>
              </div>
            </dl>
          </article>
        </div>
        <p class="caption-note">
          分類用於入門認識，不是副本站位限制。實際技能、可用二轉分支、徽章與試煉條件，以角色的遊戲內轉職頁面為準。
        </p>
        <div class="tutorial-columns job-tutorial">
          <article>
            <h3>一轉：取得徽章，再實際裝備</h3>
            <ol class="instruction-list">
              <li>角色達到 10 等，查看任務中的職業／轉職內容。</li>
              <li>
                對照職業卡，讓基礎屬性合計超過門檻，並穿戴正確的試煉武器。
              </li>
              <li>以符合條件的角色出戰，累積到指定次數後，按「獲得職業」。</li>
              <li>
                確認職業徽章已裝在職業欄；徽章留在背包裡，不會累積出戰熟練度。
              </li>
            </ol>
          </article>
          <article>
            <h3>二轉：角色等級與徽章等級分開看</h3>
            <p>
              角色需 Lv.35，對應一轉徽章需練滿
              Lv.20。裝著該徽章出戰會累積熟練度，可在裝備詳情查看目前等級與本級場次。
            </p>
            <p>
              第一個二轉費用 250,000 金幣；持有第二個二轉時需
              1,000,000，第三個起需
              3,000,000。完成二轉會消耗對應的一轉徽章，換發新的二轉徽章，熟練度從
              Lv.1 重新養成。
            </p>
            <p class="tutorial-note">
              不要把「角色 20 等」當成「徽章 20
              等」。可用分支仍以遊戲內轉職頁為準。
            </p>
          </article>
        </div>
        <div class="attribute-note">
          <h3>配點的第一步，應該有感。</h3>
          <p>
            攻擊主屬性採用前期效果明顯、後期逐漸遞減的曲線。AGI
            影響出手速度；爬塔以行動條累積判定，快的角色能比其他人多出手，怪物也同樣參與。
          </p>
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
              通行證也提供 S
              階強化寶石獎勵。通行證等級與角色等級分開計算，開通高級軌不會直接增加等級；實際獎勵可在遊戲內逐級預覽。
            </p>
          </article>
        </div>
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
    </div>
  </main>
  <footer class="site-footer">
    <a class="brand" href="#updates"
      ><span class="brand-mark" aria-hidden="true">❋</span
      ><span>音無樂園<small>OTONASHI KOI</small></span></a
    >
    <div>
      <a :href="gameUrl" target="_blank" rel="noopener noreferrer"
        >網頁遊戲 ↗</a
      ><a :href="discordUrl" target="_blank" rel="noopener noreferrer"
        >Discord 社群 ↗</a
      ><a href="#guide">基礎教學</a><a href="#updates">本季更新</a
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
