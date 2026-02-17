<script setup>
const props = defineProps({
  size: { type: [Number, String], default: 32 },
  color: { type: String, default: 'currentColor' },
  strokeWidth: { type: [Number, String], default: 2 }
})
</script>

<template>
  <svg class ="left-margin"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
  >
    <path d="M4 18L20 18" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round"/>
    <path d="M4 12L20 12" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round"/>
    <path d="M4 6L20 6" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round"/>
  </svg>
</template>