<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  size: {
    default: '40px'
  },
  background: {
    default: '#41b883'
  },
  duration: {
    default: '1.2s'
  }
})

const rectStyles = computed(() => ({
  backgroundColor: props.background,
  animationDuration: props.duration
}))
const styles = computed(() => ({
  width: props.size,
  height: props.size
}))
</script>

<template>
  <div v-bind:style="styles" class="spinner spinner--stretch">
    <div v-bind:style="rectStyles" class="rect rect-1"></div>
    <div v-bind:style="rectStyles" class="rect rect-2"></div>
    <div v-bind:style="rectStyles" class="rect rect-3"></div>
    <div v-bind:style="rectStyles" class="rect rect-4"></div>
    <div v-bind:style="rectStyles" class="rect rect-5"></div>
  </div>
</template>

<style scoped>
.spinner {
  display: inline-block;
  text-align: center;
  font-size: 10px;
}
.spinner * {
  line-height: 0;
  box-sizing: border-box;
}
.rect {
  animation: sk-stretchdelay 1.2s ease-in-out infinite;
  margin-right: 3px;
}
.spinner > div {
  height: 100%;
  width: 10%;
  display: inline-block;
}

.spinner .rect-2 {
  animation-delay: -1.1s;
}

.spinner .rect-3 {
  animation-delay: -1s;
}

.spinner .rect-4 {
  animation-delay: -0.9s;
}

.spinner .rect-5 {
  animation-delay: -0.8s;
}

@keyframes sk-stretchdelay {
  0%,
  40%,
  100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}
</style>
