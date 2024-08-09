<script setup lang="ts">
import type { Modelo } from 'trunfo-lib/models/modelo'

defineProps<{
  modelo: Modelo
}>()

const emit = defineEmits<{
  salvar: [value: Modelo]
  cancelar: []
}>()
</script>

<template>
  <form>
  </form>
</template>

<style scoped></style>
