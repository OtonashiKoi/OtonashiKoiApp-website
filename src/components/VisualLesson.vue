<script setup>
import { computed, ref } from "vue";
const props = defineProps({ lesson: { type: Object, required: true } });
const emit = defineEmits(["zoom"]);
const active = ref(0);
const current = computed(() => props.lesson.steps[active.value]);
</script>
<template>
  <div class="visual-lesson">
    <nav class="lesson-mobile-steps" aria-label="圖解步驟">
      <button
        v-for="(step, i) in lesson.steps"
        :key="i"
        :aria-label="step.title"
        :aria-pressed="active === i"
        @click="active = i"
      >
        {{ i + 1 }}</button
      ><span>{{ current.title }}</span>
    </nav>
    <figure class="lesson-screen">
      <button
        class="lesson-image"
        @click="emit('zoom', { image: current.image, title: current.title })"
        :aria-label="`放大${current.title}遊戲畫面`"
      >
        <img
          :src="current.image"
          :alt="`${current.title}：音無樂園實際介面，示範資料`"
          width="648"
          height="1152"
          loading="lazy"
        />
        <span
          v-if="current.mark"
          class="lesson-marker"
          :style="{ left: current.mark[0] + '%', top: current.mark[1] + '%' }"
          aria-hidden="true"
          >{{ active + 1 }}</span
        >
        <span class="lesson-zoom" aria-hidden="true">＋</span>
      </button>
      <figcaption>遊戲實際介面・示範資料</figcaption>
    </figure>
    <div class="lesson-instructions">
      <p class="lesson-progress">
        STEP {{ String(active + 1).padStart(2, "0") }} /
        {{ String(lesson.steps.length).padStart(2, "0") }}
      </p>
      <h3>{{ current.title }}</h3>
      <p class="lesson-caption">{{ current.text }}</p>
      <div class="lesson-step-list" :aria-label="`${lesson.name}教學步驟`">
        <button
          v-for="(step, i) in lesson.steps"
          :key="i"
          :aria-pressed="active === i"
          @click="active = i"
        >
          <span>{{ String(i + 1).padStart(2, "0") }}</span
          >{{ step.title
          }}<b aria-hidden="true">{{ active === i ? "←" : "→" }}</b>
        </button>
      </div>
      <p v-if="lesson.warning" class="lesson-warning">{{ lesson.warning }}</p>
      <div class="lesson-paging">
        <button
          :disabled="active === 0"
          @click="active--"
          aria-label="上一個操作步驟"
        >
          ←</button
        ><span>{{ active + 1 }} / {{ lesson.steps.length }}</span
        ><button
          :disabled="active === lesson.steps.length - 1"
          @click="active++"
          aria-label="下一個操作步驟"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>
