<script setup>
import portrait from "../assets/brand/otonashi-main.png";
import battle from "../assets/autumn/battle.webp";
import party from "../assets/autumn/party.webp";
import equipment from "../assets/guide/inventory.webp";
import season from "../assets/autumn/season-character.webp";
const props = defineProps({ gameUrl: String, discordUrl: String });
const emit = defineEmits(["zoom"]);
const features = [
  {
    image: battle,
    label: "CO-OP ADVENTURE",
    title: "平常一起刷，各自收穫。",
    text: "在同一張地圖共鬥，共享光環與怪物血量。多人每人取得80～100%基礎經驗，群怪乘隻數，2隻額外+10%、3隻額外+20%；金幣均分，道具各自骰。草叢至古城缺人時有NPC陪練，不分走獎勵。",
    link: "#combat",
    more: "了解一般地圖",
  },
  {
    image: equipment,
    label: "BUILD YOUR CHARACTER",
    title: "從一件裝備，養出你的職業。",
    text: "升級配點、穿裝、強化與鑲嵌，再挑戰轉職。收集怪物卡與寵物，搭配自己的戰鬥方式。",
    link: "#equipment",
    more: "了解裝備養成",
  },
  {
    image: party,
    label: "PARTY TOWER",
    title: "想挑戰，就和隊友上塔。",
    text: "2～5 人組隊，選好坦克、輸出與輔助，再由隊長出發。戰鬥自動接續，技能與用藥由你掌握。",
    link: "#tower",
    more: "了解組隊玩法",
  },
];
</script>
<template>
  <div class="home-page">
    <section id="home" class="home-hero" aria-labelledby="home-title">
      <div class="home-hero-copy">
        <p class="eyebrow">OTONASHI KOI · WEB RPG</p>
        <h1 id="home-title">音無<span>樂園</span></h1>
        <p class="home-tagline">直播相遇，遊戲裡一起冒險。</p>
        <p class="home-description">
          由 VTuber 音無恋打造的網頁 RPG。<br />用 Discord
          帳號登入，從第一場戰鬥開始，<br
            class="desktop-break"
          />把裝備、職業與隊友，慢慢變成你的冒險日常。
        </p>
        <div class="home-actions">
          <a
            class="button primary"
            :href="props.gameUrl"
            target="_blank"
            rel="noopener noreferrer"
            >進入遊戲 ↗</a
          ><a class="button subtle" href="#game-intro">認識這個遊戲 ↓</a>
        </div>
        <a class="home-creator-link" href="#creator">認識 VTuber 音無恋 →</a>
      </div>
      <div class="home-portrait is-illustration">
        <img
          :src="season"
          alt="音無恋手持紅色楓葉的秋季插畫，紫白色服裝與柔和秋色背景"
          width="836"
          height="941"
          fetchpriority="high"
        /><span aria-hidden="true"
          >音無恋<br /><small>OTONASHI KOI</small></span
        >
      </div>
    </section>
    <section
      id="game-intro"
      class="home-game-intro"
      aria-labelledby="game-intro-title"
    >
      <div class="home-section-heading">
        <p class="eyebrow">THE GAME</p>
        <h2 id="game-intro-title">這裡，是你的冒險日常。</h2>
        <p>打怪、收集、養成，也可以找隊友一起挑戰。</p>
      </div>
      <article
        v-for="(feature, i) in features"
        :key="feature.label"
        class="home-feature"
        :class="{ 'reverse-feature': i % 2 }"
      >
        <button
          class="home-game-picture"
          @click="emit('zoom', { image: feature.image, title: feature.title })"
          :aria-label="`放大${feature.title}遊戲畫面`"
        >
          <img
            :src="feature.image"
            :alt="`${feature.title}・實際遊戲介面（示範資料）`"
            width="648"
            height="1152"
            loading="lazy"
          /><span aria-hidden="true">＋</span>
        </button>
        <div class="home-feature-copy">
          <p class="eyebrow">{{ feature.label }}</p>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.text }}</p>
          <a class="home-text-link" :href="feature.link"
            >{{ feature.more }} ↗</a
          >
        </div>
      </article>
      <p class="home-image-note">
        遊戲畫面使用示範角色與資料；實際內容以遊戲內為準。
      </p>
    </section>
    <section id="creator" class="home-creator" aria-labelledby="creator-title">
      <div class="creator-portrait">
        <img
          :src="portrait"
          alt="音無恋角色半身立繪"
          width="859"
          height="2304"
          loading="lazy"
        />
      </div>
      <div class="creator-copy">
        <p class="eyebrow">MEET THE CREATOR</p>
        <h2 id="creator-title">音無恋<small>Otonashi Koi</small></h2>
        <p class="creator-role">台灣 VTuber · 遊戲設計師</p>
        <p>
          我是音無恋，也是音無樂園的創作者。<br />直播裡一起玩遊戲、聊日常，也把想玩的冒險，慢慢做成這座樂園。
        </p>
        <p>
          喜歡日麻、將棋，或只是想來坐坐聊天，都歡迎。直播外，也可以在遊戲和
          Discord 社群繼續相遇。
        </p>
        <div class="creator-topics">
          <span>遊戲</span><span>日麻・將棋</span><span>雜談</span
          ><span>遊戲製作</span>
        </div>
        <div class="creator-links">
          <a
            href="https://www.youtube.com/@%E9%9F%B3%E7%84%A1%E6%81%8B"
            target="_blank"
            rel="noopener noreferrer"
            >YouTube ↗</a
          ><a
            href="https://www.twitch.tv/otonashikoi"
            target="_blank"
            rel="noopener noreferrer"
            >Twitch ↗</a
          ><a :href="props.discordUrl" target="_blank" rel="noopener noreferrer"
            >Discord 社群 ↗</a
          >
        </div>
      </div>
    </section>
    <section class="home-next">
      <a href="#guide"
        ><span class="eyebrow">HOW TO PLAY</span>
        <h3>基礎教學</h3>
        <p>登入綁定、裝備強化與職業入門。</p>
        <span class="home-next-arrow" aria-hidden="true">↗</span></a
      ><a href="#updates"
        ><img
          :src="season"
          alt="楓紅漸漸本季主視覺"
          width="836"
          height="941"
          loading="lazy"
        />
        <div>
          <span class="eyebrow">SEASON UPDATE</span>
          <h3>本季更新 · 楓紅漸漸</h3>
          <p>看看這一季的新玩法與限定收藏。</p>
        </div>
        <span class="home-next-arrow" aria-hidden="true">↗</span></a
      >
    </section>
  </div>
</template>
