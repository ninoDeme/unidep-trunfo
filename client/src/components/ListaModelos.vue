<script setup lang="ts">
import type { Modelo } from 'trunfo-lib/models/modelo'
import { PlusIcon } from '@heroicons/vue/24/outline';
import { ref } from 'vue';

defineProps<{
  modelos: Modelo[]
}>()

const hoverEl = ref(-1);

const emit = defineEmits<{
  selecionarModelo: [value: Modelo]
  hoverModelo: [value: Modelo | null]
  novoModelo: []
}>()
</script>

<template>
    <div class="border rounded flex flex-col m-6">
      <div class="flex flex-row m-1">
        <h2 class="text-lg">Modelos</h2>
        <div class="flex-1"></div>
        <button
          aria-label="novo modelo"
          type="button"
          @click="emit('novoModelo')"
          class="icon-button"
        >
          <PlusIcon class="icon"></PlusIcon>
        </button>
      </div>
      <button
        v-for="(modelo, index) in modelos"
        :key="modelo.id_modelo"
        @click="emit('selecionarModelo', modelo)"
        @pointerenter="hoverEl = index, emit('hoverModelo', modelo)"
        @focus="hoverEl = index, emit('hoverModelo', modelo)"
      class="flex flex-row m-1 gap-1" :class="{'bg-gray-600': hoverEl === index}"
      >
        <span> {{ modelo.nome }} </span>
      </button>
    </div>
</template>

<style scoped></style>
