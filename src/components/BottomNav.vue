<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()

const tabs = [
  { to: '/',         icon: '🏠',  label: '主頁'  },
  { to: '/profile',  icon: '⚔️',  label: '角色'  },
  { to: '/backpack',icon: '🎒',  label: '背包'  },
  { to: '/monster', icon: '👾',  label: '怪物區' },
  { to: '/shop',    icon: '🛒',  label: '商店'  },
]
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="nav-tab"
      :class="{ active: route.path === tab.to }"
    >
      <span class="nav-icon">{{ tab.icon }}</span>
      <span class="nav-label">{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  height: 64px;
  display: flex;
  background: linear-gradient(0deg, #2a1205 0%, #3d2010 100%);
  border-top: 2px solid #c08030;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,200,80,0.08);
  flex-shrink: 0;
  padding-bottom: env(safe-area-inset-bottom, 0);
}
.nav-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  color: #9a7850;
  transition: all 0.2s;
  position: relative;
}
.nav-tab.active { color: #ffc840; }
.nav-tab.active::before {
  content: '';
  position: absolute;
  top: 0; left: 20%; right: 20%; height: 2px;
  background: linear-gradient(90deg, transparent, #ffc840, transparent);
  border-radius: 0 0 4px 4px;
}
.nav-tab.active .nav-icon { transform: scale(1.2); filter: drop-shadow(0 0 4px rgba(255,200,60,0.6)); }
.nav-icon { font-size: 22px; transition: transform 0.2s, filter 0.2s; }
.nav-label { font-size: 10px; font-weight: 600; letter-spacing: 0.5px; }
</style>
