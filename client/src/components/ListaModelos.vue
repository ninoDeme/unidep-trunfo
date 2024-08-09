<script setup lang="ts">
import type { Modelo } from 'trunfo-lib/models/modelo'

defineProps<{
  modelos: Modelo[]
}>()

const emit = defineEmits<{
  selecionarModelo: [value: Modelo]
  novoModelo: []
}>()
</script>

<template>
  <button @click="emit('novoModelo')">+ Novo</button>
  <div v-for="modelo in modelos" :key="modelo.id_modelo" @click="emit('selecionarModelo', modelo)">
    {{ modelo.nome }}
  </div>
</template>

<style scoped></style>
