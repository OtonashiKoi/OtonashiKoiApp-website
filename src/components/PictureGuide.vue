<script setup>
import { computed } from "vue";
const props = defineProps({ lesson: { type: Object, required: true } });
const emit = defineEmits(["zoom"]);
const pictures = computed(() => {
  const steps = props.lesson.steps;
  const selected =
    steps.length > 3
      ? [steps[2], steps[3]]
      : props.lesson.name === "強化與鑲嵌"
        ? [steps[1], steps[2]]
        : props.lesson.name === "職業與轉職" || props.lesson.name === "組隊教學"
          ? [steps[0], steps[2]]
          : steps.slice(0, 2);
  return selected.filter(
    (s, i, a) => a.findIndex((x) => x.image === s.image) === i,
  );
});
</script>
<template>
  <div class="picture-guide">
    <div
      class="guide-pictures"
      :class="{ 'single-picture': pictures.length === 1 }"
    >
      <button
        v-for="picture in pictures"
        :key="picture.image"
        @click="emit('zoom', { image: picture.image, title: picture.title })"
        :aria-label="`放大${picture.title}遊戲畫面`"
      >
        <img
          :src="picture.image"
          :alt="`${picture.title}・遊戲實際介面（示範資料）`"
          width="648"
          height="1152"
          loading="lazy"
        /><span aria-hidden="true">＋</span>
      </button>
    </div>
    <ol class="picture-guide-steps">
      <li v-for="(step, i) in lesson.steps" :key="i">
        <span>{{ i + 1 }}</span>
        <div>
          <b>{{ step.title }}</b>
          <p>{{ step.text }}</p>
        </div>
      </li>
    </ol>
    <p v-if="lesson.warning" class="picture-guide-note">{{ lesson.warning }}</p>
  </div>
</template>
